

import "./ProjectOverlay.css";
import { IProject } from '../../models/data/project';
import { ConfirmButton } from '../ConfirmButton';
import { ISlide, Slides } from '../Slides';
import { button, div, hr, input } from 'framer-motion/client';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from "framer-motion";

import CloseIcon from 'src/icons/close.svg';
import TextIcon from "src/icons/edit-text.svg";
import TasksIcon from "src/icons/tasks.svg";
import FullscreenIcon from "src/icons/go-fullscreen.svg";
import MiniplayerIcon from "src/icons/miniplayer.svg";
import ColorIcon from "src/icons/color.svg";
import CheckIcon from "src/icons/check.svg";
import DeleteIcon from "src/icons/delete.svg";


const variants = {
  enter: { opacity: 0, transform: "rotate(-45deg) scale(0)" },
  center: {

  },
  exit: { opacity: 1, transform: "rotate(0deg) scale(1)" }
};

const COLORS = [
  "#1b31ff",
  "#646aa2",
  "#9b955c",
  "#e4ce00",

  "#1a68fb",
  "#657c9f",
  "#9a8a5e",
  "#e49e03",

  "#1a91f9",
  "#6483a0",
  "#9b785e",
  "#e56a06",

  "#19cef5",
  "#6197a3",
  "#9f675c",
  "#e6310a",
];

export type ProjectSettingsOverlayAction = "" | "delete-project" | "changed-project" | "edit-project-name" | "edit-task" | "go-fullscreen" | "go-miniscreen" | "complete-project";

export function ProjectSettingsOverlay({
  show,
  onAction,
  project,
  projectTotalTime,
}: {
  show: boolean,
  onAction: (value: ProjectSettingsOverlayAction, ...args: any) => void,
  project: IProject,
  projectTotalTime: number
}) {
  const [ slide, setSlide ] = useState<ISlide>({
    index: 0,
    direction: 1
  });
  const [ color, setColor ] = useState<string>(project.color);

  useEffect(() => {
    setColor(project.color);
  }, [ project ]);

  const setProjectColor = () => {
    window.electron.projects.editProjectInfo(project.key, {
      ...project,
      color: color
    }).then((project) => {
      onAction("changed-project", project);
      setSlide({ index: 0, direction: -1 })
    })
  }

  return (
    <div className="overlay flex-column" is-visible={ show.toString() }>

      {
        slide.index !== 0 ?<button className="overlay-close-btn left" type="button" onClick={ () => setSlide({ direction: -1, index: 0 }) }>
          <img src={ CloseIcon } />
        </button> : null
      }
      <button className="overlay-close-btn right" type="button" onClick={ () => {

        switch (slide.index) {
          case 0:
            onAction("");
            setTimeout(() => {
              setSlide({ direction: -1, index: 0 })
            }, 500)
            break;
          case 1:
            setProjectColor();
            break;
        }
       }}>
        <AnimatePresence initial={ false } mode="wait">
        { slide.index === 0 ?
          <motion.img key="close-i" variants={ variants } initial="enter" animate="exit" src={ CloseIcon } transition={{ type: "spring", bounce: 0.5 }} /> :
          <motion.img key="confirm-i" variants={ variants } initial="enter" animate="exit" src={ CheckIcon } transition={{ type: "spring", bounce: 0.5 }} />
        }
        </AnimatePresence>
      </button>

      <div className='slides-container flex-column'>
        <Slides className='options flex-column' children={[
            [
              <button key="edit-name" type="button" className="option-btn btn-no-background" onClick={ () => onAction("edit-project-name") }>
                <img src={ TextIcon } />
                Edit project name
              </button>,
              <button key="edit-color" type="button" className="option-btn btn-no-background" onClick={ () => setSlide({ direction: 1, index: 1 }) }>
                <img src={ ColorIcon } />
                Change project color
              </button>,
              <button key="edit-tasks" type="button" disabled={ project.tasks.length < 2 } className="option-btn btn-no-background" onClick={ () => setSlide({ direction: 1, index: 1 }) }>
                <img src={ TasksIcon } />
                Edit tasks
              </button>,
              <button key="view-fullscreen" type="button" className="option-btn btn-no-background" onClick={ () => onAction("go-fullscreen") }>
                <img src={ FullscreenIcon } />
                Make timer fullscreen
              </button>,
              <button key="view-miniplayer" type="button" className="option-btn btn-no-background" onClick={ () => onAction("go-miniscreen") }>
                <img src={ MiniplayerIcon } />
                View timer in mini-window
              </button>,
              projectTotalTime === 0 ?
                <ConfirmButton key="delete-btn" className="option-btn btn-no-background" onConfirmed={ () => onAction("delete-project") } text={[
                  <img key="delete-icon" src={ DeleteIcon } />,
                  "Delete project",
                ]} />
                : <ConfirmButton key="confirm-btn" className="option-btn btn-no-background" onConfirmed={ () => onAction("complete-project") } text={[
                  <img  key="check-icon" src={ CheckIcon } />,
                  project.completed ? "Set project as completed" : "Set project as uncompleted",
                ]} />,
            ],
            [
              [
                <div key="color-swatch" className="color-swatch">
                  {
                    COLORS.map(c => <div key={ "color-" + c } className="color-btn" is-selected={ (c === color).toString() } style={{ backgroundColor: c }} onClick={() => setColor(c) }></div>)
                  }
                </div>,
                <hr key="separator" className="color-swatch-separator w-100" />,

                <div key="color-custom" className="flex-column w-100">
                  <span className="label">Custom color:</span>
                  <input type="color" value={ color } is-selected={ (COLORS.indexOf(color) === -1).toString() } onChange={ e => setColor(e.target.value) } />
                </div>,
              ]
            ]
          ]} slide={ slide } />
      </div>
    </div>
  )
}
