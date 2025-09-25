import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, TouchableOpacity } from 'react-native';
//import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
//import { Slider } from '@rneui/themed';
import { SafeAreaView } from 'react-native-safe-area-context';

// Interface for settings data
interface SettingsState {
  enableNotifications: boolean;
  notifyTime: Date;
  expirationThreshold: number;
  enableSound: boolean;
  showExpiringFirst: boolean;
}

// Settings React Component
export default function Settings() {
  // Variable to store settings data
  const [settings, setSettings] = useState<SettingsState>({
    enableNotifications: true,
    notifyTime: new Date(),
    expirationThreshold: 3,
    enableSound: true,
    showExpiringFirst: true,
  });

  // Used for time picker (implement later)
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Auto start
  useEffect(() => {
    loadSettings();
  }, []);

  // Load settings data from async storage
  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('appSettings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings({
          ...parsedSettings,
          notifyTime: new Date(parsedSettings.dailyReminderTime),
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  // Save settings data to async storage
  const saveSettings = async (newSettings: SettingsState) => {
    try {
      await AsyncStorage.setItem('appSettings', JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  // Function to change the settings data variable
  const handleSettingChange = (key: keyof SettingsState, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  // Used for time picker (implement later)
  const handleTimeChange = (event: any, selectedDate?: Date) => {
    setShowTimePicker(false);
    if (selectedDate) {
      handleSettingChange('notifyTime', selectedDate);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Notification Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Settings</Text>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Enable notifications</Text>
            <Switch
              value={settings.enableNotifications}
              onValueChange={(value) => handleSettingChange('enableNotifications', value)}
            />
          </View>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => setShowTimePicker(true)}
          >
            <Text style={styles.settingLabel}>Time to notify</Text>
            <Text style={styles.timeText}>
              {settings.notifyTime.toLocaleTimeString().slice(0, 5)}
            </Text>
          </TouchableOpacity>

          {/*showTimePicker && (
            <DateTimePicker
              value={settings.notifyTime}
              mode="time"
              is24Hour={true}
              display="default"
              onChange={handleTimeChange}
            />
          )*/}

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Enable sound</Text>
            <Switch
              value={settings.enableSound}
              onValueChange={(value) => handleSettingChange('enableSound', value)}
            />
          </View>
        </View>
        
        {/* Expiration Reminder Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Expiration Reminder Settings</Text>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>
              Notify before expiration: {settings.expirationThreshold} days
            </Text>
          </View>
          
          {/**<Slider
            value={settings.expirationThreshold}
            onValueChange={(value) => handleSettingChange('expirationThreshold', value)}
            minimumValue={1}
            maximumValue={7}
            step={1}
            thumbStyle={styles.sliderThumb}
            trackStyle={styles.sliderTrack}
          />**/}

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Show expiring items first</Text>
            <Switch
              value={settings.showExpiringFirst}
              onValueChange={(value) => handleSettingChange('showExpiringFirst', value)}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Style sheets
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: 'white',
    marginVertical: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 20,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  timeText: {
    fontSize: 16,
    color: '#666',
  },
  sliderThumb: {
    backgroundColor: '#2196F3',
    width: 24,
    height: 24,
  },
  sliderTrack: {
    height: 4,
  },
});
