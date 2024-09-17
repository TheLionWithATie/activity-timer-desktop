import * as React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface ISlide {
  index: number,
  direction: 1 | -1,
}

const variants = {
  enter: (direction: number) => {
    return {
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    };
  },
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => {
    return {
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    };
  }
};

export const Slides = ({
  children,
  slide,
  className,
} : {
  children: React.ReactNode[],
  slide: ISlide,
  className?: string,
}) => {
  const [[selectedSlideIndex, direction], setPage] = useState([0, 0]);

  // We only have 3 images, but we paginate them absolutely (ie 1, 2, 3, 4, 5...) and
  // then wrap that within 0-2 to find our image ID in the array below. By passing an
  // absolute page index as the `motion` component's `key` prop, `AnimatePresence` will
  // detect it as an entirely new image. So you can infinitely paginate as few as 1 images.

  React.useEffect(() => {
    setPage([slide.index, slide.direction]);
  }, [slide]);

  return (
    <AnimatePresence initial={false} custom={direction}>
      <motion.div className={ className }
        key={ "slide-" + selectedSlideIndex }
        custom={direction}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{
          x: { type: "spring", stiffness: 300, damping: 30 },
          opacity: { duration: 0.3 }
        }}
      >
        { children[selectedSlideIndex] }
      </motion.div>
    </AnimatePresence>
  );
};
