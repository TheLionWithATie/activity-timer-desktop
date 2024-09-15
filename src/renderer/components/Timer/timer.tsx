
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
import { formatMiliseconds } from "../../../util/time";

import "./timer.css";
import { projectNameValidator, taskNameValidator } from "../../../util/validators";
import { TimerTask } from "../TimerTask/TimerTask";
import { appBehaviourSubject } from "../../pages/TimersDashboard/TimersDashboard";
import { Clock } from "../Clock/Clock";



function Timer({ projectItem, projects, onInfoChanges }: {
  projectItem: IProjectItem,
  projects: IProjectItem[],
  onInfoChanges: (value: IProjectItem) => void
} ) {
  const [ project, setProject ] = useState<IProject>();
  const [ target, setTarget ] = useState(0);
  const [ isEditingName, setIsEditingName ] = useState(false);

  const [ totalTime, setTotalTime ] = useState<number>(0);
  const [ lastActiveTask, setLastActiveTask ] = useState<ITask>();
  const [ activeTask, setActiveTask ] = useState<ITask>();
  const [ startTime, setStartTime ] = useState<number>(0);
  const [ newTaskName, setNewTaskName ] = useState<string | undefined>("");

  const onActiveTaskChanged = useCallback((e: any) => {
    if (activeTask && e.detail.key !== activeTask.key) {
      stopActiveTaskTimer();
    }
  }, []);

  useEffect(() => {
    appBehaviourSubject.addEventListener("active-task-changed", onActiveTaskChanged);

    return () => appBehaviourSubject.removeEventListener("active-task-changed", onActiveTaskChanged);
  }, [ appBehaviourSubject, onActiveTaskChanged ]);

  useEffect(() => {
    if (!projectItem.fileName) return;

    window.electron.projects.getProject(projectItem.fileName).then((p) => {
      setProject(p);
      setTotalTime(p.tasks.reduce((acc, task) => acc + task.totalTime, 0) );
      setTarget(p.target);

      const t = p.tasks[0];
    });
  }, [projectItem.fileName])


  const startTaskTimer = async (task: ITask) => {
    if (activeTask) {
      if (activeTask.key === task.key) return;

      await stopActiveTaskTimer();
    }

    const startTime = Date.now();
    setActiveTask(task);
    setStartTime(startTime);
    window.electron.projects.startTaskLap(project!.key, task.key, startTime).then((task) => {
      setActiveTask(task);
    });

    appBehaviourSubject.dispatchEvent(new CustomEvent("active-task-changed", { detail: task }));
  }

  const stopActiveTaskTimer = () => {
    setLastActiveTask(activeTask);
    setActiveTask(undefined);
    setStartTime(0);

    return window.electron.projects.endTaskLap(Date.now()).then((project) => {
      setProject(project);
      setTotalTime( project.tasks.reduce((acc, task) => acc + task.totalTime, 0) );
    });
  }

  let showCircle = (project?.tasks.length === 1 && newTaskName === "");

  return (
    <div id={ "timer-" + projectItem.fileName } className="timer-container" aria-active={ !!activeTask }>
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

      <div className="timer-timer-container" hide-circle={ (!showCircle).toString() }>
        {
          showCircle ?
            <div className="timer-timer-circle">
              <TimerCircle
                time={ totalTime }
                target={ target }
                primaryColor={ "var(--color-primary)" }
                secondaryColor={ "white" }
              />
            </div> : null
        }
        <Clock totalTime={ totalTime } startTime={ startTime } isRunning={ !!activeTask } target={ target } showSeconds={ showCircle } />
      </div>
      {
        !showCircle ? <div className="timer-tasks-list flex-column">
          {
            project?.tasks.map((t) =>
              <TimerTask
                key={ t.key }
                projectKey={ project.key }
                task={ t }
                isActiveTask={ !!activeTask && t.key === activeTask.key }
                isLastPlayedTask={ !!lastActiveTask && t.key === lastActiveTask.key  }
                tasks={ project.tasks }
                onPlayClick={() => {

                  startTaskTimer(t)
                }}
                updatedTask={(project: IProject) => {
                  setProject(project);
                }} />
            )
          }

          {
            newTaskName === undefined ? <TextField
            value={ newTaskName }
            onCancel={() => setNewTaskName("")}
            onChange={(value: string) => {

              window.electron.projects.addTask(project!.key, value).then((project) => {
                setProject({ ...project! });
              })
            }}
            validator={(value: string) => {
              return taskNameValidator(project?.tasks, value);
            }}
            /> : null
          }
        </div> : null
      }


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
        <button className="btn btn-no-background flex-grow" onClick={() => {
          setNewTaskName(undefined);
        }}>
          <img src={ AddIcon }/>
          <span>TARGET</span>
        </button>
      </div>
    </div>
  );
}

export default Timer;
