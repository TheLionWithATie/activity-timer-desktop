export const padStart = function (num: number) {
  return num.toString().padStart(2, "0");
}
export const transformMiliseconds = {
  toTimeObject: (miliseconds: number) => {
    let seconds = Math.floor(miliseconds / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);

    return {
      seconds: seconds % 60,
      minutes: minutes % 60,
      hours,
    }
  },
};
export const formatMiliseconds = {
  toLongString: (miliseconds: number, showSeconds = false, showDays = false) => {
    const timeObj = transformMiliseconds.toTimeObject(miliseconds);
    const parts = [];

    if (timeObj.hours) {
      if (showDays) {
        parts.push(Math.floor(timeObj.hours / 24) + "d")
        timeObj.hours = timeObj.hours % 24
      }
      parts.push(timeObj.hours + "h")
    }
    if (timeObj.minutes) parts.push(timeObj.minutes + "m")
    if (parts.length === 0 || showSeconds) parts.push(timeObj.seconds + "s")

    return parts.join(" ");
  },
  toShortString: (miliseconds: number, showSeconds = true) => {
    const seconds = Math.floor(miliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    return `${ padStart(hours > 0 ? hours : 0) }:${padStart(minutes % 60)}${showSeconds ? "." + padStart(seconds % 60) : ""}`;
  }
}

export const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const WEEK_DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const SHORT_WEEK_DAY_NAMES = [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri",  "Sat" ];

export function monthIndexToMonthObj ( month: number, year: number ) {
  return {
    index: month,
    year: year,
    name: MONTH_NAMES[month],
  }
}

export function getMonthDays ( month: number, year: number ) {
  const date = new Date(year, month + 1, 0);
  const startWeekDay = date.getDay() - ((date.getDate() - 1) % 7);
  const today = new Date();

  return Array.from({ length: date.getDate() }, (_, i) => {
    const weekDay = (startWeekDay + i) % 7;

    return {
      date: i + 1,
      weekDayIndex: weekDay,
      weekDay: WEEK_DAY_NAMES[weekDay],
      weekDayShort: SHORT_WEEK_DAY_NAMES[weekDay],
      isToday: today.getDate()-1 === i && today.getMonth() === month && today.getFullYear() === year,
    };
  });
}
