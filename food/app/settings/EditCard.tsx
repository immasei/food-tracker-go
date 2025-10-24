import React, { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text, TextInput, Modal, Platform, Alert, KeyboardAvoidingView, Pressable, } from "react-native";
import type { TextInputProps } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type ToastVariant = "success" | "warning" | "danger" | "info";

export type EditCardProps = {
  title: string;
  twolines?: boolean;
  firstItem?: boolean;
  subtitle: string;
  value?: string | null;
  placeholder?: string;
  message?: string;
  editable?: boolean;
  disabled?: boolean;
  allowBlank?: boolean;
  onSubmit?: (value: string) => Promise<void>;
  onPress?: () => void;
  showToast?: (message: string, variant?: ToastVariant) => void;
  inputProps?: TextInputProps;
};

const EditCard: React.FC<EditCardProps> = ({
  title,
  twolines,
  firstItem,
  subtitle,
  value,
  placeholder = "",
  message,
  editable = true,
  disabled = false,
  allowBlank = false,
  onSubmit,
  onPress,
  showToast,
  inputProps,
}) => {

  // Variables:
  const [visible, setVisible] = useState(false);    // Modal visibility
  const [draft, setDraft] = useState(value ?? "");  // Local draft of the value being edited
  const [saving, setSaving] = useState(false);      // Indicates if the update is in progress



  // Methods:

  // Reset draft when value or visibility changes
  useEffect(() => {
    if (!visible) {
      setDraft(value ?? "");
    }
  }, [value, visible]);

  // Determine display value and placeholder status
  const displayValue = value && value.trim().length > 0 ? value : placeholder;
  // Check if the current value is the placeholder
  const isPlaceholder = !(value && value.trim().length > 0);

  // Method to trigger toast or alert
  const triggerToast = (text: string, variant: ToastVariant = "info") => {
    if (showToast) {
      showToast(text, variant);
    } else {
      Alert.alert("Notice", text);
    }
  };

  // Method to handle press on setting list item and open edit window
  const handlePress = () => {
    if (disabled) return;
    if (editable) {
      setDraft(value ?? "");
      setVisible(true);
    } else {
      onPress?.();
    }
  };

  // Method to handle cancel action in modal
  const handleCancel = () => {
    setVisible(false);
    setDraft(value ?? "");
  };

  // Method to update data to Firebase
  const handleUpdate = async () => {
    if (!editable || !onSubmit) return;
    const trimmedDraft = draft.trim();
    const trimmedCurrent = (value ?? "").trim();
    const hasChanged = trimmedDraft !== trimmedCurrent;

    if (!allowBlank && trimmedDraft.length === 0) {
      triggerToast(`${title} cannot be empty`, "warning");
      return;
    }

    if (!hasChanged) {
      triggerToast("No changes to update", "info");
      return;
    }

    setSaving(true);
    try {
      await onSubmit(trimmedDraft);
      setVisible(false);
    } catch (err: any) {
      const msg = typeof err?.message === "string" && err.message.length > 0 ? err.message : "Update failed";
      triggerToast(msg, "danger");
    } finally {
      setSaving(false);
    }
  };

  const trimmedDraft = draft.trim();
  const trimmedCurrent = (value ?? "").trim();
  const hasChanged = trimmedDraft !== trimmedCurrent;
  const meetsRequirement = allowBlank || trimmedDraft.length > 0;
  const canSubmit = !saving && !!onSubmit && meetsRequirement && hasChanged;

  const {
    style: customInputStyle,
    multiline: isMultiline = false,
    ...restInputProps
  } = inputProps ?? {};



  // Render:
  return (
    <>
      {/* Setting list item */}
      <Pressable
        style={({ pressed }) => [
          styles.settingItem,
          pressed && styles.settingItemPressed,
          disabled && styles.settingItemDisabled,
        ]}
        onPress={handlePress}
        disabled={disabled || (editable && !onSubmit) || saving}
      >
        
        <View style={[styles.settingItemLined, firstItem && styles.settingItemLinedFirst ]} >
          <View style={styles.settingItemText}>
            <Text style={styles.settingItemTitle}>{title}</Text>
            {twolines && <Text style={styles.settingItemValueLine}>{displayValue}</Text>}
            <Text style={styles.settingItemSubtitle}>{subtitle}</Text>
          </View>
          {!twolines && 
          <Text
            style={[styles.settingItemValue, isPlaceholder && styles.valuePlaceholder]}
            numberOfLines={1}
          >
            {displayValue}
          </Text>}
          <Ionicons name="chevron-forward" size={20} color="#ccc" style={styles.rightArrow} />
        </View>
      </Pressable>

      {/* Data edit window, triggered by pressing setting list item  */}
      {editable && (
        <Modal
          visible={visible}
          transparent
          animationType="slide"
          onRequestClose={handleCancel}
        >
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
              style={styles.modalAvoiding}
            >
              <Pressable style={styles.modalContent}>
                <Text style={styles.modalTitle}>{title}</Text>
                {message ? <Text style={styles.modalMessage}>{message}</Text> : null}
                <TextInput
                  value={draft}
                  onChangeText={setDraft}
                  placeholder={placeholder}
                  placeholderTextColor="#bbb"
                  autoFocus
                  multiline={isMultiline}
                  {...restInputProps}
                  style={[
                    styles.modalInput,
                    isMultiline && styles.modalInputMultiline,
                    customInputStyle as any,
                  ]}
                />
                <View style={styles.modalButtonRow}>
                  {/* Update button */}
                  <TouchableOpacity
                    onPress={handleUpdate}
                    style={[
                      styles.modalButton,
                      styles.modalButtonPrimary,
                      (!canSubmit || saving) && styles.modalButtonDisabled,
                    ]}
                    disabled={!canSubmit}
                  >
                    <Text style={styles.modalButtonTextPrimary}>
                      {saving ? "Saving..." : "Update"}
                    </Text>
                  </TouchableOpacity>
                  
                  {/* Cancel button */}
                  <TouchableOpacity
                    onPress={handleCancel}
                    style={[styles.modalButton, styles.modalButtonSecondary]}
                    disabled={saving}
                  >
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </Pressable>
            </KeyboardAvoidingView>
          </View>
        </Modal>
      )}
    </>
  );
};



// Styles:
const styles = StyleSheet.create({
  settingItem: {
    paddingLeft: 16,
  },
  settingItemLined: {
    paddingVertical: 12,
    paddingRight: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  settingItemLinedFirst: {
    borderTopWidth: 0,
  },
  settingItemPressed: {
    backgroundColor: '#eee',
  },
  settingItemDisabled: {
  },
  settingItemText: {
    flex: 1,
    marginRight: 12,
  },
  settingItemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
  },
  settingItemSubtitle: {
    marginTop: 2,
    fontSize: 13,
    color: "#777",
  },
  settingItemValue: {
    fontSize: 16,
    color: "#333",
    maxWidth: "60%",
    textAlign: "right",
  },
  settingItemValueLine: {
    marginTop: 4,
    fontSize: 16,
    color: "#333",
    textAlign: "left",
  },
  valuePlaceholder: {
    color: "#bbb",
  },
  rightArrow: {
    marginLeft: 5,
    marginRight: -10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  modalAvoiding: {
    flex: 1,
    justifyContent: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 30,
    marginHorizontal: 30,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
    alignSelf: "center",
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 14,
    color: "#777",
    marginBottom: 16,
    lineHeight: 20,
  },
  modalInput: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#dcdcde",
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    color: "#111",
    backgroundColor: "#f9f9fb",
    marginBottom: 20,
  },
  modalInputMultiline: {
    height: 120,
    textAlignVertical: "top",
  },
  modalButtonRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: "center",
    borderRadius: 15,
  },
  modalButtonPrimary: {
    backgroundColor: "#07f",
  },
  modalButtonSecondary: {
    backgroundColor: "#f1f2f3",
  },
  modalButtonDisabled: {
    backgroundColor: "#bbb",
  },
  modalButtonText: {
    color: "#111",
    fontWeight: "600",
    fontSize: 16,
  },
  modalButtonTextPrimary: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default EditCard;
