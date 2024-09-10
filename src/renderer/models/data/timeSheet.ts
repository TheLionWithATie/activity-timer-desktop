export interface ITimeSheet {

  key: string;
  projectKey: string;
  taskKey: string;

  startDateSinceEpoch: number;
  endDateSinceEpoch: number;
}
