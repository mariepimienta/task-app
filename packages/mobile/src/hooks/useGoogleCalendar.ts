import { useState, useEffect, useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { GoogleCalendarAPI, exchangeCodeForTokens } from '@task-app/shared';
import type { CalendarEvent } from '@task-app/shared';
import { useSettings } from './useSettings';
import { AsyncStorageAdapter } from '../storage/AsyncStorageAdapter';

// Complete auth session for web browser redirect
WebBrowser.maybeCompleteAuthSession();

const storage = new AsyncStorageAdapter();

const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '';
const IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '';
const CLIENT_SECRET = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_SECRET || '';
const WEB_REDIRECT_URI = process.env.EXPO_PUBLIC_REDIRECT_URI || 'http://localhost:8081';

// Use iOS client ID on native, web client ID on web
const CLIENT_ID = Platform.OS === 'web' ? WEB_CLIENT_ID : (IOS_CLIENT_ID || WEB_CLIENT_ID);

// For iOS, Google requires reversed client ID as the redirect URI scheme
const getIOSRedirectUri = () => {
  if (!IOS_CLIENT_ID) return '';
  // Reverse the client ID: xxx.apps.googleusercontent.com -> com.googleusercontent.apps.xxx
  const reversedClientId = IOS_CLIENT_ID.split('.').reverse().join('.');
  return `${reversedClientId}:/oauthredirect`;
};

// Google OAuth discovery document
const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

export function useGoogleCalendar() {
  const { settings, updateSettings } = useSettings();
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isConnected = settings.googleCalendarConnected;
  const hasTokens = !!settings.googleCalendarTokens;

  // For iOS, use the reversed client ID format that Google requires
  const redirectUri = Platform.OS === 'ios'
    ? getIOSRedirectUri()
    : AuthSession.makeRedirectUri({
        scheme: 'taskapp',
        path: 'oauth',
      });

  // Create the auth request
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: CLIENT_ID,
      scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
      redirectUri: Platform.OS === 'web' ? WEB_REDIRECT_URI : redirectUri,
      responseType: AuthSession.ResponseType.Code,
      usePKCE: true,
    },
    discovery
  );

  // Handle the auth response
  useEffect(() => {
    if (response?.type === 'success') {
      const { code } = response.params;
      if (code) {
        handleOAuthCallback(code, request?.codeVerifier);
      }
    } else if (response?.type === 'error') {
      Alert.alert('Authentication Error', response.error?.message || 'Failed to authenticate');
    }
  }, [response]);

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

    try {
      await promptAsync();
    } catch (err) {
      console.error('Error starting OAuth flow:', err);
      Alert.alert('Error', 'Failed to start Google Calendar authorization');
    }
  }, [promptAsync]);

  // Fetch calendar events from Google
  // silent: if true, don't show errors (used for auto-fetch on startup)
  const fetchCalendarEvents = useCallback(async (accessToken?: string, silent = false) => {
    if (!hasTokens && !accessToken) {
      console.warn('No access token available');
      return;
    }

    setLoading(true);
    if (!silent) setError(null);

    try {
      const token = accessToken || settings.googleCalendarTokens?.accessToken;
      if (!token) {
        console.warn('No access token available');
        return;
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
      console.warn('Error fetching calendar events:', err?.message || err);
      if (!silent) {
        setError('Failed to fetch calendar events');
      }
      // Don't re-throw - just log the error
    } finally {
      setLoading(false);
    }
  }, [hasTokens, settings.googleCalendarTokens, saveCalendarEvents]);

  // Handle OAuth callback
  const handleOAuthCallback = useCallback(async (code: string, codeVerifier?: string) => {
    setLoading(true);
    setError(null);

    try {
      // For native with PKCE, we need to exchange code differently
      if (Platform.OS !== 'web' && codeVerifier) {
        // Exchange code for tokens using PKCE
        const tokenResponse = await AuthSession.exchangeCodeAsync(
          {
            clientId: CLIENT_ID,
            code,
            redirectUri,
            extraParams: {
              code_verifier: codeVerifier,
            },
          },
          discovery
        );

        await updateSettings({
          googleCalendarConnected: true,
          googleCalendarTokens: {
            accessToken: tokenResponse.accessToken,
            refreshToken: tokenResponse.refreshToken || '',
            expiryDate: tokenResponse.expiresIn
              ? Date.now() + tokenResponse.expiresIn * 1000
              : Date.now() + 3600 * 1000,
          },
        });

        // Fetch initial events
        await fetchCalendarEvents(tokenResponse.accessToken);
      } else {
        // Web flow - use the existing exchange function
        const tokens = await exchangeCodeForTokens(code, CLIENT_ID, CLIENT_SECRET, WEB_REDIRECT_URI);

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
      }

      Alert.alert('Success', 'Google Calendar connected successfully!');
      return true;
    } catch (err) {
      console.error('OAuth callback error:', err);
      setError('Failed to connect Google Calendar. Please try again.');
      Alert.alert('Error', 'Failed to connect Google Calendar. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  }, [updateSettings, fetchCalendarEvents, redirectUri]);

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
