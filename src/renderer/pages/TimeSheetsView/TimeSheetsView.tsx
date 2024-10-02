import { useEffect, useState } from "react";
import { InfiniteSelector } from "../../components/infiniteSelector/InfiniteSelector";
import { IProjectItem } from "../../models/data/projectItem";
import { formatMiliseconds, MONTH_NAMES, monthIndexToMonthObj } from "../../../util/time";
import { IDaySelection, TimeSheetTable } from "../../components/TimeSheetTable/TimeSheetTable";

import "./TimeSheetsView.css";
import { DayEventsView } from "../../components/DayEventsView/DayEventsView";
import { IProject } from "../../models/data/project";
import { ITimeSheet } from "../../models/data/timeSheet";

export function TimeSheetsView() {

  const [ month, setMonth ] = useState( monthIndexToMonthObj( new Date().getMonth(), new Date().getFullYear() ) );
  const [ selectedDay, setSelectedDay ] = useState<IDaySelection>((() => {
    const today = new Date();
    return { year: today.getFullYear(), monthIndex: today.getMonth(), day: today.getDate() };
   })());

  /** List of all projects */
  const [ projects, setProjects ] = useState< { [key: string]: IProjectItem }>({});
  /** List the projects in the current month */
  const [ projectsData, setProjectsData ] = useState< { [key: string]: IProject | null }>({});

  const [ timeSheetData, setTimeSheetData ] = useState<ITimeSheet[]>([]);

  useEffect(() => {
    window.electron.projects.getProjects().then((projects) => {
      setProjects( projects.reduce((p, c) => {
        p[c.fileName] = c;
        return p;
      }, {} as any) );
    });
  }, [])

  useEffect(() => {
    getTimeSheetData();
  }, [ month ])


  const getTimeSheetData = () => {
    window.electron.timeSheet.getTimeSheetByMonth(month.index + 1, month.year).then((timeSheets) => {

      setTimeSheetData(timeSheets);
      setProjectsData( timeSheets.reduce((p, c) => {
        if (p[c.projectKey] === undefined) {
          p[c.projectKey] = null;
          getProjectData(c.projectKey);
        }

        return p;
      }, {} as { [key: string]: IProject | null }) )
    });
  }

  const getProjectData = (projectKey: string) => {
    window.electron.projects.getProject(projectKey).then((project) => {
      projectsData[projectKey] = project;
      setProjectsData(projectsData);
    })
  }

  return (
    <div className="laps-pageContainer">
      <div className="laps-filters-container">
        <div className="laps-year-selector">
          <InfiniteSelector initialValue={ month.year } getPrevValue={year => year - 1} getNextValue={year => year + 1} onChange={ (year) => setMonth({ index: month.index, name: month.name, year }) } />
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
            }}
          />
        </div>
      </div>
      <div className="laps-view-container flex-column overflow-auto">
        <TimeSheetTable timeSheetData={ timeSheetData } projectsData={ projectsData } monthIndex={ month.index } year={ month.year } projects={projects} selectedDay={selectedDay} onSelectedDayChange={(day) => setSelectedDay(day)}  />
        { selectedDay && <DayEventsView projectsData={ projectsData } timeSheetData={ timeSheetData }  year={selectedDay.year} month={selectedDay.monthIndex} day={selectedDay.day} />}
      </div>

    </div>
  );
}
