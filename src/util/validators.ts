import { IProjectItem } from "../renderer/models/data/projectItem";

export function projectNameValidator(projects: IProjectItem[] = [], value?: string) {

  if (!value) return "The project name cannot be empty";

  if (value.length > 50) return "The project name is too long";

  if (value.match(/.,\/\\\(\)/)) return "The project name contains invalid characters";

  if (projects.some(p => p.projectName === value)) return "The project name already exists";

  return false;
}
