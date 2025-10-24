import { initializeApp } from 'firebase/app';
import { getFirestore } from "firebase/firestore";

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

export const db = getFirestore(firebaseApp);
export default firebaseApp;