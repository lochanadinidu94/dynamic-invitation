let currentGuest = null;
let headsValue = 1;

// 1. On Load: Fetch Guest ID from URL and Load Data
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
    const cacheBuster = "?v=" + Date.now();
    Papa.parse("guests.csv" + cacheBuster, {
        download: true,
        header: true,
        complete: function(results) {
            // Match ID from CSV
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
    
    // Check if Guest has already RSVP'd
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
    }
}

// 2. Navigation Functions
window.openEvent = function() {
    document.getElementById('invitePage').classList.add('hidden');
    document.getElementById('eventPage').classList.remove('hidden');
    const music = document.getElementById('bgMusic');
    const icon = document.getElementById('muteIcon');
    
    if (music) {
        music.play().then(() => {
            icon.innerText = "🔊"; // Set to playing icon
        }).catch(e => {
            console.log("Autoplay blocked by browser.");
            icon.innerText = "🔇"; // Set to muted if browser blocks it
        });
    }
};

// 3. RSVP Modal Functions
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

// 4. Lambda Submission
window.submitToLambda = async function() {
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
        } else {
            throw new Error("Server Error");
        }
    } catch (err) {
        console.error(err);
        alert("Could not save RSVP. Please try again.");
        confirmBtn.innerText = "Confirm Attendance";
        confirmBtn.disabled = false;
    }
};

// 5. External Links
window.openMap = function() { window.open("https://www.google.com/maps/search/?api=1&query=Drum+Theatre+Dandenong", "_blank"); };
window.openParking = function() { window.open("https://www.google.com/maps/search/?api=1&query=parking+near+Drum+Theatre+Dandenong", "_blank"); };

window.toggleMusic = function() {
    const music = document.getElementById('bgMusic');
    const icon = document.getElementById('muteIcon');
    
    if (music.paused) {
        music.play();
        icon.innerText = "🔊";
    } else {
        music.pause();
        icon.innerText = "🔇";
    }
};