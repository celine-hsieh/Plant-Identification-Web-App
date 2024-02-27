const recipeLink = document.getElementById('recipe');
const favoriteLink = document.getElementById('favorite');
const diaryLink = document.getElementById('diary');
const homeLink = document.getElementById('home');
const testLink = document.getElementById('test');
const userLink = document.getElementById('user');
const token = sessionStorage.getItem('token');
const secretKey = 'ncku';
let allRecipes = []; // Array to store all recipes


const translation = {
    en: {
        title: "Recipe Browse",
        recipe: "Recipe",
        favorite: "Favorite",
        diary: "Diary",
        test: "Test",
        viewmore: "view more",
        login: "login",
        logout: "logout",
        searchButton: "search",
        searchInput: "Search by recipe name or ingredients...",
    },
    zh: {
        title: "食 譜",
        recipe: "食譜",
        favorite: "收藏",
        diary: "日誌",
        test: "測驗",
        viewmore: "查看更多",
        login: "登入",
        logout: "登出",
        searchButton: "搜尋",
        searchInput: "搜尋食譜名稱或食材...",
    }
};

function getQueryParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

const lang = getQueryParam('lang');
console.log(lang);
recipeLink.href = `recipe_browse.html?lang=${lang}`;
favoriteLink.href = `../recipeFavorites/recipe_favorites.html?lang=${lang}`;
diaryLink.href = `../diaryBrowse/diary_browse.html?lang=${lang}`;
homeLink.href = `../../index.html?lang=${lang}`;
test.href = `https://docs.google.com/forms/d/e/1FAIpQLSd5yOWwnIV5LnHnplNdY916sBVMFxDhbM_ds6TtQojalfSc9w/viewform?usp=sf_link`;
userLink.href = `../..?lang=${lang}`;

if (lang) {
    document.getElementById('title').textContent = translation[lang].title;
    document.getElementById('recipe').textContent = translation[lang].recipe;
    document.getElementById('favorite').textContent = translation[lang].favorite;
    document.getElementById('diary').textContent = translation[lang].diary;
    document.getElementById('test').textContent = translation[lang].test;
    document.getElementById('searchButton').textContent = translation[lang].searchButton;
    document.getElementById('searchInput').placeholder = translation[lang].searchInput;

    console.log(token);
    if (!token) {
        document.getElementById('user').textContent = translation[lang].login;
    } else {
        document.getElementById('user').textContent = translation[lang].logout;
    }
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

// Fetch all recipes from the server
document.addEventListener('DOMContentLoaded', function () {
    fetch('/getRecipes')
        .then(response => response.json())
        .then(recipes => {
            allRecipes = recipes; // Store all recipes
            displayRecipes(allRecipes); // Display all recipes initially
        })
        .catch(error => {
            console.error('Error fetching recipes:', error);
        });

    // Event listener for the search button
    document.getElementById('searchButton').addEventListener('click', function () {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        filterRecipes(searchTerm);
    });
});


// Function to check If Recipe Favorited
function checkIfRecipeFavorited(recipeId) {
    const token = sessionStorage.getItem('token');
    if (!token) {
        return Promise.resolve(false);
    }

    // Send a POST request to check if the recipe is favorited
    return fetch('/checkFavorite', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ recipeId })    // Convert the data to a JSON string
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            return data.isFavorited;
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('user').textContent = translation[lang].login;
            return false;
        });
}


// Function to display recipes
function displayRecipes(recipesToDisplay) {
    const recipeContainer = document.querySelector('.recipes-list');
    recipeContainer.innerHTML = ''; // Clear existing recipes

    recipesToDisplay.forEach(recipe => {
        const recipeDiv = createRecipeItem(recipe, recipeContainer);
        recipeContainer.appendChild(recipeDiv);
    });
}

// Function to search recipes
function filterRecipes(searchTerm) {
    const filteredRecipes = allRecipes.filter(recipe => {
        return recipe.recipeName.toLowerCase().includes(searchTerm) ||
            (recipe.material && recipe.material.toLowerCase().includes(searchTerm)) ||
            (recipe.procedure && recipe.procedure.toLowerCase().includes(searchTerm));
    });
    displayRecipes(filteredRecipes);
}

// Function to create recipes
function createRecipeItem(recipe, recipeContainer) {
    // Create a <div> element to hold the recipe information
    const recipeDiv = document.createElement('div');
    recipeDiv.className = 'recipe-item';

    // Create and append the favorite button for the recipe
    const favoriteButton = createFavoriteButton(recipe);
    recipeDiv.appendChild(favoriteButton);

    // Create and append the display for the recipe name
    const recipeName = createRecipeName(recipe);
    recipeDiv.appendChild(recipeName);

    // Create and append the button for viewing more details of the recipe
    const viewMoreButton = createViewMoreButton(recipe, recipeContainer);
    recipeDiv.appendChild(viewMoreButton);

    return recipeDiv;
}

// Function to create Favorite Button
function createFavoriteButton(recipe) {
    const favoriteButton = document.createElement('button');
    favoriteButton.className = 'favorite-btn';

    checkIfRecipeFavorited(recipe._id).then(isFavorited => {
        console.log(recipe.userId)

        if (recipe.userId != 'ADMIN')
            favoriteButton.innerHTML = isFavorited ? '★' : '☆';
        else
            favoriteButton.innerHTML = isFavorited ? '♥' : '♡';
    });

    favoriteButton.onclick = () => handleFavoriteButtonClick(favoriteButton, recipe._id, recipe.userId);
    return favoriteButton;
}

// Function to handle Favorite Button Click
function handleFavoriteButtonClick(button, recipeId, userId) {
    const token = sessionStorage.getItem('token');
    if (!token) {
        alert('Please log in to add favorites.');
        if (userId != 'ADMIN')
            button.innerHTML = '☆';
        else
            button.innerHTML = '♡';
        return;
    }

    // const isFavorited = button.innerHTML;
    if (userId != 'ADMIN') {
        isFavorited = button.innerHTML === '★';
        button.innerHTML = isFavorited ? '☆' : '★';
        console.log(userId);
    }
    else {
        isFavorited = button.innerHTML === '♥';
        button.innerHTML = isFavorited ? '♡' : '♥';
        console.log(userId);
    }


    fetch('/toggleFavorite', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ recipeId: recipeId, favorited: !isFavorited })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to toggle favorite');
            }
            return response.json();
        })
        .then(data => {
            console.log('Favorite status updated:', data);
        })
        .catch(error => {
            console.error('Error:', error);
            console.log(userId);

            if (userId != 'ADMIN')
                button.innerHTML = isFavorited ? '★' : '☆';
            else
                button.innerHTML = isFavorited ? '♥' : '♡';
        });
}

// Function to create Recipe Name
function createRecipeName(recipe) {
    const recipeName = document.createElement('h2');
    recipeName.textContent = recipe.recipeName;
    return recipeName;
}

// Function to create View More Button
function createViewMoreButton(recipe, recipeContainer) {
    const viewMoreButton = document.createElement('button');
    viewMoreButton.className = 'viewMore-btn';
    viewMoreButton.textContent = translation[lang].viewmore;

    // Attach click event handler to the button
    viewMoreButton.onclick = function () {
        // Slide out the recipe container and search container
        recipeContainer.classList.add('slide-out-left');
        document.getElementById('search-container').classList.add('slide-out-left');

        // After a short delay, hide the search container and recipe container
        setTimeout(() => {
            document.getElementById('search-container').style.display = 'none';
            recipeContainer.style.display = 'none';
            document.getElementById('backButton').style.display = 'block';

            // Display detailed information about the recipe
            const recipeDetailContainer = document.querySelector('.recipe-detail-container');
            recipeDetailContainer.innerHTML = `
                <h1>${recipe.recipeName}</h1>
                <div>
                    <h2>材料</h2>
                    <ul>${recipe.material.split('\n').map(ingredient => `<li>${ingredient}</li>`).join('')}</ul>
                </div>
                <div>
                    <h2>步驟</h2>
                    <ol>${recipe.procedure.split('\n').map(step => `<li>${step}</li>`).join('')}</ol>
                </div>
            `;
            recipeDetailContainer.style.display = 'block';
        }, 1000);
    };

    return viewMoreButton;
}

// Handle 'Back' button click
document.getElementById('backButton').addEventListener('click', function () {
    // Show the recipeContainer
    const recipeContainer = document.querySelector('.recipes-list');
    recipeContainer.style.display = 'block'; // Show the recipeContainer

    // Remove the slide-out-left animation from the container
    setTimeout(() => {
        recipeContainer.classList.remove('slide-out-left'); // Remove the slide-out-left animation from the container
        document.getElementById('search-container').classList.remove('slide-out-left');
    }, 1); // A short delay to ensure the display change is applied first

    document.getElementById('search-container').style.display = 'block';
    document.getElementById('backButton').style.display = 'none';
    document.querySelector('.recipe-detail-container').style.display = 'none';
});
