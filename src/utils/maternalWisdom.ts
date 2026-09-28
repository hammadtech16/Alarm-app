import { MaternalTone } from '../types';
import { getLanguageConfig } from './languages';

export interface DailyMaternalMessage {
  id: string;
  headline: string;
  spokenGreeting: string;
  affirmation: string;
  maternalTip: string;
  author: string;
}

const MATERNAL_LIBRARY: Record<MaternalTone, Array<{ headline: string; spoken: string; affirmation: string; tip: string }>> = {
  gentle: [
    {
      headline: 'A Peaceful Morning Awakening',
      spoken: 'Good morning, sweet {nickname}. Open your eyes softly. There is no rush at all today. Take a gentle, deep breath in and let your shoulders relax. I love you so much.',
      affirmation: 'I am safe, unhurried, and worthy of a gentle day.',
      tip: 'Before stepping out of bed, wiggle your toes and take three slow, calming breaths.',
    },
    {
      headline: 'The Morning Sun Is Whispering',
      spoken: 'Wake up gently, my darling {nickname}. The sun is rising just for you. Whatever happened yesterday is already in the past. Today is a fresh, quiet blessing.',
      affirmation: 'Today offers me a fresh beginning filled with quiet grace.',
      tip: 'Drink a warm glass of water to welcome your body to the morning.',
    },
    {
      headline: 'Rest Your Heart, Greet the Dawn',
      spoken: 'Good morning my sweet {name}. Feel how cozy and warm this moment is. You are so precious to me, and you have all the time you need to begin.',
      affirmation: 'I begin this morning with patience and tender self-kindness.',
      tip: 'Roll your shoulders backward twice and smile into the morning air.',
    },
  ],
  warm: [
    {
      headline: 'A Mother’s Heart Holds You',
      spoken: 'Good morning sunshine! It’s time to start another wonderful day, {nickname}. I believe in you with all my heart. Don’t forget how capable and loved you are.',
      affirmation: 'I carry warm confidence and love wherever I walk today.',
      tip: 'Give yourself a gentle embrace and remember someone is always proud of you.',
    },
    {
      headline: 'Step Into the Day With Courage',
      spoken: 'Rise and shine, sweet {name}! Take today one kind step at a time. If you feel tired or anxious, remember your mom’s warm hug is always right beside you.',
      affirmation: 'I am resilient, brave, and surrounded by quiet strength.',
      tip: 'Open a window for one minute to breathe in fresh morning air.',
    },
    {
      headline: 'You Are Doing Wonderfully',
      spoken: 'Good morning my dear {nickname}! Wake up with a peaceful smile. You don’t need to prove anything to anyone—just be your wonderful, kind self.',
      affirmation: 'My value is inherent and my heart is bright.',
      tip: 'Enjoy a warm cup of your favorite tea or coffee without looking at any screens.',
    },
  ],
  cozy: [
    {
      headline: 'Snuggle Out of Slumber',
      spoken: 'Wake up slowly, honey {nickname}. Stretch your arms up to the sky like a little seedling. You slept so well, and today has warm little moments waiting for you.',
      affirmation: 'I welcome today with comfort, curiosity, and calm ease.',
      tip: 'Stretch your spine and take a moment to look at the sky.',
    },
    {
      headline: 'Cozy Morning Blanket',
      spoken: 'Morning, my sweet child. Even though the bed is soft, the day outside has so much warmth for you. Take your time, wash your face with cool water, and smile.',
      affirmation: 'I move through this day at my own peaceful rhythm.',
      tip: 'Wash your face with gentle cool water to brighten your senses.',
    },
  ],
  cheerful: [
    {
      headline: 'Hello, Beautiful Morning Sunshine!',
      spoken: 'Rise and shine, champ! Today is going to be so great, {nickname}! The world is waiting for your smile, and I am so grateful you are in this world.',
      affirmation: 'I radiate joyful energy and open my heart to unexpected blessings.',
      tip: 'Put on a bright tune or humming melody as you get ready.',
    },
    {
      headline: 'A Brand New Adventure',
      spoken: 'Good morning, sweet {name}! Today is a brand new page. Whatever you touch today, do it with love. Mom is cheering for you from the bottom of her heart!',
      affirmation: 'I have the enthusiasm and kindness to make today special.',
      tip: 'Send a quick loving thought or text to someone you care about today.',
    },
  ],
  grounding: [
    {
      headline: 'Rooted in Stillness',
      spoken: 'Good morning, {nickname}. Let the ground support you as you wake. You don’t have to solve everything today. Just focus on this one breath, this one morning.',
      affirmation: 'I am grounded, centered, and safe in this present moment.',
      tip: 'Place both feet flat on the floor for 10 seconds before standing up.',
    },
    {
      headline: 'Peace in Every Step',
      spoken: 'Wake up peacefully, my dear {name}. Leave hurry at the door. You are strong enough for whatever comes, and gentle enough to be kind to yourself.',
      affirmation: 'I protect my inner peace and honor my boundaries today.',
      tip: 'Take a deep belly breath and exhale slowly through your mouth.',
    },
  ],
};

// Generates personalized wake-up speech text
export function getMaternalWakeUpSpeech(
  name: string,
  nickname: string,
  tone: MaternalTone = 'gentle',
  customMessage?: string,
  language: string = 'ur'
): string {
  if (customMessage && customMessage.trim()) {
    return customMessage.trim();
  }

  const langConfig = getLanguageConfig(language);
  const pet = nickname || langConfig.defaultPetName;
  const person = name || pet;

  if (langConfig.maternalWisdom && langConfig.maternalWisdom.length > 0) {
    const list = langConfig.maternalWisdom;
    const picked = list[Math.floor(Math.random() * list.length)];
    return picked.spoken
      .replace(/{nickname}/g, pet)
      .replace(/{name}/g, person);
  }

  const list = MATERNAL_LIBRARY[tone] || MATERNAL_LIBRARY.gentle;
  const picked = list[Math.floor(Math.random() * list.length)];

  return picked.spoken
    .replace(/{nickname}/g, pet)
    .replace(/{name}/g, person);
}

// Snooze motherly remarks
export function getMaternalSnoozeSpeech(nickname: string, language: string = 'ur'): string {
  const langConfig = getLanguageConfig(language);
  const pet = nickname || langConfig.defaultPetName;
  const remarks = langConfig.snoozePhrases;
  if (!remarks || remarks.length === 0) {
    return `Alright ${pet}, rest your eyes for a few more minutes. Mom will be right here.`;
  }
  const picked = remarks[Math.floor(Math.random() * remarks.length)];
  return picked.replace(/{nickname}/g, pet);
}

// Dismiss motherly remarks
export function getMaternalDismissSpeech(nickname: string, language: string = 'ur'): string {
  const langConfig = getLanguageConfig(language);
  const pet = nickname || langConfig.defaultPetName;
  const remarks = langConfig.dismissPhrases;
  if (!remarks || remarks.length === 0) {
    return `Good morning, ${pet}! I am so proud of you. Have a wonderful day!`;
  }
  const picked = remarks[Math.floor(Math.random() * remarks.length)];
  return picked.replace(/{nickname}/g, pet);
}

// Fetch or generate daily mother's motivational note
export async function fetchDailyMaternalMessage(
  name: string,
  nickname: string,
  tone: MaternalTone,
  language: string = 'ur'
): Promise<DailyMaternalMessage> {
  const langConfig = getLanguageConfig(language);
  const pet = nickname || name || langConfig.defaultPetName;
  const person = name || pet;

  try {
    // Try server API first with language
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch('/api/maternal-motivation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: person, nickname: pet, tone, language }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.message) {
        return {
          id: `ai_${Date.now()}`,
          headline: language === 'ur' ? 'آج کے دن امی کی دعا اور نصیحت' : "Mom's Whisper For Today",
          spokenGreeting: data.message,
          affirmation: language === 'ur' ? 'اللہ کے فضل اور ماں کی دعاؤں کے ساتھ، میں ہر کام میں پرسکون اور کامیاب ہوں۔' : `I am deeply loved, safe, and ready for whatever today brings.`,
          maternalTip: language === 'ur' ? 'ایک گلاس نیم گرم پانی پیئیں اور دل میں بسم اللہ پڑھیں۔' : `Drink a warm glass of water and take three deep breaths with your shoulders relaxed.`,
          author: language === 'ur' ? 'امی جان' : 'Mom',
        };
      }
    }
  } catch (e) {
    // Fall through to offline maternal library
  }

  // Offline / curated fallback for selected language
  if (langConfig.maternalWisdom && langConfig.maternalWisdom.length > 0) {
    const list = langConfig.maternalWisdom;
    const picked = list[Math.floor(Math.random() * list.length)];
    return {
      id: `curated_${Date.now()}`,
      headline: picked.headline,
      spokenGreeting: picked.spoken.replace(/{nickname}/g, pet).replace(/{name}/g, person),
      affirmation: picked.affirmation,
      maternalTip: picked.tip,
      author: language === 'ur' ? 'امی جان' : 'Mom',
    };
  }

  const list = MATERNAL_LIBRARY[tone] || MATERNAL_LIBRARY.gentle;
  const picked = list[Math.floor(Math.random() * list.length)];

  return {
    id: `curated_${Date.now()}`,
    headline: picked.headline,
    spokenGreeting: picked.spoken.replace(/{nickname}/g, pet).replace(/{name}/g, person),
    affirmation: picked.affirmation,
    maternalTip: picked.tip,
    author: 'Mom',
  };
}
