import { useEffect, useState } from "react";
import Timer from "../../components/Timer/timer";
import { IProjectItem } from "../../models/data/projectItem";
import AddIcon from "../../../icons/add.svg";

import "./TimersDashboard.css";
import { TextField } from "../../components/fields/TextField";
import { projectNameValidator } from "../../../util/validators";
import { InfiniteSelector } from "../../components/infiniteSelector/InfiniteSelector";

export const appBehaviourSubject = document.createElement("behaviour-subject");

export function TimersDashboard() {
  const [ projects, setProjects ] = useState<IProjectItem[]>([]);
  const [ newProjectName, setNewProjectName ] = useState<string | undefined>("");

  useEffect(() => {
    window.electron.projects.getProjects().then((projects) => setProjects(projects || []));
  }, []);

  return (
    <div className="dashboard-grid">
      {
        projects.map((p, i) => <Timer
          key={ p.fileName }
          projectItem={ p }
          projects={ projects }
          onInfoChanges={ (value) => {
            projects[i] = value;
            setProjects([...projects]);
          }}
        />)
      }
      {
        newProjectName === undefined ?
          <div className="timer-container">
            <div className="timer-header">
              <TextField
                value={ newProjectName }
                onChange={(value: string) => {
                  window.electron.projects.createProject(value).then((p) => {
                    setProjects([...projects, p]);
                  });
                  setNewProjectName(undefined);
                }}
                onCancel={() => setNewProjectName("") }
                validator={(value: string) => {
                  return projectNameValidator(projects, value);
                }} />
            </div>
          </div>
        :
          <button className="timer-container dashboard-add-project-btn" type="button" onClick={ () => setNewProjectName(undefined) }>
            <img src={ AddIcon } />
          </button>
      }
    </div>
  );
}
