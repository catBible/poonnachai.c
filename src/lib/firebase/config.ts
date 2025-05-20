
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
  return str.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase();
}

// Check for missing Firebase configuration keys
const requiredKeys: (keyof typeof firebaseConfigValues)[] = [
  'apiKey',
  'authDomain',
  'projectId',
]; // Add other keys if they are strictly essential for your app's startup

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
  // Throwing an error here will stop the app execution and display this message prominently.
  throw new Error(errorMessage);
}

const firebaseConfig = firebaseConfigValues;

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

// Initialize Firebase only on the client-side and if no app has been initialized yet
if (typeof window !== 'undefined' && !getApps().length) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (error) {
    console.error("Failed to initialize Firebase:", error);
    // Propagate the error so Next.js can display its error overlay
    throw error;
  }
} else if (getApps().length > 0) {
  // If an app is already initialized, use it
  app = getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
} else {
  // This case (server-side without an app) should be handled if you need server-side Firebase Admin SDK.
  // For client-side only apps, this branch might not be typically hit if window check is correct.
  // To prevent 'app is not defined' errors, we can assign them conditionally or ensure they are always assigned.
  // However, if this branch is reached and `app` is needed, it will cause issues.
  // For now, the primary concern is client-side initialization.
  console.warn(
    "Firebase is not initialized. This may occur during server-side rendering or if the client-side initialization conditions are not met."
  );
  // Assigning dummy or throwing an error here depends on whether server-side operations are expected.
  // To avoid 'not defined' errors if these are exported and used without proper init:
  // app = null as any; auth = null as any; db = null as any;
  // Or better, ensure consumers check for successful initialization.
}

// @ts-ignore
export { app, auth, db };
