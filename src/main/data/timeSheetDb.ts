import { FileWriter } from "../../renderer/models/FileWriter";
import _path from 'path';
import _fs from "fs";
import { IpcMain, ipcRenderer } from "electron";
import { IProject } from "../../renderer/models/data/project";
import { IDayTask } from "../../renderer/models/data/timeSheet";

export class TimeSheetDb extends FileWriter  {
  constructor(
    app: Electron.App,
    fs: typeof _fs,
    path: typeof _path,
    private ipcMain: IpcMain
  ) {
    super(app, fs, path, 'timeSheet');

    ipcMain.handle('time-sheet-get', (event, month, year) => {
      return this.getTimeSheetByMonth(month, year);
    });

    ipcMain.handle('time-sheet-edit-taks', (event, month, year, task) => {
      return this.editTask(month, year, task);
    });
  }

  private getTimeSheetByMonth(month: number, year: number) {
    month = Number(month);
    year = Number(year);
    return this.readData<IDayTask[]>(`time_sheet_${year}_${month}.json`).then((data) => data || []);
  }


  private async editTask(month: number, year: number, lap: Partial<IDayTask>) {
    month = Number(month);
    year = Number(year);
    const timeSheet = await this.readData(`time_sheet_${year}_${month}.json`) as IDayTask[];
    const originalLapIndex = timeSheet.findIndex(originalLap => originalLap.key === lap.key);

    if (lap.totalTime != null) timeSheet[originalLapIndex].totalTime = lap.totalTime;
    if (lap.notes != null) timeSheet[originalLapIndex].notes = lap.notes;

    return this.saveData(`time_sheet_${year}_${month}.json`, lap);
  }


  //** WARNING -- this doesn't propagate the edit to the project file, use the projectDb for that */
  public async __addLap(projectKey: string, taskKey: string, lap: { lapStart: number, lapEnd: number, notes?: string }) {
    const date = new Date(lap.lapStart);
    const month = date.getMonth();
    const year = date.getFullYear();
    const fileName = `time_sheet_${year}_${month}.json`;
    const id = `${year}-${month}-${date.getDate()}-${projectKey}-${taskKey}`;

    let timeSheet: IDayTask[] = await this.getTimeSheetByMonth(month, year);
    if (timeSheet.length) {
      timeSheet = await this.readData(fileName) as IDayTask[];

      const originalLapIndex = timeSheet.findIndex(originalLap => originalLap.key === id);
      if (originalLapIndex > -1) {
        timeSheet[originalLapIndex].totalTime += lap.lapEnd - lap.lapStart;
        if (lap.notes != null) timeSheet[originalLapIndex].notes = lap.notes;
      }
    } else {
      timeSheet.push({
        key: `${year}-${month}-${date.getDate()}-${projectKey}-${taskKey}`,
        taskKey: taskKey,
        projectKey: projectKey.slice(0, 50).replace(/[. ,/\\\(\)]/, "_"),
        totalTime: lap.lapEnd - lap.lapStart,
        notes: lap.notes || "",
        date: date.getDate(),
        weekDay: date.getDay(),
      })
    }

    return this.saveData(`time_sheet_${year}_${month}.json`, timeSheet);
  }

}
