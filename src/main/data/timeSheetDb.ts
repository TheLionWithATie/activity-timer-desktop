import { FileWriter } from "../../renderer/models/FileWriter";
import _path from 'path';
import _fs from "fs";
import { IpcMain, ipcRenderer } from "electron";
import { IProject } from "../../renderer/models/data/project";
import { ITimeSheet } from "../../renderer/models/data/timeSheet";

export class TimeSheetDb extends FileWriter  {
  constructor(
    app: Electron.App,
    fs: typeof _fs,
    path: typeof _path,
    private ipcMain: IpcMain
  ) {
    super(app, fs, path, 'timeSheet');

    ipcMain.on('time-sheet-get', (event, month, year) => {
      return this.getTimeSheetByMonth(month, year);
    });

    ipcMain.on('time-sheet-edit-lap', (event, month, year, lap) => {
      return this.editLap(month, year, lap);
    });
  }

  private getTimeSheetByMonth(month: number, year: number) {
    month = Number(month);
    year = Number(year);
    return this.readData(`$time_sheet_${year}_${month}.json`) as Promise<ITimeSheet[]>;
  }
  private async editLap(month: number, year: number, lap: Partial<ITimeSheet>) {
    month = Number(month);
    year = Number(year);
    const timeSheet = await this.readData(`$time_sheet_${year}_${month}.json`) as ITimeSheet[];
    const originalLapIndex = timeSheet.findIndex(originalLap => originalLap.key === lap.key);

    if (lap.startDateSinceEpoch) timeSheet[originalLapIndex].startDateSinceEpoch = lap.startDateSinceEpoch;
    if (lap.endDateSinceEpoch) timeSheet[originalLapIndex].endDateSinceEpoch = lap.endDateSinceEpoch;

    return this.saveData(`$time_sheet_${lap.startDateSinceEpoch}.json`, lap);
  }

  //** WARNING -- this doesn't propagate the edit to the project file, use the projectDb for that  */
  public async __addLap(month: number, year: number, lap: Omit<ITimeSheet, "key">) {
    month = Number(month);
    year = Number(year);
    const timeSheet = await this.readData(`$time_sheet_${year}_${month}.json`) as ITimeSheet[];

    timeSheet.push({
      key: (lap.startDateSinceEpoch + lap.endDateSinceEpoch).toString(16),
      taskKey: lap.taskKey,
      projectKey: lap.projectKey.slice(0, 50).replace(/[. ,/\\\(\)]/, "_"),
      startDateSinceEpoch: Number(lap.startDateSinceEpoch),
      endDateSinceEpoch: Number(lap.endDateSinceEpoch)
    })

    return this.saveData(`$time_sheet_${year}_${month}.json`, lap);
  }


}
