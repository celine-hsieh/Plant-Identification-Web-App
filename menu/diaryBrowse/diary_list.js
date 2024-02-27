const recipeLink = document.getElementById('recipe');
const favoriteLink = document.getElementById('favorite');
const diaryLink = document.getElementById('diary');
const homeLink = document.getElementById('home');
const testLink = document.getElementById('test');
const userLink = document.getElementById('user');
const backButton = document.getElementById('backButton');
const newDiaryContainer = document.getElementById('newDiaryContainer');
const diariesContainer = document.querySelector('.diaries-container');
const token = sessionStorage.getItem('token');
const addDiaryButton = document.getElementById('addDiaryButton');
const sortSelector = document.getElementById('sortSelector');
const diaryDetailContainer = document.getElementById('diary-detail-container');
let already = 0;
let currentDiaryData = null;

const translation = {
    en: {
        title: "Diary Browse",
        recipe: "Recipe",
        favorite: "Favorite",
        test: "Test",
        diary: "Diary",
        login: "login",
        logout: "logout"
    },
    zh: {
        title: "日 誌",
        recipe: "食譜",
        test: "測驗",
        favorite: "收藏",
        diary: "日誌",
        login: "登入",
        logout: "登出"
    }
};

function getQueryParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

const lang = getQueryParam('lang');
console.log(lang);
recipeLink.href = `../recipeBrowse/recipe_browse.html?lang=${lang}`;
favoriteLink.href = `../recipeFavorites/recipe_favorites.html?lang=${lang}`;
diaryLink.href = `diary_browse.html?lang=${lang}`;
test.href = `https://docs.google.com/forms/d/e/1FAIpQLSd5yOWwnIV5LnHnplNdY916sBVMFxDhbM_ds6TtQojalfSc9w/viewform?usp=sf_link`;
homeLink.href = `../../index.html?lang=${lang}`;
userLink.href = `../..?lang=${lang}`;

if (lang) {
    // Setting text content for various elements based on the selected language
    document.getElementById('title').textContent = translation[lang].title;
    document.getElementById('recipe').textContent = translation[lang].recipe;
    document.getElementById('favorite').textContent = translation[lang].favorite;
    document.getElementById('test').textContent = translation[lang].test;
    document.getElementById('diary').textContent = translation[lang].diary;

    // Retrieve JWT token from session storage
    const token = sessionStorage.getItem('token');
    console.log(token);

    // Toggle user element text based on token presence
    const userText = token ? translation[lang].logout : translation[lang].login;
    document.getElementById('user').textContent = userText;
}

// Menu toggle functionality
document.addEventListener('DOMContentLoaded', function () {
    const menuButton = document.querySelector('.menu-button');
    const menuDropdown = document.querySelector('.menu-dropdown');
    menuDropdown.style.display = 'none';
    menuButton.addEventListener('click', function () {
        if (menuDropdown.style.display === 'none') {
            menuDropdown.style.display = 'block';
            menuButton.textContent = ' ✕ ';
        } else {
            menuDropdown.style.display = 'none';
            menuButton.textContent = '☰';
        }
    });
});

// Handle changes in the sorting selection
document.addEventListener('DOMContentLoaded', () => {
    sortSelector.addEventListener('change', (event) => {
        fetchDiaries(event.target.value);
    });
    fetchDiaries('asc');
});


// Handle new Diary
document.addEventListener('DOMContentLoaded', function () {
    const newDiaryImage = document.getElementById('newDiaryImage');
    const imagePreview = document.getElementById('imagePreview');
    const newDiaryText = document.getElementById('newDiaryText');
    const newDiaryDate = document.getElementById('newDiaryDate');
    const weatherSelector = document.getElementById('weatherSelector');

    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    newDiaryDate.value = today;

    // Initially disable the add diary button
    addDiaryButton.disabled = true;
    addDiaryButton.style.backgroundColor = '#ccc';  // Grey background to indicate disabled state

    // Function to update the status of the add diary button
    function updateButtonStatus() {

        if (newDiaryText.value && newDiaryImage.files.length > 0) {
            addDiaryButton.disabled = false;
            addDiaryButton.style.backgroundColor = '#e8a978'; // Background color when enabled
        } else {
            addDiaryButton.disabled = true;
            addDiaryButton.style.backgroundColor = '#ccc'; // Grey background when disabled
        }
    }

    // Event listener for new diary click
    document.getElementById('newDiary').addEventListener('click', function () {
        backButton.style.display = 'block'; // Show the back button
        newDiaryContainer.classList.toggle('active');
        newDiary.style.display = 'none';
        addDiaryButton.style.display = 'block';
        if (already == 1) {
            newDiaryDate.value = ''; // 日期输入框
            newDiaryText.value = ''; // 文本输入框
            weatherSelector.value = ''; // 天氣输入框
            newDiaryImage.value = ''; // 圖片输入框
            imagePreview.style.display = 'none';
            already = 0;
        }
    });

    // Add Diary Button
    addDiaryButton.addEventListener('click', function () {
        // Check if both text and image are provided
        if (newDiaryText.value && newDiaryImage.files.length > 0) {
            const diaryDate = newDiaryDate.value;
            const diaryText = newDiaryText.value;
            const diaryImage = newDiaryImage.files[0];
            const weatherText = document.getElementById('weatherSelector').value;

            // Ensure all required fields are filled: text, image, and weather
            if (diaryText && diaryImage && weatherText !== '') {
                createDiary(diaryDate, diaryText, diaryImage, weatherText);
            } else {
                alert("請確認已填寫文字、圖片並選擇天氣。");
            }

            // Toggle visibility and active state of diary elements
            if (newDiaryContainer.classList.contains('active')) {
                newDiaryContainer.classList.remove('active');
                newDiary.style.display = 'block';
            }

            // Hide the add diary button and back button after adding a diary entry
            addDiaryButton.style.display = 'none';
            backButton.style.display = 'none';
        }
    });

    // Event listener for text input in the new diary entry
    newDiaryText.addEventListener('input', updateButtonStatus);

    // Event listener for image selection/change in the new diary entry
    newDiaryImage.addEventListener('change', function () {
        if (this.files && this.files[0]) {
            const reader = new FileReader();

            // Set up a callback for when the file is read
            reader.onload = function (e) {
                // Display the selected image in the image preview element
                imagePreview.src = e.target.result;
                imagePreview.style.display = 'block';
            };

            // Read the selected file as a data URL to display as an image and Update the button status.
            reader.readAsDataURL(this.files[0]);
            updateButtonStatus();
        }
    });
});


// Cancel the long-press effect 
document.addEventListener('click', (e) => {
    // Check if the clicked element is not a delete button
    if (!e.target.classList.contains('delete-btn')) {
        const shiftedEntries = document.querySelectorAll('.diary-entry.shifted');

        // Iterate over each shifted diary entry
        shiftedEntries.forEach(entry => {
            const deleteBtn = entry.querySelector('.delete-btn');

            // If the delete button is visible, hide it and reset the entry's position
            if (deleteBtn.style.display === 'block') {
                deleteBtn.style.display = 'none'; // Hide the delete button
                entry.classList.remove('shifted'); // Reset the diary entry's position
            }
        });
    }
});


// Function to handle the long-press effect (long-press to show cancel button)
function setupDiaryEntryEvents(diaryEntry, diaryId) {
    let pressTimer;
    let pressInterval;
    const LONG_PRESS_DURATION = 250; // Long press duration threshold
    const deleteBtn = diaryEntry.querySelector('.delete-btn');


    // Function to handle the start of a long press
    function handlePressStart() {
        let pressDuration = 0;
        pressTimer = new Date().getTime(); // Record the start time of the press

        // Update time every 100 milliseconds
        pressInterval = setInterval(() => {
            pressDuration += 100;

            // If the press duration exceeds the long press threshold
            if (pressDuration >= LONG_PRESS_DURATION) {
                clearInterval(pressInterval); // Stop the timer
                deleteBtn.style.display = 'block'; // Show the delete button
                diaryEntry.classList.add('shifted'); // Shift the diary entry to the right
            }
        }, 100);
    }

    // Function to handle the end of a long press
    function handlePressEnd() {
        clearInterval(pressInterval); // Stop the timer
    }

    // Add mouse and touch event listeners
    diaryEntry.addEventListener('mousedown', handlePressStart);
    diaryEntry.addEventListener('mouseup', handlePressEnd);
    diaryEntry.addEventListener('touchstart', handlePressStart);
    diaryEntry.addEventListener('touchend', handlePressEnd);

    // Click event for the delete button
    deleteBtn.addEventListener('click', () => {
        confirmDeletion(diaryId); // Invoke the deletion logic
    });
}

// Function to create a diary
function createDiary(date, text, imageFile, weatherText) {
    const formData = new FormData();
    console.log('date', date);

    // Append text data to the FormData object
    formData.append('date', date)
    formData.append('text', text);
    formData.append('weatherText', weatherText); // 添加天气字段
    if (imageFile) {
        formData.append('image', imageFile);
    }


    // Perform the POST request to the server
    fetch('/diary', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token
        },
        body: formData // Send FormData as the request body
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Network response was not ok.');
            }
        })
        .then(data => {
            console.log('Diary created:', data);
            alert("日誌新增成功!")
            refreshDiaryList();
            already = 1;
        })
        .catch(error => {
            console.error('Error creating diary:', error);
        });
}

// Function to display login
function showLoginPrompt() {
    const diariesContainer = document.getElementById('diaries-container');
    diariesContainer.innerHTML = `
        <div class="login-prompt">
            <p>請先登入後查看</p>
            <button id="redirectToLogin" class="login-button">登入</button>
        </div>
    `;

    document.getElementById('redirectToLogin').addEventListener('click', function () {
        window.location.href = '../../'; // Redirect to the login page when clicked
    });
}

// Function to fetch and display diaries
function fetchDiaries(sortOrder) {
    const token = sessionStorage.getItem('token'); // Retrieve the JWT token from session storage
    console.log(token);

    // Check if the token is not present
    if (!token) {
        document.getElementById('user').textContent = translation[lang].login;
        showLoginPrompt();
        return;
    } else {
        document.getElementById('user').textContent = translation[lang].logout;
    }

    // Perform the fetch request to get diaries
    fetch('/diary?sort=' + sortOrder, {
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
        .then(response => response.json())
        .then(diaries => {
            diariesContainer.innerHTML = ''; // Clear any existing content

            // Iterate over each diary entry and display it
            diaries.forEach(diary => {
                displayDiary(diary); // Function to display each diary entry
            });
        })
        .catch(error => {
            console.error('Error:', error);
            // Show login
            showLoginPrompt();
            document.getElementById('user').textContent = translation[lang].login;
        });
}

// Function to display each diary
function displayDiary(diary) {
    // Create a new div element for the diary entry
    const diaryEntry = document.createElement('div');
    diaryEntry.className = 'diary-entry';
    diaryEntry.id = `diary-${diary._id}`; // Unique ID for each diary entry

    // Create a slide container for the diary content
    const slideContainer = document.createElement('div');
    slideContainer.className = 'slide-container';

    // Set the inner HTML of the slide container, formatting the creation date
    slideContainer.innerHTML = `
        <h3>${new Date(diary.createdAt).toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
    `;

    // Create a 'read more' button for the diary entry
    const readMoreBtn = document.createElement('button');
    readMoreBtn.innerText = '查看更多';
    readMoreBtn.className = 'read-more-btn';
    readMoreBtn.onclick = function () {
        showDiaryDetail(diary);  // Function to show more details of the diary
    };

    // Append the read more button to the slide container and the container to the diary entry
    slideContainer.appendChild(readMoreBtn);
    diaryEntry.appendChild(slideContainer);

    // Create a delete button for the diary entry
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.innerText = '✕';
    diaryEntry.appendChild(deleteBtn);

    // Append the diary entry to the main diaries container
    diariesContainer.appendChild(diaryEntry);
    setupDiaryEntryEvents(diaryEntry, diary._id); // Setup event listeners for the diary entry
}

// Function to confirm the deletion of a diary entry
function confirmDeletion(diaryId) {
    if (confirm("確定要刪除這條日誌嗎(不可復原)?")) {
        deleteDiary(diaryId); // 确认删除
    }
}

// Function to delete a diary entry
function deleteDiary(diaryId) {
    const token = sessionStorage.getItem('token'); // Retrieve the JWT token from session storage
    if (!token) {
        alert('使用者未登入');
        return;
    }

    // Perform a DELETE request to delete the diary entry
    fetch(`/diary/${diaryId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('删除失败');
            }
            return response.json();
        })
        .then(() => {
            // Find and remove the diary entry from the DOM
            const diaryEntry = document.getElementById(`diary-${diaryId}`);
            if (diaryEntry) {
                diaryEntry.remove();
            }
            alert('刪除成功');
        })
        .catch(error => {
            console.error('Error deleting diary:', error);
            alert(error.message);
        });
}

// Function to display detailed information of a diary entry
function showDiaryDetail(diary) {
    currentDiaryData = diary;
    const diaryDetailContainer = document.getElementById('diary-detail-container');

    // Format the date to 'YYYY-MM-DD'
    const date = new Date(diary.createdAt);
    const formattedDate = date.getFullYear() + '-' +
        ('0' + (date.getMonth() + 1)).slice(-2) + '-' +
        ('0' + date.getDate()).slice(-2);

    // Set the inner HTML of the diary details container
    diaryDetailContainer.innerHTML = `
        <div id="dateDisplay">日期：${formattedDate}</div>
        <div id="weatherDisplay">天氣：${diary.weatherText}</div>
        <div id="diaryTextEdit" contenteditable="false">${diary.text}</div>
        ${diary.imageUrl ? `<img src="../../${diary.imageUrl}" alt="日志图片" id="diaryImage" style="max-width: 100%;">` : ''}
        <input type="file" id="diaryImageEdit" style="display: none;">
        <button id="editSaveButton">編輯</button>
    `;

    // Add event listener to the edit/save button
    const editSaveButton = diaryDetailContainer.querySelector('#editSaveButton');
    editSaveButton.addEventListener('click', (event) => handleEditSaveButtonClick(diary._id, event));

    // Animate and update the display of various containers and buttons
    diariesContainer.classList.add('slide-out-left');
    setTimeout(() => {
        diariesContainer.style.display = 'none';
        backButton.style.display = 'block';
        sortSelector.style.display = 'none';
        newDiary.style.display = 'none';
        diaryDetailContainer.style.display = 'block';
    }, 1000);
}

// Function to handle Edit Save Button
function handleEditSaveButtonClick(diaryId, event) {
    const token = sessionStorage.getItem('token'); // Retrieve the JWT token from session storage
    if (event.target && event.target.id === 'editSaveButton') {
        const isEditing = document.getElementById('diaryTextEdit').contentEditable === "true";

        if (!isEditing) {
            // Enable editing mode
            enableEditing();
            event.target.textContent = '保存';
        } else {
            // Save changes
            const editedText = document.getElementById('diaryTextEdit').innerText;
            const editedImage = document.getElementById('diaryImageEdit').files[0];
            const editedDate = document.getElementById('diaryDateEdit').value;
            const editedWeather = document.getElementById('weatherSelector').value;

            const formData = new FormData();
            formData.append('text', editedText);
            formData.append('date', editedDate);
            formData.append('weather', editedWeather);
            if (editedImage) {
                formData.append('image', editedImage);
            }

            // Send PUT request to update the diary entry
            fetch(`/diary/${diaryId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': 'Bearer ' + token
                },
                body: formData
            })
                .then(response => response.json())
                .then(updatedDiary => {
                    console.log('Diary updated:', updatedDiary);
                    // Update the display on the frontend
                    document.getElementById('dateDisplay').innerText = '日期：' + editedDate;
                    document.getElementById('weatherDisplay').innerText = '天氣：' + editedWeather;
                    document.getElementById('diaryTextEdit').innerText = updatedDiary.text;
                    refreshDiaryList();
                })
                .catch(error => {
                    console.error('Error updating diary:', error);
                });

            // Disable editing mode
            disableEditing();
            event.target.textContent = '編輯';
        }
    }
}

// Function to enable edit
function enableEditing() {
    // Enable text editing
    document.getElementById('diaryTextEdit').contentEditable = "true";

    // Enable date editing
    const dateDisplay = document.getElementById('dateDisplay');
    let currentDate = dateDisplay.innerText.replace('日期：', '').trim();

    dateDisplay.innerHTML = `日期：<input type="date" id="diaryDateEdit" value="${currentDate}">`;


    // Enable weather editing
    const weatherDisplay = document.getElementById('weatherDisplay');
    const currentWeather = weatherDisplay.innerText.replace('天氣：', '').trim();
    const weatherOptions = {
        "": "選擇天氣",
        "☀️大晴天": "☀️大晴天",
        "🌤️晴天": "🌤️晴天",
        "⛅晴時多雲": "⛅晴時多雲",
        "☁️陰天": "☁️陰天",
        "🌦️晴時多雲偶陣雨": "🌦️晴時多雲偶陣雨",
        "🌧️雨天": "🌧️雨天",
        "⛈️雷雨": "⛈️雷雨"
    };

    // Construct the weather select dropdown HTML
    let weatherSelectHTML = `<select id="weatherSelector">`;
    for (let key in weatherOptions) {
        weatherSelectHTML += `<option value="${key}" ${currentWeather === weatherOptions[key] ? 'selected' : ''}>${weatherOptions[key]}</option>`;
    }
    weatherSelectHTML += `</select>`;


    // Include a hidden input to store the selected weather value
    let hiddenInputHTML = `<input type="hidden" id="diaryWeatherEdit" value="${currentWeather}">`;
    weatherDisplay.innerHTML = `天氣：${weatherSelectHTML}${hiddenInputHTML}`;


    // Display and setup the image input for editing
    const imageInput = document.getElementById('diaryImageEdit');
    imageInput.style.display = 'block';
    imageInput.addEventListener('change', handleImageChange);
}

// Function to update the weather value
function updateWeatherValue() {
    const selectedWeather = document.getElementById('weatherSelector').value;
    document.getElementById('diaryWeatherEdit').value = selectedWeather;
}

// Function to handle image input change
function handleImageChange(event) {
    // Check if there is a file selected
    if (event.target.files && event.target.files[0]) {
        const file = event.target.files[0];
        const reader = new FileReader();

        // Update or create the image preview
        reader.onload = function (e) {
            const imageElement = document.getElementById('diaryImage');
            if (imageElement) {
                imageElement.src = e.target.result; // If an image element for preview already exists, update its source
            } else {
                // Otherwise, create a new image element for preview
                const newImage = document.createElement('img');
                newImage.id = 'diaryImage';
                newImage.src = e.target.result;
                newImage.style.maxWidth = '100%';

                // Insert the new image at the beginning of the diary detail container
                const container = document.getElementById('diary-detail-container');
                container.insertBefore(newImage, container.firstChild);
            }
        }

        reader.readAsDataURL(file); // Read the selected file as a Data URL for display
    }
}

// Function to disable edit
function disableEditing() {
    // Disable text editing
    document.getElementById('diaryTextEdit').contentEditable = "false";

    // Disable date editing
    const diaryDateEdit = document.getElementById('diaryDateEdit');
    const dateDisplay = document.getElementById('dateDisplay');
    dateDisplay.innerHTML = `日期：${diaryDateEdit.value}`;

    // Disable weather editing
    const diaryWeatherEdit = document.getElementById('diaryWeatherEdit');
    const weatherDisplay = document.getElementById('weatherDisplay');
    weatherDisplay.innerHTML = `天氣：${diaryWeatherEdit.value}`;

    // Disable image editing
    document.getElementById('diaryImageEdit').style.display = 'none';
}

// Function to refresh the list of diary entries
function refreshDiaryList() {
    // Clear the existing diary entries from the container
    diariesContainer.innerHTML = '';

    // Fetch the updated list of diary entries and display them
    fetch('/diary', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + sessionStorage.getItem('token')
        }
    })
        .then(response => response.json())
        .then(diaries => {
            diaries.forEach(diary => {
                displayDiary(diary);
            });
        })
        .catch(error => {
            console.error('Error fetching diaries:', error);
        });
}

// Handle 'Back' button click
document.getElementById('backButton').addEventListener('click', function () {
    // Check if the new diary container is active and update its state
    if (newDiaryContainer.classList.contains('active')) {
        newDiaryContainer.classList.remove('active');
        sortSelector.style.display = 'block';
        newDiary.style.display = 'block';
        addDiaryButton.style.display = 'none';
    }

    backButton.style.display = 'none';

    // Handle the slide-out-left class for the diaries container
    if (diariesContainer.classList.contains('slide-out-left')) {
        setTimeout(() => {
            diariesContainer.classList.remove('slide-out-left'); // Adjust the class name if different
        }, 1); // A short delay to ensure the display change is applied first
        sortSelector.style.display = 'block';
        newDiary.style.display = 'block';
        addDiaryButton.style.display = 'none';

    }
    // Show the diary list container
    diariesContainer.style.display = 'block'; // Show the diary list container

    // Hide the "Back" button and the diary details container
    backButton.style.display = 'none';
    diaryDetailContainer.style.display = 'none';
});
