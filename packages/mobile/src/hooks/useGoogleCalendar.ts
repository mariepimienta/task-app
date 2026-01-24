import { useState, useEffect, useCallback } from 'react';
import { GoogleCalendarAPI, getAuthorizationUrl, exchangeCodeForTokens } from '@task-app/shared';
import type { CalendarEvent } from '@task-app/shared';
import { useSettings } from './useSettings';
import { AsyncStorageAdapter } from '../storage/AsyncStorageAdapter';
import { Alert, Linking, Platform } from 'react-native';

const storage = new AsyncStorageAdapter();

// Note: For production mobile OAuth, you would need to:
// 1. Set up a custom URL scheme (e.g., taskapp://)
// 2. Use expo-auth-session or similar library
// 3. Configure Google OAuth credentials with the custom scheme as redirect URI
// For now, this uses web-compatible OAuth for testing in web preview

const CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '';
const CLIENT_SECRET = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_SECRET || '';
const REDIRECT_URI = process.env.EXPO_PUBLIC_REDIRECT_URI || 'http://localhost:8081/oauth/callback';

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
  const connectGoogleCalendar = useCallback(async () => {
    if (!CLIENT_ID) {
      Alert.alert(
        'Configuration Required',
        'Google Client ID not configured. Please add EXPO_PUBLIC_GOOGLE_CLIENT_ID to your environment variables.'
      );
      return;
    }

    const authUrl = getAuthorizationUrl(CLIENT_ID, REDIRECT_URI);

    try {
      // On web, we can use window.location
      // On native, this would open in browser (not ideal - should use expo-auth-session)
      if (Platform.OS === 'web') {
        window.location.href = authUrl;
      } else {
        const canOpen = await Linking.canOpenURL(authUrl);
        if (canOpen) {
          await Linking.openURL(authUrl);
          Alert.alert(
            'OAuth Flow',
            'For native mobile OAuth, you should implement expo-auth-session for a better user experience.'
          );
        }
      }
    } catch (err) {
      console.error('Error opening OAuth URL:', err);
      Alert.alert('Error', 'Failed to open Google Calendar authorization');
    }
  }, []);

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
      setError('Failed to fetch calendar events');
    } finally {
      setLoading(false);
    }
  }, [hasTokens, settings.googleCalendarTokens, saveCalendarEvents]);

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
  }, [updateSettings, fetchCalendarEvents]);

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
    getEventsForDay,
  };
}
