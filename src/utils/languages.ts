export interface LanguageConfig {
  code: string; // e.g. 'ur', 'en', 'hi', 'ar', 'es', 'fr', 'tr', 'de'
  name: string; // Native name
  englishName: string;
  flag: string;
  speechLang: string; // e.g. 'ur-PK', 'en-US'
  defaultPetName: string;
  petNameSuggestions: string[];
  sampleGreeting: string;
  snoozePhrases: string[];
  dismissPhrases: string[];
  clockSubtext: string;
  dismissBtnText: string;
  snoozeBtnText: string;
  maternalWisdom: Array<{
    headline: string;
    spoken: string;
    affirmation: string;
    tip: string;
  }>;
}

export const SUPPORTED_LANGUAGES: Record<string, LanguageConfig> = {
  ur: {
    code: 'ur',
    name: 'اردو',
    englishName: 'Urdu (Pakistan)',
    flag: '🇵🇰',
    speechLang: 'ur-PK',
    defaultPetName: 'بیٹا',
    petNameSuggestions: ['Beta (بیٹا)', 'Jaan (جان)', 'Raja Beta (راجہ بیٹا)', 'Guriya (گڑیا)', 'Shehzaday (شہزادے)', 'Honey'],
    sampleGreeting: 'السلام علیکم بیٹا! صبح بخیر۔ اٹھ جاؤ میرے پیارے، اللہ آپ کا دن خیر و برکت سے بھر دے۔ ماں آپ سے بہت پیار کرتی ہے۔',
    snoozePhrases: [
      'چلو ٹھیک ہے بیٹا، پانچ منٹ اور آرام کر لو۔ امی یہیں ہیں، دوبارہ پیار سے اٹھائیں گی۔',
      'سو جاؤ میرے راجہ بیٹا، بس پانچ منٹ بعد ضرور اٹھنا ہے۔',
      'تھوڑی دیر اور سستالو جان، امی آپ کا خیال رکھ رہی ہیں۔',
    ],
    dismissPhrases: [
      'شاباش میرے پیارے بیٹا! صبح بخیر۔ بسم اللہ پڑھ کے دن شروع کرو، اللہ ہر کام میں برکت دے۔',
      'ماشاءاللہ، اٹھ گئے نا! امی کی دعائیں ہمیشہ آپ کے ساتھ ہیں۔ ناشتہ ضرور کرنا۔',
      'صبح بخیر جان! آج کا دن آپ کے لیے بہت پیارا اور کامیاب ہو۔',
    ],
    clockSubtext: 'Sleep peacefully, Mom is watching over you with prayers',
    dismissBtnText: "I'm awake Mom! Good morning ☀️",
    snoozeBtnText: 'Just 5 more minutes, Mom 😴',
    maternalWisdom: [
      {
        headline: 'Morning Du’a & Blessings',
        spoken: 'صبح بخیر میرے پیارے {nickname}۔ آنکھیں کھولو بیٹا۔ گھبرانے کی کوئی بات نہیں، امی کی دعائیں ہر قدم پر آپ کے ساتھ ہیں۔',
        affirmation: 'I am blessed, safe, and surrounded by my mother’s prayers.',
        tip: 'Take three slow deep breaths and drink a warm glass of water.',
      },
      {
        headline: 'A Fresh Blessed Morning',
        spoken: 'اٹھ جاؤ میری جان {nickname}۔ نیا سورج آپ کے لیے امید اور خوشیاں لے کر طلوع ہوا ہے۔ مسکرا کر اٹھو۔',
        affirmation: 'Today brings fresh ease, peace, and abundance into my life.',
        tip: 'Open the window for fresh morning air and start with gratitude.',
      },
      {
        headline: 'Mother’s Loving Comfort',
        spoken: 'اٹھو {name}، نیند پوری ہو گئی نا؟ کوئی جلدی نہیں، آرام سے قدم رکھو۔ آپ میرے لیے سب سے قیمتی ہو۔',
        affirmation: 'I am grounded, patient, and capable of overcoming anything today.',
        tip: 'Wash your face with cool gentle water and have a nourishing breakfast.',
      },
    ],
  },
  en: {
    code: 'en',
    name: 'English',
    englishName: 'English (US/UK)',
    flag: '🌍',
    speechLang: 'en-US',
    defaultPetName: 'Sweetheart',
    petNameSuggestions: ['Sweetheart', 'Honey', 'Sunshine', 'My Dear', 'Champ', 'Kiddo'],
    sampleGreeting: 'Good morning sweetheart! Time to gently wake up. Mom loves you and today is going to be wonderful.',
    snoozePhrases: [
      'Alright sweetheart, rest your eyes for 5 more minutes. Mom will be right here to wake you up again gently.',
      'Okay honey, 5 more minutes of cozy sleep. Sleep tight, I love you.',
      'Just a little more rest, sweet child. Drifting back to sleep softly now.',
    ],
    dismissPhrases: [
      'Good morning, my dear! I am so proud of you. Remember to drink water, eat something nourishing, and have a wonderful day!',
      'You did it, my love! Eyes open and ready for the day. Remember mom loves you to the moon and back!',
      'Good morning sunshine! Go shine your bright light today, honey.',
    ],
    clockSubtext: 'Rest peacefully, Mom is watching over you',
    dismissBtnText: "I'm awake Mom! Good morning ☀️",
    snoozeBtnText: 'Just 5 more minutes, Mom 😴',
    maternalWisdom: [
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
        headline: 'A Mother’s Heart Holds You',
        spoken: 'Good morning sunshine! It’s time to start another wonderful day, {nickname}. I believe in you with all my heart. Don’t forget how capable and loved you are.',
        affirmation: 'I carry warm confidence and love wherever I walk today.',
        tip: 'Give yourself a gentle embrace and remember someone is always proud of you.',
      },
    ],
  },
  hi: {
    code: 'hi',
    name: 'हिन्दी',
    englishName: 'Hindi',
    flag: '🇮🇳',
    speechLang: 'hi-IN',
    defaultPetName: 'बेटा',
    petNameSuggestions: ['Beta (बेटा)', 'Raja Beta (राजा बेटा)', 'Guriya (गुड़िया)', 'Laadla (लाडला)', 'Bacha (बच्चा)'],
    sampleGreeting: 'सुप्रभात बेटा! उठ जाओ मेरे प्यारे, नया सवेरा आपका स्वागत कर रहा है। माँ आपसे बहुत प्यार करती है।',
    snoozePhrases: [
      'ठीक है बेटा, पाँच मिनट और आराम कर लो। माँ यहीं हैं, फिर से जगा देंगी।',
      'पाँच मिनट और सो लो मेरे बच्चे, फिर जल्दी से उठना।',
    ],
    dismissPhrases: [
      'शाबाश मेरे प्यारे बच्चे! सुप्रभात। भगवान आपका दिन शुभ करे, नाश्ता जरूर करना।',
      'सुप्रभात राजा बेटा! माँ का आशीर्वाद हमेशा आपके साथ है।',
    ],
    clockSubtext: 'Sleep peacefully, mother’s blessings are with you',
    dismissBtnText: "I'm awake Mom! Good morning ☀️",
    snoozeBtnText: 'Just 5 more minutes, Mom 😴',
    maternalWisdom: [
      {
        headline: 'Morning Blessings',
        spoken: 'सुप्रभात मेरे प्यारे {nickname}। धीरे-धीरे आँखें खोलो। कोई जल्दबाजी नहीं है, माँ का आशीर्वाद हमेशा तुम्हारे साथ है।',
        affirmation: 'I am safe, strong, and blessed by my mother’s love.',
        tip: 'Drink a warm glass of water and stretch gently.',
      },
    ],
  },
  ar: {
    code: 'ar',
    name: 'العربية',
    englishName: 'Arabic',
    flag: '🇸🇦',
    speechLang: 'ar-SA',
    defaultPetName: 'حبيبي',
    petNameSuggestions: ['Habibi (حبيبي)', 'Ya Boni (يا بني)', 'Rouhi (روحي)', 'Ya Qamar (يا قمر)'],
    sampleGreeting: 'صباح الخير يا حبيبي! استيقظ بهدوء، أمك تدعو لك بيوم مبارك وسعيد.',
    snoozePhrases: [
      'حسناً يا حبيبي، ارتح خمس دقائق أخرى. أمك بجانبك دائماً.',
      'نم قليلاً يا روحي، خمس دقائق فقط وسنبدأ اليوم بنشاط.',
    ],
    dismissPhrases: [
      'صباح النور والسرور يا بني! فخورة بك جداً، أتمنى لك يوماً رائعاً.',
      'ما شاء الله، صباح الخير! ابدأ يومك بابتسامة وذكر الله.',
    ],
    clockSubtext: 'Sleep peacefully under mother’s loving prayers',
    dismissBtnText: "I'm awake Mom! Good morning ☀️",
    snoozeBtnText: 'Just 5 more minutes, Mom 😴',
    maternalWisdom: [
      {
        headline: 'Morning Du’a & Serenity',
        spoken: 'صباح الخير يا {nickname}. تنفس بعمق وهدوء، أمك تدعو لك دائماً بالتوفيق والسكينة.',
        affirmation: 'I am surrounded by peace, dignity, and maternal prayers today.',
        tip: 'Drink a warm cup of water and smile into the morning air.',
      },
    ],
  },
  es: {
    code: 'es',
    name: 'Español',
    englishName: 'Spanish',
    flag: '🇪🇸',
    speechLang: 'es-ES',
    defaultPetName: 'Mi amor',
    petNameSuggestions: ['Mi amor', 'Cariño', 'Mi cielo', 'Campeón', 'Tesoro'],
    sampleGreeting: '¡Buenos días mi amor! Es hora de despertar con calma. Mamá te ama con todo su corazón.',
    snoozePhrases: [
      'Está bien cariño, descansa cinco minutos más. Mamá te despertará con ternura.',
      'Cinco minutitos más mi cielo, descansa tranquilo.',
    ],
    dismissPhrases: [
      '¡Buenos días mi vida! Estoy muy orgullosa de ti. ¡Que tengas un día maravilloso!',
      '¡Arriba campeón! Recuerda que mamá siempre está contigo.',
    ],
    clockSubtext: 'Sleep in peace, Mom is watching over your dreams',
    dismissBtnText: "I'm awake Mom! Good morning ☀️",
    snoozeBtnText: 'Just 5 more minutes, Mom 😴',
    maternalWisdom: [
      {
        headline: 'A Loving Morning Awakening',
        spoken: 'Buenos días, mi dulce {nickname}. Abre los ojos despacio. Hoy no hay prisa, respira profundo y recuerda cuánto te amo.',
        affirmation: 'I walk with tranquility and the unconditional love of my mother.',
        tip: 'Drink a glass of water and stretch your arms gently.',
      },
    ],
  },
  fr: {
    code: 'fr',
    name: 'Français',
    englishName: 'French',
    flag: '🇫🇷',
    speechLang: 'fr-FR',
    defaultPetName: 'Mon chéri',
    petNameSuggestions: ['Mon chéri', 'Mon ange', 'Mon trésor', 'Mon petit coeur'],
    sampleGreeting: 'Bonjour mon chéri ! C’est l’heure de te réveiller doucement. Maman t’aime très fort.',
    snoozePhrases: [
      'D’accord mon ange, repose-toi encore cinq minutes. Maman te réveillera.',
      'Encore un petit somme de cinq minutes, rendors-toi paisiblement.',
    ],
    dismissPhrases: [
      'Bonjour mon grand ! Je suis fière de toi. Passe une magnifique journée !',
      'Te voilà debout, formidable ! Belle journée à toi.',
    ],
    clockSubtext: 'Rest peacefully, Mom is watching over you',
    dismissBtnText: "I'm awake Mom! Good morning ☀️",
    snoozeBtnText: 'Just 5 more minutes, Mom 😴',
    maternalWisdom: [
      {
        headline: 'Sweet Morning Awakening',
        spoken: 'Bonjour mon doux {nickname}. Ouvre les yeux lentement, rien ne presse. Maman pense très fort à toi.',
        affirmation: 'I welcome this day with calm confidence and inner peace.',
        tip: 'Breathe in deeply and take a glass of fresh water.',
      },
    ],
  },
  tr: {
    code: 'tr',
    name: 'Türkçe',
    englishName: 'Turkish',
    flag: '🇹🇷',
    speechLang: 'tr-TR',
    defaultPetName: 'Canım',
    petNameSuggestions: ['Canım', 'Kuzum', 'Yavrum', 'Birtanem', 'Güzelim'],
    sampleGreeting: 'Günaydın canım yavrum! Yavaşça uyan, annen seni çok seviyor. Bugün senin günün olsun.',
    snoozePhrases: [
      'Tamam canım, beş dakika daha dinlen. Annen seni yine sevgiyle uyandıracak.',
      'Beş dakika daha uyu kuzum, annen yanında.',
    ],
    dismissPhrases: [
      'Günaydın birtanem! Seninle gurur duyuyorum. Harika bir gün geçir, kahvaltını ihmal etme!',
      'Aferin kuzuma! Günün aydın ve bereketli olsun.',
    ],
    clockSubtext: 'Sleep peacefully, mother’s prayers are with you',
    dismissBtnText: "I'm awake Mom! Good morning ☀️",
    snoozeBtnText: 'Just 5 more minutes, Mom 😴',
    maternalWisdom: [
      {
        headline: 'A Gentle Morning Awakening',
        spoken: 'Günaydın tatlı {nickname}. Gözlerini usulca aç, hiç acelemiz yok. Annen seni tüm kalbiyle seviyor.',
        affirmation: 'I am safe and calm, and today holds wonderful moments for me.',
        tip: 'Take a deep morning breath and have a warm glass of water.',
      },
    ],
  },
};

export function getLanguageConfig(code: string): LanguageConfig {
  return SUPPORTED_LANGUAGES[code] || SUPPORTED_LANGUAGES.en;
}
