import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize Gemini client if API key is provided
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// In-memory cache to prevent burning Gemini API quota on page refreshes
const messageCache = new Map<string, { message: string; timestamp: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

// Track backoff when rate limit / 429 occurs
let quotaExhaustedUntil = 0;

// Rich curated maternal wisdom across all supported languages
const fallbackWisdom: Record<string, string[]> = {
  ur: [
    "صبح بخیر میرے پیارے بیٹا! آنکھیں کھولو، نیا دن اللہ کی رحمت اور برکت لے کر آیا ہے۔ امی کی دعائیں ہمیشہ آپ کے ساتھ ہیں۔ ناشتہ اچھے سے کرنا۔",
    "اٹھ جاؤ میری جان! کوئی جلدی نہیں ہے، سکون سے بستر سے نکلو۔ اللہ آپ کو ہر قدم پر عافیت اور کامیابی عطا کرے، ماں آپ سے بہت پیار کرتی ہے۔",
    "صبح بخیر راجہ بیٹا! مسکرا کر اٹھو، آج کا دن آپ کے لیے بہت آسانیاں لائے گا۔ اپنے رب کا شکر ادا کرو اور بسم اللہ سے شروعات کرو۔",
    "اٹھو میرے پیارے، نیند پوری ہو گئی نا؟ بسم اللہ پڑھ کے اٹھو جان، امی آپ کے لیے دل سے دعا گو ہیں۔",
    "صبح بخیر گڑیا! نیا سورج آپ کی زندگی میں روشنی لائے۔ پریشان ہونے کی کوئی بات نہیں، امی آپ کے ساتھ ہیں۔"
  ],
  en: [
    "Good morning my sweet child. Take a slow, deep breath and feel how precious this new day is. Don't rush into the world; remember I am always rooting for you.",
    "Wake up softly, sunshine. You don't have to carry the whole world today—just take one kind step at a time. Have a warm glass of water and be proud of yourself.",
    "Rise and shine, sweetheart! The world is so much brighter with your gentle heart in it. Eat a nourishing breakfast and smile, you've got this.",
    "Good morning, my dear. If yesterday felt heavy, today is a fresh clean blanket. Wrap yourself in courage and remember how deeply you are loved."
  ],
  hi: [
    "सुप्रभात मेरे प्यारे बेटा! धीरे-धीरे आँखें खोलो। नया सवेरा आपके लिए नई आशाएँ और खुशियाँ लाया है। माँ का आशीर्वाद हमेशा आपके साथ है।",
    "उठ जाओ मेरी जान! कोई जल्दबाजी नहीं है, आराम से दिन की शुरुआत करो। भगवान आपका दिन मंगलमय करे।"
  ],
  ar: [
    "صباح الخير يا بني العزيز! استيقظ بهدوء وسكينة، يومك مبارك إن شاء الله ودعوات أمك ترافقك دائماً في كل خطوة.",
    "استيقظ يا حبيبي، ما شاء الله صباح جميل ينتظرك. ابدأ يومك بابتسامة وذكر الله، أمك تحبك كثيراً."
  ],
  es: [
    "¡Buenos días mi amor! Despierta con calma y alegría. Recuerda que mamá siempre está orgullosa de ti y te acompaña con todo su cariño.",
    "¡Arriba mi cielo! Hoy es un día maravilloso para sonreír y dar lo mejor de ti. Respira hondo y desayuna bien."
  ],
  fr: [
    "Bonjour mon chéri ! Ouvre doucement les yeux, la journée t'offre de belles choses. Maman pense très fort à toi avec tout son amour.",
    "Réveille-toi en douceur mon ange. Prends ton temps, respire profondément et passe une merveilleuse journée."
  ],
  tr: [
    "Günaydın canım yavrum! Yavaşça uyan, yeni gün sana huzur ve bereket getirsin. Annen seni tüm kalbiyle seviyor.",
    "Kalk bakalım birtanem, güzel bir gün seni bekliyor. Kahvaltını yapmayı unutma, dualarım hep seninle."
  ]
};

// Server-side endpoint for Maternal Motivational Messages
app.post('/api/maternal-motivation', async (req, res) => {
  const { name, nickname, tone = 'gentle', focus = 'general', language = 'ur' } = req.body;
  const langKey = typeof language === 'string' ? language.toLowerCase() : 'ur';
  const petName = nickname || name || (langKey === 'ur' ? 'بیٹا' : 'sweetheart');
  const cacheKey = `${langKey}_${tone}_${name || ''}_${nickname || ''}`;

  // 1. Check in-memory cache first to save quota
  const cached = messageCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
    return res.json({ message: cached.message, source: 'cache' });
  }

  // 2. Helper to fetch randomized curated message
  const getCuratedMessage = () => {
    const langList = fallbackWisdom[langKey] || fallbackWisdom.ur;
    const randomIndex = Math.floor(Math.random() * langList.length);
    let selected = langList[randomIndex];
    if (name && langKey === 'en') {
      selected = selected.replace('my sweet child', `${petName}`);
    }
    return selected;
  };

  // 3. If within 429 quota backoff window, immediately serve high-quality curated message
  const now = Date.now();
  if (now < quotaExhaustedUntil || !ai || !process.env.GEMINI_API_KEY) {
    const selected = getCuratedMessage();
    messageCache.set(cacheKey, { message: selected, timestamp: now });
    return res.json({ message: selected, source: 'curated' });
  }

  // 4. Try generating with Gemini
  try {
    const isUrdu = langKey === 'ur';
    const languageInstruction = isUrdu 
      ? `Language requirement: Write in authentic, loving Pakistani Urdu (using Urdu Nastaliq/Arabic script). The tone must sound like a warm, caring Pakistani mother (Ammi Jaan) waking up her child with prayers ("Dua") and affection (e.g. calling them "Beta", "Jaan", "Raja Beta", giving du'as like "Allah hifz-o-amaan mein rakhay").`
      : `Language requirement: Write in ${langKey}. Tone must be authentic maternal warmth.`;

    const prompt = `Write a short, tender morning wake-up message from a deeply loving mother to her child named "${name || ''}" (whom she affectionately calls "${petName}").
${languageInstruction}
Tone style: ${tone} (Options: gentle, warm, cozy, cheerful, grounding).
Focus for today: ${focus}.
Guidelines:
- Maximum 2 to 3 sentences (35-55 words).
- Must sound genuinely maternal, soothing, comforting, and natural when read aloud by text-to-speech.
- Avoid robotic or cold phrases.
- Return ONLY the spoken message, without quotation marks, markdown, or headers.`;

    // Use the official recommended model: gemini-3.8-flash
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an affectionate, wise, and gentle mother speaking softly to awaken your beloved child in the morning.',
        temperature: 0.8,
      },
    });

    const message = response.text?.trim();
    if (message) {
      messageCache.set(cacheKey, { message, timestamp: now });
      return res.json({ message, source: 'ai' });
    }
  } catch (error: any) {
    // Check if error is quota exhaustion (429 / RESOURCE_EXHAUSTED) or model availability
    const isRateLimited = error?.status === 'RESOURCE_EXHAUSTED' || 
                          error?.status === 429 || 
                          String(error?.message || '').includes('429') ||
                          String(error?.message || '').includes('quota');

    if (isRateLimited) {
      // Set a 5-minute backoff window before trying Gemini API again
      quotaExhaustedUntil = Date.now() + 5 * 60 * 1000;
    }
  }

  // Graceful fallback to rich curated response
  const selected = getCuratedMessage();
  messageCache.set(cacheKey, { message: selected, timestamp: now });
  return res.json({ message: selected, source: 'curated' });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Setup Vite in development or static serving in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  const portNum = Number(PORT) || 3000;
  app.listen(portNum, '0.0.0.0', () => {
    console.log(`Server listening on port ${portNum}`);
  });
}

startServer();
