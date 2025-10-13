'use client';

import { X, MessageCircle, Mic, History, User, Users, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { useRouter } from 'next/navigation';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NavigationDrawer({ isOpen, onClose }: NavigationDrawerProps) {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth/login');
  };

  // Get user initials for avatar placeholder
  const getInitials = () => {
    if (!user?.email) return '?';
    return user.email.charAt(0).toUpperCase();
  };

  // TODO: Get actual profile completion from database
  const profileCompletion = 45; // Placeholder

  // TODO: Get actual subscription tier from database
  const subscriptionTier = 'Free Trial'; // Placeholder

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(42, 63, 90, 0.5)',
            zIndex: 999,
            animation: 'fadeIn 0.2s ease-out',
            borderRadius: '24px'
          }}
        />
      )}

      {/* Drawer */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: '80%',
          maxWidth: '280px',
          backgroundColor: '#FFFFFF',
          boxShadow: '-5px 0 20px rgba(42, 63, 90, 0.15)',
          zIndex: 1000,
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease-out',
          display: 'flex',
          flexDirection: 'column',
          borderTopLeftRadius: '24px',
          borderBottomLeftRadius: '24px'
        }}
      >
        {/* Mini Profile Area */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(227, 234, 221, 0.6), rgba(215, 205, 236, 0.6))',
            padding: '24px',
            borderBottom: '1px solid rgba(215, 205, 236, 0.2)'
          }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              color: '#586C8E',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>

          {/* Avatar */}
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #D7CDEC, #B7D3D8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              fontSize: '32px',
              fontWeight: 600,
              color: '#2A3F5A',
              cursor: 'pointer',
              transition: 'transform 0.2s',
              boxShadow: '0 4px 12px rgba(183, 211, 216, 0.3)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            title="Click to upload avatar"
          >
            {getInitials()}
          </div>

          {/* User Info */}
          <p
            style={{
              fontSize: '14px',
              color: '#586C8E',
              margin: '0 0 4px 0',
              fontWeight: 500
            }}
          >
            {user?.email || 'Not signed in'}
          </p>

          {/* Subscription Badge */}
          <div
            style={{
              display: 'inline-block',
              padding: '4px 12px',
              borderRadius: '12px',
              backgroundColor: 'rgba(230, 168, 151, 0.2)',
              border: '1px solid rgba(230, 168, 151, 0.3)',
              fontSize: '12px',
              fontWeight: 600,
              color: '#E6A897',
              marginBottom: '16px'
            }}
          >
            {subscriptionTier}
          </div>

          {/* Profile Completion */}
          <div style={{ marginTop: '12px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <span style={{ fontSize: '12px', color: '#586C8E' }}>
                Profile completion
              </span>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#2A3F5A' }}>
                {profileCompletion}%
              </span>
            </div>
            {/* Progress Bar */}
            <div
              style={{
                width: '100%',
                height: '8px',
                backgroundColor: 'rgba(215, 205, 236, 0.3)',
                borderRadius: '4px',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  width: `${profileCompletion}%`,
                  height: '100%',
                  background: 'linear-gradient(to right, #D7CDEC, #B7D3D8)',
                  borderRadius: '4px',
                  transition: 'width 0.3s ease-out'
                }}
              />
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav style={{ flex: 1, padding: '16px 0', overflowY: 'auto' }}>
          <NavLink href="/chat" icon={<MessageCircle size={20} />} onClick={onClose}>
            Chat Mode
          </NavLink>
          <NavLink href="/voice" icon={<Mic size={20} />} onClick={onClose}>
            Voice Mode
          </NavLink>
          <NavLink href="/sessions" icon={<History size={20} />} onClick={onClose}>
            Session History
          </NavLink>
          <NavLink href="/family" icon={<Users size={20} />} onClick={onClose}>
            My Family
          </NavLink>
          <NavLink href="/profile" icon={<User size={20} />} onClick={onClose}>
            Profile Settings
          </NavLink>
        </nav>

        {/* Logout Button */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid rgba(215, 205, 236, 0.2)'
          }}
        >
          <button
            onClick={handleSignOut}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '12px',
              border: '1px solid rgba(215, 205, 236, 0.3)',
              backgroundColor: 'rgba(249, 247, 243, 0.5)',
              color: '#586C8E',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(230, 168, 151, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(230, 168, 151, 0.3)';
              e.currentTarget.style.color = '#E6A897';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(249, 247, 243, 0.5)';
              e.currentTarget.style.borderColor = 'rgba(215, 205, 236, 0.3)';
              e.currentTarget.style.color = '#586C8E';
            }}
          >
            <LogOut size={18} />
            Sign Out
          </button>

          {/* Version Info */}
          <p
            style={{
              fontSize: '11px',
              color: '#586C8E',
              opacity: 0.5,
              textAlign: 'center',
              marginTop: '12px',
              marginBottom: 0
            }}
          >
            v2.0.0 • Coaching Mode
          </p>
        </div>
      </div>
    </>
  );
}

interface NavLinkProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick: () => void;
}

function NavLink({ href, icon, children, onClick }: NavLinkProps) {
  return (
    <a
      href={href}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 24px',
        color: '#586C8E',
        textDecoration: 'none',
        fontSize: '15px',
        fontWeight: 500,
        transition: 'all 0.2s',
        borderLeft: '3px solid transparent'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(227, 234, 221, 0.3)';
        e.currentTarget.style.borderLeftColor = '#D7CDEC';
        e.currentTarget.style.color = '#2A3F5A';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
        e.currentTarget.style.borderLeftColor = 'transparent';
        e.currentTarget.style.color = '#586C8E';
      }}
    >
      {icon}
      <span>{children}</span>
    </a>
  );
}
