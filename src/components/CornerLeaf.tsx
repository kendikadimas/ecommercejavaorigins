'use client';

import React from 'react';

// ponytail: decorative only — pointer-events-none, never blocks clicks
export interface CornerLeafProps {
  src: string;
  size?: number;          // width px
  className?: string;     // positioning (e.g. "absolute top-0 left-0")
  opacity?: number;       // 0-1
  rotate?: number;        // degrees
  flipX?: boolean;        // scaleX(-1)
  flipY?: boolean;        // scaleY(-1)
  hideMobile?: boolean;   // hide below sm
}

export const CornerLeaf: React.FC<CornerLeafProps> = ({
  src,
  size = 200,
  className = '',
  opacity = 0.25,
  rotate = 0,
  flipX = false,
  flipY = false,
  hideMobile = true,
}) => {
  const transforms: string[] = [];
  if (rotate) transforms.push(`rotate(${rotate}deg)`);
  if (flipX) transforms.push('scaleX(-1)');
  if (flipY) transforms.push('scaleY(-1)');

  return (
    <img
      src={src}
      alt=""
      aria-hidden
      className={`${hideMobile ? 'hidden sm:block' : ''} pointer-events-none select-none z-0 ${className}`}
      style={{
        width: size,
        opacity,
        transform: transforms.length > 0 ? transforms.join(' ') : undefined,
      }}
    />
  );
};
