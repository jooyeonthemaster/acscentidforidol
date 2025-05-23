import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
// import { getAnalytics } from 'firebase/analytics'; // 애널리틱스는 지금 당장 필요하지 않으므로 주석 처리

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
let app;
let db;

// 서버와 클라이언트 모두에서 Firebase 초기화
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp(); // 이미 초기화되었다면 기존 앱을 사용
}

db = getDatabase(app);

// const analytics = getAnalytics(app); // 애널리틱스는 지금 당장 필요하지 않으므로 주석 처리

export { db }; 