// useKeyboardShortcut Hook - Handle keyboard shortcuts
import { useEffect } from 'react';

export const useKeyboardShortcut = (keys, callback, deps = []) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Check if all modifier keys match
      const keysArray = Array.isArray(keys) ? keys : [keys];
      
      const match = keysArray.some(keyCombo => {
        const parts = keyCombo.toLowerCase().split('+');
        const key = parts[parts.length - 1];
        const modifiers = parts.slice(0, -1);
        
        const keyMatch = event.key.toLowerCase() === key;
        const ctrlMatch = modifiers.includes('ctrl') ? event.ctrlKey : !event.ctrlKey;
        const altMatch = modifiers.includes('alt') ? event.altKey : !event.altKey;
        const shiftMatch = modifiers.includes('shift') ? event.shiftKey : !event.shiftKey;
        const metaMatch = modifiers.includes('meta') ? event.metaKey : !event.metaKey;
        
        return keyMatch && (modifiers.length === 0 || (
          (modifiers.includes('ctrl') === event.ctrlKey || !modifiers.includes('ctrl')) &&
          (modifiers.includes('alt') === event.altKey || !modifiers.includes('alt')) &&
          (modifiers.includes('shift') === event.shiftKey || !modifiers.includes('shift')) &&
          (modifiers.includes('meta') === event.metaKey || !modifiers.includes('meta'))
        ));
      });
      
      if (match) {
        event.preventDefault();
        callback(event);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [keys, callback, ...deps]);
};
