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


export class ProjectDb extends FileWriter  {

  private cachedProjects: Promise<IProjectItem[]>;
  private activeLaps: Promise<Omit<Omit<ITimeSheet, "endDateSinceEpoch">, "key">[]>;

  constructor(
    app: Electron.App,
    fs: typeof _fs,
    path: typeof _path,
    private ipcMain: IpcMain
  ) {
    super(app, fs, path, 'projects');

    this.cachedProjects = this.getProjects();
    this.activeLaps = this.getActiveLaps();

    ipcMain.handle('projects-get', (event, filter) => {
      console.log("projects get", filter)
      return this.getProjects(filter).catch(console.error);
    });

    ipcMain.handle('project-get', (event, key) => {
      return this.getProject(key);
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

    ipcMain.handle('project-start-task-lap', (event, projectKey, taskKey, startTime) => {
      return this.startTaskLap(projectKey, taskKey, startTime);
    });

    ipcMain.handle('project-end-task-lap', (event, projectKey, taskKey, endTime) => {
      return this.endTaskLap(projectKey, taskKey, endTime);
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
  private async getActiveLaps() {
     return (await storeService).get("$activeLaps");
  }

  private async getProject(key: string) {
    key = key.slice(0, 50).replace(/[. ,/\\\(\)]/, "_");
    return this.readData(key + ".json") as Promise<IProject>;
  }

  private async createProject(projectName: string) {
    const cachedProjects = (await this.cachedProjects);
    const fileName = projectName.trim().slice(0, 50).replace(/[. ,/\\\(\)]/, "_") + "_" + (new Date().getTime()).toString(16);

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
    return this.saveData(fileName + ".json", newProject)
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
  private async startTaskLap(projectKey: string, taskKey: string, startTime: number) {
    const cachedProjects = (await this.cachedProjects);
    const cachedProject = cachedProjects.find(cp => cp.fileName === projectKey);
    const project = await this.readData(cachedProject?.fileName + ".json") as IProject;
    const task = project.tasks.find(t => t.key === taskKey);

    (await this.activeLaps).push({
      projectKey: cachedProject!.fileName,
      taskKey: task!.key,
      startDateSinceEpoch: startTime
    });
    (await storeService).set("$activeLaps", (await this.activeLaps));

    return task;
  }
  private async endTaskLap(projectKey: string, taskKey: string, endTime: number) {
    const cachedProjects = (await this.cachedProjects);
    const cachedProject = cachedProjects.find(cp => cp.fileName === projectKey);
    const project = await this.readData(cachedProject?.fileName + ".json") as IProject;
    const taskIndex = project.tasks.findIndex(t => t.key === taskKey);

    const activeLaps = (await this.activeLaps);
    const activeLapIndex = activeLaps.findIndex(al => al.projectKey === projectKey && al.taskKey === taskKey)
    const activeLap = activeLaps.splice(activeLapIndex, 1)[0];
    const startDate = new Date(activeLap.startDateSinceEpoch);


    project.tasks[taskIndex].totalTime += activeLap.startDateSinceEpoch - endTime;
    await this.saveData(project.key + ".json", project);

    await timeSheetDbService.__addLap(startDate.getFullYear(), startDate.getMonth() + 1, {
      ...activeLap,
      endDateSinceEpoch: endTime
    });

    return project;
  }
}
