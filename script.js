/**
 * RINNAH 2026 - Production Script
 */

let currentGuest = null;
let headsValue = 1;

// --- CORE DATA LOADING ---
function loadGuestData(id) {
    // Only use cache buster if you are NOT on a local file system
    const isLocal = window.location.protocol === 'file:';
    const csvUrl = isLocal ? "guests.csv" : "guests.csv?v=" + Date.now();

    Papa.parse(csvUrl, {
        download: true,
        header: true,
        complete: function(results) {
            currentGuest = results.data.find(row => 
                row.ID && row.ID.toString().trim() === id.toString().trim()
            );
            if (currentGuest) {
                updateUI(currentGuest);
            }
        }
    });
}

function updateUI(guest) {
    // Update labels
    const displayElement = document.getElementById('guestDisplayName');
    const personalMsgElement = document.getElementById('personalMessage');

    if (displayElement) displayElement.innerText = guest.Name;
    if (personalMsgElement) personalMsgElement.innerText = "Welcome, " + guest.Name;
    
    // Check if they already RSVP'd
    if (guest.RSVP && guest.RSVP.trim().toLowerCase() === "done") {
        headsValue = parseInt(guest.Heads) || 1;
        lockRSVPButton(headsValue);
    }
}

function lockRSVPButton(heads) {
    const btn = document.getElementById('rsvpBtn');
    if (btn) {
        btn.innerText = `✅ RSVP'd: ${heads} Seats`;
        btn.disabled = true;
        btn.classList.add('btn-disabled');
        btn.style.background = "#444";
        btn.style.cursor = "default";
    }
}

// --- EVENT HANDLERS ---

window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const guestId = urlParams.get('id');

    if (guestId) {
        loadGuestData(guestId);
    } else {
        console.log("No ID provided in URL.");
    }
};

window.openEvent = function() {
    document.getElementById('invitePage').classList.add('hidden');
    document.getElementById('eventPage').classList.remove('hidden');
    const music = document.getElementById('bgMusic');
    if (music) music.play().catch(() => console.log("Audio autoplay blocked by browser."));
};

window.handleRSVP = function() {
    if (!currentGuest) {
        alert("Guest data not loaded yet.");
        return;
    }
    document.getElementById('headsDisplay').innerText = headsValue;
    document.getElementById('rsvpModal').classList.remove('hidden');
};

window.closeModal = function() {
    document.getElementById('rsvpModal').classList.add('hidden');
};

window.adjustHeads = function(amount) {
    headsValue = Math.max(1, Math.min(10, headsValue + amount));
    document.getElementById('headsDisplay').innerText = headsValue;
};

window.submitToLambda = async function() {
    const confirmBtn = document.getElementById('submitRsvpBtn');
    confirmBtn.innerText = "Saving...";
    confirmBtn.disabled = true;

    try {
        const API_URL = "https://x0p16znd81.execute-api.ap-southeast-2.amazonaws.com/rsvp";
        const response = await fetch(API_URL, {
            method: 'POST',
            mode: 'cors', // Ensure CORS is handled
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: currentGuest.ID.trim(),
                heads: headsValue
            })
        });

        if (response.ok) {
            alert("Thank you! Your RSVP is confirmed.");
            closeModal();
            lockRSVPButton(headsValue);
            currentGuest.RSVP = "Done";
        } else {
            throw new Error("Server rejected the request.");
        }
    } catch (err) {
        console.error("RSVP Error:", err);
        alert("Failed to save RSVP. Please try again later.");
        confirmBtn.innerText = "Confirm Attendance";
        confirmBtn.disabled = false;
    }
};

// Map & Navigation
window.openMap = function() { window.open("https://www.google.com/maps/search/?api=1&query=Drum+Theatre+Dandenong", "_blank"); };
window.openParking = function() { window.open("https://www.google.com/maps/search/?api=1&query=parking+near+Drum+Theatre+Dandenong", "_blank"); };