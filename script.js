/**
 * RINNAH 2026 - Global RSVP Script
 */

// State variables
let currentGuest = null;
let headsValue = 1;

// --- INITIAL LOAD ---
window.onload = function() {
    console.log("Page Loaded. Initializing...");
    const urlParams = new URLSearchParams(window.location.search);
    const guestId = urlParams.get('id');

    if (guestId) {
        loadGuestData(guestId);
    } else {
        const nameDisplay = document.getElementById('guestDisplayName');
        if (nameDisplay) nameDisplay.innerText = "Beloved Guest";
    }
};

function loadGuestData(id) {
    const cacheBuster = "?v=" + new Date().getTime();
    Papa.parse("guests.csv" + cacheBuster, {
        download: true,
        header: true,
        complete: function(results) {
            // Safety check for ID
            currentGuest = results.data.find(row => row.ID && row.ID.toString().trim() === id.trim());
            
            if (currentGuest) {
                console.log("Guest Found:", currentGuest.Name);
                updateUI(currentGuest);
            } else {
                console.error("Guest ID not found in CSV");
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
        btn.style.cursor = "default";
        btn.style.pointerEvents = "none";
    }
}

// --- EXPLICIT GLOBAL FUNCTIONS ---
// We attach these to 'window' so index.html can always find them

window.openEvent = function() {
    document.getElementById('invitePage').classList.add('hidden');
    document.getElementById('eventPage').classList.remove('hidden');
    const music = document.getElementById('bgMusic');
    if (music) music.play().catch(e => console.warn("Audio blocked by browser."));
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
    headsValue = Math.max(1, Math.min(10, headsValue + amount));
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
        console.error("Submission error:", err);
        alert("Failed to save RSVP. Please try again.");
        confirmBtn.innerText = "Confirm Attendance";
        confirmBtn.disabled = false;
    }
};

window.openMap = function() { window.open("https://maps.google.com", "_blank"); };
window.openParking = function() { alert("Free parking available at the Drum Theatre multi-deck after 4 PM."); };