/**
 * RINNAH 2026 - Invitation & RSVP Logic
 */

let currentGuest = null;
let headsValue = 1;

window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const guestId = urlParams.get('id');

    if (guestId) {
        loadGuestData(guestId);
    } else {
        document.getElementById('guestDisplayName').innerText = "Beloved Guest";
    }
};

function loadGuestData(id) {
    // FORCE LATEST DATA: Cache Buster prevents browser from using old CSV versions
    const cacheBuster = "?v=" + new Date().getTime();
    
    Papa.parse("guests.csv" + cacheBuster, {
        download: true,
        header: true,
        complete: function(results) {
            // Find guest by ID
            currentGuest = results.data.find(row => row.ID.trim() === id.trim());
            
            if (currentGuest) {
                // IMMEDIATELY update UI and check RSVP status
                updateUI(currentGuest);
            }
        }
    });
}

function updateUI(guest) {
    document.getElementById('guestDisplayName').innerText = guest.Name;
    document.getElementById('personalMessage').innerText = "Welcome, " + guest.Name;
    
    // CHECK RSVP STATUS: If "Done" or "done", lock the button immediately
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
        // Explicitly set style in JS to ensure it overrides everything
        btn.style.backgroundColor = "#444";
        btn.style.color = "#888";
        btn.style.cursor = "default";
        btn.style.pointerEvents = "none";
    }
}

function openEvent() {
    document.getElementById('invitePage').classList.add('hidden');
    document.getElementById('eventPage').classList.remove('hidden');
    
    const music = document.getElementById('bgMusic');
    if (music) {
        music.play().catch(e => console.log("Audio play blocked."));
    }
}

function handleRSVP() {
    if (!currentGuest) return;
    document.getElementById('headsDisplay').innerText = headsValue;
    document.getElementById('rsvpModal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('rsvpModal').classList.add('hidden');
}

function changeHeads(amount) {
    headsValue = Math.max(1, Math.min(10, headsValue + amount));
    document.getElementById('headsCount').innerText = headsValue;
}

async function submitToLambda() {
    const confirmBtn = document.getElementById('submitRsvpBtn');
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
            closeModal();
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
}

// Map & Parking helpers
function openMap() { window.open("https://maps.google.com/?q=Drum+Theatre+Dandenong", "_blank"); }
function openParking() { alert("Free parking available at the Drum Theatre multi-deck after 4 PM."); }


// --- MODAL & RSVP LOGIC ---
function handleRSVP() {
    if (!currentGuest) return;
    // Fix: Match the ID from index.html (headsDisplay)
    document.getElementById('headsDisplay').innerText = headsValue;
    document.getElementById('rsvpModal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('rsvpModal').classList.add('hidden');
}

function adjustHeads(amount) {
    headsValue = Math.max(1, Math.min(10, headsValue + amount));
    // Fix: Match the ID from index.html (headsDisplay)
    document.getElementById('headsDisplay').innerText = headsValue;
}