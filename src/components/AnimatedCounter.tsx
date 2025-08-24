import React, { useEffect, useRef, useState } from 'react';

interface AnimatedCounterProps {
  value: number;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ value }) => {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);

  useEffect(() => {
    const start = prev.current;
    const end = value;
    const duration = 500;
    const startTime = performance.now();

    const step = (time: number) => {
      const progress = Math.min((time - startTime) / duration, 1);
      const current = Math.round(start + (end - start) * progress);
      setDisplay(current);
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
    prev.current = value;
  }, [value]);

  return <span>{display}</span>;
};

export default AnimatedCounter;
