/**
 * RINNAH 2026 - Main Script
 */

let currentGuest = null;
let headsValue = 1;

// --- INITIALIZATION ---
window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const guestId = urlParams.get('id');

    if (guestId) {
        fetchGuestData(guestId);
    } else {
        console.log("No Guest ID found in URL.");
    }
};

async function fetchGuestData(id) {
    Papa.parse("guests.csv", {
        download: true,
        header: true,
        complete: function(results) {
            currentGuest = results.data.find(row => row.ID === id);
            
            if (currentGuest) {
                updateUIWithGuest(currentGuest);
            }
        },
        error: function(err) {
            console.error("Error loading CSV:", err);
        }
    });
}

function updateUIWithGuest(guest) {
    // Update Page 1 Name
    document.getElementById('guestDisplayName').innerText = guest.Name;
    
    // Update Page 2 Personal Greeting
    document.getElementById('personalMessage').innerText = "Welcome, " + guest.Name;
    
    // Update RSVP Button state
    if (guest.RSVP === "Done") {
        const btn = document.getElementById('rsvpBtn');
        btn.innerText = "✅ RSVP'd: " + guest.Heads + " Seats";
        headsValue = parseInt(guest.Heads);
    }
}

// --- NAVIGATION & ANIMATION ---
function openEvent() {
    const music = document.getElementById('bgMusic');
    
    document.getElementById('invitePage').classList.add('hidden');
    document.getElementById('eventPage').classList.remove('hidden');
    
    if (music) {
        music.play().catch(e => console.log("Autoplay prevented:", e));
    }
}

// --- RSVP MODAL LOGIC ---
function handleRSVP() {
    if (!currentGuest) return;
    document.getElementById('headsDisplay').innerText = headsValue;
    document.getElementById('rsvpModal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('rsvpModal').classList.add('hidden');
}

function changeHeads(delta) {
    headsValue += delta;
    if (headsValue < 1) headsValue = 1;
    if (headsValue > 10) headsValue = 10;
    document.getElementById('headsDisplay').innerText = headsValue;
}

// --- LAMBDA API CALL ---
async function submitToLambda() {
    const submitBtn = document.getElementById('submitRsvpBtn');
    
    // 1. Setup UI for loading
    submitBtn.innerText = "Saving your spot...";
    submitBtn.disabled = true;

    try {
        // IMPORTANT: Paste your output 'rsvp_api_endpoint' here
        const API_URL = "https://ajcgjpzb25.execute-api.ap-southeast-2.amazonaws.com/rsvp";

        const payload = {
            id: currentGuest.ID,
            heads: headsValue
        };

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert("Praise God! We have received your RSVP.");
            closeModal();
            
            // Update the main page button
            const mainRsvpBtn = document.getElementById('rsvpBtn');
            mainRsvpBtn.innerText = "✅ RSVP'd: " + headsValue + " Seats";
            
            // Update local memory
            currentGuest.RSVP = "Done";
            currentGuest.Heads = headsValue;
        } else {
            throw new Error("Server responded with error");
        }

    } catch (error) {
        console.error("RSVP Error:", error);
        alert("Something went wrong. Please try again or contact the organizer.");
        submitBtn.innerText = "Confirm Attendance";
        submitBtn.disabled = false;
    }
}

// --- EXTERNAL LINKS ---
function openMap() {
    window.open("https://maps.google.com/?q=Drum+Theatre+Dandenong", "_blank");
}

function openParking() {
    alert("Free parking is available at the Drum Theatre multi-deck car park (off Walker St) after 4:00 PM.");
}