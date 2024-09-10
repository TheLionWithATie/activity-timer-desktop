
import CSS from "csstype";
import { useState, useRef, useEffect } from "react";

import AddIcon from "../../icons/add.svg";
import PauseIcon from "../../icons/pause.svg";
import PlayIcon from "../../icons/play.svg";
import ResetIcon from "../../icons/reset.svg";
import StopIcon from "../../icons/stop.svg";
import { IProjectItem } from "../models/data/projectItem";
import { IProject } from "../models/data/project";
import { ITimeSheet } from "../models/data/timeSheet";
import { TimerCircle } from "./TimerCircle";
import { Clock } from "./clock";
import { formatMiliseconds } from "../../util/time";
import { ITask } from "../models/data/task";
import { TextField } from "./fields/TextField";



const styles: { [key: string]: CSS.Properties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    alignContent: "center",
    justifyContent: 'center',
    background: "gray",
    borderRadius: "25px",
    padding: "20px",
    gap: "20px",
    margin: "20px",
  },
  timerCircle: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  row: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  infoText: {
    color: "white",
    fontSize: "2em",
  },
  disabledText: {
    color: "#8D8D8D",
    fontSize: "2em",
    lineHeight: "40px"
  },
  timerContainer: {
    borderWidth: 0,
    width: "300px",
    height: "300px",
    display: 'flex',
    alignItems: 'center',
    gap: 0,
    position: "relative",
    justifyContent: 'center'
  },
  buttonsContainer: {
    marginTop: "35px",
    display: "flex",
    flexDirection: "row",
    width: 300 * 0.8 + "px",
    justifyContent: "space-between",
  },
  button: {
    backgroundColor: "darkgray",
    padding: 0,
    border: 0,
    width: "68px",
    height: "68px",
  },
};



function Timer({ fileName, projectName, completed, behaviorSubject }: IProjectItem & { behaviorSubject: HTMLElement } ) {
  const [ project, setProject ] = useState<IProject>();
  const [ target, setTarget ] = useState(0);

  const [ activeTask, setActiveTask ] = useState<ITask>();
  const [ startTime, setStartTime ] = useState<number>(0);

  useEffect(() => {
    const functionRef = (e: any) => {
      if (activeTask && e.detail.task.key !== activeTask.key) {
        stopActiveTaskTimer();
      }
    };
    behaviorSubject.addEventListener("active-task-changed", functionRef);

    return () => behaviorSubject.removeEventListener("active-task-changed", functionRef);
  }, []);

  useEffect(() => {
    if (!fileName) return;

    window.electron.projects.getProject(fileName).then((p) => {
      setProject(p);
      setTarget(p.target);

      const t = p.tasks[0];
    });
  }, [fileName])

  function startTaskTimer(task: ITask) {
    behaviorSubject.dispatchEvent(new CustomEvent("active-task-changed", { detail: task }));

    const startTime = Date.now();
    setActiveTask(task);
    setStartTime(startTime);
    window.electron.projects.startTaskLap(project!.key, task.key, startTime).then((task) => {
      setActiveTask(task);
    })
  }

  function stopActiveTaskTimer() {
    setActiveTask(undefined);
    setStartTime(0);

    window.electron.projects.endTaskLap(project!.key, activeTask!.key, Date.now()).then((project) => {
      setProject(project);
    });
  }


  return (
    <div style={styles.container}>
      <TextField
        value={ project?.name || projectName }
        onChange={(value: string) => {

          project!.name = value;
          setProject({ ...project! });
          window.electron.projects.editProjectInfo(project!.key, project!);
        }}
        validator={(value: string) => {

          if (value.length > 50) return "The project name is too long";

          if (value.match(/.,\/\\\(\)/)) return "The project name contains invalid characters";

          return "";
        }} />

      <button type='button' style={ { ...styles.button, display: "flex", padding: 0, flex: 0, flexBasis: "10%" } }>
        { target > 0 ?
            <span style={styles.infoText}> { "Target " + formatMiliseconds.toShortString(target, false) } </span>
          : [
            <img key="icon" src={ AddIcon } style={ { opacity: 0.5 } } />,
            <span key="label" style={ styles.disabledText }> { "Set target" } </span>
          ]
        }
      </button>

      <div style={ styles.timerContainer }>
        <div style={ styles.timerCircle }>
          <TimerCircle
            time={ 0 /** TODO get the total time */ }
            target={ target }
            primaryColor={ "red" }
            secondaryColor={ "orange" }
          />
        </div>
        { project && project.tasks ? project.tasks.map(t => <Clock key={ t.key } totalTime={ t.totalTime } startTime={ startTime } isRunning={ (!!activeTask && t.key === activeTask.key) } target={ target } />) : null }
      </div>

      <div style={ { ... styles.buttonsContainer, flex: 0, flexBasis: "10%" } }>
        <button onClick={ () => activeTask ? stopActiveTaskTimer() : startTaskTimer(project!.tasks![0] ) } style={styles.button}>
          <img src={ activeTask ? PlayIcon : PauseIcon }/>
        </button>
      </div>
    </div>
  );
}

export default Timer;
