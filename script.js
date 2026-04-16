// Function to handle page transition and Music
function openEvent() {
    const invitePage = document.getElementById('invitePage');
    const eventPage = document.getElementById('eventPage');
    const music = document.getElementById('bgMusic');

    // Hide Page 1, Show Page 2
    invitePage.classList.add('hidden');
    eventPage.classList.remove('hidden');

    // Play Background Music
    if (music) {
        music.play().catch(error => {
            console.log("Audio play failed, waiting for interaction:", error);
        });
    }
}

// Logic to pull Guest ID and Name from CSV
window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const guestId = urlParams.get('id');

    if (guestId) {
        Papa.parse("guests.csv", {
            download: true,
            header: true,
            complete: function(results) {
                const guest = results.data.find(row => row.ID === guestId);
                if (guest) {
                    // Update the personal message and the input field for confirmation
                    document.getElementById('personalMessage').innerText = "Welcome, " + guest.Name;
                    document.getElementById('nameInput').value = guest.Name;
                }
            }
        });
    }
};

// Navigation Functions
function openMap() {
    window.open("https://maps.app.goo.gl/YourDrumTheatreLink", "_blank");
}

function openParking() {
    alert("Free parking is available at the Drum Theatre multi-deck car park after 4:00 PM.");
}