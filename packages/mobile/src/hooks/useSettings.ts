import { useState, useEffect, useCallback } from 'react';
import { AppSettings, DEFAULT_SETTINGS } from '@task-app/shared';
import { AsyncStorageAdapter } from '../storage/AsyncStorageAdapter';

const storage = new AsyncStorageAdapter();

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const loadedSettings = await storage.getSettings();
      setSettings(loadedSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = useCallback(
    async (updates: Partial<AppSettings>) => {
      const newSettings = { ...settings, ...updates };
      try {
        await storage.saveSettings(newSettings);
        setSettings(newSettings);
      } catch (error) {
        console.error('Error saving settings:', error);
      }
    },
    [settings]
  );

  const toggleShowTasks = useCallback(async () => {
    await updateSettings({ showTasks: !settings.showTasks });
  }, [settings, updateSettings]);

  const toggleShowCalendarEvents = useCallback(async () => {
    await updateSettings({ showCalendarEvents: !settings.showCalendarEvents });
  }, [settings, updateSettings]);

  return {
    settings,
    loading,
    updateSettings,
    toggleShowTasks,
    toggleShowCalendarEvents,
  };
}
