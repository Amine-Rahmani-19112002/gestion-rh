import { useState, useEffect } from 'react';

const useIdleTimeout = (onIdle, idleTime = 15 * 60 * 1000) => {
  const [isIdle, setIsIdle] = useState(false);

  useEffect(() => {
    let timeoutId;

    const handleActivity = () => {
      setIsIdle(false);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsIdle(true);
        if (onIdle) onIdle();
      }, idleTime);
    };

    // Events that reset the idle timer
    const events = ['mousemove', 'keydown', 'wheel', 'DOMMouseScroll', 'mouseWheel', 'mousedown', 'touchstart', 'touchmove', 'MSPointerDown', 'MSPointerMove'];

    // Add listeners
    events.forEach((event) => window.addEventListener(event, handleActivity));

    // Initialize timer
    handleActivity();

    return () => {
      events.forEach((event) => window.removeEventListener(event, handleActivity));
      clearTimeout(timeoutId);
    };
  }, [onIdle, idleTime]);

  return isIdle;
};

export default useIdleTimeout;
