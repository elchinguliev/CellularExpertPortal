import React, { useRef, useEffect } from 'react';

// StableInput - fokusunu itirmir, çünki ayrı komponentdir
export const StableInput = React.memo(({ value, onChange, onKeyDown, placeholder, type='text', style={} }) => {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      style={style}
    />
  );
});

export const StableTextarea = React.memo(({ value, onChange, onKeyDown, placeholder, style={}, rows=1 }) => {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      style={style}
      rows={rows}
    />
  );
});

export const StableSelect = React.memo(({ value, onChange, options, style={} }) => {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} style={style}>
      {options.map(o => <option key={o}>{o}</option>)}
    </select>
  );
});
