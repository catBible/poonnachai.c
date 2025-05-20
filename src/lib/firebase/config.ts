
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfigValues = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Helper function to convert camelCase to SNAKE_CASE_UPPER
const camelToSnakeCaseUpper = (str: string) => {
  return str.replace(/([A-Z])/g, '_$1').toUpperCase();
}

// Check for missing Firebase configuration keys
const requiredKeys: (keyof typeof firebaseConfigValues)[] = [
  'apiKey',
  'authDomain',
  'projectId',
];

const missingKeys = requiredKeys.filter(key => !firebaseConfigValues[key]);

if (missingKeys.length > 0) {
  const errorMessage = `Firebase configuration error: The following required environment variables are missing:
${missingKeys.map(key => `NEXT_PUBLIC_FIREBASE_${camelToSnakeCaseUpper(key)}`).join('\n')}

Please ensure these are set in your .env.local file (or .env for production builds) and that you have restarted your Next.js development server after adding them.

Example .env.local content:
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
NEXT_PUBLIC_FIREBASE_APP_ID=1:1234567890:web:abcdef1234567890

You can find these values in your Firebase project settings:
Project Overview -> Project settings (gear icon) -> General -> Your apps -> Firebase SDK snippet -> Config.
`;
  console.error(errorMessage);
  throw new Error(errorMessage);
}

const firebaseConfig = firebaseConfigValues;

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

if (!getApps().length) {
  // If no Firebase app has been initialized yet, initialize one.
  // This will run once, either on the server (first import) or on the client (first import).
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (error: any) {
    console.error("Failed to initialize Firebase:", error);
    // It's critical to re-throw the error, especially if it happens during server build/render
    throw new Error(`Firebase initialization failed: ${error.message || String(error)}`);
  }
} else {
  // If an app is already initialized, use it.
  app = getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
}

export { app, auth, db };
