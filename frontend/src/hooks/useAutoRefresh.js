import { useEffect, useRef } from 'react';

export const useAutoRefresh = (callback, interval = 5 * 60 * 1000, enabled = true) => {
  const savedCallback = useRef();
  const intervalId = useRef();

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval
  useEffect(() => {
    if (!enabled) return;

    const tick = () => {
      if (!document.hidden) {
        savedCallback.current();
      }
    };

    intervalId.current = setInterval(tick, interval);
    return () => clearInterval(intervalId.current);
  }, [interval, enabled]);

  // Clear interval on visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && intervalId.current) {
        clearInterval(intervalId.current);
      } else if (!document.hidden && enabled) {
        intervalId.current = setInterval(() => {
          if (!document.hidden) {
            savedCallback.current();
          }
        }, interval);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [interval, enabled]);
};