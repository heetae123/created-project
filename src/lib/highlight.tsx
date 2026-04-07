import React from 'react';

/**
 * Parse text with highlight markers ("") and newlines.
 * - Text inside "" becomes highlighted with the accent color
 * - \n becomes <br />
 *
 * Example: '최고의 순간을\n"기획합니다"'
 * → 최고의 순간을<br/><span style={{color}}>기획합니다</span>
 */
export function HighlightText({
  text,
  color = '#F97316',
  className = '',
  style = {},
}: {
  text: string;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  if (!text) return null;

  const parts: React.ReactNode[] = [];
  // Split by "" pairs
  const segments = text.split('"');

  segments.forEach((segment, i) => {
    const isHighlight = i % 2 === 1; // odd indexes are inside quotes
    // Split by newlines
    const lines = segment.split('\n');
    lines.forEach((line, j) => {
      if (j > 0) parts.push(<br key={`br-${i}-${j}`} />);
      if (line) {
        if (isHighlight) {
          parts.push(
            <span key={`hl-${i}-${j}`} style={{ color }}>
              {line}
            </span>
          );
        } else {
          parts.push(<React.Fragment key={`t-${i}-${j}`}>{line}</React.Fragment>);
        }
      }
    });
  });

  return <span className={className} style={style}>{parts}</span>;
}
