import { useState, useEffect, useCallback } from 'react';
import { GoogleCalendarAPI, getAuthorizationUrl, exchangeCodeForTokens } from '../../../shared/src/index';
import type { CalendarEvent } from '../../../shared/src/index';
import { useSettings } from './useSettings';
import { LocalStorageAdapter } from '../storage/LocalStorageAdapter';

const storage = new LocalStorageAdapter();

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const CLIENT_SECRET = import.meta.env.VITE_GOOGLE_CLIENT_SECRET || '';
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI || 'http://localhost:5173/oauth/callback';

export function useGoogleCalendar() {
  const { settings, updateSettings } = useSettings();
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isConnected = settings.googleCalendarConnected;
  const hasTokens = !!settings.googleCalendarTokens;

  // Load calendar events from storage on mount
  useEffect(() => {
    if (isConnected) {
      loadCalendarEvents();
    }
  }, [isConnected]);

  const loadCalendarEvents = useCallback(async () => {
    try {
      const events = await storage.getCalendarEvents();
      setCalendarEvents(events);
    } catch (err) {
      console.error('Error loading calendar events:', err);
    }
  }, []);

  const saveCalendarEvents = useCallback(async (events: CalendarEvent[]) => {
    try {
      await storage.saveCalendarEvents(events);
      setCalendarEvents(events);
    } catch (err) {
      console.error('Error saving calendar events:', err);
    }
  }, []);

  // Initiate OAuth flow
  const connectGoogleCalendar = useCallback(() => {
    if (!CLIENT_ID) {
      setError('Google Client ID not configured. Please add it to .env.local');
      return;
    }

    const authUrl = getAuthorizationUrl(CLIENT_ID, REDIRECT_URI);
    window.location.href = authUrl;
  }, []);

  // Handle OAuth callback
  const handleOAuthCallback = useCallback(async (code: string) => {
    setLoading(true);
    setError(null);

    try {
      const tokens = await exchangeCodeForTokens(code, CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

      await updateSettings({
        googleCalendarConnected: true,
        googleCalendarTokens: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiryDate: tokens.expiryDate,
        },
      });

      // Fetch initial events
      await fetchCalendarEvents(tokens.accessToken);

      return true;
    } catch (err) {
      console.error('OAuth callback error:', err);
      setError('Failed to connect Google Calendar. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  }, [updateSettings]);

  // Fetch calendar events from Google
  const fetchCalendarEvents = useCallback(async (accessToken?: string) => {
    if (!hasTokens && !accessToken) {
      console.warn('No access token available');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = accessToken || settings.googleCalendarTokens?.accessToken;
      if (!token) {
        throw new Error('No access token available');
      }

      const api = new GoogleCalendarAPI({ accessToken: token });

      // Fetch events for the current week
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay() + 1); // Monday
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7); // Next Monday

      const events = await api.fetchEvents(weekStart, weekEnd);
      await saveCalendarEvents(events);

    } catch (err: any) {
      console.error('Error fetching calendar events:', err);

      // If unauthorized, try to refresh token
      if (err.message?.includes('Unauthorized') && settings.googleCalendarTokens?.refreshToken) {
        await refreshAccessToken();
      } else {
        setError('Failed to fetch calendar events');
      }
    } finally {
      setLoading(false);
    }
  }, [hasTokens, settings.googleCalendarTokens, saveCalendarEvents]);

  // Refresh access token
  const refreshAccessToken = useCallback(async () => {
    if (!settings.googleCalendarTokens?.refreshToken) {
      return;
    }

    try {
      const api = new GoogleCalendarAPI({
        accessToken: settings.googleCalendarTokens.accessToken,
        refreshToken: settings.googleCalendarTokens.refreshToken,
      });

      const newAccessToken = await api.refreshAccessToken(CLIENT_ID, CLIENT_SECRET);

      await updateSettings({
        googleCalendarTokens: {
          ...settings.googleCalendarTokens,
          accessToken: newAccessToken,
          expiryDate: Date.now() + 3600 * 1000, // 1 hour from now
        },
      });

      // Retry fetching events
      await fetchCalendarEvents(newAccessToken);
    } catch (err) {
      console.error('Error refreshing token:', err);
      setError('Failed to refresh access token. Please reconnect.');
    }
  }, [settings.googleCalendarTokens, updateSettings, fetchCalendarEvents]);

  // Disconnect Google Calendar
  const disconnectGoogleCalendar = useCallback(async () => {
    await updateSettings({
      googleCalendarConnected: false,
      googleCalendarTokens: undefined,
    });
    await saveCalendarEvents([]);
  }, [updateSettings, saveCalendarEvents]);

  // Get events for a specific day
  const getEventsForDay = useCallback((date: Date) => {
    return calendarEvents.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate.toDateString() === date.toDateString();
    });
  }, [calendarEvents]);

  return {
    isConnected,
    calendarEvents,
    loading,
    error,
    connectGoogleCalendar,
    disconnectGoogleCalendar,
    handleOAuthCallback,
    fetchCalendarEvents,
    refreshAccessToken,
    getEventsForDay,
  };
}
