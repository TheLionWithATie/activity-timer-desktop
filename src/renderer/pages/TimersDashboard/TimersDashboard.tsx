import { useEffect, useState } from "react";
import { IProjectItem } from "../../models/data/projectItem";

import "./TimersDashboard.css";
import { motion } from "framer-motion";
import { TextField } from "../../components/fields/TextField";
import { projectNameValidator } from "../../../util/validators";
import { InfiniteSelector } from "../../components/infiniteSelector/InfiniteSelector";
import { ITask } from "../../models/data/task";
import { IActiveLap } from "../../../main/data/projectDb";
import { div } from "framer-motion/client";
import { EmptyProjectCard } from "../../components/EmptyProjectCard";
import ProjectCard from "../../components/ProjectCard/projectCard";

export const appBehaviourSubject = document.createElement("behaviour-subject");

export function TimersDashboard() {
  const [ projects, setProjects ] = useState<IProjectItem[]>([]);
  const [ emptyProjects, setEmptyProjects ] = useState<Array<{}>>(Array(3).fill(null));
  const [ initialActiveTask, setInitialActiveTask ] = useState<IActiveLap | null>();

  function getProjects () {
    window.electron.projects.getProjects().then((projects) => {
      setProjects(projects || []);
      setEmptyProjects(projects.length < 3 ? Array(3 - projects.length).fill(null) : [null]);
    });
  }

  useEffect(() => {
    getProjects();

    window.electron.projects.getActiveTask().then((task) => {
      setInitialActiveTask(task || null);
    });

    appBehaviourSubject.addEventListener("project-deleted", () => {
      getProjects();
    })
  }, []);

  return (
    <div className="timers-dashboard">
      {
        initialActiveTask !== undefined ? <div className="dashboard-grid">
          {
            projects.map((p, i) => <ProjectCard
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
            emptyProjects.map((_, i) => (
              <EmptyProjectCard key={ "empty_project_" + i } projects={ projects } createProject={ (value: string) => {
                window.electron.projects.createProject(value).then((p) => {
                  setProjects([...projects, p]);
                  setEmptyProjects((projects.length) < 2 ? Array(2 - projects.length).fill(null) : [null]);
                });
              }} />
            ))
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
