import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth'; // Import getAuth
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
    // apiKey: "AIzaSyD03YRikMYZnnncwJWyjDf2wVFer-vukqU",
    // authDomain: "telegram-e84b9.firebaseapp.com",
    // databaseURL: "https://telegram-e84b9-default-rtdb.asia-southeast1.firebasedatabase.app",
    // projectId: "telegram-e84b9",
    // storageBucket: "telegram-e84b9.firebasestorage.app",
    // messagingSenderId: "18200002246",
    // appId: "1:18200002246:web:df225386da8cf6d53861c7",
    // measurementId: "G-90BTGM8R0N"

    apiKey: "AIzaSyAr7pLAFvWzMtdaux2CooAOgLqtw9JOZIs",
    authDomain: "telegram-mini-applicatio-b17a1.firebaseapp.com",
    databaseURL: "https://telegram-mini-applicatio-b17a1-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "telegram-mini-applicatio-b17a1",
    storageBucket: "telegram-mini-applicatio-b17a1.firebasestorage.app",
    messagingSenderId: "66491108378",
    appId: "1:66491108378:web:dc3b649889117e17f4d5a3",
    measurementId: "G-PDL9LQKX8J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // Initialize Auth
const database = getDatabase(app);

export { app, auth, database };
