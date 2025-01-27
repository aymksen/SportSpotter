function showAuthPopup(mode) {
    document.getElementById('authOverlay').style.display = 'flex';
    switchAuth(mode);
}

function hideAuthPopup() {
    document.getElementById('authOverlay').style.display = 'none';
}

function switchAuth(mode) {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const loginTab = document.getElementById('loginTab');
    const signupTab = document.getElementById('signupTab');

    if (mode === 'login') {
        loginForm.style.display = 'flex';
        signupForm.style.display = 'none';
        loginTab.classList.add('active');
        signupTab.classList.remove('active');
    } else {
        loginForm.style.display = 'none';
        signupForm.style.display = 'flex';
        loginTab.classList.remove('active');
        signupTab.classList.add('active');
    }
}

// Handle form submissions
// document.getElementById('loginForm').addEventListener('submit', (e) => {
//     e.preventDefault();
//     const email = document.getElementById('email').value;
//     const password = document.getElementById('password').value;
//     console.log('Login with:', email);
//     hideAuthPopup();
// });

document.getElementById('signupForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('signupEmail').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('signupPassword').value;
    console.log('Signup with:', { email, username, password });
    hideAuthPopup();
});

// Close popup when clicking outside
document.getElementById('authOverlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('authOverlay')) {
        hideAuthPopup();
    }
});



function showAddEventForm() {
    document.getElementById('addEventOverlay').style.display = 'flex';
}

function hideAddEventForm() {
    document.getElementById('addEventOverlay').style.display = 'none';
}

// Handle form submission
document.getElementById('addEventForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const eventData = {
        date: document.getElementById('eventDate').value,
        time: document.getElementById('eventTime').value,
        activities: document.getElementById('eventActivities').value,
        location: document.getElementById('eventLocation').value,
        tag: document.getElementById('eventTag').value
    };
    console.log('New Event:', eventData);
    hideAddEventForm();
});

// Close popup when clicking outside
document.getElementById('addEventOverlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('addEventOverlay')) {
        hideAddEventForm();
    }
});