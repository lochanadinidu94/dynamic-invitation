function openDoor() {
    document.getElementById('door-container').classList.add('door-open');
    setTimeout(() => {
        document.getElementById('invitation-page').classList.remove('hidden');
    }, 800);
}

// Logic to fetch CSV and find Guest
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
                    document.getElementById('guest-name').innerText = guest.Name;
                } else {
                    document.getElementById('guest-name').innerText = "Special Guest";
                }
            }
        });
    }
};