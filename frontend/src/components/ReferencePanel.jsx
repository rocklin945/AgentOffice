import React from 'react';

export default function ReferencePanel({
  src,
  alt,
  maxWidth = 1280,
  className = '',
  imageClassName = '',
}) {
  return (
    <div className={`flex justify-center ${className}`}>
      <div
        className="w-full overflow-hidden rounded-[22px] border border-[#edf1f7] bg-white shadow-[0_16px_36px_rgba(23,43,77,0.08)]"
        style={{ maxWidth }}
      >
        <img
          src={src}
          alt={alt}
          className={`block h-auto w-full ${imageClassName}`}
          draggable="false"
        />
      </div>
    </div>
  );
}
