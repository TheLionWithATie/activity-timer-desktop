
import CSS from "csstype";
import { useState, useRef, useEffect, useCallback } from "react";

import AddIcon from "src/icons/add.svg";
import PauseIcon from "src/icons/pause.svg";
import PlayIcon from "src/icons/play.svg";
import SettingsIcon from "src/icons/settings.svg";
import NoteIcon from "src/icons/note.svg";

import { IProjectItem } from "../../models/data/projectItem";
import { IProject } from "../../models/data/project";
import { ITimeSheet } from "../../models/data/timeSheet";
import { ITask } from "../../models/data/task";
import { TimerCircle } from "../TimerCircle";
import { TextField } from "../fields/TextField";
import { Clock } from "../clock";
import { formatMiliseconds } from "../../../util/time";

import "./timer.css";
import { projectNameValidator } from "../../../util/validators";

function Timer({ projectItem, behaviorSubject, projects, onInfoChanges }: {
  projectItem: IProjectItem,
  behaviorSubject: HTMLElement,
  projects: IProjectItem[],
  onInfoChanges: (value: IProjectItem) => void
} ) {
  const [ project, setProject ] = useState<IProject>();
  const [ target, setTarget ] = useState(0);
  const [ isEditingName, setIsEditingName ] = useState(false);

  const [ totalTime, setTotalTime ] = useState<number>(0);
  const [ activeTask, setActiveTask ] = useState<ITask>();
  const [ startTime, setStartTime ] = useState<number>(0);

  const onActiveTaskChanged = useCallback((e: any) => {
    if (activeTask && e.detail.key !== activeTask.key) {
      stopActiveTaskTimer();
    }
  }, []);

  useEffect(() => {
    behaviorSubject.addEventListener("active-task-changed", onActiveTaskChanged);

    return () => behaviorSubject.removeEventListener("active-task-changed", onActiveTaskChanged);
  }, [ behaviorSubject, onActiveTaskChanged ]);

  useEffect(() => {
    if (!projectItem.fileName) return;

    window.electron.projects.getProject(projectItem.fileName).then((p) => {
      setProject(p);
      setTotalTime(p.tasks.reduce((acc, task) => acc + task.totalTime, 0) );
      setTarget(p.target);

      const t = p.tasks[0];
    });
  }, [projectItem.fileName])


  const startTaskTimer = (task: ITask) => {
    const startTime = Date.now();
    setActiveTask(task);
    setStartTime(startTime);
    window.electron.projects.startTaskLap(project!.key, task.key, startTime).then((task) => {
      setActiveTask(task);
    });

    behaviorSubject.dispatchEvent(new CustomEvent("active-task-changed", { detail: task }));
  }

  const stopActiveTaskTimer = () => {
    setActiveTask(undefined);
    setStartTime(0);

    window.electron.projects.endTaskLap(project!.key, activeTask!.key, Date.now()).then((project) => {
      setProject(project);
      setTotalTime( project.tasks.reduce((acc, task) => acc + task.totalTime, 0) );
    });
  }


  return (
    <div id={ "timer-" + projectItem.fileName } className="timer-container">
      <style>
        { `
          #timer-${ projectItem.fileName } {
            --color-primary: ${ "blue" };
          }
        ` }
      </style>
      <div className="timer-header" is-editing-name={ isEditingName.toString() }>
        <button className="btn-icon btn-no-background" type="button">
          <img src={ NoteIcon } />
        </button>
        <TextField
          value={ project?.name || projectItem.projectName }
          onFocus={() => {
            setIsEditingName(true);
          }}
          onCancel={() => setIsEditingName(false)}
          onChange={(value: string) => {
            setIsEditingName(false);

            project!.name = value;
            window.electron.projects.editProjectInfo(project!.key, project!).then(() => {
              projectItem.projectName = value;

              onInfoChanges(projectItem);
              setProject({ ...project! });
            })
          }}
          validator={(value: string) => {
            return projectNameValidator(projects, value);
          }} />
        <button type="button" className="btn-icon btn-no-background">
          <img src={ SettingsIcon } />
        </button>
      </div>

      <div className="timer-timer-container">
        <div className="timer-timer-circle">
          <TimerCircle
            time={ totalTime }
            target={ target }
            primaryColor={ "var(--color-primary)" }
            secondaryColor={ "white" }
          />
        </div>
        <Clock totalTime={ totalTime } startTime={ startTime } isRunning={ !!activeTask } target={ target } />
      </div>

      <div className="timer-actions-row" style={ { flex: 0, flexBasis: "10%" } }>
        <button className="btn btn-no-background flex-grow">
          { target > 0 ?
              <span className="timer-infoText"> { formatMiliseconds.toShortString(target, false) } </span>
            :
              <img src={ AddIcon }/>
          }
          <span>TARGET</span>
        </button>
        <button className="btn-icon button" onClick={ () => activeTask ? stopActiveTaskTimer() : startTaskTimer(project!.tasks![0] ) }>
          <img src={ activeTask ? PlayIcon : PauseIcon }/>
        </button>
        <button className="btn btn-no-background flex-grow">
          <img src={ AddIcon }/>
          <span>TARGET</span>
        </button>
      </div>
    </div>
  );
}

export default Timer;
