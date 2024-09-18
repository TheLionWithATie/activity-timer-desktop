
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
import { electron } from "process";
import { ProjectSettingsOverlay, ProjectSettingsOverlayAction } from "../ProjectOverlay/ProjectSettingsOverlay";
import { TimerTasksList } from "./TimerTasksList";
import { ProjectNotesOverlay, ProjectNotesOverlayAction } from "../ProjectOverlay/ProjectNotesOverlay";

type ProjectOverlayAction = ProjectSettingsOverlayAction | ProjectNotesOverlayAction;

function Timer({ projectItem, projects, onInfoChanges }: {
  projectItem: IProjectItem,
  projects: IProjectItem[],
  onInfoChanges: (value: IProjectItem) => void
} ) {
  const [ project, setProject ] = useState<IProject>();
  const [ target, setTarget ] = useState(0);
  const [ overlay, setOverlay ] = useState<"" | "notes" | "settings">("");
  const [ isEditingName, setIsEditingName ] = useState(false);

  const [ totalTime, setTotalTime ] = useState<number>(0);
  const [ lastActiveTask, setLastActiveTask ] = useState<ITask>();
  const [ activeTask, _setActiveTask ] = useState<ITask>();

  const _activeTaskRef = useRef(activeTask);
  const setActiveTask = (data: ITask | undefined) => {
    _activeTaskRef.current = data;
    _setActiveTask(data);
  };

  const [ startTime, setStartTime ] = useState<number>(0);
  const [ createNewTask, setCreateNewTask ] = useState<boolean>(false);

  const onActiveTaskChanged = (e: any) => {
    const activeTask = _activeTaskRef.current;
    if (activeTask && e.detail.key !== activeTask.key) {
      window.electron.projects.getActiveTask().then((task) => {
        if (task && task.key === activeTask.key) {
          stopActiveTaskTimer();
        } else {
          return window.electron.projects.getProject(project!.key).then((project) => {
            setActiveTask(undefined);
            setStartTime(0);
            setProject(project);
            setTotalTime( project.tasks.reduce((acc, task) => acc + task.totalTime, 0) );
          });
        }
      });

    }
  };

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
    setLastActiveTask(_activeTaskRef.current);
    setActiveTask(undefined);
    setStartTime(0);

    return window.electron.projects.endTaskLap(Date.now()).then((project) => {
      setProject(project);
      setTotalTime( project.tasks.reduce((acc, task) => acc + task.totalTime, 0) );
    });
  }

  const handleSettingsAction = (e: ProjectOverlayAction, ...args: any) => {
    switch (e) {
      case "edit-project-name":
        setOverlay("");
        setIsEditingName(true);
        return;
      case "changed-project":
        setProject(args[0]);
        if (args[1]) setOverlay("");

        return;
      case "complete-project":
        window.electron.projects.editProjectInfo(projectItem.fileName, {
          ...project,
          completed: true,
        }).then((project) => {
          appBehaviourSubject.dispatchEvent(new CustomEvent("project-completed", { detail: project }));
        });
        return;
      default:
        setOverlay("");
        return;
    }
  }

  let showCircle = (project?.tasks.length === 1 && !createNewTask);

  return (
    <div id={ "timer-" + projectItem.fileName } className="timer-container" is-active={ (activeTask != null).toString() }>
      {
        project ? [
          <ProjectNotesOverlay key="project-notes" show={ overlay === "notes" } onAction={ handleSettingsAction } project={ project } />,
          <ProjectSettingsOverlay key="project-settings" show={ overlay === "settings" } onAction={ handleSettingsAction } project={ project } />,
        ] : null
      }
      <style>
        { `
          #timer-${ projectItem.fileName } {
            --color-primary: ${ project?.color || "#000" };
          }
        ` }
      </style>
      <div className="timer-header" is-editing-name={ isEditingName.toString() }>
        <button className="btn-icon btn-no-background" type="button" onClick={ () => setOverlay("notes") }>
          <img src={ NoteIcon } />
        </button>
        <TextField
          setFocus={ isEditingName }
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
        <button type="button" className="btn-icon btn-no-background" onClick={ () => setOverlay("settings") }>
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
        <Clock totalTime={ totalTime } startTime={ startTime } isRunning={ !!activeTask } showSeconds={ showCircle ? true : "inline" } />
      </div>
      {
        (!showCircle && project) ? <TimerTasksList
          project={ project }
          activeTask={ activeTask }
          lastActiveTask={ lastActiveTask }
          projectChanged={ setProject }
          startTaskTimer={ startTaskTimer }
          createNewTask={ createNewTask }
        /> : null
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
        <button className="btn-icon button" onClick={ () => activeTask ? stopActiveTaskTimer() : startTaskTimer(lastActiveTask || project!.tasks![0] ) }>
          <img src={ activeTask ? PlayIcon : PauseIcon }/>
        </button>
        <button className="btn btn-no-background flex-grow" onClick={() => {
          setCreateNewTask(true);
        }}>
          <img src={ AddIcon }/>
          <span>TASK</span>
        </button>
      </div>
    </div>
  );
}

export default Timer;
