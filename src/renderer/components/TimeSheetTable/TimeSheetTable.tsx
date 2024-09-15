import { useEffect, useRef, useState } from "react";
import { IProjectItem } from "../../models/data/projectItem";
import { formatMiliseconds, getMonthDays } from "../../../util/time";

import "./TimeSheetTable.css";

interface ISheetRow { name: string, days: { [date: number]: string }, totalTime: number }


export function TimeSheetTable({
  monthIndex,
  year,
  projects,
}: {
  monthIndex: number,
  year: number,
  projects?: { [key: string]: IProjectItem },
}) {
  const [ days, setDays ] = useState<ReturnType<typeof getMonthDays>>([]);
  const [ rows, setRows ] = useState<ISheetRow[]>([]);
  const [ daysTotals, setDaysTotal ] = useState<{ [day: string]: number }>({});

  useEffect(() => {
    setDays(getMonthDays(monthIndex, year));
  }, [monthIndex, year]);

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
              [c.date]: formatMiliseconds.toShortString(totalLapTime),
            },
            totalTime: totalLapTime,
          }
        } else {
          p[c.projectKey].days[c.date] = formatMiliseconds.toShortString(totalLapTime, false);
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
    <table className="time-sheet-table">
      <thead>
        <tr>
          <th>Project</th>
          { days.map((d, i) => <th key={ d.weekDayShort + "_" + i } aria-weekday={ d.weekDayIndex } is-today={ d.isToday.toString() }>
            <span className="time-sheet-date">{ d.date }</span>
            <span className="time-sheet-weekday">{ d.weekDayShort }</span>
          </th>) }
          <th>Total</th>
        </tr>
      </thead>
      <tbody>{
        rows.length ? [ ...rows.map((r, r_i) =>
            <tr className="time-sheet-row" style={{ animationDelay: (r_i + 1) * 0.25 + "s" }}>
              <td key={ "name_col_" + r_i }>{r.name}</td>
              {
                days.map(d => <td key={ "time_col_" + r_i + d.date } aria-weekday={ d.weekDayIndex } is-today={ d.isToday.toString() }>{ r.days[d.date] || "-" }</td>)
              }
              <td key={ "total_col_" + r_i }>{formatMiliseconds.toShortString(r.totalTime)}</td>
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
  );
}
