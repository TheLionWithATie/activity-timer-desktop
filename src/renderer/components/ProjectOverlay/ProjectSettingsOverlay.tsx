

import "./ProjectOverlay.css";
import { IProject } from '../../models/data/project';
import { ConfirmButton } from '../ConfirmButton';
import { ISlide, Slides } from '../slides';
import { button, div, input } from 'framer-motion/client';
import { useState } from 'react';

import CloseIcon from 'src/icons/close.svg';
import TextIcon from "src/icons/edit-text.svg";
import TasksIcon from "src/icons/tasks.svg";
import FullscreenIcon from "src/icons/go-fullscreen.svg";
import MiniplayerIcon from "src/icons/miniplayer.svg";
import ColorIcon from "src/icons/color.svg";
import CheckIcon from "src/icons/check.svg";

export type ProjectSettingsOverlayAction = "" | "edit-project-name" | "edit-task" | "go-fullscreen" | "go-miniscreen" | "complete-project";

export function ProjectSettingsOverlay({
  show,
  onAction,
  project,
}: {
  show: boolean,
  onAction: (value: ProjectSettingsOverlayAction, ...args: any) => void,
  project: IProject,
}) {
  const [ slide, setSlide ] = useState<ISlide>({
    index: 0,
    direction: 1
  });

  const showTasksEditTab = () => {

  };

  return (
    <div className="overlay flex-column" is-visible={ show.toString() }>

      <button className="overlay-close-btn right" type="button" onClick={ () => {
        onAction("");
        setTimeout(() => {
          setSlide({ direction: -1, index: 0 })
        }, 500)
       }}>
        <img src={ CloseIcon } />
      </button>


      <div className='slides-container flex-column'>
        <Slides className='options flex-column' children={[
            [
              <button type="button" className="option-btn btn-no-background" onClick={ () => onAction("edit-project-name") }>
                <img src={ TextIcon } />
                Edit project name
              </button>,
              <button type="button" className="option-btn btn-no-background" onClick={ () => setSlide({ direction: 1, index: 1 }) }>
                <img src={ ColorIcon } />
                Change project color
              </button>,
              <button type="button" disabled={ project.tasks.length < 2 } className="option-btn btn-no-background" onClick={ () => showTasksEditTab() }>
                <img src={ TasksIcon } />
                Edit tasks
              </button>,
              <button type="button" className="option-btn btn-no-background" onClick={ () => onAction("go-fullscreen") }>
                <img src={ FullscreenIcon } />
                Make timer fullscreen
              </button>,
              <button type="button" className="option-btn btn-no-background" onClick={ () => onAction("go-miniscreen") }>
                <img src={ MiniplayerIcon } />
                View timer in mini-window
              </button>,
              <ConfirmButton className="option-btn btn-no-background" onConfirmed={ () => onAction("complete-project") } text={[
                <img src={ TextIcon } />,
                "Set project as completed"
              ]} />,
            ],
            [
              [
                <input type="color" />,
                <button type="button" onClick={ () => setSlide({ direction: -1, index: 0 }) }></button>
              ]
            ]
          ]} slide={ slide } />
      </div>
    </div>
  )
}
