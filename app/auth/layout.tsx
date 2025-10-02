import type { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      backgroundColor: '#F9F7F3',
      backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'200\'%3E%3Cfilter id=\'a\' x=\'0\' y=\'0\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'.75\' stitchTiles=\'stitch\'/%3E%3CfeColorMatrix type=\'saturate\' values=\'0\'/%3E%3C/filter%3E%3Cpath filter=\'url(%23a)\' opacity=\'.05\' d=\'M0 0h200v200H0z\'/%3E%3C/svg%3E")',
      backgroundRepeat: 'repeat',
      overflow: 'hidden'
    }}>
      <div 
        aria-hidden="true" 
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom right, rgba(227, 234, 221, 0.6), #F9F7F3, rgba(215, 205, 236, 0.5))',
          opacity: 0.8
        }}
      />
      <div 
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '-6rem',
          left: '-5rem',
          width: '520px',
          height: '520px',
          borderRadius: '9999px',
          backgroundColor: 'rgba(215, 205, 236, 0.4)',
          filter: 'blur(48px)',
          opacity: 0.7
        }}
      />
      <div 
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: '-8rem',
          right: '-4rem',
          width: '580px',
          height: '580px',
          borderRadius: '9999px',
          backgroundColor: 'rgba(183, 211, 216, 0.4)',
          filter: 'blur(48px)',
          opacity: 0.7
        }}
      />
      <div style={{
        position: 'relative',
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem'
      }}>
        {children}
      </div>
    </div>
  );
}

