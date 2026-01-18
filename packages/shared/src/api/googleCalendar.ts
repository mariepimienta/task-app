import { CalendarEvent } from '../types';

export interface GoogleCalendarConfig {
  accessToken: string;
  refreshToken?: string;
}

/**
 * Google Calendar API integration
 *
 * Setup Instructions:
 * 1. Go to Google Cloud Console (https://console.cloud.google.com/)
 * 2. Create a new project or select existing one
 * 3. Enable Google Calendar API
 * 4. Create OAuth 2.0 credentials (Web application)
 * 5. Add authorized redirect URIs:
 *    - For web: http://localhost:5173/oauth/callback
 *    - For mobile: Custom scheme like taskapp://oauth/callback
 * 6. Copy Client ID and Client Secret
 */

export class GoogleCalendarAPI {
  private accessToken: string;
  private refreshToken?: string;

  constructor(config: GoogleCalendarConfig) {
    this.accessToken = config.accessToken;
    this.refreshToken = config.refreshToken;
  }

  /**
   * Fetch events for a specific time range
   */
  async fetchEvents(timeMin: Date, timeMax: Date): Promise<CalendarEvent[]> {
    try {
      const params = new URLSearchParams({
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        singleEvents: 'true',
        orderBy: 'startTime',
      });

      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized - token may be expired');
        }
        throw new Error(`Failed to fetch events: ${response.statusText}`);
      }

      const data = await response.json() as { items: any[] };

      return data.items.map((item: any) => ({
        id: item.id,
        title: item.summary || 'Untitled Event',
        startTime: item.start.dateTime || item.start.date,
        endTime: item.end.dateTime || item.end.date,
        source: 'google' as const,
        visible: true,
      }));
    } catch (error) {
      console.error('Error fetching Google Calendar events:', error);
      throw error;
    }
  }

  /**
   * Refresh the access token using refresh token
   */
  async refreshAccessToken(clientId: string, clientSecret: string): Promise<string> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: this.refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json() as { access_token: string };
      this.accessToken = data.access_token;
      return data.access_token;
    } catch (error) {
      console.error('Error refreshing access token:', error);
      throw error;
    }
  }
}

/**
 * OAuth 2.0 helpers
 */
export const GOOGLE_OAUTH_CONFIG = {
  authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenUrl: 'https://oauth2.googleapis.com/token',
  scope: 'https://www.googleapis.com/auth/calendar.readonly',
};

/**
 * Generate OAuth authorization URL
 */
export function getAuthorizationUrl(clientId: string, redirectUri: string): string {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: GOOGLE_OAUTH_CONFIG.scope,
    access_type: 'offline', // Get refresh token
    prompt: 'consent', // Force consent screen to get refresh token
  });

  return `${GOOGLE_OAUTH_CONFIG.authUrl}?${params}`;
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string
): Promise<{ accessToken: string; refreshToken: string; expiryDate: number }> {
  try {
    const response = await fetch(GOOGLE_OAUTH_CONFIG.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code for tokens');
    }

    const data = await response.json() as { access_token: string; refresh_token: string; expires_in: number };

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiryDate: Date.now() + data.expires_in * 1000,
    };
  } catch (error) {
    console.error('Error exchanging code for tokens:', error);
    throw error;
  }
}
