import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js";

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

const publicEventsRef = ref(database, 'events');

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
  Object.entries(events).forEach(([eventId, event]) => {
    const eventCard = document.createElement('div');
    eventCard.className = 'event-card';
    eventCard.innerHTML = `
      <div class="event-date">${formatFirebaseDate(event.date, event.time)}</div>
      <h3 class="event-title">${event.activity}</h3>
      <div class="event-location">${event.location}</div>
      <span class="event-sport ${event.eventTag.toLowerCase()}">${event.eventTag}</span>
    `;

    // Add delete button if current user is the owner
    if (event.owner === userId) {
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-event-btn';
      deleteBtn.innerHTML = '×';
      deleteBtn.onclick = () => deleteEvent(eventId);
      eventCard.appendChild(deleteBtn);
    }

    container.appendChild(eventCard);
  });
}

async function deleteEvent(eventId) {
  if (confirm('Are you sure you want to delete this event?')) {
    try {
      await remove(ref(database, `events/${eventId}`));
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Error deleting event. Please try again.');
    }
  }
}

// Real-time listener
onValue(publicEventsRef, (snapshot) => {
  renderEvents(snapshot);
});

// Modified form submission handler
document.getElementById('addEventForm').addEventListener('submit', (e) => {
  e.preventDefault();

  const eventData = {
    date: document.getElementById('eventDate').value,
    time: document.getElementById('eventTime').value,
    activity: document.getElementById('eventActivities').value,
    location: document.getElementById('eventLocation').value,
    eventTag: document.getElementById('eventTag').value.trim(),
    owner: userId // Add owner information
  };

  if (!Object.values(eventData).every(field => field)) {
    alert('Please fill in all fields');
    return;
  }

  push(publicEventsRef, eventData)
    .then(() => {
      document.getElementById('addEventForm').reset();
      hideAddEventForm();
    })
    .catch((error) => {
      console.error('Error adding event:', error);
      alert('Error adding event. Please try again.');
    });
});

// Keep show/hide functions
function showAddEventForm() {
  document.getElementById('addEventOverlay').style.display = 'block';
}

function hideAddEventForm() {
  document.getElementById('addEventOverlay').style.display = 'none';
}