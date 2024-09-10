export const padStart = function (num: number) {
  return num.toString().padStart(2, "0");
}
export const transformMiliseconds = {
  toTimeObject: (miliseconds: number) => {
    let seconds = Math.floor(miliseconds / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60) % 60;

    seconds = seconds % 60;
    minutes = minutes % 60;

    if (hours < 0) {
      hours = 0;
    }

    return {
      seconds,
      minutes,
      hours,
    }
  },
};
export const formatMiliseconds = {
  toLongString: (miliseconds: number, showSeconds = false) => {
    const timeObj = transformMiliseconds.toTimeObject(miliseconds);
    const parts = [];

    if (timeObj.hours) parts.push(timeObj.hours + "h")
    if (timeObj.minutes) parts.push(timeObj.minutes + "m")
    if (parts.length === 0 || showSeconds) parts.push(timeObj.seconds + "s")

    return parts.join(" ");
  },
  toShortString: (miliseconds: number, showSeconds = true) => {
    const seconds = Math.floor(miliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    return `${padStart(hours > 0 ? hours : 0)}:${padStart(minutes % 60)}${showSeconds ? "." + padStart(seconds % 60) : ""}`;
  }
}
