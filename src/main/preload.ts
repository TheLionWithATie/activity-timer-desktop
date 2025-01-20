// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { IActiveLap, ProjectsListFilter } from './data/projectDb';
import { IDayTask } from '../renderer/models/data/timeSheet';
import { IProjectItem } from '../renderer/models/data/projectItem';
import { IProject } from '../renderer/models/data/project';
import { ITask } from '../renderer/models/data/task';

export type Channels = 'ipc-example';

export const PRELOAD_ACTIONS = {
  timeSheet: {
      getTimeSheetByMonth: async (month: number, year: number) => {
        return ipcRenderer.invoke('time-sheet-get', month, year) as Promise<IDayTask[]>
      },
      editLap: async (month: number, year: number, lap: Partial<IDayTask>) => {
        return ipcRenderer.invoke('time-sheet-edit-lap', month, year, lap) as Promise<IDayTask>
      }
    },
  projects: {
    "getProjects": async (filter?: ProjectsListFilter) => {
      console.log('getProjects', filter);
      return ipcRenderer.invoke('projects-get', filter).catch(err => alert(err.message)) as Promise<IProjectItem[]>;
    },
    "getProject": async (key: string) => {
      return ipcRenderer.invoke('project-get', key).catch(err => alert(err.message)) as Promise<IProject>;
    },
    "getActiveTask": async () => {
      return ipcRenderer.invoke('active-task-get').catch(err => alert(err.message)) as Promise<IActiveLap>;
    },
    "createProject": async (projectName: string) => {
      return ipcRenderer.invoke('project-create', projectName).catch(err => alert(err.message)) as Promise<IProjectItem>;
    },
    "editProjectInfo": async (projectKey: string, editedProject: Partial<Omit<IProject, "tasks" | "color" | "textColor" | "hilightColor">> ) => {
      return ipcRenderer.invoke('project-edit-info', projectKey, editedProject).catch(err => alert(err.message)) as Promise<IProject>;
    },
    "editProjectColor": async (projectKey: string, color: string ) => {
      return ipcRenderer.invoke('project-edit-color', projectKey, color).catch(err => alert(err.message)) as Promise<IProject>;
    },
    "deleteProject": async (projectKey: string) => {
      return ipcRenderer.invoke('project-delete', projectKey).catch(err => alert(err.message)) as Promise<IProject>;
    },
    "addTask": async (projectKey: string, taskName: string) => {
      return ipcRenderer.invoke('project-add-task', projectKey, taskName).catch(err => alert(err.message)) as Promise<IProject>;
    },
    "editTask": async (projectKey: string, taskKey: string, taskInfo: Partial<Omit<Omit<ITask, "key">, "projectKey">>) => {
      return ipcRenderer.invoke('project-edit-task', projectKey, taskKey, taskInfo).catch(err => alert(err.message)) as Promise<IProject>;
    },
    "startTaskLap": async (projectKey: string, taskKey: string, endTime: number) => {
      return ipcRenderer.invoke('project-start-task-lap', projectKey, taskKey, endTime).catch(err => alert(err.message)) as Promise<IActiveLap>;
    },
    "endTaskLap": async (endTime: number) => {
      return ipcRenderer.invoke('project-end-task-lap', endTime).catch(err => alert(err.message)) as Promise<IProject>;
    }
  },
};

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
  ...PRELOAD_ACTIONS,
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
