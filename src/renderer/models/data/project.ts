import { ITask } from "./task";

export interface IProject {
  key: string;
  name: string;
  description: string;
  creationDate: string;
  tasks: ITask[];
  target: number;

  color: string;
  hilightColor: string;
  textColor: string;

  completed: boolean;
}
