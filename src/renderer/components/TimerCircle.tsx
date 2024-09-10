import CSS from "csstype";

export function TimerCircle ({ time, target, primaryColor, secondaryColor }: { time: number, target?: number, primaryColor: CSS.Properties['color'], secondaryColor: CSS.Properties['color'] }) {
  const radius = 47;
  const circumference = Math.PI * radius * 2

  target = target || 0;

  let dashArray = "0";
  if (target && target < time) {
    dashArray = `${ circumference / 100 * (time / target * 100) } ${ circumference }`;
  }

  return (
    <svg height="100%" width="100%" viewBox="0 0 100 100" style={{ pointerEvents: "none" }}>
      <circle
        cx="50"
        cy="50"
        r={radius}
        stroke="white"
        strokeWidth="4"
        fill="transparent"
      />
      <circle
        cx="50"
        cy="50"
        r={radius}
        strokeWidth="4"
        strokeLinecap="round"
        stroke={ (target > 0 && time > target) ? secondaryColor : primaryColor }
        strokeDasharray={ dashArray }
        rotate="-90deg"
        fill="transparent"
      />
    </svg>
  );
};
