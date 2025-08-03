import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  connectFirestoreEmulator,
  initializeFirestore,
  CACHE_SIZE_UNLIMITED 
} from 'firebase/firestore';

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
  app = getApp();
}

// Firestore 초기화 - 성능 최적화 설정
if (typeof window !== 'undefined') {
  // 클라이언트에서만 실행
  try {
    db = initializeFirestore(app, {
      cacheSizeBytes: CACHE_SIZE_UNLIMITED,
      experimentalForceLongPolling: false, // 웹소켓 사용
    });
  } catch (error) {
    // 이미 초기화된 경우
    db = getFirestore(app);
  }
} else {
  // 서버에서는 기본 초기화
  db = getFirestore(app);
}

// 개발 환경에서는 실제 Firestore 사용 (에뮬레이터 비활성화)
// 에뮬레이터 사용하려면 아래 주석 해제하고 `firebase emulators:start` 실행
/*
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
    console.log('🔧 Firestore 에뮬레이터에 연결됨');
  } catch (error) {
    // 이미 연결된 경우 무시
  }
}
*/

export { db };

// 컬렉션 이름 상수 정의
export const COLLECTIONS = {
  USERS: 'users',
  SESSIONS: 'sessions', 
  ANALYSES: 'analyses',
  RECIPES: 'recipes',
  PERFUMES: 'perfumes',
  FEEDBACKS: 'feedbacks',
  CONFIRMATIONS: 'confirmations'
};

// 인덱스 최적화를 위한 필드 상수
export const FIELDS = {
  CREATED_AT: 'createdAt',
  UPDATED_AT: 'updatedAt',
  USER_ID: 'userId',
  SESSION_ID: 'sessionId',
  STATUS: 'status',
  PHONE_NUMBER: 'phoneNumber'
};