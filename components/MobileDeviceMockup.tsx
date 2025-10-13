'use client';

interface MobileDeviceMockupProps {
  children: React.ReactNode;
}

export default function MobileDeviceMockup({ children }: MobileDeviceMockupProps) {
  return (
    <>
      {/* Desktop: Show device mockup frame */}
      <div className="hidden lg:flex min-h-screen items-center justify-center p-5 sm:p-10" style={{ backgroundColor: '#F9F7F3' }}>
        {/* Device Frame */}
        <div
          style={{
            width: '420px',
            height: '840px',
            backgroundColor: '#2A3F5A',
            borderRadius: '48px',
            padding: '12px',
            boxShadow: '0 25px 50px rgba(42, 63, 90, 0.3), inset 0 0 0 2px rgba(255, 255, 255, 0.1)',
            position: 'relative'
          }}
        >
          {/* Screen Container */}
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '36px',
              overflow: 'hidden',
              backgroundColor: '#000000',
              position: 'relative'
            }}
          >
            {/* Actual App Content */}
            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
              {children}
            </div>
          </div>

          {/* Power Button */}
          <div
            style={{
              position: 'absolute',
              right: '-4px',
              top: '200px',
              width: '4px',
              height: '80px',
              backgroundColor: '#1A2D44',
              borderRadius: '0 2px 2px 0'
            }}
          />

          {/* Volume Buttons */}
          <div
            style={{
              position: 'absolute',
              left: '-4px',
              top: '180px',
              width: '4px',
              height: '50px',
              backgroundColor: '#1A2D44',
              borderRadius: '2px 0 0 2px'
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: '-4px',
              top: '240px',
              width: '4px',
              height: '50px',
              backgroundColor: '#1A2D44',
              borderRadius: '2px 0 0 2px'
            }}
          />

          {/* Device Label */}
          <div
            style={{
              position: 'absolute',
              bottom: '-40px',
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '12px',
              color: '#586C8E',
              fontWeight: 500,
              textAlign: 'center'
            }}
          >
            Mobile Preview (Desktop Testing)
          </div>
        </div>
      </div>

      {/* Mobile/Tablet: Render children directly without device frame */}
      <div className="lg:hidden min-h-screen" style={{ backgroundColor: '#F9F7F3' }}>
        {children}
      </div>
    </>
  );
}
