'use client';

interface ContinuationPromptProps {
  lastMessageAt: string;
  onContinue: () => void;
  onStartNew: () => void;
}

export default function ContinuationPrompt({ lastMessageAt, onContinue, onStartNew }: ContinuationPromptProps) {
  // Format the timestamp
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    // Time portion (e.g., "2:35 PM")
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    // Relative date
    let dateStr = '';
    if (diffMins < 1) {
      dateStr = 'just now';
    } else if (diffMins < 60) {
      dateStr = `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
    } else if (diffHours < 24) {
      dateStr = `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    } else if (diffDays === 1) {
      dateStr = `yesterday at ${timeStr}`;
    } else if (diffDays < 7) {
      dateStr = `${diffDays} days ago at ${timeStr}`;
    } else {
      // Full date for older messages
      dateStr = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      }) + ` at ${timeStr}`;
    }

    return dateStr;
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'flex-start',
      paddingLeft: '8px',
      paddingRight: '8px',
      marginBottom: '20px'
    }}>
      <div style={{ maxWidth: '85%' }}>
        {/* Assistant-style message bubble */}
        <div
          style={{
            backgroundColor: '#E3EADD',
            color: '#2A3F5A',
            borderRadius: '18px 18px 18px 4px',
            boxShadow: '0 2px 5px rgba(42, 63, 90, 0.05)',
            padding: '15px 20px',
            margin: '4px 0'
          }}
        >
          <p style={{
            margin: '0 0 12px 0',
            fontSize: '15px',
            lineHeight: 1.5,
            color: '#2A3F5A'
          }}>
            Welcome back! I see we left off <strong>{formatTimestamp(lastMessageAt)}</strong>.
          </p>
          <p style={{
            margin: '0 0 14px 0',
            fontSize: '15px',
            lineHeight: 1.5,
            color: '#2A3F5A'
          }}>
            Would you like to continue our conversation, or start fresh with a quick check-in?
          </p>

          {/* Inline buttons matching chat style */}
          <div style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={onContinue}
              style={{
                padding: '8px 16px',
                background: '#4A9E5F',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 3px rgba(74, 158, 95, 0.2)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#3D8350';
                e.currentTarget.style.boxShadow = '0 2px 5px rgba(74, 158, 95, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#4A9E5F';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(74, 158, 95, 0.2)';
              }}
            >
              Continue conversation
            </button>

            <button
              onClick={onStartNew}
              style={{
                padding: '8px 16px',
                background: '#fff',
                color: '#586C8E',
                border: '1.5px solid rgba(88, 108, 142, 0.25)',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(88, 108, 142, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(88, 108, 142, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#fff';
                e.currentTarget.style.borderColor = 'rgba(88, 108, 142, 0.25)';
              }}
            >
              Start new check-in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
