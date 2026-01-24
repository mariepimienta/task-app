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
  Alert,
} from 'react-native';
import { Task } from '@task-app/shared';

interface TaskActionModalProps {
  visible: boolean;
  task: Task | null;
  onClose: () => void;
  onSave: (taskId: string, newTitle: string) => void;
  onDelete: (taskId: string) => void;
}

export function TaskActionModal({ visible, task, onClose, onSave, onDelete }: TaskActionModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');

  useEffect(() => {
    if (visible && task) {
      setEditedTitle(task.title);
      setIsEditing(false);
    }
  }, [visible, task]);

  const handleSave = () => {
    if (task && editedTitle.trim()) {
      onSave(task.id, editedTitle.trim());
      onClose();
    }
  };

  const handleDelete = () => {
    if (!task) return;

    const confirmDelete = () => {
      onDelete(task.id);
      onClose();
    };

    if (typeof window !== 'undefined' && window.confirm) {
      if (window.confirm('Are you sure you want to delete this task?')) {
        confirmDelete();
      }
    } else {
      Alert.alert(
        'Delete Task',
        'Are you sure you want to delete this task?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: confirmDelete },
        ]
      );
    }
  };

  if (!task) return null;

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
            <Text style={styles.title}>{isEditing ? 'Edit Task' : 'Task Options'}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {isEditing ? (
            <>
              <TextInput
                style={styles.input}
                value={editedTitle}
                onChangeText={setEditedTitle}
                autoFocus
                multiline
                placeholder="Task description..."
                placeholderTextColor="#a3a3a3"
              />
              <View style={styles.editButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setIsEditing(false)}
                  activeOpacity={0.6}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveButton, !editedTitle.trim() && styles.saveButtonDisabled]}
                  onPress={handleSave}
                  disabled={!editedTitle.trim()}
                  activeOpacity={0.6}
                >
                  <Text style={[styles.saveButtonText, !editedTitle.trim() && styles.saveButtonTextDisabled]}>
                    Save
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setIsEditing(true)}
                activeOpacity={0.6}
              >
                <Text style={styles.actionButtonText}>Edit Task</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={handleDelete}
                activeOpacity={0.6}
              >
                <Text style={styles.deleteButtonText}>Delete Task</Text>
              </TouchableOpacity>
            </View>
          )}
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
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  title: {
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
  editButtons: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 6,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#737373',
    fontSize: 14,
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#000000',
    borderRadius: 6,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#f5f5f5',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  saveButtonTextDisabled: {
    color: '#a3a3a3',
  },
  actionButtons: {
    padding: 24,
    gap: 12,
  },
  actionButton: {
    paddingVertical: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: '#fef2f2',
  },
  deleteButtonText: {
    color: '#dc2626',
    fontSize: 15,
    fontWeight: '500',
  },
});
