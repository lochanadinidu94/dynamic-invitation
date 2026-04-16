/**
 * RINNAH 2026 - Invitation Portal Logic
 * Handles: CSV Parsing, Music Playback, and Page Transitions
 */

// Function to handle the transition from Page 1 to Page 2
function openEvent() {
    const invitePage = document.getElementById('invitePage');
    const eventPage = document.getElementById('eventPage');
    const music = document.getElementById('bgMusic');

    // 1. Hide the Welcome Page and show the Event Page
    invitePage.classList.add('hidden');
    eventPage.classList.remove('hidden');

    // 2. Play Background Music
    // Browsers require a user click (interaction) before audio can play.
    // This button click serves as that interaction.
    if (music) {
        music.play().catch(error => {
            console.error("Music playback failed. Browser might be blocking audio:", error);
        });
    }
}

// Logic to execute as soon as the window loads
window.onload = function() {
    // 1. Get the 'id' parameter from the URL (e.g., index.html?id=4)
    const urlParams = new URLSearchParams(window.location.search);
    const guestId = urlParams.get('id');

    // 2. If an ID exists, fetch the guest details from the CSV
    if (guestId) {
        Papa.parse("guests.csv", {
            download: true,
            header: true,
            complete: function(results) {
                // Find the row where the ID matches the URL parameter
                const guest = results.data.find(row => row.ID === guestId);

                if (guest) {
                    // Update Page 1 (The elegant welcome script)
                    const firstPageName = document.getElementById('guestDisplayName');
                    if (firstPageName) {
                        firstPageName.innerText = guest.Name;
                    }

                    // Update Page 2 (The message above the title)
                    const secondPageName = document.getElementById('personalMessage');
                    if (secondPageName) {
                        secondPageName.innerText = "Welcome, " + guest.Name;
                    }
                } else {
                    console.warn("Guest ID not found in CSV. Using default text.");
                    setDefaultNames();
                }
            },
            error: function(err) {
                console.error("Error parsing CSV file:", err);
                setDefaultNames();
            }
        });
    } else {
        // Fallback if no ID is provided in the URL
        setDefaultNames();
    }
};

// Fallback function for default text
function setDefaultNames() {
    const p1 = document.getElementById('guestDisplayName');
    const p2 = document.getElementById('personalMessage');
    if (p1) p1.innerText = "Beloved Guest";
    if (p2) p2.innerText = "Welcome";
}

// Navigation Functions
function openMap() {
    // Replace with your actual Drum Theatre Google Maps link
    window.open("https://www.google.com/maps/search/?api=1&query=Drum+Theatre+Dandenong", "_blank");
}

function openParking() {
    // Standard alert or could be a link to a parking map PDF/image
    alert("Parking Information:\n\nFree parking is available at the Drum Theatre multi-deck car park (off Walker Street) after 4:00 PM on Sunday.");
}