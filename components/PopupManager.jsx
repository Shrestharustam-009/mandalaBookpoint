'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { api } from '@/lib/api';
import './PopupManager.css';

export default function PopupManager() {
  const [popups, setPopups] = useState([]);
  const [closedPopups, setClosedPopups] = useState({});

  useEffect(() => {
    const fetchPopups = async () => {
      try {
        const activePopups = await api.popups.getActive();
        setPopups(activePopups);
      } catch (error) {
        console.error('Error fetching popups:', error);
      }
    };
    fetchPopups();
  }, []);

  const handleClose = (popupId) => {
    setClosedPopups(prev => ({
      ...prev,
      [popupId]: true,
    }));
  };

  const visiblePopups = popups.filter(popup => !closedPopups[popup.id]);

  if (visiblePopups.length === 0) {
    return null;
  }

  return (
    <div className="popup-container">
      {visiblePopups.map(popup => (
        <div key={popup.id} className="popup">
          <button
            className="popup-close"
            onClick={() => handleClose(popup.id)}
            aria-label="Close popup"
          >
            <X size={24} />
          </button>

          <div className="popup-content">
            <div className={`popup-icon popup-icon-${popup.type}`}>
              {popup.type === 'announcement' && '📢'}
              {popup.type === 'offer' && '🎉'}
              {popup.type === 'event' && '📅'}
              {popup.type === 'promotion' && '✨'}
            </div>

            <h2 className="popup-title">{popup.title}</h2>
            <p className="popup-text">{popup.content}</p>

            <button className="popup-action">Learn More</button>
          </div>
        </div>
      ))}
    </div>
  );
}
