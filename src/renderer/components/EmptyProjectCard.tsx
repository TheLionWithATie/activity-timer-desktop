import { useState } from "react";
import { TextField } from "./fields/TextField";
import { projectNameValidator } from "../../util/validators";
import { IProjectItem } from "../models/data/projectItem";
import AddIcon from "../../icons/add.svg";

export function EmptyProjectCard({ projects, createProject }: { projects: IProjectItem[], createProject: (value: string) => void }) {
  const [ newProjectName, setNewProjectName ] = useState<string | 0>(0);

  return (newProjectName !== 0 ?
    <div className="timer-container">
      <div className="timer-header">
        <TextField
          value={ newProjectName }
          onChange={(value: string) => {
            createProject(value);
            setNewProjectName(0);
          }}
          onCancel={() => setNewProjectName(0) }
          validator={(value: string) => {
            return projectNameValidator(projects, value);
          }} />
      </div>
    </div>
    :
    <button className="timer-container dashboard-add-project-btn" type="button" onClick={ () => setNewProjectName("") }>
      <img src={ AddIcon } />
    </button>
  );
}
