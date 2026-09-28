# Mimi - Maternal Alarm (Expo / React Native Edition)

This directory contains the complete **Expo (React Native)** implementation of the Mimi Maternal Alarm App.

## Features
- **Expo Speech (`expo-speech`)**: Native text-to-speech engine speaking gentle maternal wake-up messages in Urdu, English, Hindi, and Arabic.
- **Expo Haptics (`expo-haptics`)**: Tactile feedback on alarm triggers, toggles, and theme selections.
- **AsyncStorage (`@react-native-async-storage/async-storage`)**: Offline-first storage for user settings, customized alarms, and voice preferences.
- **Onyx Studio & Gentle Pastel Themes**: Full support for Onyx Studio Dark, Rosewater Blush, Morning Lavender, Sage Blossom, and Honey Peach.
- **Active Test Alarm Screen**: Includes the dedicated top Back button, maternal sun aura, and dismissal flow.

---

## Quick Start (How to Run on iOS / Android)

### 1. Requirements
Ensure you have [Node.js](https://nodejs.org/) installed on your computer.

### 2. Install Dependencies
In your terminal, navigate to this `expo-project` folder:
```bash
cd expo-project
npm install
```

### 3. Launch Expo
```bash
npx expo start
```

### 4. Open on your Phone
1. Install **Expo Go** from the [Apple App Store](https://apps.apple.com/app/expo-go/id982107779) (iOS) or [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent) (Android).
2. Scan the QR code displayed in your terminal using the Camera app (iOS) or the Expo Go app (Android).
3. The app will open immediately on your physical phone!

---

## Building Native APK (Android) or IPA (iOS)
To create standalone distribution builds with EAS (Expo Application Services):
```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview
```
