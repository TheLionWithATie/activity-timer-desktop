// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { TimeSheetDb } from './data/timeSheetDb';
import { ProjectDb, ProjectsListFilter } from './data/projectDb';
import { ITimeSheet } from '../renderer/models/data/timeSheet';
import { IProjectItem } from '../renderer/models/data/projectItem';
import { IProject } from '../renderer/models/data/project';
import { ITask } from '../renderer/models/data/task';

export type Channels = 'ipc-example';

export const PRELOAD_ACTIONS = {
  timeSheet: {
      getTimeSheetByMonth: async (month: number, year: number) => {
        return ipcRenderer.invoke('time-sheet-get', month, year) as Promise<ITimeSheet[]>
      },
      editLap: async (month: number, year: number, lap: Partial<ITimeSheet>) => {
        return ipcRenderer.invoke('time-sheet-edit-lap', month, year, lap) as Promise<ITimeSheet>
      }
    },
  projects: {
    "getProjects": async (filter?: ProjectsListFilter) => {
      console.log('getProjects', filter);
      return ipcRenderer.invoke('projects-get', filter) as Promise<IProjectItem[]>;
    },
    "getProject": async (key: string) => {
      return ipcRenderer.invoke('project-get', key) as Promise<IProject>;
    },
    "createProject": async (projectName: string) => {
      return ipcRenderer.invoke('project-create', projectName) as Promise<IProjectItem>;
    },
    "editProjectInfo": async (projectKey: string, editedProject: Partial<Omit<IProject, "tasks">> ) => {
      return ipcRenderer.invoke('project-edit-info', projectKey, editedProject) as Promise<IProject>;
    },
    "addTask": async (projectKey: string, taskName: string) => {
      return ipcRenderer.invoke('project-add-task', projectKey, taskName) as Promise<IProject>;
    },
    "editTask": async (projectKey: string, taskKey: string, taskInfo: Partial<Omit<Omit<ITask, "key">, "projectKey">>) => {
      return ipcRenderer.invoke('project-edit-task', projectKey, taskKey, taskInfo) as Promise<IProject>;
    },
    "startTaskLap": async (projectKey: string, taskKey: string, endTime: number) => {
      return ipcRenderer.invoke('project-start-task-lap', projectKey, taskKey, endTime) as Promise<ITask>;
    },
    "endTaskLap": async (endTime: number) => {
      return ipcRenderer.invoke('project-end-task-lap', endTime) as Promise<IProject>;
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
