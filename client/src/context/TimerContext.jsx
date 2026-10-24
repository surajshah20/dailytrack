import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { getActiveSession, startSession as apiStart, stopSession as apiStop } from '../api/sessions.js';
import { useAuth } from './AuthContext.jsx';

const TimerContext = createContext(null);

export const TimerProvider = ({ children }) => {
  const { user } = useAuth();
  const [activeSession, setActiveSession] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [loading, setLoading] = useState(true);
  const timerIntervalRef = useRef(null);

  const clearSession = () => {
    setActiveSession(null);
    setElapsedSeconds(0);
  };

  // Ask the server what is running and align local state with it
  const syncActiveSession = async () => {
    if (!user) {
      clearSession();
      setLoading(false);
      return;
    }
    try {
      const res = await getActiveSession();
      if (res.success && res.data) {
        setActiveSession(res.data);
        const startMs = new Date(res.data.started_at).getTime();
        setElapsedSeconds(Math.max(0, Math.floor((Date.now() - startMs) / 1000)));
      } else {
        clearSession();
      }
    } catch (err) {
      console.error('Failed to sync timer:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    syncActiveSession();
  }, [user]);

  // Re-check when the tab becomes visible, in case the session changed elsewhere
  useEffect(() => {
    if (!user) return undefined;
    const onVisible = () => {
      if (document.visibilityState === 'visible') syncActiveSession();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [user]);

  // Tick the live timer from the server's start time
  useEffect(() => {
    if (activeSession && activeSession.is_running) {
      const startMs = new Date(activeSession.started_at).getTime();

      timerIntervalRef.current = setInterval(() => {
        setElapsedSeconds(Math.max(0, Math.floor((Date.now() - startMs) / 1000)));
      }, 1000);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [activeSession]);

  const startTimer = async ({ taskId, categoryId, notes }) => {
    try {
      const res = await apiStart({ taskId, categoryId, notes });
      if (res.success) {
        setActiveSession(res.data);
        setElapsedSeconds(0);
      }
      return res;
    } catch (err) {
      // 400 means a session is already running (another tab or device): pick it up
      if (err.response?.status === 400) await syncActiveSession();
      throw err;
    }
  };

  const stopTimer = async (notes) => {
    if (!activeSession) return null;
    try {
      const res = await apiStop(activeSession.id, { notes });
      if (res.success) clearSession();
      return res;
    } catch (err) {
      // 404 means it was already stopped elsewhere: clear it instead of leaving a ghost timer
      if (err.response?.status === 404) {
        clearSession();
        return null;
      }
      throw err;
    }
  };

  return (
    <TimerContext.Provider value={{ activeSession, elapsedSeconds, loading, startTimer, stopTimer, syncActiveSession }}>
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) throw new Error('useTimer must be used within a TimerProvider');
  return context;
};