import firebaseApp from './firebaseConfig';
import { getFirestore } from 'firebase/firestore';

export const db = getFirestore(firebaseApp);