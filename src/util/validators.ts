import { IProjectItem } from "../renderer/models/data/projectItem";
import { ITask } from "../renderer/models/data/task";

export function projectNameValidator(projects: IProjectItem[] = [], value?: string) {

  if (!value) return "The project name cannot be empty";

  if (value.length > 50) return "The project name is too long";

  if (value.match(/.,\/\\\(\)/)) return "The project name contains invalid characters";

  if (projects.some(p => p.projectName.toLocaleLowerCase() === value.trim().toLocaleLowerCase())) return "The project name already exists";

  return false;
}

export function taskNameValidator(tasks: ITask[] = [], value?: string) {

  if (!value) return "The task name cannot be empty";

  if (tasks.some(p => p.description === value)) return "The task already exists";

  return false;

}
