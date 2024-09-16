import { useState } from "react";


export function ConfirmButton({
  text,
  onConfirmed
}: { text: string, onConfirmed: () => void }) {
  const [ fistClick, setFistClick ] = useState(false);

  return (
    <button type="button" className={ "" } onClick={ () => { fistClick ? (setFistClick(true), onConfirmed()) : setFistClick(true) }}  onMouseLeave={ () => setFistClick(false) }>
      {
        fistClick ? "Click again to confirm" : text
      }
    </button>
  )
}
