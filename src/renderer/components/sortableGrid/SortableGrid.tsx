import * as React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { div, use } from "framer-motion/client";

import "./SortableGrid.scss";

export function SortableGrid ({
  children
} : {
  children: React.ReactNode[],
  listChanged: () => void,
}) {
  const [ selectedChild, setSelectedChild ] = useState<number | null>(null);
  const [ position, setPosition ] = useState<{ x: number, y: number } | null>(null);

  return (
    <div className="sortable-grid">
      { ...children.map((child, i) => <SortableGridItem>{ child }</SortableGridItem> )}
    </div>
  );
};

function SortableGridItem ({
  children
} : {
  children: React.ReactNode
}) {
  const cardWidth = 350 / 2;
  const cardHeight = 540 / 2;
  const [ isGrabbing, setIsGrabbing ] = useState<boolean>(false);
  const [ position, setPosition ] = useState<{ x: number, y: number } | null>(null);

  return <div
    className={ isGrabbing ? "selected-child" : "" }
    style={ isGrabbing ? { top: position?.y, left: position?.x } : {} }
    onMouseDown={ (e) => { setPosition({ x: e.clientX, y: e.clientY }) } }
    onMouseMove={ (e) => { if (isGrabbing) {
      e.preventDefault();
      setPosition({ x: e.clientX - cardWidth, y: e.clientY - cardHeight })
    } else if (position && Math.abs(position.x - e.clientX) > 2 && Math.abs(position.y - e.clientY) > 2) {
      setIsGrabbing(true);
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      setPosition({ x: rect.left, y: rect.top })
    }} }
    onMouseUp={ () => { setIsGrabbing(false); setPosition(null); } }
    onMouseLeave={ () => { setIsGrabbing(false); setPosition(null); } }
    >
      <span className="cell sx-cell"></span>
      { children }
      <span className="cell dx-cell"></span>
    </div>;
}
