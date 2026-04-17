/**
 * RINNAH 2026 - Production Script
 */

let currentGuest = null;
let headsValue = 1;

// --- CORE DATA LOADING ---
function loadGuestData(id) {
    const cacheBuster = "?v=" + new Date().getTime();
    Papa.parse("guests.csv" + cacheBuster, {
        download: true,
        header: true,
        complete: function(results) {
            currentGuest = results.data.find(row => row.ID && row.ID.trim() === id.trim());
            if (currentGuest) {
                updateUI(currentGuest);
            }
        }
    });
}

function updateUI(guest) {
    document.getElementById('guestDisplayName').innerText = guest.Name;
    document.getElementById('personalMessage').innerText = "Welcome, " + guest.Name;
    
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
        btn.style.backgroundColor = "#444";
        btn.style.color = "#888";
        btn.style.pointerEvents = "none";
    }
}

// --- GLOBAL ATTACHMENTS (Prevents ReferenceError) ---

window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const guestId = urlParams.get('id');

    if (guestId) {
        loadGuestData(guestId);
    } else {
        const display = document.getElementById('guestDisplayName');
        if (display) display.innerText = "Beloved Guest";
    }
};

window.openEvent = function() {
    document.getElementById('invitePage').classList.add('hidden');
    document.getElementById('eventPage').classList.remove('hidden');
    const music = document.getElementById('bgMusic');
    if (music) music.play().catch(e => console.log("Audio blocked."));
};

window.handleRSVP = function() {
    if (!currentGuest) return;
    const display = document.getElementById('headsDisplay');
    if (display) display.innerText = headsValue;
    document.getElementById('rsvpModal').classList.remove('hidden');
};

window.closeModal = function() {
    document.getElementById('rsvpModal').classList.add('hidden');
};

window.adjustHeads = function(amount) {
    // 1. Update variable
    headsValue = Math.max(1, Math.min(10, headsValue + amount));
    // 2. Update UI immediately
    const display = document.getElementById('headsDisplay');
    if (display) {
        display.innerText = headsValue;
    }
};

window.submitToLambda = async function() {
    const confirmBtn = document.getElementById('submitRsvpBtn');
    if (!confirmBtn) return;

    confirmBtn.innerText = "Saving...";
    confirmBtn.disabled = true;

    try {
        const API_URL = "https://x0p16znd81.execute-api.ap-southeast-2.amazonaws.com/rsvp";
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: currentGuest.ID,
                heads: headsValue
            })
        });

        if (response.ok) {
            alert("Thank you! Your RSVP is confirmed.");
            window.closeModal();
            lockRSVPButton(headsValue);
            currentGuest.RSVP = "Done";
            currentGuest.Heads = headsValue;
        } else {
            throw new Error("Server error");
        }
    } catch (err) {
        alert("Failed to save RSVP.");
        confirmBtn.innerText = "Confirm Attendance";
        confirmBtn.disabled = false;
    }
};

window.openMap = function() { window.open("https://maps.google.com", "_blank"); };
window.openParking = function() { alert("Free parking available after 4 PM."); };