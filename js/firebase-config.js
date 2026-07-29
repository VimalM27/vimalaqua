// ============================================================
// FIREBASE CONFIG
// ============================================================
// 1. Go to https://console.firebase.google.com
// 2. Create a project (free) called "Vimal Farms" (or anything)
// 3. Click the "</>" web icon to register a web app
// 4. Copy the config object it gives you and paste the values below
// 5. In the Firebase Console:
//      - Build > Authentication > Get Started > enable "Email/Password"
//      - Build > Firestore Database > Create database > start in
//        "Production mode" (or test mode while developing)
// ============================================================

const firebaseConfig = {
  apiKey: "AIzaSyDOfA7xS7QEDzm7AQmOKwlY8zIZfuUFfjI",
  authDomain: "vimal-farms.firebaseapp.com",
  projectId: "vimal-farms",
  storageBucket: "vimal-farms.firebasestorage.app",
  messagingSenderId: "846135571017",
  appId: "1:846135571017:web:85e16e74bd18b2b9a64598"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();