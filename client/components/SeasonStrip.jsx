import React from 'react';

const MONTH_LETTERS = ['J','F','M','A','M','J','J','A','S','O','N','D'];
const MONTH_NAMES   = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function SeasonStrip({ inSeason, seasonMonths, generalSeason, currentMonth }) {
  const seasonSet = new Set(seasonMonths || []);

  let pillClass, pillIcon, pillText;
  if (inSeason !== null) {
    if (inSeason) {
      pillClass = 'strip-pill strip-pill--in';
      pillIcon = (
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
          <path d="M2 10 C2 10 3 5 8 3 C10 2 11 2 11 2 C11 2 11 3 10 5 C8 8 4 10 2 10Z" fill="currentColor"/>
          <line x1="2" y1="10" x2="6" y2="6" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
        </svg>
      );
      pillText = 'in season now';
    } else if (seasonMonths && seasonMonths.length > 0) {
      const range = seasonMonths.length > 6
        ? 'most of the year'
        : `${MONTH_NAMES[seasonMonths[0]-1]} – ${MONTH_NAMES[seasonMonths[seasonMonths.length-1]-1]}`;
      pillClass = 'strip-pill strip-pill--upcoming';
      pillIcon = (
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
          <circle cx="6" cy="6" r="2.5" fill="currentColor"/>
          <line x1="6" y1="0.5" x2="6" y2="2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          <line x1="6" y1="10" x2="6" y2="11.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          <line x1="0.5" y1="6" x2="2" y2="6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          <line x1="10" y1="6" x2="11.5" y2="6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
      );
      pillText = range;
    } else {
      pillClass = 'strip-pill strip-pill--out';
      pillIcon = (
        <svg width="9" height="10" viewBox="0 0 10 12" fill="none">
          <path d="M7.5 1.5 A4.5 4.5 0 1 0 7.5 10.5 A3 3 0 1 1 7.5 1.5Z" fill="currentColor"/>
        </svg>
      );
      pillText = 'out of season';
    }
  } else {
    pillClass = 'strip-pill strip-pill--general';
    pillIcon = (
      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
        <rect x="1" y="2.5" width="10" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.1" fill="none"/>
        <line x1="1" y1="5.5" x2="11" y2="5.5" stroke="currentColor" strokeWidth="1"/>
        <line x1="4" y1="1" x2="4" y2="4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="8" y1="1" x2="8" y2="4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    );
    pillText = generalSeason ? generalSeason.toLowerCase() : 'season varies';
  }

  const todayLeft = `calc(${((currentMonth - 0.5) / 12 * 100).toFixed(2)}% - 1px)`;

  return (
    <div className="season-strip">
      <div className={pillClass}>
        {pillIcon}
        {pillText}
      </div>
      <div className="season-strip__wrap">
        <div className="season-strip__bar">
          {MONTH_LETTERS.map((_, i) => (
            <div key={i} className={`season-strip__seg${seasonSet.has(i + 1) ? ' peak' : ''}`} />
          ))}
        </div>
        <div className="season-strip__today" style={{ left: todayLeft }} />
        <div className="season-strip__labels">
          {MONTH_LETTERS.map((l, i) => <span key={i}>{l}</span>)}
        </div>
      </div>
    </div>
  );
}
