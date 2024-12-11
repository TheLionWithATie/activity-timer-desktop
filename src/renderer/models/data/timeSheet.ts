import { formatMiliseconds } from "../../../util/time";


type Lap = [ number, number ];
export interface IDayTask {

  /**
   * year-month-date-projectKey-taskKey
   */
  key: string;
  projectKey: string;
  taskKey: string;
  date: number;
  weekDay: number;

  totalTime: number;
  notes: string;
}

/* export interface ITimeSheetExtended extends ITimeSheet {
  startDate: Date,
  endDate: Date,
  totalTime: number;
  totalFormattedTime: string;
}
 */
/* export function timeSheetToDateTable(timeSheet: ITimeSheet[]) {
  return timeSheet.reduce((p, c) => {
    const dateStart = new Date(c.startDateSinceEpoch);
    const dateEnd = new Date(c.endDateSinceEpoch);
    const key = dateStart.getDate().toString();
    const totalTime = c.endDateSinceEpoch - c.startDateSinceEpoch;

    const extendedTmSht: ITimeSheetExtended = {
      ...c,
      startDate: dateStart,
      endDate: dateEnd,
      totalTime: totalTime,
      totalFormattedTime: formatMiliseconds.toShortString(totalTime)
    }

    if (p[ key ])
      p[key].push(extendedTmSht);
    else
      p[key] = [extendedTmSht];

    return p;
  }, {} as { [key: string]: ITimeSheetExtended[] })
}
 */
