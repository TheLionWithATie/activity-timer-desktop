
import CloseIcon from 'src/icons/close.svg';

import "./ProjectOverlay.css";
import { IProject } from '../../models/data/project';
import { ConfirmButton } from '../ConfirmButton';

export type ProjectSettingsOverlayAction = "" | "edit-project-name" | "edit-task" | "go-fullscreen" | "go-miniscreen" | "complete-project";

export function ProjectSettingsOverlay({
  show,
  onAction,
  project,
}: {
  show: boolean,
  onAction: (value: ProjectSettingsOverlayAction) => void,
  project: IProject,
}) {

  const showTasksEditTab = () => {

  };

  return (
    <div className="overlay flex-column" aria-visible={ show.toString() }>
      <div className="overlay-close-btn-container">
        <button className="overlay-close-btn right" type="button" onClick={ () => onAction("") }>
          <img src={ CloseIcon } />
        </button>

        <div className="options flex-column">
          <button type="button" onClick={ () => onAction("edit-project-name") }>Edit project name</button>
          <button type="button" onClick={ () => showTasksEditTab() }>Edit tasks</button>
          <button type="button" onClick={ () => onAction("go-fullscreen") }>Make timer fullscreen</button>
          <button type="button" onClick={ () => onAction("go-miniscreen") }>View timer in miniwindow</button>
          <ConfirmButton text="Set project as completed" onConfirmed={ () => onAction("complete-project") } />
        </div>
      </div>
    </div>
  )
}
