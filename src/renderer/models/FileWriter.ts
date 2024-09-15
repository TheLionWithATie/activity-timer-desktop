import path from 'path';
import fs from "fs";

export abstract class FileWriter {

  private filePath = "";

  constructor(
    private _app: Electron.App,
    private _fs: typeof fs,
    private _path: typeof path,
    private folderName: string,
  ) {
    this.filePath = this._path.join(this._app.getPath('userData'), this.folderName);


    if (!this._fs.existsSync(this.filePath)) {
      this._fs.mkdirSync(this.filePath);
    }
  }


  protected doesFileExist(fileName: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this._fs.stat(this._path.join(this._app.getPath('userData'), this.folderName, fileName), (err, stats) => {
        if (err) {
          return resolve(false);
        }
        resolve(true);
      });
    });
  }

  protected saveData(fileName: string, data: any) {
      const text = JSON.stringify(data);

      return new Promise<boolean>((resolve, reject) => {
        this._fs.writeFile(this._path.join(this._app.getPath('userData'), this.folderName, fileName), text, err => {
            if (err) {
              console.log(err);
              return resolve(false);
            }
            resolve(true);
        })
      });
  }

  protected readData(fileName: string): Promise<any> {
      return new Promise((resolve, reject) => {
        if (!this.doesFileExist(fileName)) {
          resolve(null);
        }

        this._fs.readFile(this._path.join(this._app.getPath('userData'), this.folderName, fileName), 'utf8', (err, data) => {
            if (err) {
                reject(err);
                return;
            }
            resolve( JSON.parse(data) );
        });
      })
  }
}
