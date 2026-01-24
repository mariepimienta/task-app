import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { DayOfWeek, TimeOfDay } from '@task-app/shared';

interface AddTaskModalProps {
  visible: boolean;
  dayOfWeek: DayOfWeek | null;
  timeOfDay: TimeOfDay | null;
  onClose: () => void;
  onAdd: (text: string) => void;
}

export function AddTaskModal({ visible, dayOfWeek, timeOfDay, onClose, onAdd }: AddTaskModalProps) {
  const [taskText, setTaskText] = useState('');

  useEffect(() => {
    if (visible) {
      setTaskText('');
    }
  }, [visible]);

  const handleAdd = () => {
    if (taskText.trim()) {
      onAdd(taskText.trim());
      onClose();
    }
  };

  const dayLabel = dayOfWeek
    ? dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1)
    : '';
  const timeLabel = timeOfDay?.toUpperCase() || '';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Add Task</Text>
              <Text style={styles.subtitle}>
                {dayLabel} • {timeLabel}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Enter task description..."
            placeholderTextColor="#a3a3a3"
            value={taskText}
            onChangeText={setTaskText}
            autoFocus
            multiline
            returnKeyType="done"
            onSubmitEditing={handleAdd}
          />

          <TouchableOpacity
            style={[styles.addButton, !taskText.trim() && styles.addButtonDisabled]}
            onPress={handleAdd}
            disabled={!taskText.trim()}
            activeOpacity={0.6}
          >
            <Text style={[styles.addButtonText, !taskText.trim() && styles.addButtonTextDisabled]}>
              Add Task
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  backdrop: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  title: {
    fontSize: 24,
    fontWeight: '300',
    color: '#000000',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
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
  input: {
    margin: 24,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 6,
    fontSize: 15,
    color: '#000000',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  addButton: {
    marginHorizontal: 24,
    paddingVertical: 14,
    backgroundColor: '#000000',
    borderRadius: 6,
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#f5f5f5',
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  addButtonTextDisabled: {
    color: '#a3a3a3',
  },
});
