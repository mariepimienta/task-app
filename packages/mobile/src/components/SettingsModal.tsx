import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  showTasks: boolean;
  showCalendarEvents: boolean;
  onToggleShowTasks: () => void;
  onToggleShowCalendarEvents: () => void;
  isCalendarConnected: boolean;
  onConnectCalendar: () => void;
  onDisconnectCalendar: () => void;
}

export function SettingsModal({
  visible,
  onClose,
  showTasks,
  showCalendarEvents,
  onToggleShowTasks,
  onToggleShowCalendarEvents,
  isCalendarConnected,
  onConnectCalendar,
  onDisconnectCalendar,
}: SettingsModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Settings</Text>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeButton}
                activeOpacity={0.6}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Display</Text>

              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Show Tasks</Text>
                <Switch
                  value={showTasks}
                  onValueChange={onToggleShowTasks}
                  trackColor={{ false: '#e5e5e5', true: '#000000' }}
                  thumbColor="#ffffff"
                />
              </View>

              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Show Calendar Events</Text>
                <Switch
                  value={showCalendarEvents}
                  onValueChange={onToggleShowCalendarEvents}
                  trackColor={{ false: '#e5e5e5', true: '#000000' }}
                  thumbColor="#ffffff"
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Google Calendar</Text>

              <View style={styles.settingRow}>
                <View>
                  <Text style={styles.settingLabel}>Connection Status</Text>
                  <Text style={styles.settingSubtext}>
                    {isCalendarConnected ? 'Connected' : 'Not connected'}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.connectionButton,
                    isCalendarConnected && styles.connectionButtonDisconnect,
                  ]}
                  onPress={isCalendarConnected ? onDisconnectCalendar : onConnectCalendar}
                  activeOpacity={0.6}
                >
                  <Text
                    style={[
                      styles.connectionButtonText,
                      isCalendarConnected && styles.connectionButtonTextDisconnect,
                    ]}
                  >
                    {isCalendarConnected ? 'Disconnect' : 'Connect'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '300',
    color: '#000000',
    letterSpacing: -0.5,
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
  section: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#737373',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingLabel: {
    fontSize: 15,
    color: '#000000',
    fontWeight: '400',
  },
  settingSubtext: {
    fontSize: 13,
    color: '#737373',
    marginTop: 2,
  },
  connectionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#000000',
    borderRadius: 6,
  },
  connectionButtonDisconnect: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  connectionButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#ffffff',
  },
  connectionButtonTextDisconnect: {
    color: '#737373',
  },
});
