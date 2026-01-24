import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface HeaderProps {
  wakeUpTime: string;
  showTasks: boolean;
  showCalendarEvents: boolean;
  onToggleShowTasks: () => void;
  onToggleShowCalendarEvents: () => void;
  weekTitle?: string;
  isTemplateView?: boolean;
  onSaveTemplateToAllWeeks?: () => void;
  isCalendarConnected?: boolean;
  onConnectCalendar?: () => void;
  onDisconnectCalendar?: () => void;
}

export function Header({
  wakeUpTime,
  showTasks,
  showCalendarEvents,
  onToggleShowTasks,
  onToggleShowCalendarEvents,
  weekTitle,
  isTemplateView = false,
  onSaveTemplateToAllWeeks,
  isCalendarConnected = false,
  onConnectCalendar,
  onDisconnectCalendar,
}: HeaderProps) {

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={styles.weekRange}>{weekTitle || 'Weekly View'}</Text>
        <Text style={styles.wakeUpTime}>Wake up: {wakeUpTime}</Text>
      </View>

      <View style={styles.controlsRow}>
        <TouchableOpacity
          style={[styles.toggleButton, showTasks && styles.toggleButtonActive]}
          onPress={onToggleShowTasks}
          activeOpacity={0.6}
        >
          <Text style={[styles.toggleButtonText, showTasks && styles.toggleButtonTextActive]}>
            Tasks
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggleButton, showCalendarEvents && styles.toggleButtonActive]}
          onPress={onToggleShowCalendarEvents}
          activeOpacity={0.6}
        >
          <Text style={[styles.toggleButtonText, showCalendarEvents && styles.toggleButtonTextActive]}>
            Calendar
          </Text>
        </TouchableOpacity>

        {isCalendarConnected ? (
          <TouchableOpacity
            style={[styles.toggleButton, styles.toggleButtonActive]}
            onPress={onDisconnectCalendar}
            activeOpacity={0.6}
          >
            <Text style={[styles.toggleButtonText, styles.toggleButtonTextActive]}>
              Connected
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={onConnectCalendar}
            activeOpacity={0.6}
          >
            <Text style={styles.toggleButtonText}>
              Connect
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {isTemplateView && onSaveTemplateToAllWeeks && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onSaveTemplateToAllWeeks}
          activeOpacity={0.6}
        >
          <Text style={styles.actionButtonText}>Save for All Future Weeks</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  titleRow: {
    marginBottom: 20,
  },
  weekRange: {
    fontSize: 32,
    fontWeight: '300',
    color: '#000000',
    marginBottom: 6,
    letterSpacing: -1,
  },
  wakeUpTime: {
    fontSize: 14,
    color: '#737373',
    fontWeight: '400',
    letterSpacing: 0,
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 6,
  },
  toggleButtonActive: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  toggleButtonText: {
    fontSize: 13,
    color: '#737373',
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  toggleButtonTextActive: {
    color: '#ffffff',
  },
  actionButton: {
    marginTop: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: '#000000',
    borderRadius: 6,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
});
