import { style, use } from "framer-motion/client"
import { useEffect, useState } from "react"
import { formatMiliseconds, transformMiliseconds } from "../../../util/time";
import { ITimeSheet } from "../../models/data/timeSheet";
import { IProject } from "../../models/data/project";

const MIN_HEIGHT = 15;
const HOUR_HEIGHT = 100;
const MINUTE_HEIGHT = HOUR_HEIGHT / 60;

export function DayEventsView({
  timeSheetData,
  projectsData,
  year,
  month,
  day,
}: {
  timeSheetData: ITimeSheet[],
  projectsData: { [key: string]: IProject | null },
  year: number,
  month: number,
  day: number
}) {
  const [ selectedDay, setSelectedDay ] = useState<ITimeSheet[]>();

  useEffect(() => {

    if (!timeSheetData) return setSelectedDay([]);

    const startOfDay = new Date(year, month, day).getTime();
    const timeSheetLaps = timeSheetData.reduce((p, c) => {
      if (c.date == day) {
        const start = transformMiliseconds.toTimeObject(c.startDateSinceEpoch - startOfDay);
        const topOffset = (start.hours * HOUR_HEIGHT) + (start.minutes * MINUTE_HEIGHT);
        const height = (c.endDateSinceEpoch - c.startDateSinceEpoch) / 1000 / 60 * 0.5

        p.push({
          ...c,
          width: 1,
          leftOffset: 0,
          topOffset: topOffset,
          height: height < MIN_HEIGHT ? MIN_HEIGHT : height,
        });

        const prevLap = p[p.length - 2];
        if (prevLap && (prevLap.topOffset + prevLap.height > topOffset)) {
          const newWidth = prevLap.width + 1;

          for (let i = newWidth-1; i > -1; i--) {
            if (p[ p.length - i ]) p[ p.length - i ].width = newWidth;
          }
        }
      }
      return p;
    }, [] as (ITimeSheet & { topOffset: number, height: number, leftOffset: number, width: number })[]);

    let counter = 0;

    setSelectedDay(timeSheetLaps.map((lap) => {
      lap.width = 100 /lap.width
      if (lap.width !== 100) {
        counter += 1;
      } else {
        counter = 0;
      }
      lap.leftOffset = lap.width * counter;

      return lap;
    }));

  }, [year, month, day, timeSheetData]);

  return (
    <div className="time-sheet-selected-day-container">
      <style>
        {`.time-sheet-selected-day-conatiner {
          --hour-height: ${ HOUR_HEIGHT }px;
        }`}
      </style>
      {
        [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23 ].map((d, d_i) =>
          <div key={ d_i } style={{
            position: "absolute",
            borderBottom: "1px solid #ffffff30",
            left: 0,
            right: 0,
            top: d * HOUR_HEIGHT + "px",
            padding: "2px 10px",
            height: HOUR_HEIGHT + "px",
          }} className="time-sheet-table-tooltip">{ d }</div>
        )
      }
      {
        selectedDay && selectedDay.map((d: any, d_i) =>
          <div key={ d_i } style={{
            position: "absolute",
            border: "2px solid red",
            right: 0,
            width: d.width + "%",
            left: d.leftOffset + "%",
            top: d.topOffset + "px",
            height: d.height + "px",
          }} className="time-sheet-table-tooltip">{ d.projectKey } - { d.taskKey } - { formatMiliseconds.toShortString(d.endDateSinceEpoch - d.startDateSinceEpoch, false) }</div>
        )
    }
    </div>
  )
}
