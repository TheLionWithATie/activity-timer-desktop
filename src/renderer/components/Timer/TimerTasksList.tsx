import { useEffect, useState } from "react";
import { taskNameValidator } from "../../../util/validators";
import { IProject } from "../../models/data/project";
import { TextField } from "../fields/TextField";
import { TimerTask } from "../TimerTask/TimerTask";
import { ITask } from "../../models/data/task";


export function TimerTasksList({
  activeTask,
  lastActiveTask,
  project,
  projectChanged,
  startTaskTimer,
  createNewTask,
}: {
  activeTask: ITask | undefined,
  lastActiveTask: ITask | undefined,
  project: IProject,
  projectChanged: (project: IProject) => void,
  startTaskTimer: (task: ITask) => void,
  createNewTask: boolean
}) {
  const [ newTaskName, setNewTaskName ] = useState<string | 0>(0);
  const [ activeTasks, setActiveTasks ] = useState<ITask[]>([]);
  const [ inactiveTasks, setInactiveTasks ] = useState<ITask[]>([]);

  useEffect(() => {
    if (createNewTask) {
      setNewTaskName(0);
    }
  }, [createNewTask]);

  useEffect(() => {
    const tasks = project.tasks.sort((a, b) => a.description.localeCompare(b.description) )
    setActiveTasks(tasks.filter(t => !t.completed));
    setInactiveTasks(tasks.filter(t => t.completed));
  }, [project]);

  const getTasksComponentsList = (tasks: ITask[]) => tasks.map((t) =>
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
        projectChanged(project);
      }} />
  )

  return (
    <div className="timer-tasks-list flex-column">
      {
        getTasksComponentsList(activeTasks)
      }
      {
        newTaskName !== 0 ?
          <TextField
            value={ newTaskName }
            onCancel={() => setNewTaskName(0)}
            onChange={(value: string) => {
              setNewTaskName(0);
              window.electron.projects.addTask(project!.key, value).then((project) => {
                projectChanged({ ...project! });
              })
            }}
            validator={(value: string) => {
              return taskNameValidator(project?.tasks, value);
            }}
          /> : null
      }
      {
        getTasksComponentsList(inactiveTasks)
      }
    </div>
  )
}
