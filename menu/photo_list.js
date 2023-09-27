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