import { useEffect, useRef, useState } from "react";
import { IProjectItem } from "../../models/data/projectItem";
import { formatMiliseconds, getMonthDays, transformMiliseconds } from "../../../util/time";

import "./TimeSheetTable.css";
import { div } from "framer-motion/client";
import { ITimeSheet } from "../../models/data/timeSheet";
import { DayEventsView } from "../DayEventsView/DayEventsView";

interface ISheetRow { name: string, days: { [date: number]: number }, totalTime: number }
export interface IDaySelection { year: number, month: number, day: number };

export function TimeSheetTable({
  monthIndex,
  year,
  projects,
  onSelectedDay,
}: {
  monthIndex: number,
  year: number,
  projects?: { [key: string]: IProjectItem },
  onSelectedDay: (day: IDaySelection) => void
}) {
  const [ days, setDays ] = useState<ReturnType<typeof getMonthDays>>([]);
  const [ rows, setRows ] = useState<ISheetRow[]>([]);
  const [ daysTotals, setDaysTotal ] = useState<{ [day: string]: number }>({});
  const [ selectedDay, setSelectedDay ] = useState<IDaySelection>();

  const selectDay = (year: number, month: number, day: number) => {
    setSelectedDay({ year, month, day });
    onSelectedDay({ year, month, day });
  };

  useEffect(() => {
    setDays(getMonthDays(monthIndex, year));
  }, [monthIndex, year]);

  useEffect(() => {
    const today = new Date();
    selectDay(today.getFullYear(), today.getMonth() + 1, today.getDate());
  }, []);

  useEffect(() => {
    if (monthIndex == null || year == null || !projects) return;

    getLaps();
  }, [monthIndex, year, projects]);

  const getLaps = () => {
    if (!projects) return;

    window.electron.timeSheet.getTimeSheetByMonth(monthIndex + 1, year).then((laps) => {

      if (!laps || !laps.length) {
        setRows([]);
        setDaysTotal({});
        return;
      }

      const tempDaysTotals: any = {};
      const projectsObject = laps.reduce((p, c) => {
        const totalLapTime = c.endDateSinceEpoch - c.startDateSinceEpoch;

        if (!p[c.projectKey]) {
          p[c.projectKey] = {
            name: projects[c.projectKey].projectName || c.projectKey,
            days: {
              [c.date]: totalLapTime,
            },
            totalTime: totalLapTime,
          }
        } else {
          p[c.projectKey].days[c.date] = (p[c.projectKey].days[c.date] || 0) + totalLapTime;
          p[c.projectKey].totalTime += totalLapTime;
        }

        tempDaysTotals[c.date] = (tempDaysTotals[c.date] || 0) + totalLapTime;

        return p;
      }, {} as { [ projectKey: string]: ISheetRow });

      setRows(Object.values(projectsObject));
      setDaysTotal(tempDaysTotals);
    });
  };

  useEffect(() => {
    const todayEl = document.querySelector('.time-sheet-table th[is-today="true"]');
    if (todayEl) {
      todayEl.scrollIntoView({ behavior: "smooth", inline: "center" });
    } else {
      const firstEl = document.querySelector('.time-sheet-table th[is-today="false"]');
      firstEl &&firstEl.scrollIntoView({ behavior: "smooth", inline: "end" });
    }
  });

  return (
    <div className="overflow-auto w-100">
      <table className="time-sheet-table">
          <thead>
            <tr>
              <th>Project</th>
              { days.map((d, i) => <th onClick={ () => selectDay(year, monthIndex, d.date) } key={ d.weekDayShort + "_" + i } aria-weekday={ d.weekDayIndex } is-today={ d.isToday.toString() }>
                <span className="time-sheet-date">{ d.date }</span>
                <span className="time-sheet-weekday">{ d.weekDayShort }</span>
              </th>) }
              <th>Total</th>
            </tr>
          </thead>
          <tbody>{
            rows.length ? [ ...rows.map((r, r_i) =>
                <tr key={ "time-sheet-row-" + r_i } className="time-sheet-row" style={{ animationDelay: (r_i + 1) * 0.25 + "s" }}>
                  <td key={ "name_col_" + r_i }>{r.name}</td>
                  {
                    days.map(d => <td key={ "time_col_" + r_i + d.date } aria-weekday={ d.weekDayIndex } is-today={ d.isToday.toString() }>{ r.days[d.date] ? formatMiliseconds.toShortString(r.days[d.date], false) : "-" }</td>)
                  }
                  <td key={ "total_col_" + r_i }>{formatMiliseconds.toShortString(r.totalTime, false)}</td>
                </tr>
              ),
              <tr className="time-sheet-row time-sheet-total-row">
                <td></td>
                {
                  days.map(d => <td key={ "time_col_total" + d.date } aria-weekday={ d.weekDayIndex } is-today={ d.isToday.toString() }>{ daysTotals[d.date] ? formatMiliseconds.toShortString(daysTotals[d.date], false) : "0" }</td>)
                }
                <td></td>
              </tr>
            ] : <tr className="time-sheet-no-data"><td colSpan={days.length + 2}><span>No data</span></td></tr>
          }</tbody>
        </table>
     </div>
  );
}
