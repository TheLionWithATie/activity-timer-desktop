import { useState } from "react";


export function ConfirmButton({
  text,
  onConfirmed,
  className,
}: { text: React.ReactNode, onConfirmed: () => void, className: string }) {
  const [ firstClick, setFirstClick ] = useState(false);

  return (
    <button type="button" has-clicked={ firstClick.toString() } className={ "btn-confirm " + className } onClick={ () => { firstClick ? (setFirstClick(true), onConfirmed()) : setFirstClick(true) }}  onMouseLeave={ () => setFirstClick(false) }>
      {
        firstClick ? "Click again to confirm" : text
      }
    </button>
  )
}
