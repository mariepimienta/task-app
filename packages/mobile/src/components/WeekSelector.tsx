import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { getWeekStartFromDate, getCurrentWeekStart, getWeekRangeFromStart, getPreviousWeekStart, getNextWeekStart } from '@task-app/shared';

interface WeekSelectorProps {
  availableWeeks: string[];
  currentWeek: string | 'template';
  onSelectWeek: (weekStart: string | 'template') => void;
  onCreateWeek?: () => void;
}

export function WeekSelector({
  availableWeeks,
  currentWeek,
  onSelectWeek,
  onCreateWeek,
}: WeekSelectorProps) {
  const [isVisible, setIsVisible] = useState(false);

  const currentLabel = currentWeek === 'template'
    ? 'Template'
    : getWeekRangeFromStart(currentWeek).label;

  const handleDateSelect = (day: { dateString: string }) => {
    const weekStart = getWeekStartFromDate(new Date(day.dateString));

    // Just select the week - WeeklyView will auto-create if needed
    onSelectWeek(weekStart);
    setIsVisible(false);
  };

  const handlePrevWeek = () => {
    if (currentWeek === 'template') return;
    const prevWeek = getPreviousWeekStart(currentWeek);
    onSelectWeek(prevWeek);
  };

  const handleNextWeek = () => {
    if (currentWeek === 'template') return;
    const nextWeek = getNextWeekStart(currentWeek);
    onSelectWeek(nextWeek);
  };

  // Mark weeks that have tasks
  const markedDates: { [key: string]: any } = {};
  availableWeeks.forEach(weekStart => {
    const date = new Date(weekStart);
    // Mark all 7 days of the week
    for (let i = 0; i < 7; i++) {
      const day = new Date(date);
      day.setDate(date.getDate() + i);
      const dateString = day.toISOString().split('T')[0];
      markedDates[dateString] = {
        marked: true,
        dotColor: '#000000',
      };
    }
  });

  // Highlight selected week
  if (currentWeek !== 'template') {
    const selectedDate = new Date(currentWeek);
    for (let i = 0; i < 7; i++) {
      const day = new Date(selectedDate);
      day.setDate(selectedDate.getDate() + i);
      const dateString = day.toISOString().split('T')[0];
      markedDates[dateString] = {
        ...markedDates[dateString],
        selected: true,
        selectedColor: '#000000',
      };
    }
  }

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={handlePrevWeek}
          disabled={currentWeek === 'template'}
          activeOpacity={0.6}
        >
          <Text style={[styles.navButtonText, currentWeek === 'template' && styles.navButtonDisabled]}>←</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.selectorButton}
          onPress={() => setIsVisible(true)}
          activeOpacity={0.6}
        >
          <Text style={styles.selectorLabel}>WEEK</Text>
          <Text style={styles.selectorValue}>{currentLabel}</Text>
          <Text style={styles.chevron}>▼</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={handleNextWeek}
          disabled={currentWeek === 'template'}
          activeOpacity={0.6}
        >
          <Text style={[styles.navButtonText, currentWeek === 'template' && styles.navButtonDisabled]}>→</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={isVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setIsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>Select Week</Text>
                  <Text style={styles.modalSubtitle}>Tap any date to select that week</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setIsVisible(false)}
                  style={styles.closeButton}
                  activeOpacity={0.6}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.calendarContainer}>
                <Calendar
                  onDayPress={handleDateSelect}
                  markedDates={markedDates}
                  theme={{
                    backgroundColor: '#ffffff',
                    calendarBackground: '#ffffff',
                    textSectionTitleColor: '#737373',
                    selectedDayBackgroundColor: '#000000',
                    selectedDayTextColor: '#ffffff',
                    todayTextColor: '#000000',
                    dayTextColor: '#000000',
                    textDisabledColor: '#d4d4d4',
                    dotColor: '#000000',
                    selectedDotColor: '#ffffff',
                    arrowColor: '#000000',
                    monthTextColor: '#000000',
                    textDayFontWeight: '400',
                    textMonthFontWeight: '500',
                    textDayHeaderFontWeight: '500',
                    textDayFontSize: 14,
                    textMonthFontSize: 16,
                    textDayHeaderFontSize: 12,
                  }}
                />
              </View>

              <TouchableOpacity
                style={styles.templateButton}
                onPress={() => {
                  onSelectWeek('template');
                  setIsVisible(false);
                }}
                activeOpacity={0.6}
              >
                <Text style={styles.templateButtonText}>View Template</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 6,
    backgroundColor: '#ffffff',
  },
  navButtonText: {
    fontSize: 20,
    color: '#000000',
    fontWeight: '300',
  },
  navButtonDisabled: {
    color: '#d4d4d4',
  },
  selectorButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 6,
  },
  selectorLabel: {
    fontSize: 11,
    color: '#737373',
    fontWeight: '500',
    marginRight: 12,
    letterSpacing: 1,
  },
  selectorValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: '400',
    color: '#000000',
  },
  chevron: {
    fontSize: 10,
    color: '#737373',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '300',
    color: '#000000',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#737373',
    fontWeight: '400',
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#737373',
    fontWeight: '300',
  },
  calendarContainer: {
    padding: 16,
  },
  templateButton: {
    margin: 20,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 6,
    alignItems: 'center',
  },
  templateButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
});
