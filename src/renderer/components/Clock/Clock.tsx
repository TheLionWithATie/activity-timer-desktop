import CSS from "csstype";
import { useEffect, useState } from "react";
import { TimerCircle } from "../TimerCircle";
import { formatMiliseconds, padStart, transformMiliseconds } from "../../../util/time";

import "./clock.css";

function getFormattedClockTime(time: number) {
  const ft = transformMiliseconds.toTimeObject(time);
  return {
    formattedTime: padStart(ft.hours) + ":" + padStart(ft.minutes),
    formattedSubTime: ft.seconds.toString(),
  };
}

export function Clock({
  totalTime,
  startTime,
  isRunning,
  showSeconds,
}: {
  totalTime: number,
  startTime: number,
  isRunning: boolean,
  showSeconds?: boolean | "inline",
}) {
  const [ formattedTime, setFormattedTime ] = useState<{
    formattedTime: string,
    formattedSubTime: string,
  }>(getFormattedClockTime(totalTime));

  useEffect(() => {
    setFormattedTime(
      getFormattedClockTime(totalTime)
    );
  }, [totalTime]);

  useEffect(() => {
    if (!isRunning) return;

    const intervalId = setInterval(() => {

      setFormattedTime(
        getFormattedClockTime( Date.now() - startTime + totalTime )
      );

    }, 1000)

    return () => clearInterval(intervalId);

  }, [ startTime, isRunning ])


  return (
    <div className="clock flex-column" show-seconds={ (showSeconds || true).toString() }>
      <span className="clock-text">{`${ formattedTime.formattedTime }`}</span>
      {
        (showSeconds === false) ? null : <span className="clock-sub-text">{`${ formattedTime.formattedSubTime }`}</span>
      }
    </div>
  );
}
