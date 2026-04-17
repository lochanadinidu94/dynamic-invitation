/**
 * RINNAH 2026 - Invitation & RSVP Logic
 */

let currentGuest = null;
let headsValue = 1;

// --- INITIALIZATION ---
window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const guestId = urlParams.get('id');

    if (guestId) {
        loadGuestData(guestId);
    } else {
        document.getElementById('guestDisplayName').innerText = "Beloved Guest";
    }
};

// Fetch and Parse the CSV
function loadGuestData(id) {
    // Adding ?t= + timestamp makes the URL unique every time the page loads
    const cacheBuster = "?t=" + new Date().getTime();
    
    Papa.parse("guests.csv" + cacheBuster, {
        download: true,
        header: true,
        complete: function(results) {
            currentGuest = results.data.find(row => row.ID === id);
            
            if (currentGuest) {
                updateUI(currentGuest);
            }
        }
    });
}

// Update UI and Check RSVP Status on Load
function updateUI(guest) {
    document.getElementById('guestDisplayName').innerText = guest.Name;
    document.getElementById('personalMessage').innerText = "Welcome, " + guest.Name;
    
    // IF ALREADY RSVP'D: Disable button immediately on load
    if (guest.RSVP === "Done") {
        headsValue = parseInt(guest.Heads) || 1;
        lockRSVPButton(headsValue);
    }
}

// --- HELPER: Lock Button ---
function lockRSVPButton(heads) {
    const btn = document.getElementById('rsvpBtn');
    if (btn) {
        btn.innerText = `✅ RSVP'd: ${heads} Seats`;
        btn.disabled = true;
        btn.classList.add('btn-disabled');
    }
}

// --- NAVIGATION ---
function openEvent() {
    document.getElementById('invitePage').classList.add('hidden');
    document.getElementById('eventPage').classList.remove('hidden');
    
    const music = document.getElementById('bgMusic');
    if (music) {
        music.play().catch(e => console.log("Music autoplay blocked."));
    }
}

// --- MODAL & RSVP LOGIC ---
function handleRSVP() {
    if (!currentGuest) return;
    document.getElementById('headsCount').innerText = headsValue;
    document.getElementById('rsvpModal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('rsvpModal').classList.add('hidden');
}

function adjustHeads(amount) {
    headsValue = Math.max(1, Math.min(10, headsValue + amount));
    document.getElementById('headsCount').innerText = headsValue;
}

// --- SEND TO LAMBDA ---
async function submitRSVP() {
    const confirmBtn = document.getElementById('confirmRsvpBtn');
    confirmBtn.innerText = "Saving...";
    confirmBtn.disabled = true;

    try {
        // REPLACE with your solid Lambda URL from Terraform
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
            
            // Lock the button after successful submission
            lockRSVPButton(headsValue);
            
            // Update local memory
            currentGuest.RSVP = "Done";
            currentGuest.Heads = headsValue;
        } else {
            throw new Error("Server error");
        }
    } catch (err) {
        alert("Failed to save RSVP. Please check your connection.");
        confirmBtn.innerText = "Confirm Attendance";
        confirmBtn.disabled = false;
    }
}

// --- EXTERNAL LINKS ---
function openMap() {
    window.open("https://www.google.com/maps/search/?api=1&query=Drum+Theatre+Dandenong", "_blank");
}

function openParking() {
    alert("Free parking is available at the Drum Theatre multi-deck car park after 4:00 PM.");
}