// Get elements
const cameraButton = document.getElementById('cameraButton');
const browseButton = document.getElementById('browseButton');
const previewImage = document.getElementById('previewImage');
const resultDiv = document.getElementById('result');

// Create hidden file input elements to trigger the camera and photo browser
const cameraInput = document.createElement('input');
cameraInput.type = 'file';
cameraInput.accept = 'image/*';
cameraInput.capture = 'environment'; // Prefer the rear camera

const browseInput = document.createElement('input');
browseInput.type = 'file';
browseInput.accept = 'image/*';

// Listen for camera button click event
cameraButton.addEventListener('click', function () {
  cameraInput.click();
});

// Listen for browse button click event
browseButton.addEventListener('click', function () {
  browseInput.click();
});

// Common function to handle photo selection
function handlePhotoSelection(file) {
  if (file) {
    const objectURL = URL.createObjectURL(file);
    previewImage.src = objectURL;
    document.getElementById('previewText').style.display = 'block';
    previewImage.style.display = 'block';
    resultDiv.style.display = 'block'; // Display the result div
    cameraButton.textContent = '📷 Retake Photo'; // Update button text

    // Save the image to localStorage
    let photos = JSON.parse(localStorage.getItem("photos")) || [];
    photos.push(objectURL);
    localStorage.setItem("photos", JSON.stringify(photos));

    // TODO: Send the photo to the backend for recognition
    sendImageToServer(file);
  }
}

// Listen for changes in the camera input element
cameraInput.addEventListener('change', function () {
  handlePhotoSelection(cameraInput.files[0]);
});

// Listen for changes in the browse input element
browseInput.addEventListener('change', function () {
  handlePhotoSelection(browseInput.files[0]);
});

// Function to send the photo to the backend for recognition
function sendImageToServer(file) {
  const formData = new FormData();
  formData.append('photo', file);

  fetch('/api/recognize', {
    method: 'POST',
    body: formData
  })
    .then(response => response.json())
    .then(data => {
      if (data && data.result) {
        resultDiv.textContent = 'Result: ' + data.result;
      } else {
        resultDiv.textContent = 'Recognition failed, please try again.';
      }
    })
    .catch(error => {
      console.error('Error:', error);
      resultDiv.textContent = 'An error occurred, please try again.';
    });
}
