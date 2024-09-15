import CSS from "csstype";
import { useEffect, useState } from "react";
import { TimerCircle } from "./TimerCircle";
import { formatMiliseconds } from "../../util/time";

const styles: { [key: string]: CSS.Properties } = {
  timerText: {
    color: "white",
    fontFamily: "Roboto",
    padding: 0,
    fontSize: "85px",
    paddingBottom: "20px",
    margin: 0
  },
  timerSubText: {
    position: "absolute",
    fontFamily: "Roboto",
    fontWeight: "bold",
    bottom: "28%",
    color: "#8D8D8D",
    fontSize: "36px",
    margin: 0,
  },
}
export function Clock({ totalTime, startTime, isRunning, target }: { totalTime: number, startTime: number, isRunning: boolean, target: number }) {
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
      <span style={styles.timerText}>{`${ formattedTime.formattedTime }`}</span>
      <span style={styles.timerSubText}>{`${ formattedTime.formattedSubTime }`}</span>
    </div>
  );
}
