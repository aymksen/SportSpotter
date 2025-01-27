// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";

const firebaseConfig = {
  apiKey: "AIzaSyAT5JjIkzGZXGN2dLx_aLeYHmG03zKXy5c",
  authDomain: "eventdata-a2a22.firebaseapp.com",
  databaseURL: "https://eventdata-a2a22-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "eventdata-a2a22",
  storageBucket: "eventdata-a2a22.firebasestorage.app",
  messagingSenderId: "693643701014",
  appId: "1:693643701014:web:b9b085bcdfc3a907557e37",
  measurementId: "G-20XJ24X2JQ"
};

const app = initializeApp(firebaseConfig);
export default app;