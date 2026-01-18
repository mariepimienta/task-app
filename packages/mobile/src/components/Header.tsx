import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { getCurrentWeekRange } from '@task-app/shared';

interface HeaderProps {
  wakeUpTime: string;
  showTasks: boolean;
  showCalendarEvents: boolean;
  onToggleShowTasks: () => void;
  onToggleShowCalendarEvents: () => void;
}

export function Header({
  wakeUpTime,
  showTasks,
  showCalendarEvents,
  onToggleShowTasks,
  onToggleShowCalendarEvents,
}: HeaderProps) {
  const weekRange = getCurrentWeekRange();

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={styles.weekRange}>{weekRange.label}</Text>
        <Text style={styles.wakeUpTime}>*Wake up time: {wakeUpTime}</Text>
      </View>

      <View style={styles.controlsRow}>
        <TouchableOpacity style={styles.toggleButton} onPress={onToggleShowTasks}>
          <Text style={styles.toggleButtonText}>
            {showTasks ? '✓' : '○'} Tasks
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.toggleButton} onPress={onToggleShowCalendarEvents}>
          <Text style={styles.toggleButtonText}>
            {showCalendarEvents ? '✓' : '○'} Calendar
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  titleRow: {
    marginBottom: 12,
  },
  weekRange: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  wakeUpTime: {
    fontSize: 12,
    color: '#666',
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  toggleButtonText: {
    fontSize: 13,
    color: '#333',
  },
});
