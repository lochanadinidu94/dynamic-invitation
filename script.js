function openDoor() {
    document.getElementById('door-container').classList.add('door-open');
    setTimeout(() => {
        document.getElementById('invitation-page').classList.remove('hidden');
    }, 1000);
}

window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const guestId = urlParams.get('id');

    // Use current path to find CSV
    Papa.parse("guests.csv", {
        download: true,
        header: true,
        complete: function(results) {
            const guest = results.data.find(row => row.ID === guestId);
            if (guest) {
                document.getElementById('guest-name').innerText = guest.Name;
            } else {
                document.getElementById('guest-name').innerText = "Beloved Guest";
            }
        },
        error: function() {
            document.getElementById('guest-name').innerText = "Special Guest";
        }
    });
};