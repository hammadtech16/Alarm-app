import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Switch,
  Modal,
  StatusBar,
  Alert,
  TextInput,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
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

const TIMER_PRESETS_MIN = [1, 5, 10, 15, 30];

function formatClockTime(date: Date) {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return { time: `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`, ampm };
}

function formatClockDate(date: Date) {
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Alarm times are stored as 24h "HH:MM"; render them the way a clock face would.
function formatAlarmTime(time24: string) {
  const [h, m] = time24.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return { display: `${h12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`, ampm };
}

function formatRingIn(diffMinutes: number) {
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;
  if (hours <= 0) return `Rings in ${minutes}m`;
  return `Rings in ${hours}h ${minutes}m`;
}

// Finds the soonest enabled alarm from now, wrapping to tomorrow if every
// enabled alarm's time-of-day has already passed today.
function getNextAlarm(alarms: AlarmItem[], now: Date) {
  const enabled = alarms.filter((a) => a.enabled);
  if (enabled.length === 0) return null;

  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  let best: { alarm: AlarmItem; diffMinutes: number } | null = null;

  for (const alarm of enabled) {
    const [h, m] = alarm.time.split(':').map(Number);
    let diffMinutes = h * 60 + m - nowMinutes;
    if (diffMinutes <= 0) diffMinutes += 24 * 60;
    if (!best || diffMinutes < best.diffMinutes) {
      best = { alarm, diffMinutes };
    }
  }

  return best;
}

function getWorldClockTime(offsetHours: number, now: Date) {
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  return formatClockTime(new Date(utcMs + offsetHours * 3600000));
}

function formatUtcOffset(offsetHours: number) {
  const sign = offsetHours >= 0 ? '+' : '-';
  const abs = Math.abs(offsetHours);
  const h = Math.floor(abs);
  const m = Math.round((abs - h) * 60);
  return `UTC${sign}${h}${m ? ':' + m.toString().padStart(2, '0') : ''}`;
}

interface CityTimezone {
  city: string;
  country: string;
  offset: number;
}

// Major cities spanning every standard UTC offset, so any timezone in the
// world is reachable even though this isn't literally every city on Earth.
const WORLD_CITIES: CityTimezone[] = [
  { city: 'Baker Island', country: 'US Minor Outlying Islands', offset: -12 },
  { city: 'Pago Pago', country: 'American Samoa', offset: -11 },
  { city: 'Honolulu', country: 'USA', offset: -10 },
  { city: 'Anchorage', country: 'USA', offset: -9 },
  { city: 'Los Angeles', country: 'USA', offset: -8 },
  { city: 'San Francisco', country: 'USA', offset: -8 },
  { city: 'Vancouver', country: 'Canada', offset: -8 },
  { city: 'Tijuana', country: 'Mexico', offset: -8 },
  { city: 'Denver', country: 'USA', offset: -7 },
  { city: 'Phoenix', country: 'USA', offset: -7 },
  { city: 'Calgary', country: 'Canada', offset: -7 },
  { city: 'Chicago', country: 'USA', offset: -6 },
  { city: 'Mexico City', country: 'Mexico', offset: -6 },
  { city: 'Guatemala City', country: 'Guatemala', offset: -6 },
  { city: 'Winnipeg', country: 'Canada', offset: -6 },
  { city: 'New York', country: 'USA', offset: -5 },
  { city: 'Washington DC', country: 'USA', offset: -5 },
  { city: 'Toronto', country: 'Canada', offset: -5 },
  { city: 'Bogotá', country: 'Colombia', offset: -5 },
  { city: 'Lima', country: 'Peru', offset: -5 },
  { city: 'Havana', country: 'Cuba', offset: -5 },
  { city: 'Quito', country: 'Ecuador', offset: -5 },
  { city: 'Santiago', country: 'Chile', offset: -4 },
  { city: 'Caracas', country: 'Venezuela', offset: -4 },
  { city: 'Halifax', country: 'Canada', offset: -4 },
  { city: 'La Paz', country: 'Bolivia', offset: -4 },
  { city: 'Santo Domingo', country: 'Dominican Republic', offset: -4 },
  { city: "St. John's", country: 'Canada', offset: -3.5 },
  { city: 'São Paulo', country: 'Brazil', offset: -3 },
  { city: 'Rio de Janeiro', country: 'Brazil', offset: -3 },
  { city: 'Buenos Aires', country: 'Argentina', offset: -3 },
  { city: 'Montevideo', country: 'Uruguay', offset: -3 },
  { city: 'South Georgia', country: 'South Georgia', offset: -2 },
  { city: 'Praia', country: 'Cape Verde', offset: -1 },
  { city: 'Azores', country: 'Portugal', offset: -1 },
  { city: 'London', country: 'United Kingdom', offset: 0 },
  { city: 'Lisbon', country: 'Portugal', offset: 0 },
  { city: 'Dublin', country: 'Ireland', offset: 0 },
  { city: 'Accra', country: 'Ghana', offset: 0 },
  { city: 'Reykjavik', country: 'Iceland', offset: 0 },
  { city: 'Casablanca', country: 'Morocco', offset: 0 },
  { city: 'Dakar', country: 'Senegal', offset: 0 },
  { city: 'Paris', country: 'France', offset: 1 },
  { city: 'Berlin', country: 'Germany', offset: 1 },
  { city: 'Madrid', country: 'Spain', offset: 1 },
  { city: 'Rome', country: 'Italy', offset: 1 },
  { city: 'Amsterdam', country: 'Netherlands', offset: 1 },
  { city: 'Lagos', country: 'Nigeria', offset: 1 },
  { city: 'Algiers', country: 'Algeria', offset: 1 },
  { city: 'Brussels', country: 'Belgium', offset: 1 },
  { city: 'Vienna', country: 'Austria', offset: 1 },
  { city: 'Warsaw', country: 'Poland', offset: 1 },
  { city: 'Zurich', country: 'Switzerland', offset: 1 },
  { city: 'Stockholm', country: 'Sweden', offset: 1 },
  { city: 'Cairo', country: 'Egypt', offset: 2 },
  { city: 'Athens', country: 'Greece', offset: 2 },
  { city: 'Helsinki', country: 'Finland', offset: 2 },
  { city: 'Johannesburg', country: 'South Africa', offset: 2 },
  { city: 'Cape Town', country: 'South Africa', offset: 2 },
  { city: 'Jerusalem', country: 'Israel', offset: 2 },
  { city: 'Bucharest', country: 'Romania', offset: 2 },
  { city: 'Kyiv', country: 'Ukraine', offset: 2 },
  { city: 'Tripoli', country: 'Libya', offset: 2 },
  { city: 'Moscow', country: 'Russia', offset: 3 },
  { city: 'Istanbul', country: 'Turkey', offset: 3 },
  { city: 'Riyadh', country: 'Saudi Arabia', offset: 3 },
  { city: 'Jeddah', country: 'Saudi Arabia', offset: 3 },
  { city: 'Nairobi', country: 'Kenya', offset: 3 },
  { city: 'Baghdad', country: 'Iraq', offset: 3 },
  { city: 'Doha', country: 'Qatar', offset: 3 },
  { city: 'Kuwait City', country: 'Kuwait', offset: 3 },
  { city: 'Addis Ababa', country: 'Ethiopia', offset: 3 },
  { city: 'Tehran', country: 'Iran', offset: 3.5 },
  { city: 'Dubai', country: 'UAE', offset: 4 },
  { city: 'Abu Dhabi', country: 'UAE', offset: 4 },
  { city: 'Baku', country: 'Azerbaijan', offset: 4 },
  { city: 'Tbilisi', country: 'Georgia', offset: 4 },
  { city: 'Muscat', country: 'Oman', offset: 4 },
  { city: 'Kabul', country: 'Afghanistan', offset: 4.5 },
  { city: 'Karachi', country: 'Pakistan', offset: 5 },
  { city: 'Lahore', country: 'Pakistan', offset: 5 },
  { city: 'Islamabad', country: 'Pakistan', offset: 5 },
  { city: 'Tashkent', country: 'Uzbekistan', offset: 5 },
  { city: 'Yekaterinburg', country: 'Russia', offset: 5 },
  { city: 'New Delhi', country: 'India', offset: 5.5 },
  { city: 'Mumbai', country: 'India', offset: 5.5 },
  { city: 'Bengaluru', country: 'India', offset: 5.5 },
  { city: 'Colombo', country: 'Sri Lanka', offset: 5.5 },
  { city: 'Kathmandu', country: 'Nepal', offset: 5.75 },
  { city: 'Dhaka', country: 'Bangladesh', offset: 6 },
  { city: 'Almaty', country: 'Kazakhstan', offset: 6 },
  { city: 'Thimphu', country: 'Bhutan', offset: 6 },
  { city: 'Yangon', country: 'Myanmar', offset: 6.5 },
  { city: 'Bangkok', country: 'Thailand', offset: 7 },
  { city: 'Jakarta', country: 'Indonesia', offset: 7 },
  { city: 'Hanoi', country: 'Vietnam', offset: 7 },
  { city: 'Ho Chi Minh City', country: 'Vietnam', offset: 7 },
  { city: 'Phnom Penh', country: 'Cambodia', offset: 7 },
  { city: 'Singapore', country: 'Singapore', offset: 8 },
  { city: 'Kuala Lumpur', country: 'Malaysia', offset: 8 },
  { city: 'Beijing', country: 'China', offset: 8 },
  { city: 'Shanghai', country: 'China', offset: 8 },
  { city: 'Hong Kong', country: 'Hong Kong', offset: 8 },
  { city: 'Taipei', country: 'Taiwan', offset: 8 },
  { city: 'Manila', country: 'Philippines', offset: 8 },
  { city: 'Perth', country: 'Australia', offset: 8 },
  { city: 'Pyongyang', country: 'North Korea', offset: 9 },
  { city: 'Seoul', country: 'South Korea', offset: 9 },
  { city: 'Tokyo', country: 'Japan', offset: 9 },
  { city: 'Osaka', country: 'Japan', offset: 9 },
  { city: 'Darwin', country: 'Australia', offset: 9.5 },
  { city: 'Adelaide', country: 'Australia', offset: 9.5 },
  { city: 'Brisbane', country: 'Australia', offset: 10 },
  { city: 'Sydney', country: 'Australia', offset: 10 },
  { city: 'Melbourne', country: 'Australia', offset: 10 },
  { city: 'Canberra', country: 'Australia', offset: 10 },
  { city: 'Guam', country: 'Guam', offset: 10 },
  { city: 'Port Moresby', country: 'Papua New Guinea', offset: 10 },
  { city: 'Honiara', country: 'Solomon Islands', offset: 11 },
  { city: 'Nouméa', country: 'New Caledonia', offset: 11 },
  { city: 'Auckland', country: 'New Zealand', offset: 12 },
  { city: 'Wellington', country: 'New Zealand', offset: 12 },
  { city: 'Suva', country: 'Fiji', offset: 12 },
  { city: 'Chatham Islands', country: 'New Zealand', offset: 12.75 },
  { city: "Nuku'alofa", country: 'Tonga', offset: 13 },
  { city: 'Apia', country: 'Samoa', offset: 13 },
  { city: 'Kiritimati', country: 'Kiribati', offset: 14 },
];

const ADD_MODAL_TITLES = {
  alarms: 'Add Alarm',
  bedtimes: 'Add Bedtime',
  clock: 'Add World Clock',
  timer: 'Add Custom Timer',
} as const;

const FAB_CONFIG = {
  alarms: 'Add Alarm',
  clock: 'Add Clock',
  timer: 'Add Timer',
  bedtimes: 'Add Bedtime',
} as const;

interface StepperProps {
  value: number;
  onChange: (next: number) => void;
  min: number;
  max: number;
  step?: number;
  wrapAround?: boolean;
  format?: (n: number) => string;
  accentColor: string;
  borderColor: string;
  textColor: string;
}

function Stepper({ value, onChange, min, max, step = 1, wrapAround = false, format, accentColor, borderColor, textColor }: StepperProps) {
  const move = (delta: number) => {
    let next = value + delta;
    if (wrapAround) {
      const range = max - min + step;
      next = (((next - min) % range) + range) % range + min;
    } else {
      next = Math.min(max, Math.max(min, next));
    }
    onChange(next);
  };

  const display = format ? format(value) : value.toString().padStart(2, '0');

  return (
    <View style={styles.stepperControls}>
      <TouchableOpacity style={[styles.stepperButton, { borderColor }]} onPress={() => move(-step)}>
        <Ionicons name="remove" size={18} color={accentColor} />
      </TouchableOpacity>
      <Text style={[styles.stepperValue, { color: textColor }]}>{display}</Text>
      <TouchableOpacity style={[styles.stepperButton, { borderColor }]} onPress={() => move(step)}>
        <Ionicons name="add" size={18} color={accentColor} />
      </TouchableOpacity>
    </View>
  );
}

// Wraps a list row so swiping it either left or right reveals a delete
// action; tapping that action removes the row.
function SwipeableAlarmRow({ children, onDelete }: { children: React.ReactNode; onDelete: () => void }) {
  const swipeableRef = React.useRef<Swipeable>(null);

  const handleDelete = () => {
    swipeableRef.current?.close();
    onDelete();
  };

  const renderDeleteAction = () => (
    <TouchableOpacity style={styles.deleteAction} onPress={handleDelete} activeOpacity={0.85}>
      <Ionicons name="trash" size={20} color="#FFFFFF" />
    </TouchableOpacity>
  );

  return (
    <Swipeable
      ref={swipeableRef}
      renderLeftActions={renderDeleteAction}
      renderRightActions={renderDeleteAction}
      overshootLeft={false}
      overshootRight={false}
    >
      {children}
    </Swipeable>
  );
}

export default function App() {
  const [currentThemeKey, setCurrentThemeKey] = useState<ThemeKey>('onyx_minimal');
  const [activeTab, setActiveTab] = useState<'alarms' | 'clock' | 'timer' | 'bedtimes'>('alarms');
  const [alarms, setAlarms] = useState<AlarmItem[]>([]);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isTestAlarmOpen, setIsTestAlarmOpen] = useState(false);
  const [language, setLanguage] = useState<'ur' | 'en' | 'hi' | 'ar'>('ur');

  const [currentTime, setCurrentTime] = useState(new Date());
  const [timerDuration, setTimerDuration] = useState(5 * 60);
  const [timerRemaining, setTimerRemaining] = useState(5 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [bedtimes, setBedtimes] = useState<AlarmItem[]>([
    { id: 'b1', time: '21:30', label: 'Wind Down & Read', enabled: true, repeat: 'Every Day' },
    { id: 'b2', time: '22:00', label: 'Lights Out, Sweet Dreams', enabled: true, repeat: 'Every Day' },
  ]);
  const [worldClocks, setWorldClocks] = useState<{ id: string; label: string; offset: number }[]>([]);
  const [timerPresets, setTimerPresets] = useState<number[]>(TIMER_PRESETS_MIN);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCityPickerOpen, setIsCityPickerOpen] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [addForm, setAddForm] = useState({
    hour: new Date().getHours(),
    minute: new Date().getMinutes(),
    label: '',
    repeat: 'Every Day' as 'Every Day' | 'Weekdays' | 'Once',
    cityLabel: '',
    utcOffset: 0,
    customMinutes: 5,
  });

  const theme = THEMES[currentThemeKey];

  // Live clock tick for the Clock tab
  useEffect(() => {
    const id = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Timer countdown
  useEffect(() => {
    if (!isTimerRunning) return;
    if (timerRemaining <= 0) {
      setIsTimerRunning(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Speech.speak('Time is up. Take a gentle, peaceful break.', { language: 'en-US' });
      return;
    }
    const id = setTimeout(() => setTimerRemaining((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [isTimerRunning, timerRemaining]);

  const selectTimerPreset = (minutes: number) => {
    Haptics.selectionAsync();
    setIsTimerRunning(false);
    setTimerDuration(minutes * 60);
    setTimerRemaining(minutes * 60);
  };

  const toggleTimer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (timerRemaining <= 0) {
      setTimerRemaining(timerDuration);
      setIsTimerRunning(true);
      return;
    }
    setIsTimerRunning((r) => !r);
  };

  const resetTimer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsTimerRunning(false);
    setTimerRemaining(timerDuration);
  };

  const toggleBedtime = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setBedtimes((prev) =>
      prev.map((b) => (b.id === id ? { ...b, enabled: !b.enabled } : b))
    );
  };

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

  const deleteAlarm = (id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setAlarms((prev) => prev.filter((a) => a.id !== id));
  };

  const adjustAddForm = (patch: Partial<typeof addForm>) => setAddForm((prev) => ({ ...prev, ...patch }));

  const openAddModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const now = new Date();
    setAddForm({
      hour: now.getHours(),
      minute: now.getMinutes(),
      label: '',
      repeat: 'Every Day',
      cityLabel: '',
      utcOffset: 0,
      customMinutes: 5,
    });
    setIsCityPickerOpen(false);
    setCitySearch('');
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setIsCityPickerOpen(false);
    setCitySearch('');
  };

  const selectCity = (c: CityTimezone) => {
    Haptics.selectionAsync();
    adjustAddForm({ cityLabel: c.city, utcOffset: c.offset });
    setIsCityPickerOpen(false);
    setCitySearch('');
  };

  const filteredCities = citySearch.trim()
    ? WORLD_CITIES.filter((c) => {
        const q = citySearch.trim().toLowerCase();
        return c.city.toLowerCase().includes(q) || c.country.toLowerCase().includes(q);
      })
    : WORLD_CITIES;

  const handleConfirmAdd = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    if (activeTab === 'alarms' || activeTab === 'bedtimes') {
      const time = `${addForm.hour.toString().padStart(2, '0')}:${addForm.minute.toString().padStart(2, '0')}`;
      const newItem: AlarmItem = {
        id: Date.now().toString(),
        time,
        label: addForm.label.trim() || (activeTab === 'alarms' ? 'New Alarm' : 'New Bedtime'),
        enabled: true,
        repeat: addForm.repeat,
      };
      if (activeTab === 'alarms') setAlarms((prev) => [...prev, newItem]);
      else setBedtimes((prev) => [...prev, newItem]);
    } else if (activeTab === 'clock') {
      setWorldClocks((prev) => [
        ...prev,
        { id: Date.now().toString(), label: addForm.cityLabel.trim() || 'New Clock', offset: addForm.utcOffset },
      ]);
    } else if (activeTab === 'timer') {
      const minutes = Math.min(180, Math.max(1, addForm.customMinutes));
      setTimerPresets((prev) => Array.from(new Set([...prev, minutes])).sort((a, b) => a - b));
      selectTimerPreset(minutes);
    }

    closeAddModal();
  };

  const removeWorldClock = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setWorldClocks((prev) => prev.filter((c) => c.id !== id));
  };

  const nextAlarm = getNextAlarm(alarms, currentTime);

  const handleTestAlarm = () => {
    setIsTestAlarmOpen(true);
    playMaternalWakeUp();
  };

  const handleDismissTestAlarm = () => {
    Speech.stop();
    setIsTestAlarmOpen(false);
  };

  return (
    <GestureHandlerRootView style={styles.gestureRoot}>
    <SafeAreaProvider>
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
      <View style={styles.contentArea}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {activeTab === 'alarms' && (
          <>
            {/* Prominent Current Time */}
            <View style={styles.heroClock}>
              <Text style={styles.heroClockTime}>
                {formatClockTime(currentTime).time.slice(0, 5)}
              </Text>
              <Text style={[styles.heroClockMeta, { color: theme.muted }]}>
                {formatClockTime(currentTime).ampm} · {formatClockDate(currentTime)}
              </Text>
            </View>

            {/* Next Upcoming Alarm Highlight Card */}
            {nextAlarm ? (
              <View style={[styles.upcomingCard, { backgroundColor: theme.accent }]}>
                <View style={styles.upcomingHeader}>
                  <Text style={styles.upcomingBadge}>Next Alarm</Text>
                  <Switch
                    value={nextAlarm.alarm.enabled}
                    onValueChange={() => toggleAlarm(nextAlarm.alarm.id)}
                    trackColor={{ false: 'rgba(255,255,255,0.3)', true: '#FFFFFF' }}
                    thumbColor={theme.accent}
                    style={styles.upcomingSwitch}
                  />
                </View>
                <Text style={styles.upcomingTime}>
                  {formatAlarmTime(nextAlarm.alarm.time).display}{' '}
                  <Text style={styles.upcomingAmPm}>{formatAlarmTime(nextAlarm.alarm.time).ampm}</Text>
                </Text>
                <Text style={styles.upcomingLabel}>{nextAlarm.alarm.label}</Text>
                <Text style={styles.upcomingRelative}>{formatRingIn(nextAlarm.diffMinutes)}</Text>

                <TouchableOpacity style={styles.testAlarmButton} onPress={handleTestAlarm}>
                  <Text style={styles.testAlarmButtonText}>Test Mom's Voice</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={[styles.upcomingCard, styles.upcomingCardEmpty, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Ionicons name="moon-outline" size={26} color={theme.muted} />
                <Text style={[styles.upcomingEmptyText, { color: theme.slate }]}>No alarms set yet</Text>
                <Text style={[styles.upcomingEmptySubtext, { color: theme.muted }]}>
                  Tap "Add Alarm" below to create one
                </Text>
              </View>
            )}

            {/* Section Heading */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Coming Next</Text>
              <Text style={[styles.sectionSubtitle, { color: theme.muted }]}>
                {alarms.filter((a) => a.enabled).length} active
              </Text>
            </View>

            {/* Alarms List */}
            {alarms.map((alarm) => (
              <SwipeableAlarmRow key={alarm.id} onDelete={() => deleteAlarm(alarm.id)}>
                <View
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
              </SwipeableAlarmRow>
            ))}
          </>
        )}

        {activeTab === 'clock' && (
          <View style={styles.clockScreen}>
            <View style={[styles.clockCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Ionicons name="sunny-outline" size={28} color={theme.accent} />
              <Text style={[styles.clockDate, { color: theme.slate }]}>{formatClockDate(currentTime)}</Text>
              <Text style={styles.clockTime}>{formatClockTime(currentTime).time}</Text>
              <Text style={[styles.clockAmPm, { color: theme.muted }]}>{formatClockTime(currentTime).ampm}</Text>
            </View>

            {worldClocks.length > 0 && (
              <>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>World Clocks</Text>
                </View>
                {worldClocks.map((wc) => {
                  const wcTime = getWorldClockTime(wc.offset, currentTime);
                  return (
                    <View
                      key={wc.id}
                      style={[styles.alarmCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                    >
                      <View style={styles.alarmInfo}>
                        <Text style={styles.alarmTime}>{wcTime.time.slice(0, 5)}</Text>
                        <Text style={[styles.alarmLabel, { color: theme.slate }]}>{wc.label}</Text>
                        <Text style={[styles.alarmRepeat, { color: theme.muted }]}>
                          UTC{wc.offset >= 0 ? '+' : ''}{wc.offset} · {wcTime.ampm}
                        </Text>
                      </View>
                      <TouchableOpacity onPress={() => removeWorldClock(wc.id)}>
                        <Ionicons name="close-circle-outline" size={22} color={theme.muted} />
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </>
            )}

            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Upcoming Today</Text>
            </View>

            {alarms.filter((a) => a.enabled).map((alarm) => (
              <View
                key={alarm.id}
                style={[styles.alarmCard, { backgroundColor: theme.card, borderColor: theme.border }]}
              >
                <View style={styles.alarmInfo}>
                  <Text style={styles.alarmTime}>{alarm.time}</Text>
                  <Text style={[styles.alarmLabel, { color: theme.slate }]}>{alarm.label}</Text>
                </View>
                <Ionicons name="alarm-outline" size={20} color={theme.accent} />
              </View>
            ))}
          </View>
        )}

        {activeTab === 'timer' && (
          <View style={styles.timerScreen}>
            <View style={[styles.timerCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.timerLabel, { color: theme.accent }]}>
                {isTimerRunning ? 'Breathing In Progress' : 'Ready When You Are'}
              </Text>
              <Text style={styles.timerDisplay}>{formatDuration(timerRemaining)}</Text>

              <View style={styles.timerActionsRow}>
                <TouchableOpacity
                  style={[styles.timerActionButton, { backgroundColor: theme.accent }]}
                  onPress={toggleTimer}
                >
                  <Ionicons
                    name={isTimerRunning ? 'pause' : 'play'}
                    size={20}
                    color="#FFFFFF"
                  />
                  <Text style={styles.timerActionText}>
                    {isTimerRunning ? 'Pause' : timerRemaining <= 0 ? 'Restart' : 'Start'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.timerActionButton, styles.timerResetButton, { borderColor: theme.border }]}
                  onPress={resetTimer}
                >
                  <Ionicons name="refresh" size={20} color={theme.slate} />
                  <Text style={[styles.timerActionText, { color: theme.slate }]}>Reset</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Quick Durations</Text>
            </View>

            <View style={styles.timerPresetsRow}>
              {timerPresets.map((minutes) => {
                const isSelected = timerDuration === minutes * 60;
                return (
                  <TouchableOpacity
                    key={minutes}
                    style={[
                      styles.timerPresetChip,
                      {
                        backgroundColor: isSelected ? theme.accent : theme.card,
                        borderColor: isSelected ? theme.accent : theme.border,
                      },
                    ]}
                    onPress={() => selectTimerPreset(minutes)}
                  >
                    <Text style={[styles.timerPresetText, { color: isSelected ? '#FFFFFF' : theme.slate }]}>
                      {minutes} min
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {activeTab === 'bedtimes' && (
          <>
            <View style={[styles.upcomingCard, { backgroundColor: theme.accent }]}>
              <View style={styles.upcomingHeader}>
                <Text style={styles.upcomingBadge}>Bedtime Reminder</Text>
              </View>
              <Ionicons name="moon" size={28} color="#FFFFFF" style={{ marginTop: 4 }} />
              <Text style={styles.upcomingLabel}>A calm wind-down helps everyone sleep better.</Text>
            </View>

            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Bedtime Reminders</Text>
              <Text style={[styles.sectionSubtitle, { color: theme.muted }]}>
                {bedtimes.filter((b) => b.enabled).length} active
              </Text>
            </View>

            {bedtimes.map((bedtime) => (
              <View
                key={bedtime.id}
                style={[styles.alarmCard, { backgroundColor: theme.card, borderColor: theme.border }]}
              >
                <View style={styles.alarmInfo}>
                  <Text style={styles.alarmTime}>{bedtime.time}</Text>
                  <Text style={[styles.alarmLabel, { color: theme.slate }]}>{bedtime.label}</Text>
                  <Text style={[styles.alarmRepeat, { color: theme.muted }]}>{bedtime.repeat}</Text>
                </View>

                <Switch
                  value={bedtime.enabled}
                  onValueChange={() => toggleBedtime(bedtime.id)}
                  trackColor={{ false: theme.border, true: theme.accent }}
                  thumbColor="#FFFFFF"
                />
              </View>
            ))}
          </>
        )}

      </ScrollView>

        <TouchableOpacity
          style={[styles.fab, { backgroundColor: theme.accent }]}
          onPress={openAddModal}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.fabText}>{FAB_CONFIG[activeTab]}</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation */}
      <View style={[styles.bottomNav, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
        {(
          [
            { key: 'alarms', label: 'Alarms', icon: 'alarm' },
            { key: 'clock', label: 'Clock', icon: 'time' },
            { key: 'timer', label: 'Timer', icon: 'hourglass' },
            { key: 'bedtimes', label: 'Bedtimes', icon: 'moon' },
          ] as const
        ).map((tab) => {
          const isActive = activeTab === tab.key;
          const tintColor = isActive ? theme.accent : theme.muted;
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.navTab}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isActive ? tab.icon : (`${tab.icon}-outline` as const)}
                size={22}
                color={tintColor}
              />
              <Text style={[styles.navTabText, { color: tintColor }]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Theme Modal */}
      <Modal visible={isThemeModalOpen} transparent animationType="slide">
        <TouchableWithoutFeedback onPress={() => setIsThemeModalOpen(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
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
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Add Item Modal (Alarm / Bedtime / World Clock / Custom Timer) */}
      <Modal visible={isAddModalOpen} transparent animationType="slide">
        <TouchableWithoutFeedback onPress={closeAddModal}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity
                    onPress={() => {
                      if (isCityPickerOpen) {
                        setIsCityPickerOpen(false);
                        setCitySearch('');
                      } else {
                        closeAddModal();
                      }
                    }}
                  >
                    <Text style={[styles.modalBackText, { color: theme.slate }]}>← Back</Text>
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>
                    {activeTab === 'clock' && isCityPickerOpen ? 'Select City' : ADD_MODAL_TITLES[activeTab]}
                  </Text>
                  <TouchableOpacity onPress={closeAddModal}>
                    <Text style={styles.modalCloseText}>✕</Text>
                  </TouchableOpacity>
                </View>

                {(activeTab === 'alarms' || activeTab === 'bedtimes') && (
                  <>
                    <Text style={styles.timePreviewText}>
                      {addForm.hour.toString().padStart(2, '0')}:{addForm.minute.toString().padStart(2, '0')}
                    </Text>

                    <View style={styles.stepperRow}>
                      <Text style={[styles.stepperLabel, { color: theme.slate }]}>Hour</Text>
                      <Stepper
                        value={addForm.hour}
                        onChange={(h) => adjustAddForm({ hour: h })}
                        min={0}
                        max={23}
                        wrapAround
                        accentColor={theme.accent}
                        borderColor={theme.border}
                        textColor={theme.text}
                      />
                    </View>

                    <View style={styles.stepperRow}>
                      <Text style={[styles.stepperLabel, { color: theme.slate }]}>Minute</Text>
                      <Stepper
                        value={addForm.minute}
                        onChange={(m) => adjustAddForm({ minute: m })}
                        min={0}
                        max={59}
                        step={5}
                        wrapAround
                        accentColor={theme.accent}
                        borderColor={theme.border}
                        textColor={theme.text}
                      />
                    </View>

                    <TextInput
                      style={[styles.textInput, { backgroundColor: theme.bg, borderColor: theme.border, color: theme.text }]}
                      placeholder="Label (e.g. Morning Walk)"
                      placeholderTextColor={theme.muted}
                      value={addForm.label}
                      onChangeText={(t) => adjustAddForm({ label: t })}
                    />

                    <View style={styles.chipsRow}>
                      {(['Every Day', 'Weekdays', 'Once'] as const).map((r) => {
                        const isSelected = addForm.repeat === r;
                        return (
                          <TouchableOpacity
                            key={r}
                            style={[
                              styles.chip,
                              { backgroundColor: isSelected ? theme.accent : theme.bg, borderColor: isSelected ? theme.accent : theme.border },
                            ]}
                            onPress={() => adjustAddForm({ repeat: r })}
                          >
                            <Text style={[styles.chipText, { color: isSelected ? '#FFFFFF' : theme.slate }]}>{r}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </>
                )}

                {activeTab === 'clock' && (
                  isCityPickerOpen ? (
                    <>
                      <View style={[styles.citySearchRow, { backgroundColor: theme.bg, borderColor: theme.border }]}>
                        <Ionicons name="search" size={16} color={theme.muted} />
                        <TextInput
                          style={[styles.citySearchInput, { color: theme.text }]}
                          placeholder="Search city or country"
                          placeholderTextColor={theme.muted}
                          value={citySearch}
                          onChangeText={setCitySearch}
                          autoFocus
                        />
                      </View>

                      <ScrollView style={styles.cityListScroll} keyboardShouldPersistTaps="handled">
                        {filteredCities.map((c) => (
                          <TouchableOpacity
                            key={c.city}
                            style={[styles.cityListRow, { borderBottomColor: theme.border }]}
                            onPress={() => selectCity(c)}
                          >
                            <View>
                              <Text style={[styles.cityListName, { color: theme.text }]}>{c.city}</Text>
                              <Text style={[styles.cityListCountry, { color: theme.muted }]}>{c.country}</Text>
                            </View>
                            <Text style={[styles.cityListOffset, { color: theme.accent }]}>{formatUtcOffset(c.offset)}</Text>
                          </TouchableOpacity>
                        ))}
                        {filteredCities.length === 0 && (
                          <Text style={[styles.cityListEmpty, { color: theme.muted }]}>
                            No cities match "{citySearch}"
                          </Text>
                        )}
                      </ScrollView>
                    </>
                  ) : (
                    <>
                      <TouchableOpacity
                        style={[styles.dropdownField, { backgroundColor: theme.bg, borderColor: theme.border }]}
                        onPress={() => setIsCityPickerOpen(true)}
                      >
                        <Text style={[styles.dropdownFieldText, { color: addForm.cityLabel ? theme.text : theme.muted }]}>
                          {addForm.cityLabel || 'Select a city'}
                        </Text>
                        <Ionicons name="chevron-down" size={18} color={theme.muted} />
                      </TouchableOpacity>

                      <View style={styles.stepperRow}>
                        <Text style={[styles.stepperLabel, { color: theme.slate }]}>UTC Offset</Text>
                        <Stepper
                          value={addForm.utcOffset}
                          onChange={(o) => adjustAddForm({ utcOffset: o })}
                          min={-12}
                          max={14}
                          step={0.5}
                          wrapAround
                          format={formatUtcOffset}
                          accentColor={theme.accent}
                          borderColor={theme.border}
                          textColor={theme.text}
                        />
                      </View>
                    </>
                  )
                )}

                {activeTab === 'timer' && (
                  <View style={styles.stepperRow}>
                    <Text style={[styles.stepperLabel, { color: theme.slate }]}>Duration</Text>
                    <Stepper
                      value={addForm.customMinutes}
                      onChange={(m) => adjustAddForm({ customMinutes: Math.min(180, Math.max(1, m)) })}
                      min={1}
                      max={180}
                      format={(n) => `${n} min`}
                      accentColor={theme.accent}
                      borderColor={theme.border}
                      textColor={theme.text}
                    />
                  </View>
                )}

                {!(activeTab === 'clock' && isCityPickerOpen) && (
                  <TouchableOpacity style={[styles.doneButton, { backgroundColor: theme.accent }]} onPress={handleConfirmAdd}>
                    <Text style={styles.doneButtonText}>{ADD_MODAL_TITLES[activeTab]}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
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
    </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  gestureRoot: {
    flex: 1,
  },
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
  contentArea: {
    flex: 1,
    position: 'relative',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 24,
    gap: 14,
  },
  fab: {
    position: 'absolute',
    right: 18,
    bottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  fabText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
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
    alignItems: 'center',
    marginBottom: 8,
  },
  upcomingBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  upcomingSwitch: {
    transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }],
  },
  upcomingRelative: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    marginTop: 6,
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
  upcomingCardEmpty: {
    alignItems: 'center',
    borderWidth: 1,
    gap: 4,
  },
  upcomingEmptyText: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 6,
  },
  upcomingEmptySubtext: {
    fontSize: 12,
    fontWeight: '500',
  },
  heroClock: {
    alignItems: 'center',
    marginBottom: 4,
    paddingVertical: 8,
  },
  heroClockTime: {
    fontSize: 56,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1.5,
  },
  heroClockMeta: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
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
  deleteAction: {
    flex: 1,
    width: 76,
    borderRadius: 18,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clockScreen: {
    gap: 14,
  },
  clockCard: {
    alignItems: 'center',
    padding: 28,
    borderRadius: 24,
    borderWidth: 1,
    gap: 6,
  },
  clockDate: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  clockTime: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
    marginTop: 6,
  },
  clockAmPm: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  timerScreen: {
    gap: 14,
  },
  timerCard: {
    alignItems: 'center',
    padding: 28,
    borderRadius: 24,
    borderWidth: 1,
    gap: 8,
  },
  timerLabel: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  timerDisplay: {
    fontSize: 56,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  timerActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  timerActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
  },
  timerResetButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  timerActionText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  timerPresetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  timerPresetChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  timerPresetText: {
    fontSize: 13,
    fontWeight: '600',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 8,
    borderTopWidth: 1,
  },
  navTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 6,
  },
  navTabText: {
    fontSize: 11,
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
    padding: 22,
    paddingBottom: 28,
    borderWidth: 1,
    maxHeight: '80%',
    gap: 18,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
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
  timePreviewText: {
    fontSize: 40,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -1,
  },
  stepperRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepperLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  stepperControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  stepperButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    fontSize: 16,
    fontWeight: '700',
    minWidth: 64,
    textAlign: 'center',
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dropdownField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  dropdownFieldText: {
    fontSize: 14,
    fontWeight: '600',
  },
  citySearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  citySearchInput: {
    flex: 1,
    fontSize: 14,
  },
  cityListScroll: {
    maxHeight: 320,
  },
  cityListRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  cityListName: {
    fontSize: 14,
    fontWeight: '700',
  },
  cityListCountry: {
    fontSize: 11,
    marginTop: 2,
  },
  cityListOffset: {
    fontSize: 12,
    fontWeight: '700',
  },
  cityListEmpty: {
    textAlign: 'center',
    fontSize: 13,
    paddingVertical: 20,
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
    marginTop: 2,
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
