import React, { useEffect, useState } from 'react';

interface HighlightCardProps {
  active: boolean;
  color?: 'blue' | 'yellow' | 'green';
  duration?: number;
  children: React.ReactNode;
}

const colorMap: Record<string, string> = {
  blue: 'ring-blue-400',
  yellow: 'ring-yellow-400',
  green: 'ring-green-400'
};

const HighlightCard: React.FC<HighlightCardProps> = ({ active, color = 'blue', duration = 3000, children }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (active) {
      setShow(true);
      const t = setTimeout(() => setShow(false), duration);
      return () => clearTimeout(t);
    }
  }, [active, duration]);

  return (
    <div className={`${show ? `${colorMap[color]} ring-2 animate-pulse` : ''} rounded-lg transition-all`}>{children}</div>
  );
};

export default HighlightCard;
