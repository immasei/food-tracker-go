import { initializeApp } from 'firebase/app';
import { getFirestore } from "firebase/firestore";
import { initializeAuth } from 'firebase/auth';
import * as firebaseAuth from 'firebase/auth';
const reactNativePersistence = (firebaseAuth as any).getReactNativePersistence;
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Optionally import the services that you want to use
// import {...} from 'firebase/auth';
// import {...} from 'firebase/database';
// import {...} from 'firebase/firestore';
// import {...} from 'firebase/functions';
// import {...} from 'firebase/storage';

// Initialize Firebase
const firebaseConfig = {
  apiKey: 'AIzaSyAfeFFJ8DJ4JIHLmo_3FFnGH3dX358vhDg',
  authDomain: 'comp5216-2025-ga-t02-g03.firebaseapp.com',
  databaseURL: 'https://comp5216-2025-ga-t02-g03.firebaseio.com',
  projectId: 'comp5216-2025-ga-t02-g03',
  storageBucket: 'comp5216-2025-ga-t02-g03.appspot.com',
  messagingSenderId: '411649834184',
  appId: '1:411649834184:ios:71a00c59473dae36f379fd',
};

const firebaseApp = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(firebaseApp);

// Initialize Auth with persistent storage (fixes the warning)
export const auth = initializeAuth(firebaseApp, {
  persistence: reactNativePersistence(ReactNativeAsyncStorage),
});

export default firebaseApp;