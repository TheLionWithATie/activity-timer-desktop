import CSS from "csstype";
import { useEffect, useState } from "react";
import { TimerCircle } from "../TimerCircle";
import { formatMiliseconds, getMiliseconds, padStart, transformMiliseconds } from "../../../util/time";

import "./clock.css";
import { TextField } from "../fields/TextField";
import { targetValidator } from "../../../util/validators";

function getFormattedClockTime(time: number) {
  const ft = transformMiliseconds.toTimeObject(time);
  return {
    formattedTime: formatMiliseconds.toLongString(time, false, false),
    formattedSubTime: ft.seconds.toString(),
  };
}

export function Clock({
  totalTime,
  startTime,
  target,
  isRunning,
  showSeconds,
  changeTarget,
}: {
  totalTime: number,
  startTime: number,
  target: number,
  isRunning: boolean,
  showSeconds?: boolean | "inline",
  changeTarget: (target: number) => void
}) {
  const getCalculatedTime = () => (startTime ? Date.now() - startTime : 0) + (totalTime || 0);
  const [ isEditingTarget, setIsEditingTarget ] = useState(false);
  const [ formattedTime, setFormattedTime ] = useState<{
    formattedTime: string,
    formattedSubTime: string,
  }>(getFormattedClockTime(getCalculatedTime()));

  useEffect(() => {
    setFormattedTime(
      getFormattedClockTime(getCalculatedTime())
    );

    if (!isRunning) return;

    const intervalId = setInterval(() => {
      setFormattedTime(
        getFormattedClockTime(getCalculatedTime())
      );
    }, 1000)

    return () => clearInterval(intervalId);

  }, [ totalTime, startTime, isRunning ])


  return (
    <div className="clock flex-column" show-seconds={ (showSeconds || true).toString() }>
      <span className="clock-text">{`${ formattedTime.formattedTime }`}</span>
      {
        (showSeconds === false) ? null : <span className="clock-sub-text">{`${ formattedTime.formattedSubTime }`}</span>
      }
      {
        !target && !isEditingTarget ?
          <button className="target-button" onClick={ () => setIsEditingTarget(true) }>SET TARGET</button>
        : <TextField
            setFocus={ isEditingTarget }
            value={ formatMiliseconds.toLongString(target) }
            onCancel={() => setIsEditingTarget(false)}
            onChange={(value: string) => {
              const m = getMiliseconds.fromTimeString(value)
              changeTarget(m);
            }}
            validator={ targetValidator } />
      }
    </div>
  );
}
