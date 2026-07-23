import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyB7RisFjy5L1sLiH_VpXrJB05qGhr1CcLY',
  authDomain: 'game-96c46.firebaseapp.com',
  projectId: 'game-96c46',
  storageBucket: 'game-96c46.firebasestorage.app',
  messagingSenderId: '31876054374',
  appId: '1:31876054374:web:d2f5a114a775f49d0a9ca7',
  measurementId: 'G-B4E37J6LR6',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');
googleProvider.setCustomParameters({ prompt: 'select_account' });
