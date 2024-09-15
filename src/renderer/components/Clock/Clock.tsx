import CSS from "csstype";
import { useEffect, useState } from "react";
import { TimerCircle } from "../TimerCircle";
import { formatMiliseconds } from "../../../util/time";

import "./clock.css";

export function Clock({
  totalTime,
  startTime,
  isRunning,
  showSeconds,
  target
}: {
  totalTime: number,
  startTime: number,
  isRunning: boolean,
  showSeconds?: boolean,
  target: number
}) {
  const [ time, setTime ] = useState(totalTime);

  useEffect(() => {
    setTime(totalTime);
  }, [totalTime]);

  useEffect(() => {
    if (!isRunning) return;

    const intervalId = setInterval(() => {
      setTime( Date.now() - startTime + totalTime );
    }, 1000)

    return () => clearInterval(intervalId);

  }, [ startTime ])

  const ft = formatMiliseconds.toShortString(time).split(".")
  const formattedTime = {
    formattedTime: ft[0],
    formattedSubTime: ft[1],
  };

  return (
    <div style={ { display: "flex", flexDirection: "column", alignItems: "center", } }>
      <span className="clock-text">{`${ formattedTime.formattedTime }`}</span>
      {
        showSeconds === false ? null : <span  className="clock-sub-text">{`${ formattedTime.formattedSubTime }`}</span>
      }
    </div>
  );
}
