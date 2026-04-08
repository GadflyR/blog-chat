import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyAc4TBjNmUaMDoEx584Qgv_bajxghmwMz8',
  authDomain: 'blog-efdea.firebaseapp.com',
  projectId: 'blog-efdea',
  storageBucket: 'blog-efdea.firebasestorage.app',
  messagingSenderId: '188031104075',
  appId: '1:188031104075:web:5fbe8f008c9e5325b009ce',
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const storage = getStorage(app, 'gs://blog-efdea.firebasestorage.app');
