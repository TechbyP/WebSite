const fs = require('node:fs');
const path = require('node:path');
const dotenv = require('dotenv');

const rootDir = path.resolve(__dirname, '..');
const publicContentDir = path.join(rootDir, 'public', 'content');
const blogCacheSource = path.join(rootDir, 'scripts', '.blog-cache.json');
const blogCacheDestination = path.join(publicContentDir, 'blog-cache.json');
const announcementsDestination = path.join(publicContentDir, 'announcements.json');
const heroItemsDestination = path.join(publicContentDir, 'hero-items.json');

dotenv.config({ path: path.join(rootDir, '.env') });

const ensureDir = (dirPath) => {
  fs.mkdirSync(dirPath, { recursive: true });
};

const ensureJsonFile = (filePath, defaultValue) => {
  if (fs.existsSync(filePath)) {
    return;
  }

  fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2));
};

const getFirebaseConfig = () => {
  const config = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
  };

  return config.apiKey && config.projectId ? config : null;
};

const withTimeout = (promise, timeoutMs, label) => Promise.race([
  promise,
  new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms`)), timeoutMs);
  }),
]);

const toSerializable = (value) => {
  if (Array.isArray(value)) {
    return value.map((entry) => toSerializable(entry));
  }

  if (value && typeof value === 'object') {
    if (typeof value.toDate === 'function') {
      return value.toDate().toISOString();
    }

    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, toSerializable(entry)])
    );
  }

  return value;
};

const sortByDateDesc = (left, right) => String(right.date || '').localeCompare(String(left.date || ''));

const sortByOrderAsc = (left, right) => Number(left.order || 0) - Number(right.order || 0);

const sortByPriorityDesc = (left, right) => {
  const priorityDelta = Number(right.priority || 0) - Number(left.priority || 0);

  if (priorityDelta !== 0) {
    return priorityDelta;
  }

  return String(right.createdAt || '').localeCompare(String(left.createdAt || ''));
};

const writeJson = (filePath, value) => {
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2));
};

const loadCachedArticles = () => {
  if (!fs.existsSync(blogCacheSource)) {
    return { articles: [] };
  }

  try {
    return JSON.parse(fs.readFileSync(blogCacheSource, 'utf8'));
  } catch {
    return { articles: [] };
  }
};

const syncFromFirebase = async () => {
  const firebaseConfig = getFirebaseConfig();

  if (!firebaseConfig) {
    return null;
  }

  const { initializeApp, deleteApp } = await import('firebase/app');
  const { getFirestore, collection, getDocs, terminate } = await import('firebase/firestore');

  const app = initializeApp(firebaseConfig, `public-content-sync-${Date.now()}`);
  const db = getFirestore(app);
  const fetchTimeoutMs = 15000;

  try {
    const [articleSnapshot, announcementSnapshot, heroSnapshot] = await Promise.all([
      withTimeout(getDocs(collection(db, 'articles')), fetchTimeoutMs, 'articles fetch'),
      withTimeout(getDocs(collection(db, 'announcements')), fetchTimeoutMs, 'announcements fetch'),
      withTimeout(getDocs(collection(db, 'heroItems')), fetchTimeoutMs, 'hero-items fetch'),
    ]);

    const articles = articleSnapshot.docs
      .map((documentSnapshot) => ({
        id: documentSnapshot.id,
        ...toSerializable(documentSnapshot.data()),
      }))
      .sort(sortByDateDesc);

    const announcements = announcementSnapshot.docs
      .map((documentSnapshot) => ({
        id: documentSnapshot.id,
        ...toSerializable(documentSnapshot.data()),
      }))
      .filter((announcement) => announcement.isActive !== false)
      .sort(sortByPriorityDesc);

    const heroItems = heroSnapshot.docs
      .map((documentSnapshot) => ({
        id: documentSnapshot.id,
        ...toSerializable(documentSnapshot.data()),
      }))
      .sort(sortByOrderAsc);

    return { articles, announcements, heroItems };
  } finally {
    await terminate(db).catch(() => undefined);
    await deleteApp(app).catch(() => undefined);
  }
};

ensureDir(publicContentDir);

(async () => {
  try {
    const freshContent = await syncFromFirebase();

    if (freshContent) {
      const blogCache = {
        timestamp: Date.now(),
        articles: freshContent.articles,
      };

      writeJson(blogCacheSource, blogCache);
      writeJson(blogCacheDestination, blogCache);
      writeJson(announcementsDestination, freshContent.announcements);
      writeJson(heroItemsDestination, freshContent.heroItems);
      console.log(
        `Synced public content: ${freshContent.articles.length} articles, ${freshContent.announcements.length} announcements, ${freshContent.heroItems.length} hero items.`
      );
      return;
    }
  } catch (error) {
    console.warn(`Public content sync fell back to cached files: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  const cachedBlog = loadCachedArticles();
  writeJson(blogCacheDestination, cachedBlog);
  ensureJsonFile(announcementsDestination, []);
  ensureJsonFile(heroItemsDestination, []);
})();