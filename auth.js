import app from './firebase-config.js';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";

const auth = getAuth(app);

// Auth UI Management
document.addEventListener('DOMContentLoaded', () => {
  // Login Handler
  document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('password').value;

    console.log("Auth request payload:", {
      email: email,
      password: password.length // Don't log actual password
    });


    try {
      await signInWithEmailAndPassword(auth, email, password);
      hideAuthPopup();
    } catch (error) {
      handleAuthError(error);
    }
  });

  // Signup Handler
  document.getElementById('signupForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('signupEmail').value.trim().toLowerCase();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      hideAuthPopup();
    } catch (error) {
      handleAuthError(error);
    }
  });

  // Auth State Listener
  onAuthStateChanged(auth, (user) => {
    const authButtons = document.querySelector('.auth-buttons');
    const userGreeting = document.querySelector('.user-greeting');
    
    if (user) {
      authButtons.style.display = 'none';
      userGreeting.style.display = 'flex';
      userGreeting.innerHTML = `Hello, ${user.email}<button onclick="logout()" class="button-3">Logout</button>`;
    } else {
      authButtons.style.display = 'flex';
      userGreeting.style.display = 'none';
    }
  });
});

// Auth UI Functions

document.getElementById('authOverlay').addEventListener('mousedown', function(e) {
  // Only trigger if pressing down directly on overlay background
  if (e.target === this) {
    hideAuthPopup();
  }
});

window.hideAuthPopup = () => {
  document.getElementById('authOverlay').style.display = 'none';
  document.getElementById('loginForm').reset();
  document.getElementById('signupForm').reset();
};


document.getElementById('authOverlay').style.userSelect = 'none';


window.switchAuth = (type) => {
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  
  if (type === 'login') {
    loginForm.style.display = 'block';
    signupForm.style.display = 'none';
  } else {
    signupForm.style.display = 'block';
    loginForm.style.display = 'none';
  }
};

window.logout = async () => {
  try {
    await auth.signOut();
  } catch (error) {
    console.error('Logout error:', error);
  }
};

function handleAuthError(error) {
  console.error("Full error details:", error);
  let message = 'Authentication failed: ';
  switch(error.code) {
    case 'auth/email-already-in-use': message += 'Email already in use'; break;
    case 'auth/invalid-email': message += 'Invalid email'; break;
    case 'auth/weak-password': message += 'Password too weak (min 6 characters)'; break;
    case 'auth/user-not-found': message += 'User not found'; break;
    case 'auth/wrong-password': message += 'Wrong password'; break;
    default: message += error.message;
  }
  alert(message);
}