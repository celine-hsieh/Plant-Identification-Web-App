// Open (or create) the database
let openRequest = indexedDB.open("photoDatabase", 1);

openRequest.onupgradeneeded = function () {
    let db = openRequest.result;
    if (!db.objectStoreNames.contains('photos')) {
        db.createObjectStore('photos');
    }
};

openRequest.onerror = function () {
    console.error("Error", openRequest.error);
};

openRequest.onsuccess = function () {
    let db = openRequest.result;
    if (document.location.pathname.endsWith('photos_browse.html')) {
        displayPhotos(db);
    }
};

function displayPhotos(db) {
    let transaction = db.transaction("photos", "readonly");
    let store = transaction.objectStore("photos");
    let request = store.openCursor();

    request.onsuccess = function () {
        let cursor = request.result;
        if (cursor) {
            let img = document.createElement("img");
            img.src = cursor.value;
            document.body.appendChild(img);
            cursor.continue();
        }
    };
}

function savePhotoToDB(dataURL) {
    let db = openRequest.result;
    let transaction = db.transaction("photos", "readwrite");
    let store = transaction.objectStore("photos");
    store.add(dataURL);
}

// Assuming you have a function to handle photo capture/upload called handlePhoto
function handlePhoto(dataURL) {
    savePhotoToDB(dataURL);
    // ... other code to handle the photo ...
}

// Menu toggle functionality
document.addEventListener("DOMContentLoaded", function () {
    const menuButton = document.querySelector('.menu-container');
    const menuContent = document.querySelector('.menu-dropdown');

    menuButton.addEventListener('click', function () {
        menuContent.classList.toggle('show');
    });

    // Hide the menu when clicking outside of it
    document.addEventListener('click', function (event) {
        if (!menuButton.contains(event.target) && !menuContent.contains(event.target)) {
            menuContent.classList.remove('show');
        }
    });

    // Fetch and display photos if on photos_browse.html
    if (document.location.pathname.endsWith('photos_browse.html')) {
        fetchPhotosAndDisplay();
    }
});

function fetchPhotosAndDisplay() {
    // Fetch photos from the server or database and display them
    // This is a placeholder function and should be implemented based on your backend setup
    // For now, I'll just add a comment here.
}
