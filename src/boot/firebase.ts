import { defineBoot } from '#q-app';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase project config values are safe to expose client-side; access is
// enforced by Firebase Authentication + Firestore security rules, not secrecy.
const firebaseConfig = {
  apiKey: 'AIzaSyCGyr-ehTPZhvdntQFIHPOfPKNXzBfBLEc',
  authDomain: 'job-hunt-tracker-d9d65.firebaseapp.com',
  projectId: 'job-hunt-tracker-d9d65',
  storageBucket: 'job-hunt-tracker-d9d65.firebasestorage.app',
  messagingSenderId: '702831515903',
  appId: '1:702831515903:web:2782de045061c4c47394ca',
};

const firebaseApp = initializeApp(firebaseConfig);

export const auth = getAuth(firebaseApp);
export const firestore = getFirestore(firebaseApp);

export default defineBoot(() => {
  // Firebase is initialized above at module load time; nothing else to wire up here.
});
