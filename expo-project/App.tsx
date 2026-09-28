import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Switch,
  Modal,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Theme Palettes matching the Mimi Design System
const THEMES = {
  onyx_minimal: {
    id: 'onyx_minimal',
    name: 'Onyx Studio',
    tagline: 'Deep black & shadow grey with sunset orange accent',
    bg: '#000001',
    card: '#141415',
    border: '#16161C',
    accent: '#F85E2B',
    text: '#FFFFFF',
    muted: '#646366',
    slate: '#C7C6C9',
  },
  rose: {
    id: 'rose',
    name: 'Rosewater Blush',
    tagline: 'Delicate maternal warmth and soft tea rose petal',
    bg: '#0A0507',
    card: '#1A0D12',
    border: '#2E1520',
    accent: '#E11D48',
    text: '#FFFFFF',
    muted: '#7C4A5A',
    slate: '#E8CCD5',
  },
  lavender: {
    id: 'lavender',
    name: 'Morning Lavender',
    tagline: 'Calming lilac mist and soothing wisteria',
    bg: '#06040A',
    card: '#130C1C',
    border: '#241436',
    accent: '#9333EA',
    text: '#FFFFFF',
    muted: '#6B4E8C',
    slate: '#D6C8E8',
  },
  sage: {
    id: 'sage',
    name: 'Sage Blossom',
    tagline: 'Quiet botanical sage and morning dew garden',
    bg: '#030806',
    card: '#0B1712',
    border: '#142E24',
    accent: '#059669',
    text: '#FFFFFF',
    muted: '#457361',
    slate: '#C4E3D7',
  },
  peach: {
    id: 'peach',
    name: 'Honey Peach',
    tagline: 'Warm soothing peach and morning apricot glow',
    bg: '#0A0603',
    card: '#1A1009',
    border: '#331D10',
    accent: '#EA580C',
    text: '#FFFFFF',
    muted: '#7A523A',
    slate: '#E8D3C4',
  },
};

type ThemeKey = keyof typeof THEMES;

interface AlarmItem {
  id: string;
  time: string; // "07:30"
  label: string;
  enabled: boolean;
  repeat: string;
}

export default function App() {
  const [currentThemeKey, setCurrentThemeKey] = useState<ThemeKey>('onyx_minimal');
  const [activeTab, setActiveTab] = useState<'alarms' | 'clock' | 'timer' | 'bedtimes'>('alarms');
  const [alarms, setAlarms] = useState<AlarmItem[]>([
    { id: '1', time: '06:30', label: 'Morning Fajr & Awakening', enabled: true, repeat: 'Every Day' },
    { id: '2', time: '08:00', label: 'Gentle Breakfast Reminder', enabled: true, repeat: 'Weekdays' },
    { id: '3', time: '14:30', label: 'Peaceful Afternoon Pause', enabled: false, repeat: 'Once' },
  ]);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isTestAlarmOpen, setIsTestAlarmOpen] = useState(false);
  const [language, setLanguage] = useState<'ur' | 'en' | 'hi' | 'ar'>('ur');

  const theme = THEMES[currentThemeKey];

  // Speak maternal wake-up message using Expo Speech
  const playMaternalWakeUp = () => {
    Speech.stop();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    let message = '';
    let voiceLang = 'ur';

    if (language === 'ur') {
      message = 'صبح بخیر میرے پیارے بیٹا! اٹھ جاؤ، ماں آپ کے لیے ہمیشہ دعا گو ہے۔ اللہ آپ کے دن کو آسان اور پرسکون بنائے۔';
      voiceLang = 'ur-PK';
    } else if (language === 'hi') {
      message = 'सुप्रभात मेरे प्यारे बच्चे! उठ जाओ, नया सवेरा आपका स्वागत कर रहा है। माँ आपसे बहुत प्यार करती है।';
      voiceLang = 'hi-IN';
    } else if (language === 'ar') {
      message = 'صباح الخير يا بني! استيقظ بهدوء، أمك تدعو لك بيوم مبارك وسعيد.';
      voiceLang = 'ar-SA';
    } else {
      message = 'Good morning my dear child! Take a peaceful breath and wake up gently. Mom loves you and is proud of you.';
      voiceLang = 'en-US';
    }

    Speech.speak(message, {
      language: voiceLang,
      pitch: 1.15,
      rate: 0.85,
    });
  };

  const toggleAlarm = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAlarms((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    );
  };

  const handleTestAlarm = () => {
    setIsTestAlarmOpen(true);
    playMaternalWakeUp();
  };

  const handleDismissTestAlarm = () => {
    Speech.stop();
    setIsTestAlarmOpen(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.bg} />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <View style={styles.brandRow}>
          <View style={[styles.logoIcon, { backgroundColor: theme.accent }]}>
            <Text style={styles.logoHeart}>♥</Text>
          </View>
          <Text style={styles.brandTitle}>Mimi</Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => setLanguage((l) => (l === 'ur' ? 'en' : l === 'en' ? 'hi' : l === 'hi' ? 'ar' : 'ur'))}
          >
            <Text style={[styles.headerButtonText, { color: theme.slate }]}>
              {language.toUpperCase()}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => setIsThemeModalOpen(true)}
          >
            <Text style={[styles.headerButtonText, { color: theme.accent }]}>Theme</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content Area */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Next Upcoming Alarm Highlight Card */}
        <View style={[styles.upcomingCard, { backgroundColor: theme.accent }]}>
          <View style={styles.upcomingHeader}>
            <Text style={styles.upcomingBadge}>Next Alarm</Text>
            <Text style={styles.upcomingRelative}>Ring in 7h 45m</Text>
          </View>
          <Text style={styles.upcomingTime}>06:30 <Text style={styles.upcomingAmPm}>AM</Text></Text>
          <Text style={styles.upcomingLabel}>Morning Fajr & Gentle Awakening</Text>

          <TouchableOpacity style={styles.testAlarmButton} onPress={handleTestAlarm}>
            <Text style={styles.testAlarmButtonText}>Test Mom's Voice</Text>
          </TouchableOpacity>
        </View>

        {/* Section Heading */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Maternal Alarms</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.muted }]}>
            {alarms.filter((a) => a.enabled).length} active
          </Text>
        </View>

        {/* Alarms List */}
        {alarms.map((alarm) => (
          <View
            key={alarm.id}
            style={[styles.alarmCard, { backgroundColor: theme.card, borderColor: theme.border }]}
          >
            <View style={styles.alarmInfo}>
              <Text style={styles.alarmTime}>{alarm.time}</Text>
              <Text style={[styles.alarmLabel, { color: theme.slate }]}>{alarm.label}</Text>
              <Text style={[styles.alarmRepeat, { color: theme.muted }]}>{alarm.repeat}</Text>
            </View>

            <Switch
              value={alarm.enabled}
              onValueChange={() => toggleAlarm(alarm.id)}
              trackColor={{ false: theme.border, true: theme.accent }}
              thumbColor="#FFFFFF"
            />
          </View>
        ))}

      </ScrollView>

      {/* Bottom Navigation */}
      <View style={[styles.bottomNav, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
        <TouchableOpacity
          style={[styles.navTab, activeTab === 'alarms' && { backgroundColor: theme.accent }]}
          onPress={() => setActiveTab('alarms')}
        >
          <Text style={styles.navTabText}>Alarms</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navTab, activeTab === 'clock' && { backgroundColor: theme.accent }]}
          onPress={() => setActiveTab('clock')}
        >
          <Text style={styles.navTabText}>Clock</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navTab, activeTab === 'timer' && { backgroundColor: theme.accent }]}
          onPress={() => setActiveTab('timer')}
        >
          <Text style={styles.navTabText}>Timer</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navTab, activeTab === 'bedtimes' && { backgroundColor: theme.accent }]}
          onPress={() => setActiveTab('bedtimes')}
        >
          <Text style={styles.navTabText}>Bedtimes</Text>
        </TouchableOpacity>
      </View>

      {/* Theme Modal */}
      <Modal visible={isThemeModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setIsThemeModalOpen(false)}>
                <Text style={[styles.modalBackText, { color: theme.slate }]}>← Back</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Theme & Colors</Text>
              <TouchableOpacity onPress={() => setIsThemeModalOpen(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSectionLabel, { color: theme.muted }]}>
              Gentle Morning Atmospheres
            </Text>

            {Object.keys(THEMES).map((key) => {
              const th = THEMES[key as ThemeKey];
              const isSelected = currentThemeKey === key;
              return (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.themeItemCard,
                    {
                      backgroundColor: theme.bg,
                      borderColor: isSelected ? th.accent : theme.border,
                      borderWidth: isSelected ? 2 : 1,
                    },
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setCurrentThemeKey(key as ThemeKey);
                  }}
                >
                  <View style={styles.themeItemHeader}>
                    <Text style={styles.themeItemName}>{th.name}</Text>
                    <View style={[styles.themeColorDot, { backgroundColor: th.accent }]} />
                  </View>
                  <Text style={[styles.themeItemTagline, { color: theme.muted }]}>
                    {th.tagline}
                  </Text>
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity
              style={[styles.doneButton, { backgroundColor: theme.accent }]}
              onPress={() => setIsThemeModalOpen(false)}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Active Alarm / Test Alarm Ringing Modal */}
      <Modal visible={isTestAlarmOpen} transparent animationType="fade">
        <View style={[styles.testModalContainer, { backgroundColor: theme.bg }]}>
          {/* Back Button */}
          <TouchableOpacity style={styles.testModalBack} onPress={handleDismissTestAlarm}>
            <Text style={[styles.testModalBackText, { color: theme.slate }]}>← Back</Text>
          </TouchableOpacity>

          <View style={styles.testModalCenter}>
            <View style={[styles.testModalSun, { borderColor: theme.accent }]}>
              <Text style={[styles.testModalSunIcon, { color: theme.accent }]}>☀️</Text>
            </View>

            <Text style={[styles.testModalLabel, { color: theme.accent }]}>Gentle Awakening</Text>
            <Text style={styles.testModalTime}>06:30 <Text style={styles.testModalAmPm}>AM</Text></Text>

            <View style={[styles.testModalSpeechCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.testModalSpeakingBadge, { color: theme.accent }]}>♥ Mom is speaking...</Text>
              <Text style={styles.testModalQuote}>
                {language === 'ur'
                  ? 'صبح بخیر میرے پیارے بیٹا! اٹھ جاؤ، ماں آپ کے لیے ہمیشہ دعا گو ہے۔'
                  : 'Good morning my child! Mom is waking you with peace and love.'}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.dismissAwakeButton, { backgroundColor: theme.accent }]}
              onPress={handleDismissTestAlarm}
            >
              <Text style={styles.dismissAwakeText}>I'm awake Mom! Good morning ☀️</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoHeart: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  headerButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 100,
    gap: 14,
  },
  upcomingCard: {
    padding: 20,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  upcomingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  upcomingBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  upcomingRelative: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  upcomingTime: {
    fontSize: 44,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  upcomingAmPm: {
    fontSize: 20,
    fontWeight: '500',
  },
  upcomingLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
    fontWeight: '500',
  },
  testAlarmButton: {
    marginTop: 14,
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: 'center',
  },
  testAlarmButtonText: {
    color: '#000001',
    fontWeight: '700',
    fontSize: 13,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sectionSubtitle: {
    fontSize: 12,
  },
  alarmCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
  },
  alarmInfo: {
    gap: 2,
  },
  alarmTime: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  alarmLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  alarmRepeat: {
    fontSize: 11,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
  },
  navTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
  },
  navTabText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    borderWidth: 1,
    maxHeight: '80%',
    gap: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  modalBackText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalCloseText: {
    fontSize: 16,
    color: '#646366',
  },
  modalSectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  themeItemCard: {
    padding: 12,
    borderRadius: 14,
    gap: 4,
  },
  themeItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  themeItemName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  themeColorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  themeItemTagline: {
    fontSize: 11,
  },
  doneButton: {
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  testModalContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  testModalBack: {
    position: 'absolute',
    top: 50,
    left: 24,
    zIndex: 10,
  },
  testModalBackText: {
    fontSize: 15,
    fontWeight: '600',
  },
  testModalCenter: {
    alignItems: 'center',
    gap: 16,
  },
  testModalSun: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#141415',
  },
  testModalSunIcon: {
    fontSize: 42,
  },
  testModalLabel: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  testModalTime: {
    fontSize: 64,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  testModalAmPm: {
    fontSize: 24,
    fontWeight: '400',
    color: '#646366',
  },
  testModalSpeechCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    width: '100%',
    alignItems: 'center',
    gap: 8,
  },
  testModalSpeakingBadge: {
    fontSize: 12,
    fontWeight: '700',
  },
  testModalQuote: {
    fontSize: 15,
    color: '#FFFFFF',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 22,
  },
  dismissAwakeButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 22,
    alignItems: 'center',
    marginTop: 10,
  },
  dismissAwakeText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
});
