import React from 'react';

import SeasonStrip from './SeasonStrip.jsx';

export default function PinPopup({ pin, isMyPin, isAdmin, editingPinId, editingNotes, startEditingNotes, cancelEditingNotes, saveEditedNotes, deletePin, setEditingNotes }) {
  if (!pin) return null;
  const currentMonth = new Date().getMonth() + 1;
  const inSeason = pin.zone ? window.isInSeason?.(pin.fruitType, pin.zone, currentMonth) : null;
  const seasonMonths = pin.zone ? window.getSeasonForZone?.(pin.fruitType, pin.zone) : null;
  const generalSeason = window.getSeasonDisplay?.(pin.fruitType);

  return (
    <div className="pin-popup">
      <div className="popup-header">
        <h3 className="fruit-title">{pin.fruitTypeDisplay?.toLowerCase?.() || pin.fruitType?.toLowerCase?.()}</h3>
        <SeasonStrip
          inSeason={inSeason}
          seasonMonths={seasonMonths}
          generalSeason={generalSeason}
          currentMonth={currentMonth}
        />
      </div>
      <div className="popup-content">
        {(pin.notes || editingPinId === pin.pinId || (isMyPin || isAdmin)) && (
          <div className="notes-section">
            <strong>notes:</strong>
            {editingPinId === pin.pinId ? (
              <div className="edit-notes-box">
                <textarea 
                  value={editingNotes}
                  onChange={e => setEditingNotes(e.target.value)}
                  className="notes-textarea"
                />
                <div className="edit-notes-actions">
                  <button 
                    onClick={() => saveEditedNotes(pin.pinId)}
                    className="save-notes-btn"
                  >
                    save
                  </button>
                  <button 
                    onClick={cancelEditingNotes}
                    className="cancel-notes-btn"
                  >
                    cancel
                  </button>
                </div>
              </div>
            ) : pin.notes ? (
              <p 
                className="pin-notes clickable-notes"
                onClick={() => (isMyPin || isAdmin) && startEditingNotes(pin.pinId, pin.notes)}
                style={{ cursor: (isMyPin || isAdmin) ? 'pointer' : 'default' }}
                title={(isMyPin || isAdmin) ? 'Click to edit' : ''}
              >
                {pin.notes}
              </p>
            ) : (isMyPin || isAdmin) ? (
              <p
                className="pin-notes add-notes-prompt"
                onClick={() => startEditingNotes(pin.pinId, '')}
                style={{ cursor: 'pointer' }}
              >
                + add notes
              </p>
            ) : null}
          </div>
        )}
        <details className="metadata-details">
          <summary className="metadata-summary">details</summary>
          <div className="metadata-grid">
            <div className="metadata-item">
              <strong>location:</strong>
              <span>{pin.coordinates.lat.toFixed(4)}, {pin.coordinates.lng.toFixed(4)}</span>
            </div>
            <div className="metadata-item">
              <strong>added by:</strong>
              <span>{pin.submittedBy || 'anonymous'}</span>
            </div>
            <div className="metadata-item">
              <strong>date:</strong>
              <span>{new Date(pin.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}</span>
            </div>
          </div>
        </details>
        {(isMyPin || isAdmin) && (
          <div className="pin-actions">
            <button 
              className="delete-pin-btn"
              onClick={() => deletePin(pin.pinId)}
            >
              delete pin
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
