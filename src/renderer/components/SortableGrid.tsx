import * as React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { div, use } from "framer-motion/client";

export const SortableGrid = ({
  children
} : {
  children: React.ReactNode[],
  listChanged: () => void,
}) => {
  const [ selectedChild, setSelectedChild ] = useState<number | null>(null);
  const [ position, setPosition ] = useState<{ x: number, y: number } | null>(null);

  return (
    <div>
      { ...children.map((child, i) => <div 
        className={ selectedChild === i ? "selected-child" : "" } 
        style={ selectedChild === i ? { top: position?.y, left: position?.x } : {} }
        onMouseDown={ (e) => { setSelectedChild(i); setPosition({ x: e.clientX, y: e.clientY }) } }
        onMouseMove={ (e) => { if (selectedChild === i) setPosition({ x: e.clientX, y: e.clientY }) } }
        onMouseUp={ () => { setSelectedChild(null); setPosition(null) } }
        onMouseLeave={ () => { setSelectedChild(null); setPosition(null) } }
        >{ child }</div>
      )}
    </div>
  );
};
