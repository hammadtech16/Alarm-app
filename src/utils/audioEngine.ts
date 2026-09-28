import { ChimeSoundId } from '../types';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Chime notes frequencies
const PENTATONIC_CHIMES = [523.25, 659.25, 783.99, 880.0, 1046.5]; // C5, E5, G5, A5, C6
const HARP_NOTES = [349.23, 440.0, 523.25, 659.25, 783.99, 1046.5]; // F4, A4, C5, E5, G5, C6

// Play a synthesized single bell/chime strike
export function playChimeNote(frequency: number, duration: number = 3.5, gainMultiplier: number = 0.25): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Warm bell sound: sine with subtle second harmonic
    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, now);

    // Filter to warm up the tone
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(frequency * 3, now);

    // Envelope: soft attack, long natural bell decay
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(gainMultiplier, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.1);
  } catch (err) {
    console.warn('Audio playback error', err);
  }
}

// Tibetan singing bowl hum with beating overtones
export function playTibetanBowl(duration: number = 5, gainMultiplier: number = 0.3): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const fundamental = 216; // A3 harmonic
    const overtone = 432;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(fundamental, now);
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(overtone + 1.5, now); // slight beat frequency

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(gainMultiplier, now + 0.6);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration);
    osc2.stop(now + duration);
  } catch (e) {
    console.warn('Tibetan bowl error', e);
  }
}

// Forest birds chirping tone
export function playBirdChirp(gainMultiplier: number = 0.2): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(2400, now);
    osc.frequency.exponentialRampToValueAtTime(3200, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(2600, now + 0.18);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(gainMultiplier, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  } catch (e) {
    console.warn('Bird chirp error', e);
  }
}

// Play selected chime preset sequence
export function playChimePattern(type: ChimeSoundId, volume = 0.3): void {
  try {
    if (type === 'morning_chimes') {
      PENTATONIC_CHIMES.forEach((freq, idx) => {
        setTimeout(() => playChimeNote(freq, 3.0, volume), idx * 450);
      });
    } else if (type === 'tibetan_bowl') {
      playTibetanBowl(4.5, volume);
    } else if (type === 'forest_birds') {
      playBirdChirp(volume);
      setTimeout(() => playBirdChirp(volume * 0.9), 160);
      setTimeout(() => playBirdChirp(volume * 0.8), 350);
      setTimeout(() => playChimeNote(783.99, 2.5, volume * 0.7), 600);
    } else if (type === 'harp_sunrise') {
      HARP_NOTES.forEach((freq, idx) => {
        setTimeout(() => playChimeNote(freq, 2.8, volume * 0.8), idx * 220);
      });
    }
  } catch (e) {
    console.warn('Chime pattern error', e);
  }
}

// Mother's Voice Text-to-Speech Engine
export function getMaternalVoice(lang: string = 'ur'): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;

  const targetLang = lang.toLowerCase();

  // If Urdu requested:
  if (targetLang === 'ur' || targetLang.startsWith('ur')) {
    // Look specifically for Urdu voices
    const urduVoice = voices.find(
      (v) => v.lang.toLowerCase().startsWith('ur') || v.lang.toLowerCase().includes('pk')
    );
    if (urduVoice) return urduVoice;

    // Fallback to Hindi or South Asian natural female voice if direct Urdu voice not installed in OS
    const regionalVoice = voices.find(
      (v) => v.lang.toLowerCase().startsWith('hi') || v.name.toLowerCase().includes('kalpana')
    );
    if (regionalVoice) return regionalVoice;
  }

  // If specific non-English language requested:
  if (targetLang !== 'en') {
    const langMatch = voices.find(
      (v) => v.lang.toLowerCase().startsWith(targetLang)
    );
    if (langMatch) return langMatch;
  }

  // Search for soothing maternal-sounding female voices
  const preferredNames = [
    'samantha', 'karen', 'victoria', 'serena', 'moira', 'fiona', 
    'tessa', 'ava', 'allison', 'kate', 'natural', 'female'
  ];

  for (const name of preferredNames) {
    const match = voices.find(
      (v) => v.name.toLowerCase().includes(name) && v.lang.startsWith('en')
    );
    if (match) return match;
  }

  // Fallback to any voice for this language or first available voice
  const fallbackMatch = voices.find((v) => v.lang.startsWith(targetLang));
  return fallbackMatch || voices[0] || null;
}

export function speakMaternalMessage(
  text: string,
  options?: {
    pitch?: number;
    rate?: number;
    volume?: number;
    lang?: string;
    onEnd?: () => void;
    onError?: () => void;
  }
): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    options?.onEnd?.();
    return;
  }

  try {
    // Cancel any previous utterance to avoid stackup
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const lang = options?.lang || 'ur';
    const voice = getMaternalVoice(lang);
    if (voice) {
      utterance.voice = voice;
    }

    // Set speech language code
    if (lang === 'ur' || lang.startsWith('ur')) {
      utterance.lang = 'ur-PK';
    } else if (lang === 'hi') {
      utterance.lang = 'hi-IN';
    } else if (lang === 'ar') {
      utterance.lang = 'ar-SA';
    } else if (lang === 'es') {
      utterance.lang = 'es-ES';
    } else if (lang === 'tr') {
      utterance.lang = 'tr-TR';
    } else {
      utterance.lang = 'en-US';
    }

    // Maternal tuning: slightly warm pitch and calm, relaxed rate
    utterance.pitch = options?.pitch ?? 1.15;
    utterance.rate = options?.rate ?? (lang === 'ur' ? 0.82 : 0.88);
    utterance.volume = options?.volume ?? 1.0;

    utterance.onend = () => {
      options?.onEnd?.();
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis utterance error:', e);
      options?.onError?.();
    };

    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.warn('Speech synthesis error:', e);
    options?.onError?.();
  }
}

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

// Voice Note Audio Player for Base64 Data
let currentAudioElement: HTMLAudioElement | null = null;

export function playVoiceNoteAudio(
  base64Audio: string,
  onEnd?: () => void
): HTMLAudioElement | null {
  stopVoiceNoteAudio();

  if (!base64Audio) {
    onEnd?.();
    return null;
  }

  try {
    const audio = new Audio();
    audio.src = base64Audio.startsWith('data:') 
      ? base64Audio 
      : `data:audio/webm;base64,${base64Audio}`;
    
    currentAudioElement = audio;

    audio.onended = () => {
      currentAudioElement = null;
      onEnd?.();
    };

    audio.onerror = (err) => {
      console.warn('Voice note playback error:', err);
      currentAudioElement = null;
      onEnd?.();
    };

    audio.play().catch((e) => {
      console.warn('Playback play() was prevented:', e);
      onEnd?.();
    });

    return audio;
  } catch (err) {
    console.warn('Failed to play voice note audio:', err);
    onEnd?.();
    return null;
  }
}

export function stopVoiceNoteAudio(): void {
  if (currentAudioElement) {
    try {
      currentAudioElement.pause();
      currentAudioElement.currentTime = 0;
    } catch (e) {
      // ignore
    }
    currentAudioElement = null;
  }
}
