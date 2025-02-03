import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your Firebase config from Firebase Console
const firebaseConfig = {
    apiKey: "AIzaSyCq22fcUFgVY5mY4WS3PiUKkbga11YX9MU",
    authDomain: "aic-coin.firebaseapp.com",
    projectId: "aic-coin",
    storageBucket: "aic-coin.firebasestorage.app",
    messagingSenderId: "489411439843",
    appId: "1:489411439843:web:ec1a625ca62e4eae0369d6",
    measurementId: "G-FVFNZJCLJK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
