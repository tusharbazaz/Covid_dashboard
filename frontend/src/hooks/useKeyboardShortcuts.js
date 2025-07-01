import { useEffect } from 'react';

export const useKeyboardShortcuts = (shortcuts) => {
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Check if user is typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      const key = e.key.toLowerCase();
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;
      const alt = e.altKey;

      shortcuts.forEach(shortcut => {
        const matchesKey = shortcut.key.toLowerCase() === key;
        const matchesCtrl = shortcut.ctrl ? ctrl : !ctrl;
        const matchesShift = shortcut.shift ? shift : !shift;
        const matchesAlt = shortcut.alt ? alt : !alt;

        if (matchesKey && matchesCtrl && matchesShift && matchesAlt) {
          e.preventDefault();
          shortcut.handler();
        }
      });
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [shortcuts]);
};

// Usage in App.jsx:
/*
useKeyboardShortcuts([
  { key: 'r', ctrl: true, handler: () => reload() },
  { key: 'e', ctrl: true, handler: () => exportData() },
  { key: 'd', ctrl: true, handler: () => toggleTheme() },
  { key: 'f', ctrl: true, handler: () => focusSearch() },
  { key: 'Escape', handler: () => closeAllModals() }
]);
*/