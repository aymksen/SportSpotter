import app from './firebase-config.js';
import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";

const database = getDatabase(app);
const auth = getAuth(app);
const publicEventsRef = ref(database, 'events');

document.addEventListener('DOMContentLoaded', () => {
  // Event Form Submission
  document.getElementById('addEventForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = auth.currentUser;

    if (!user) {
      alert('Please login to create events!');
      return;
    }

    const eventData = {
      date: document.getElementById('eventDate').value,
      time: document.getElementById('eventTime').value,
      activity: document.getElementById('eventActivities').value,
      location: document.getElementById('eventLocation').value,
      eventTag: document.getElementById('eventTag').value.trim(),
      owner: user.uid
    };

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

  // Real-time Listener
  onValue(publicEventsRef, (snapshot) => {
    renderEvents(snapshot);
  });
});

function renderEvents(snapshot) {
  const container = document.getElementById('eventsContainer');
  container.innerHTML = '';

  if (!snapshot.exists()) {
    container.innerHTML = '<div class="event-card">No upcoming events found</div>';
    return;
  }

  const events = snapshot.val();
  const currentUser = auth.currentUser?.uid;

  Object.entries(events).forEach(([eventId, event]) => {
    const eventCard = document.createElement('div');
    eventCard.className = 'event-card';
    eventCard.innerHTML = `
      <div class="event-date">${formatFirebaseDate(event.date, event.time)}</div>
      <h3 class="event-title">${event.activity}</h3>
      <div class="event-location">${event.location}</div>
      <span class="event-sport ${event.eventTag.toLowerCase()}">${event.eventTag}</span>
    `;

    if (event.owner === currentUser) {
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

// Keep the date formatting and show/hide functions
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

window.showAddEventForm = () => {
  document.getElementById('addEventOverlay').style.display = 'flex';
};

window.hideAddEventForm = () => {
  document.getElementById('addEventOverlay').style.display = 'none';
};