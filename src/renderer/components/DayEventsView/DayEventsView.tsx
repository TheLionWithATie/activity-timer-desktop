import { use } from "framer-motion/client"
import { useEffect, useState } from "react"
import { formatMiliseconds, transformMiliseconds } from "../../../util/time";
import { ITimeSheet } from "../../models/data/timeSheet";


export function DayEventsView({
  year,
  month,
  day,
}: {
  year: number,
  month: number,
  day: number
}) {
  const [ selectedDay, setSelectedDay ] = useState<ITimeSheet[]>();

  useEffect(() => {
    window.electron.timeSheet.getTimeSheetByMonth(month + 1, year).then((laps) => {
      if (!laps) return setSelectedDay([]);

      const startOfDay = new Date(year, month, day).getTime();
      setSelectedDay(laps.reduce((p, c) => {
        if (c.date == day) {
          const start = transformMiliseconds.toTimeObject(c.startDateSinceEpoch - startOfDay);

          p.push({
            ...c,
            topOffset: (start.hours * 30) + (start.minutes * 0.5),
            height: (c.endDateSinceEpoch - c.startDateSinceEpoch) / 1000 / 60 * 0.5,
          });
        }
        return p;
      }, [] as (ITimeSheet & { topOffset: number, height: number })[]));
    });
  }, [year, month, day]);

  return (
    <div className="time-sheet-selected-day-container">
      {
        [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23 ].map((d, d_i) =>
          <div key={ d_i } style={{
            position: "absolute",
            borderBottom: "1px solid #ffffff30",
            left: 0,
            right: 0,
            top: d * 30 + "px",
            padding: "2px 10px",
            height: "30px",
          }} className="time-sheet-table-tooltip">{ d }</div>
        )
      }
      {
        selectedDay && selectedDay.map((d: any, d_i) =>
          <div key={ d_i } style={{
            position: "absolute",
            backgroundColor: "blue",
            left: 0,
            right: 0,
            top: d.topOffset + "px",
            height: d.height + "px",
          }} className="time-sheet-table-tooltip">{ d.projectKey } - { d.taskKey } - { formatMiliseconds.toShortString(d.endDateSinceEpoch - d.startDateSinceEpoch, false) }</div>
        )
    }
    </div>
  )
}
