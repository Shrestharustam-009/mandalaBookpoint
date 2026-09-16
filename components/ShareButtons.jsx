'use client';

import siteConfig from '@/config/siteConfig';

/**
 * Share button utilizing the native Web Share API
 */
export default function ShareButtons({ url, title, text = '' }) {
  const shareUrl = typeof window !== 'undefined' ? url || window.location.href : url || '';
  const shareTitle = title || 'Check out this book!';
  const shareText = text || `${shareTitle} - ${siteConfig.siteName}`;

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
          handleFallbackShare();
        }
      }
    } else {
      handleFallbackShare();
    }
  };

  const handleFallbackShare = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    } catch {
      alert('Failed to copy link');
    }
  };

  return (
    <div className="share-buttons" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
      <button
        type="button"
        onClick={handleShare}
        className="share-btn share-native"
        aria-label="Share via..."
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          width: '100%',
          minWidth: '120px',
          height: '40px',
          padding: '0 16px',
          border: '1px solid #e5e7eb',
          borderRadius: '6px',
          backgroundColor: '#f9fafb',
          color: '#4b5563',
          fontSize: '0.9rem',
          fontWeight: '500',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = '#f3f4f6';
          e.currentTarget.style.color = '#111827';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = '#f9fafb';
          e.currentTarget.style.color = '#4b5563';
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
          <polyline points="16 6 12 2 8 6"></polyline>
          <line x1="12" y1="2" x2="12" y2="15"></line>
        </svg>
        Share
      </button>
    </div>
  );
}
