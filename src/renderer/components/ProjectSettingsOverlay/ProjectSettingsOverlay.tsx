
import CloseIcon from 'src/icons/close.svg';

export function ProjectSettingsOverlay({

}: {

}) {

  return (
    <div className="overlay">
      <div className="overlay-close-btn-container">
        <button className="overlay-close-btn">
          <img src={ CloseIcon } />
        </button>
      </div>
    </div>
  )
}