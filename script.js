// 1. Element References
const cameraButton = document.getElementById('cameraButton');
const browseButton = document.getElementById('browseButton');
const previewImage = document.getElementById('previewImage');
const resultDiv = document.getElementById('result');
const languageSwitcher = document.getElementById('languageSwitcher');
const [recipeLink, favoriteLink, diaryLink, userLink, testLink] =
  ['recipe', 'favorite', 'diary', 'user', 'test'].map(id => document.getElementById(id));


// 2. Constants and Global Variables
const token = sessionStorage.getItem('token');
const secretKey = 'ncku';
const translations = {
  en: {
    title: "FruitVeg Culinary Compass",
    cameraButton: "📷 Open Camera",
    browseButton: "📂 Browse Photos",
    previewText: "Preview of fruit or vegetable",
    result: "Awaiting recognition...",
    generateRecipe: "Generate Recipe",
    backButton: "⬅️ Back",
    resultPrefix: "Result: ",
    retake: '📷 Retake Photo',
    recipe: "Recipe",
    favorite: "Favorite",
    diary: "Diary",
    test: "Test",
    login: "login",
    logout: "logout",
    recipeContainer: "Recipes are being generated...",
    errorText: 'An error occurred, please try again.',
    generateImage: "Generate Image",
    saveRecipe: "Save",
    imageContainer: "Images are being generated...",
    alertA: "Please log in.",
    alertB: "Save successful.",
    alertC: "Recipe already exists.",
    regenerate: "⬅️ regenerate",
  },
  zh: {
    title: "蔬 果 食 譜 雷 達",
    cameraButton: "📷 開啟相機",
    browseButton: "📂 瀏覽相簿",
    previewText: "預覽水果或蔬菜",
    result: "等待辨識...",
    generateRecipe: "生成食譜",
    backButton: "⬅️ 返回",
    resultPrefix: "結果: ",
    retake: '📷 重開相機',
    recipe: "食譜",
    favorite: "收藏",
    diary: "日誌",
    test: "測驗",
    login: "登入",
    logout: "登出",
    recipeContainer: "正在生成食譜...",
    errorText: "無法辨識，請重試",
    generateImage: "生成圖片",
    saveRecipe: "儲存食譜",
    imageContainer: "正在生成圖像...",
    alertA: "請先登入",
    alertB: "儲存成功",
    alertC: "食譜已存在",
    regenerate: "⬅️ 重新生成",
  }
};
let currentLanguage = getQueryParam('lang');
let generatedRecipe = '';
let recipeName = '', material = '', procedure = '';
switchLanguage(currentLanguage)


// 3. Utility Functions
function getQueryParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

function isJwtExpired(token) {
  if (!token) {
    return true; // No token, assume it's expired
  }

  // Decode the token
  const payloadBase64 = token.split('.')[1];
  const decodedJson = atob(payloadBase64);
  const decoded = JSON.parse(decodedJson);

  // Get current time and JWT expiration time
  const currentTime = Date.now() / 1000; // in seconds
  const expTime = decoded.exp;

  // Check if current time is greater than expiration time
  return currentTime > expTime;
}

function switchLanguage(lang) {
  // currentLanguage = lang; // Save the current language
  document.getElementById('title').textContent = translations[lang].title;
  document.getElementById('cameraButton').textContent = translations[lang].cameraButton;
  document.getElementById('browseButton').textContent = translations[lang].browseButton;
  document.getElementById('previewText').textContent = translations[lang].previewText;
  document.getElementById('result').textContent = translations[lang].result;
  document.getElementById('generateRecipe').textContent = translations[lang].generateRecipe;
  document.getElementById('backButton').textContent = translations[lang].backButton;
  document.getElementById('recipe').textContent = translations[lang].recipe;
  document.getElementById('favorite').textContent = translations[lang].favorite;
  document.getElementById('diary').textContent = translations[lang].diary;
  document.getElementById('test').textContent = translations[lang].test;
  document.getElementById('recipeContainer').textContent = translations[lang].recipeContainer;
  document.getElementById('generateImage').textContent = translations[lang].generateImage;
  document.getElementById('saveRecipe').textContent = translations[lang].saveRecipe;
  document.getElementById('imageContainer').textContent = translations[lang].imageContainer;
  document.getElementById('regenerate').textContent = translations[lang].regenerate;

  const token = sessionStorage.getItem('token'); // Or however you store your token
  const expired = isJwtExpired(token);
  console.log(expired);

  if (expired) {
    document.getElementById('user').textContent = translations[lang].login;
  } else {
    document.getElementById('user').textContent = translations[lang].logout;
  }
}

recipeLink.href = `./menu/recipeBrowse/recipe_browse.html?lang=${currentLanguage}`;
favoriteLink.href = `./menu/recipeFavorites/recipe_favorites.html?lang=${currentLanguage}`;
diaryLink.href = `./menu/diaryBrowse/diary_browse.html?lang=${currentLanguage}`;
testLink.href = `https://docs.google.com/forms/d/e/1FAIpQLSd5yOWwnIV5LnHnplNdY916sBVMFxDhbM_ds6TtQojalfSc9w/viewform?usp=sf_link`;
userLink.href = `../..?lang=${currentLanguage}`;

// Get the language switcher dropdown element
document.addEventListener('DOMContentLoaded', () => {
  const languageSwitcher = document.getElementById('languageSwitcher');
  const langParam = getQueryParam('lang');

  // Set the language switcher's value based on the URL parameter
  if (langParam && languageSwitcher) {
    languageSwitcher.value = langParam;
  }

  // Event listener for language change
  languageSwitcher.addEventListener('change', (e) => {
    switchLanguage(e.target.value);
    currentLanguage = e.target.value;
    // console.log(currentLanguage);

    // Update href attributes for links based on the selected languag
    recipeLink.href = `./menu/recipeBrowse/recipe_browse.html?lang=${currentLanguage}`;
    favoriteLink.href = `./menu/recipeFavorites/recipe_favorites.html?lang=${currentLanguage}`;
    diaryLink.href = `./menu/diaryBrowse/diary_browse.html?lang=${currentLanguage}`;
    test.href = `https://docs.google.com/forms/d/e/1FAIpQLSd5yOWwnIV5LnHnplNdY916sBVMFxDhbM_ds6TtQojalfSc9w/viewform?usp=sf_link`;
  });
});

// Create hidden file input elements to trigger the camera and photo browser
const cameraInput = document.createElement('input');
cameraInput.type = 'file';
cameraInput.accept = 'image/*';
cameraInput.capture = 'environment'; // Prefer the rear camera

const browseInput = document.createElement('input');
browseInput.type = 'file';
browseInput.accept = 'image/*';

// camera button
cameraButton.addEventListener('click', function () {
  cameraInput.click();
});

// browse button
browseButton.addEventListener('click', function () {
  browseInput.click();
});

// handle photo selection
function handlePhotoSelection(file) {
  if (file) {
    const objectURL = URL.createObjectURL(file);
    previewImage.src = objectURL;
    document.getElementById('previewText').style.display = 'block';
    previewImage.style.display = 'block';
    resultDiv.style.display = 'block'; // Display the result div
    cameraButton.textContent = translations[languageSwitcher.value].retake;
    resultDiv.textContent = translations[languageSwitcher.value].result;


    // Save the image to localStorage
    let photos = JSON.parse(localStorage.getItem("photos")) || [];
    photos.push(objectURL);
    localStorage.setItem("photos", JSON.stringify(photos));

    // Send the photo to the backend for recognition
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

// send the photo to the backend for recognition
function sendImageToServer(file) {
  const formData = new FormData();
  formData.append('photo', file);

  // First, save the image
  fetch('/api/save-image', {
    method: 'POST',
    body: formData
  })
    .then(response => response.json())
    .then(data => {
      if (data && data.success) {
        console.log('Image saved successfully on the server.');

        // Now, recognize the image
        return fetch('/api/recognize', {
          method: 'POST',
          body: formData,
          headers: {
            'Current-Language': currentLanguage
          }
        });
      } else {
        throw new Error('Failed to save the image on the server.');
      }
    })
    .then(response => response.json())
    .then(data => {
      if (data && data.result) {
        resultDiv.innerHTML = translations[languageSwitcher.value].resultPrefix + data.result;
        // If recognition is successful, show the generate recipe button
        document.getElementById('generateRecipe').style.display = 'block';
        localStorage.setItem('ingredient', data.ingredient);
      } else {
        throw new Error('Recognition failed, please try again.');
      }
    })
    .catch(error => {
      console.error('Error:', error);
      resultDiv.textContent = `${translations[languageSwitcher.value].errorText} - ${error.message}`;
    });
}

// 'Back button' click
document.getElementById('backButton').addEventListener('click', function () {
  // Remove the slide-out-left animation from the container
  document.getElementById('main').style.display = 'block';
  const main = document.querySelector('.main');
  main.classList.remove('slide-out-left');

  // Hide the "Back" button
  document.getElementById('backButton').style.display = 'none';
  document.getElementById('recipeContainer').style.display = 'none';
  document.getElementById('saveRecipe').style.display = 'none';
  document.getElementById('generateImage').style.display = 'none';
});


// 'Regenerate' button click
document.getElementById('regenerate').addEventListener('click', function () {
  const imageContainer = document.getElementById('imageContainer');

  // Remove all child elements of imageContainer
  while (imageContainer.firstChild) {
    imageContainer.removeChild(imageContainer.firstChild);
  }

  document.getElementById('imageContainer').style.display = 'none';
  document.getElementById('main').style.display = 'block';
  const main = document.querySelector('.main');
  main.classList.remove('slide-out-left');
  const generateRecipe = document.querySelector('.recipeContainer');
  generateRecipe.classList.remove('slide-out-left');

  // Hide the "Back" button
  document.getElementById('regenerate').style.display = 'none';
  document.getElementById('recipeContainer').style.display = 'none';
});


// 'Generate Recipe' button click
document.getElementById('generateRecipe').addEventListener('click', function () {
  // Apply the slide out animation to the container
  document.querySelector('.main').classList.add('slide-out-left');

  setTimeout(() => {
    document.getElementById('backButton').style.display = 'block';
    document.getElementById('main').style.display = 'none';
    document.getElementById('recipeContainer').style.display = 'block';
    document.getElementById('recipeContainer').innerText = translations[languageSwitcher.value].recipeContainer;
    document.getElementById('generateRecipe').style.display = 'none';

    const ingredient = encodeURIComponent(localStorage.getItem('ingredient'));
    const language = languageSwitcher.value;

    // Fetch and process the recipe
    fetch(`/api/generate-recipe?ingredient=${ingredient}&language=${language}`)
      .then(response => response.json())
      .then(data => {
        if (data && data.recipe) {
          generatedRecipe = data.recipe;
          const lines = data.recipe.split('\n'); // Assuming lines  are separated by periods
          let listContent = ''; //'<ul>';
          let sectionStarted = false;
          recipeName = lines[0].trim();

          let currentSection = '';

          // formatting the recipe for display "listContent"
          lines.forEach((line, index) => {
            if (index === 0) { // First line is the recipe name
              listContent += `<strong>${line.trim()}</strong><br><br>`;
            } else if (line.trim().match(/^\d/)) { // Line starts with a number
              if (!sectionStarted) {
                sectionStarted = true;
              }
              listContent += `${line.trim()}<br>`;
            } else {
              if (sectionStarted && line.trim() === '') {
                listContent += '<br>'; // Add a break after a section ends
                sectionStarted = false;
              } else {
                listContent += `${line.trim()}<br>`;
              }
            }
          });

          // handles extracting the recipe name, material, and procedure 
          lines.forEach((line, index) => {
            if (index === 0) { // First line is the recipe name
              recipeName = line.includes(':') ? line.split(':')[1].trim() : line.trim();
            } else if (languageSwitcher.value === 'zh') {
              if (line.includes('食材:')) currentSection = 'material';
              else if (line.includes('步驟:')) currentSection = 'procedure';
              else if (currentSection && line.trim().match(/^\d/)) {
                const text = line.trim().replace(/^\d+\./, '').trim();
                if (currentSection === 'material') material += text + '\n';
                else if (currentSection === 'procedure') procedure += text + '\n';
              }
            } else if (languageSwitcher.value === 'en') {
              if (line.includes('Ingredients:')) currentSection = 'material';
              else if (line.includes('Steps:')) currentSection = 'procedure';
              else if (currentSection === 'material' && line.trim() !== '') {
                // Remove the hyphen or numbers from the beginning and store the line in material
                const text = line.trim().replace(/^- /, '').replace(/^\d+\. /, '').trim();
                material += text + '\n';
              } else if (currentSection === 'procedure' && line.trim().match(/^\d/)) {
                // Store the line in procedure
                const text = line.trim().replace(/^\d+\./, '').trim();
                procedure += text + '\n';
              }
            }
          });

          material = material.trim();
          procedure = procedure.trim();

          // Output or store recipeName, material, and procedure
          console.log('Recipe Name:', recipeName);
          console.log('Material:', material);
          console.log('Procedure:', procedure);
          document.getElementById('saveRecipe').style.display = 'block';
          document.getElementById('generateImage').style.display = 'block';

          document.getElementById('recipeContainer').innerHTML = listContent;
          document.getElementById('generateRecipe').style.display = 'block';
        } else {
          console.error('Recipe not found in the response:', data);
          document.getElementById('recipeContainer').innerText = 'Error: Recipe not found.';
        }
      })
      .catch(error => {
        console.error('Error fetching recipe:', error);
        document.getElementById('recipeContainer').innerText = 'Error fetching recipe. Please try again.';
      });
  }, 1000); // 500ms matches the animation duration
});


// 'Save Recipe' button click
document.getElementById('saveRecipe').addEventListener('click', function () {
  const token = sessionStorage.getItem('token'); // Or however you store your token
  const expired = isJwtExpired(token);
  if (!recipeName || !material || !procedure) {
    alert("No recipeName | material | procedure to save");
    return;
  } else if (expired) {
    alert(translations[languageSwitcher.value].alertA); //請先登入
    return;
  }

  const recipeData = {
    recipeName: recipeName,
    material: material,
    procedure: procedure
  };

  fetch('/api/save-recipe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token, // Include this if you require authentication
    },
    body: JSON.stringify(recipeData)
  })
    .then(response => {
      if (!response.ok) {
        if (response.status === 400) {
          alert(translations[languageSwitcher.value].alertC); //食譜已存在
        } else {
          throw new Error('Failed to save recipe');
        }
        return null; // Return null to prevent further processing in case of an error
      }
      return response.json();
    })
    .then(data => {
      if (data) {
        console.log('Recipe saved:', data);
        alert(translations[languageSwitcher.value].alertB); // 儲存成功
        // Additional actions upon successful save, like showing a success message
      }
    })
    .catch(error => {
      console.error('Error saving recipe:', error);
    });
});


// 'Generate Image' button click
document.getElementById('generateImage').addEventListener('click', function () {
  document.getElementById('backButton').style.display = 'none';
  document.getElementById('saveRecipe').style.display = 'none';
  document.getElementById('generateImage').style.display = 'none';
  document.querySelector('.recipeContainer').classList.add('slide-out-left');
  setTimeout(() => {
    document.getElementById('regenerate').style.display = 'block';
    document.getElementById('recipeContainer').style.display = 'none';
    document.getElementById('imageContainer').style.display = 'block';
    document.getElementById('imageContainer').innerText = translations[languageSwitcher.value].imageContainer;

    const recipeDescription = generatedRecipe;
    fetch(`/api/generate-image?description=${encodeURIComponent(recipeDescription)}`)
      .then(response => response.json())
      .then(data => {
        if (data && data.imageUrl) {
          // Display the generated image
          const img = new Image();
          img.src = data.imageUrl;
          console.log(img.src);
          img.alt = "Generated Image";
          const container = document.getElementById('imageContainer');
          container.innerHTML = ''; // Clear previous images
          container.appendChild(img); // Append the new image
        } else {
          console.error('Image not generated:', data);
        }
      })
      .catch(error => {
        console.error('Error generating image:', error);
      });
  }, 1000); // 500ms matches the animation duration
});

// 'Menu' button click
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