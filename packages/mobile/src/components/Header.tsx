import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface HeaderProps {
  isTemplateView?: boolean;
  onSaveTemplateToAllWeeks?: () => void;
  onOpenSettings: () => void;
}

export function Header({
  isTemplateView = false,
  onSaveTemplateToAllWeeks,
  onOpenSettings,
}: HeaderProps) {

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Text style={styles.appTitle}>Tasks</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={onOpenSettings}
          activeOpacity={0.6}
        >
          <Text style={styles.settingsIcon}>⚙</Text>
        </TouchableOpacity>
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
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: '#000000',
    letterSpacing: -0.5,
  },
  settingsButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIcon: {
    fontSize: 24,
    color: '#737373',
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
