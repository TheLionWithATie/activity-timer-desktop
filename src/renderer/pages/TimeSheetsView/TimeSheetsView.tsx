import { useEffect, useState } from "react";
import { InfiniteSelector } from "../../components/infiniteSelector/InfiniteSelector";
import { IProjectItem } from "../../models/data/projectItem";
import { formatMiliseconds, MONTH_NAMES, monthIndexToMonthObj } from "../../../util/time";
import { TimeSheetTable } from "../../components/TimeSheetTable/TimeSheetTable";

import "./TimeSheetsView.css";

export function TimeSheetsView() {
  const [ year, setYear ] = useState(new Date().getFullYear());
  const [ month, setMonth ] = useState( monthIndexToMonthObj( new Date().getMonth(), year ) );
  const [ projects, setProjects ] = useState< { [key: string]: IProjectItem }>();


  useEffect(() => {
    window.electron.projects.getProjects().then((projects) => {
      setProjects( projects.reduce((p, c) => {
        p[c.fileName] = c;
        return p;
      }, {} as any) );
    });
  }, [])

  return (
    <div className="laps-pageContainer">
      <div className="laps-filters-container">
        <div className="laps-year-selector">
          <InfiniteSelector initialValue={ year } getPrevValue={year => year - 1} getNextValue={year => year + 1} onChange={ setYear } />
        </div>
        <div className="laps-month-selector">
          <InfiniteSelector
            initialValue={ month }
            viewKey="name"
            getPrevValue={(c) => {
              if (c.index == 0) {
                return {
                  index: 11,
                  year: c.year - 1,
                  name: MONTH_NAMES[11],
                }
              }
              return {
                index: c.index - 1,
                year: c.year,
                name: MONTH_NAMES[c.index - 1],
              }
            }}
            getNextValue={(c) => {
              if (c.index == 11) {
                return {
                  index: 0,
                  year: c.year + 1,
                  name: MONTH_NAMES[0],
                }
              }
              return {
                index: c.index + 1,
                year: c.year,
                name: MONTH_NAMES[c.index + 1],
              }
            }}
            onChange={(v) => {
              setMonth(v);
              if (v.year !== year) setYear(v.year);
            }}
          />
        </div>
      </div>
      <div className="laps-view-container flex-column overflow-auto">
        <TimeSheetTable monthIndex={ month.index } year={ month.year } projects={projects} />
      </div>

    </div>
  );
}
