import { useEffect, useState } from "react";
import Timer from "../../components/Timer/timer";
import { IProjectItem } from "../../models/data/projectItem";
import AddIcon from "../../../icons/add.svg";

import "./TimersDashboard.css";
import { motion } from "framer-motion";
import { TextField } from "../../components/fields/TextField";
import { projectNameValidator } from "../../../util/validators";
import { InfiniteSelector } from "../../components/infiniteSelector/InfiniteSelector";
import { ITask } from "../../models/data/task";
import { ActiveLap } from "../../../main/data/projectDb";
import { div } from "framer-motion/client";

export const appBehaviourSubject = document.createElement("behaviour-subject");

export function TimersDashboard() {
  const [ projects, setProjects ] = useState<IProjectItem[]>([]);
  const [ initialActiveTask, setInitialActiveTask ] = useState<ActiveLap | null>();
  const [ newProjectName, setNewProjectName ] = useState<string | 0>(0);

  useEffect(() => {
    window.electron.projects.getProjects().then((projects) => setProjects(projects || []));
    
    window.electron.projects.getActiveTask().then((task) => {
      setInitialActiveTask(task || null);
    });
  }, []);

  return (
    <div className="timers-dashboard">
      {
        initialActiveTask !== undefined ? <div className="dashboard-grid">
          {
            projects.map((p, i) => <Timer
              key={ p.fileName }
              projectItem={ p }
              projects={ projects }
              initialActiveLap={ initialActiveTask }
              onInfoChanges={ (value) => {
                projects[i] = value;
                setProjects([...projects]);
              }}
            />)
          }
          {
            newProjectName !== 0 ?
              <div className="timer-container">
                <div className="timer-header">
                  <TextField
                    value={ newProjectName }
                    onChange={(value: string) => {
                      window.electron.projects.createProject(value).then((p) => {
                        setProjects([...projects, p]);
                      });
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
          }
        </div> : <motion.div className="loading-spinner" animate={{
          scale: [1, 2, 2, 1, 1],
          rotate: [0, 0, 270, 270, 0],
          borderRadius: ["20%", "20%", "50%", "50%", "20%"],
        }}></motion.div>
      }
    </div>
  );
}
