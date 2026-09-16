'use client';

import React from 'react';

interface StarBorderProps {
  as?: React.ElementType;
  className?: string;
  children?: React.ReactNode;
  color?: string;
  secondColor?: string;
  speed?: string;
  thickness?: number;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  style?: React.CSSProperties;
}

const StarBorder = ({
  as: Tag = 'div',
  className = '',
  color = 'white',
  secondColor,
  speed = '6s',
  thickness = 1,
  backgroundColor = 'transparent',
  textColor = 'inherit',
  borderColor = 'transparent',
  children,
  style,
}: StarBorderProps) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Component = Tag as any;
  return (
    <Component
      className={`relative inline-block overflow-hidden rounded-[20px] ${className}`}
      style={{ padding: `${thickness}px 0`, ...style }}
    >
      {/* Primary color streaks */}
      <div
        className="absolute w-[300%] h-[50%] opacity-70 bottom-[-11px] right-[-250%] rounded-full animate-star-movement-bottom z-0"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animationDuration: speed,
        }}
      />
      <div
        className="absolute w-[300%] h-[50%] opacity-70 top-[-10px] left-[-250%] rounded-full animate-star-movement-top z-0"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animationDuration: speed,
        }}
      />

      {/* Secondary color streaks — opposite direction, slower */}
      {secondColor && (
        <>
          <div
            className="absolute w-[300%] h-[50%] opacity-50 bottom-[-11px] left-[-250%] rounded-full animate-star-movement-top z-0"
            style={{
              background: `radial-gradient(circle, ${secondColor}, transparent 10%)`,
              animationDuration: `calc(${speed} * 1.4)`,
            }}
          />
          <div
            className="absolute w-[300%] h-[50%] opacity-50 top-[-10px] right-[-250%] rounded-full animate-star-movement-bottom z-0"
            style={{
              background: `radial-gradient(circle, ${secondColor}, transparent 10%)`,
              animationDuration: `calc(${speed} * 1.4)`,
            }}
          />
        </>
      )}

      <div
        className="relative z-[1] rounded-[20px] w-full h-full"
        style={{ background: backgroundColor, color: textColor, borderColor }}
      >
        {children}
      </div>
    </Component>
  );
};

export default StarBorder;
