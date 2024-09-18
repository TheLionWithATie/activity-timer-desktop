import { IProject } from '../../models/data/project';
import { ConfirmButton } from '../ConfirmButton';
import { button, div, input } from 'framer-motion/client';
import { useEffect, useState } from 'react';

import CloseIcon from 'src/icons/close.svg';
import CheckIcon from 'src/icons/check.svg';
import "./ProjectOverlay.css";

export type ProjectNotesOverlayAction = "" | "changed-project";

export function ProjectNotesOverlay({
  show,
  onAction,
  project,
}: {
  show: boolean,
  onAction: (value: ProjectNotesOverlayAction, ...args: any) => void,
  project: IProject,
}) {
  const [ text, setText ] = useState(project.description);
  const [ isFocused, setFocused ] = useState(false);

  useEffect(() => {
    setText(project.description);
  }, [ show ]);

  const setProjectNotes = (exit: boolean = true) => {
    if (canSave()) {
      window.electron.projects.editProjectInfo(project.key, {
        ...project,
        description: text,
      }).then((project) => {
        onAction("changed-project", project, exit);
      })
    } else if (exit) {
      onAction("");
    }
  }

  const canSave = () => {
    return text.trim() !== project.description;
  }

  return (
    <div className="overlay flex-column" is-visible={ show.toString() }>

      <button className="overlay-close-btn left" type="button" onClick={ () => onAction("") }>
        <img src={ CloseIcon } />
      </button>
      <button className="overlay-close-btn right" disabled={ canSave() } type="button" onClick={ () => setProjectNotes(true) }>
        <img src={ CheckIcon } />
      </button>

      <textarea className="overlay-textarea" is-empty={ (!text).toString() } value={ (text.trim() || isFocused) ? text : "Write a note..." } onFocus={ () => setFocused(true) } onBlur={ () => setFocused(false) } onChange={ (e) => setText(e.target.value) } onKeyDown={(k) => {
        if (k.key === "Enter" && k.ctrlKey) {
          setProjectNotes(true);
        } else if (k.key === "s" && k.ctrlKey) {
          setProjectNotes(false);
        }
      }} />
    </div>
  )
}
