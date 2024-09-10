import { ITask } from "./task";

export interface IProject {
  key: string;
  name: string;
  description: string;
  tasks: ITask[];
  target: number;
  completed: boolean;
}
