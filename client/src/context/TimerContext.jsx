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

  // Sync active session on load
  const syncActiveSession = async () => {
    if (!user) {
      setActiveSession(null);
      setElapsedSeconds(0);
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
        setActiveSession(null);
        setElapsedSeconds(0);
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

  // Interval for ticking the live timer
  useEffect(() => {
    if (activeSession && activeSession.is_running) {
      const startMs = new Date(activeSession.started_at).getTime();

      timerIntervalRef.current = setInterval(() => {
        const seconds = Math.max(0, Math.floor((Date.now() - startMs) / 1000));
        setElapsedSeconds(seconds);
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [activeSession]);

  const startTimer = async ({ taskId, categoryId, notes }) => {
    const res = await apiStart({ taskId, categoryId, notes });
    if (res.success) {
      setActiveSession(res.data);
      setElapsedSeconds(0);
    }
    return res;
  };

  const stopTimer = async (notes) => {
    if (!activeSession) return null;
    const res = await apiStop(activeSession.id, { notes });
    if (res.success) {
      setActiveSession(null);
      setElapsedSeconds(0);
    }
    return res;
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