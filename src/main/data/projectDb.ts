import { FileWriter } from "../../renderer/models/FileWriter";
import _path from 'path';
import _fs from "fs";
import { IpcMain, ipcRenderer } from "electron";
import { storeService, timeSheetDbService } from "../main";
import { IProjectItem } from "../../renderer/models/data/projectItem";
import { IProject } from "../../renderer/models/data/project";
import { ITimeSheet } from "../../renderer/models/data/timeSheet";
import { start } from "repl";
import { ITask } from "../../renderer/models/data/task";


export type ProjectsListFilter = "all" | "completed" | "uncompleted";

export type ActiveLap = Omit<Omit<ITimeSheet, "endDateSinceEpoch">, "key">;

export class ProjectDb extends FileWriter  {

  private cachedProjects: Promise<IProjectItem[]>;

  constructor(
    app: Electron.App,
    fs: typeof _fs,
    path: typeof _path,
    private ipcMain: IpcMain
  ) {
    super(app, fs, path, 'projects');

    this.cachedProjects = this.getProjects();

    ipcMain.handle('projects-get', (event, filter) => {
      console.log("projects get", filter)
      return this.getProjects(filter).catch(console.error);
    });

    ipcMain.handle('project-get', (event, key) => {
      return this.getProject(key);
    });

    ipcMain.handle('active-task-get', (event) => {
      return this.getActiveLap();
    });

    ipcMain.handle('project-create', (event, projectName) => {
      return this.createProject(projectName);
    });

    ipcMain.handle('project-edit-info', (event, projectKey, editedProject) => {
      return this.editProjectInfo(projectKey, editedProject);
    });

    ipcMain.handle('project-add-task', (event, projectKey, taskName) => {
      return this.addProjectTask(projectKey, taskName);
    });
    ipcMain.handle('project-edit-task', (event, projectKey, taskKey, taskInfo) => {
      return this.editTaskInfo(projectKey, taskKey, taskInfo);
    });

    ipcMain.handle('project-start-task-lap', (event, projectKey, taskKey, startTime) => {
      return this.startTaskLap(projectKey, taskKey, startTime);
    });

    ipcMain.handle('project-end-task-lap', (event, endTime) => {
      return this.endTaskLap(endTime);
    });
  }

  private async getProjects(filter?: ProjectsListFilter) {
    const projects = (await storeService).get("$projects") || [];

    switch (filter) {
      case "completed":
        return projects.filter(p => p.completed);
    case "uncompleted":
        return projects.filter(p => !p.completed);
    default:
        return projects;
    }
  }
  private async getActiveLap() {
     return (await storeService).get("$activeLap") as Promise<ActiveLap>;
  }

  private async getProject(key: string) {
    key = key.slice(0, 50).replace(/[. ,/\\\(\)]/, "_");
    return this.readData(key + ".json") as Promise<IProject>;
  }

  private async createProject(projectName: string) {
    const cachedProjects = (await this.cachedProjects);
    const fileName = projectName.trim().slice(0, 50).replace(/[. ,/\\\(\)]/, "_") + "_" + (new Date().getTime()).toString(16);

    if (await this.doesFileExist(fileName + ".json")) throw Error("File already exists");


    const newProjectItem: IProjectItem = {
      completed: false,
      projectName: String(projectName),
      fileName: fileName
    }
    const newProject: IProject = {
      key: fileName,
      name: String(projectName),
      description: "",
      tasks: [
        {
          key: (new Date().getTime()).toString(16),
          description: projectName,
          notes: "",
          totalTime: 0,
          completed: false,
        }
      ],
      target: 0,
      completed: false
    }

    cachedProjects.push(newProjectItem);

    storeService.then(store => store.set("$projects", cachedProjects));
    await this.saveData(fileName + ".json", newProject)
    return newProjectItem;
  }

  private async editProjectInfo(projectKey: string, editedProject: Partial<Omit<IProject, "tasks">> ) {
    const cachedProjects = (await this.cachedProjects);
    const cachedProjectIndex = cachedProjects.findIndex(cp => cp.fileName === projectKey);
    const project = await this.readData(cachedProjects[cachedProjectIndex].fileName + ".json") as IProject;

    if (editedProject.name) project.name = cachedProjects[cachedProjectIndex].projectName = editedProject.name;
    if (editedProject.completed) project.completed = cachedProjects[cachedProjectIndex].completed = editedProject.completed;
    if (editedProject.description) project.description = editedProject.description;
    if (editedProject.target) project.target = editedProject.target;

    // update project file
    await this.saveData(project.key + ".json", project);

    // update the project list in cache
    (await storeService).set("$projects", cachedProjects);

    return project;
  }

  private async addProjectTask(projectKey: string, taskDescription: string) {
    const cachedProjects = (await this.cachedProjects);
    const cachedProject = cachedProjects.find(cp => cp.fileName === projectKey);
    if (!cachedProject) return Promise.reject(false);

    const project = await this.readData(cachedProject?.fileName + ".json") as IProject;
    project.tasks.push({
      key: (new Date().getTime()).toString(16),
      description: taskDescription,
      notes: "",
      totalTime: 0,
      completed: false,
    });

    // update project file
    await this.saveData(project.key + ".json", project);

    return project;
  }
  private async editTaskInfo(projectKey: string, taskKey: string, taskInfo: Partial<Omit<Omit<ITask, "key">, "totalTime">>) {
    const cachedProjects = (await this.cachedProjects);
    const cachedProject = cachedProjects.find(cp => cp.fileName === projectKey);
    if (!cachedProject) return Promise.reject(false);

    const project = await this.readData(cachedProject?.fileName + ".json") as IProject;
    const taskIndex = project.tasks.findIndex(t => t.key === taskKey);


    if (taskInfo.description) project.tasks[taskIndex].description = taskInfo.description || "";
    if (taskInfo.notes) project.tasks[taskIndex].notes = taskInfo.notes || "";
    if (taskInfo.completed) project.tasks[taskIndex].completed = taskInfo.completed || false;

    // update project file
    await this.saveData(project.key + ".json", project);

    return project;
  }
  private async startTaskLap(projectKey: string, taskKey: string, startTime: number) {
    const cachedProjects = (await this.cachedProjects);
    const cachedProject = cachedProjects.find(cp => cp.fileName === projectKey);
    const project = await this.readData(cachedProject?.fileName + ".json") as IProject;
    const task = project.tasks.find(t => t.key === taskKey);

    (await storeService).set("$activeLap", {
      projectKey: cachedProject!.fileName,
      taskKey: task!.key,
      startDateSinceEpoch: startTime
    });

    return task;
  }
  private async endTaskLap(endTime: number) {

    const cachedProjects = await this.cachedProjects;
    const activeLap = await this.getActiveLap();

    if (!activeLap) throw Error("No active lap");

    const startDate = new Date(activeLap.startDateSinceEpoch);
    const cachedProject = cachedProjects.find(cp => cp.fileName === activeLap.projectKey);
    if (!cachedProject) {
      (await storeService).set("$activeLap", null);
      throw Error("Cannot find project, the active lap will be deleted!");
    }

    const project = await this.readData(cachedProject?.fileName + ".json") as IProject;
    if (!project) {
      (await storeService).set("$activeLap", null);
      throw Error("Cannot find project file, the active lap will be deleted!");
    }
    const taskIndex = project.tasks.findIndex(t => t.key === activeLap.taskKey);

    project.tasks[taskIndex].totalTime += endTime - activeLap.startDateSinceEpoch;

    await this.saveData(project.key + ".json", project);

    await timeSheetDbService.__addLap(startDate.getMonth() + 1, startDate.getFullYear(), {
      ...activeLap,
      endDateSinceEpoch: endTime
    });

    (await storeService).set("$activeLap", null);



    return project;
  }
}
