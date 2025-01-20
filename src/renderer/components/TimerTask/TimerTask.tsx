

import { formatMiliseconds, transformMiliseconds } from "../../../util/time";
import { taskNameValidator } from "../../../util/validators";
import { IProject } from "../../models/data/project";
import { ITask } from "../../models/data/task";
import { TextField } from "../fields/TextField";
import "./TimerTask.css";

import PlayIcon from "src/icons/play.svg";
import PauseIcon from "src/icons/pause.svg";

export function TimerTask({
  projectKey,
  task,
  isActiveTask,
  isLastPlayedTask,
  tasks,
  onPlayClick,
  onPauseClick,
  updatedTask,
}: {
  projectKey: string,
  task: ITask,
  isActiveTask: boolean,
  isLastPlayedTask: boolean,
  tasks: ITask[],
  onPlayClick?: () => void
  onPauseClick?: () => void
  updatedTask: (project: IProject) => void
}) {
  return (
    <div className="flex-row timer-task" is-active={ isActiveTask.toString() } aria-selected={ (isActiveTask || isLastPlayedTask) } aria-disabled={ task.completed }>
      <div className="timer-task-indicator btn flex-row" onClick={ isActiveTask ? onPauseClick : onPlayClick }>
        <img src={ isActiveTask ? PauseIcon : PlayIcon } />
      </div>
      <span className="flex-grow timer-task-description">
        <TextField
          value={ task.description }
          onChange={(value: string) => {

            task.description = value;
            window.electron.projects.editTask(projectKey, task.key, task).then((project) => {
              updatedTask(project!);
            })
          }}
          validator={(value: string) => {
            return taskNameValidator(tasks, value);
          }}
        />
      </span>
      <span className="timer-task-time">
          { formatMiliseconds.toLongString(task.totalTime, false, false) }
      </span>
    </div>
  )
}
