'use client';

import { useState } from 'react';

export default function AccessibilityPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [fontSize, setFontSize] = useState('medium');
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Apply font size to document
  const applyFontSize = (size: 'small' | 'medium' | 'large' | 'x-large') => {
    let root = document.documentElement;
    switch (size) {
      case 'small':
        root.style.fontSize = '14px';
        break;
      case 'medium':
        root.style.fontSize = '16px';
        break;
      case 'large':
        root.style.fontSize = '18px';
        break;
      case 'x-large':
        root.style.fontSize = '20px';
        break;
      default:
        root.style.fontSize = '16px';
    }
    setFontSize(size);
  };

  // Apply high contrast mode
  const toggleHighContrast = () => {
    const newState = !highContrast;
    setHighContrast(newState);
    if (newState) {
      document.body.classList.add('high-contrast-mode');
    } else {
      document.body.classList.remove('high-contrast-mode');
    }
  };

  // Apply reduced motion
  const toggleReducedMotion = () => {
    const newState = !reducedMotion;
    setReducedMotion(newState);
    if (newState) {
      document.body.classList.add('reduced-motion');
    } else {
      document.body.classList.remove('reduced-motion');
    }
  };

  return (
    <div className="fixed right-4 bottom-4 z-50">
      {/* Accessibility button */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="p-3 bg-sage rounded-full shadow-soft hover:shadow-hover transition-all duration-200"
        aria-label={isOpen ? "Close accessibility settings" : "Open accessibility settings"}
      >
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 16v-4"></path>
          <path d="M12 8h.01"></path>
        </svg>
      </button>

      {/* Accessibility panel */}
      {isOpen && (
        <div className="absolute right-0 bottom-16 w-64 p-4 bg-white rounded-xl shadow-soft border border-slate-100 animate-slide-left">
          <h3 className="text-gray-800 font-semibold mb-3">Accessibility Options</h3>
          
          {/* Font size */}
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Text Size</p>
            <div className="flex space-x-2">
              {(['small', 'medium', 'large', 'x-large'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => applyFontSize(size)}
                  className={`px-2 py-1 text-xs rounded-md ${
                    fontSize === size
                      ? 'bg-lavender text-gray-800'
                      : 'bg-cream text-gray-600'
                  }`}
                >
                  {size === 'x-large' ? 'XL' : size.charAt(0).toUpperCase() + size.slice(1, 1)}
                </button>
              ))}
            </div>
          </div>

          {/* High contrast */}
          <div className="mb-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={highContrast}
                onChange={toggleHighContrast}
                className="rounded border-slate-300 text-lavender focus:ring-lavender"
              />
              <span className="text-sm text-gray-600">High contrast</span>
            </label>
          </div>

          {/* Reduced motion */}
          <div className="mb-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={reducedMotion}
                onChange={toggleReducedMotion}
                className="rounded border-slate-300 text-lavender focus:ring-lavender"
              />
              <span className="text-sm text-gray-600">Reduced motion</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}