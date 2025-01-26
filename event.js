import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js";

const firebaseConfig = {
  databaseURL: "https://eventdata-a2a22-default-rtdb.europe-west1.firebasedatabase.app/"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// User ID management
let userId = localStorage.getItem("userId");
if (!userId) {
  userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  localStorage.setItem("userId", userId);
}

const userEventsRef = ref(database, `events/${userId}`);

function formatFirebaseDate(dateString, timeString) {
  const date = new Date(`${dateString}T${timeString}`);
  const options = { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric', 
    hour: 'numeric', 
    minute: '2-digit', 
    hour12: true 
  };
  return date.toLocaleString('en-US', options).replace(',', ' •');
}

function renderEvents(snapshot) {
  const container = document.getElementById('eventsContainer');
  container.innerHTML = '';

  if (!snapshot.exists()) {
    container.innerHTML = '<div class="event-card">No upcoming events found</div>';
    return;
  }

  const events = snapshot.val();
  Object.entries(events).forEach(([key, event]) => {
    const eventCard = document.createElement('div');
    eventCard.className = 'event-card';
    eventCard.innerHTML = `
      <div class="event-date">${formatFirebaseDate(event.date, event.time)}</div>
      <h3 class="event-title">${event.activity}</h3>
      <div class="event-location">${event.location}</div>
      <span class="event-sport ${event.eventTag.toLowerCase()}">${event.eventTag}</span>
    `;
    container.appendChild(eventCard);
  });
}

// Real-time listener
onValue(userEventsRef, (snapshot) => {
  renderEvents(snapshot);
});

// Form submission handler (keep your existing form ID)
document.getElementById('addEventForm').addEventListener('submit', (e) => {
  e.preventDefault();

  const eventData = {
    date: document.getElementById('eventDate').value,
    time: document.getElementById('eventTime').value,
    activity: document.getElementById('eventActivities').value,
    location: document.getElementById('eventLocation').value,
    eventTag: document.getElementById('eventTag').value
  };

  if (!Object.values(eventData).every(field => field.trim())) {
    alert('Please fill in all fields');
    return;
  }

  push(userEventsRef, eventData)
    .then(() => {
      document.getElementById('addEventForm').reset();
      hideAddEventForm();
    })
    .catch((error) => {
      console.error('Error adding event:', error);
      alert('Error adding event. Please try again.');
    });
});

// Keep your existing show/hide functions
function showAddEventForm() {
  document.getElementById('addEventOverlay').style.display = 'block';
}

function hideAddEventForm() {
  document.getElementById('addEventOverlay').style.display = 'none';
}