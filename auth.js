// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-analytics.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAdq5vopBcCndx9ce4arvM-o3cnwi2IGRg",
  authDomain: "sportspotter-e5d74.firebaseapp.com",
  projectId: "sportspotter-e5d74",
  storageBucket: "sportspotter-e5d74.firebasestorage.app",
  messagingSenderId: "9163968897",
  appId: "1:9163968897:web:3a5a644eb4153f11395880",
  measurementId: "G-V7EG7QPTNE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);





const email = document.getElementById('email').value;
const password = document.getElementById('password').value;

const submit = document.getElementById('submit');

// Handle form submissions
document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    console.log('Login with:', email , password);
    hideAuthPopup();
});