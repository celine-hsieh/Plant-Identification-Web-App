const recipeLink = document.getElementById('recipe');
const favoriteLink = document.getElementById('favorite');
const diaryLink = document.getElementById('diary');
const homeLink = document.getElementById('home');
const userLink = document.getElementById('user');
const testLink = document.getElementById('test');
const token = sessionStorage.getItem('token');
const secretKey = 'ncku';

const translation = {
    en: {
        title: "Favorite Recipes",
        recipe: "Recipe",
        favorite: "Favorite",
        diary: "Diary",
        test: "Test",
        viewmore: "view more",
        login: "login",
        logout: "logout"
    },
    zh: {
        title: "收 藏",
        recipe: "食譜",
        favorite: "收藏",
        test: "測驗",
        diary: "日誌",
        viewmore: "查看更多",
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
favoriteLink.href = `recipe_favorites.html?lang=${lang}`;
diaryLink.href = `../diaryBrowse/diary_browse.html?lang=${lang}`;
homeLink.href = `../../index.html?lang=${lang}`;
test.href = `https://docs.google.com/forms/d/e/1FAIpQLSd5yOWwnIV5LnHnplNdY916sBVMFxDhbM_ds6TtQojalfSc9w/viewform?usp=sf_link`;
userLink.href = `../..?lang=${lang}`;


if (lang) {
    document.getElementById('title').textContent = translation[lang].title;
    document.getElementById('recipe').textContent = translation[lang].recipe;
    document.getElementById('favorite').textContent = translation[lang].favorite;
    document.getElementById('test').textContent = translation[lang].test;
    document.getElementById('diary').textContent = translation[lang].diary;
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

// Function to display login
function showLoginPrompt() {
    const favoriteContainer = document.getElementById('favorite-list');
    favoriteContainer.innerHTML = `
        <div class="login-prompt">
            <p>請先登入後查看</p>
            <button id="redirectToLogin" class="login-button">登入</button>
        </div>
    `;

    document.getElementById('redirectToLogin').addEventListener('click', function () {
        window.location.href = '../../'; // Redirect to the login page when clicked
    });
}

// Handle get favorited
document.addEventListener('DOMContentLoaded', function () {
    const token = sessionStorage.getItem('token');
    console.log(token);
    if (!token) {
        showLoginPrompt();
        return;
    }
    fetch('/getFavorited', {
        headers: {
            'Authorization': 'Bearer ' + token,
        },
    })
        .then(response => response.json())
        .then(async recipes => {
            const favoriteContainer = document.querySelector('.favorite-list');
            recipes.forEach(recipe => {
                const favoriteDiv = createRecipeItem(recipe, favoriteContainer);
                favoriteContainer.appendChild(favoriteDiv);
            });
        })
        .catch(error => {
            console.error('Error fetching recipes:', error);
            showLoginPrompt();
            document.getElementById('user').textContent = translation[lang].login;
        });
});

// Function to create recipes
function createRecipeItem(recipe, favoriteContainer) {
    // Create a <div> element to hold the favorite recipe information
    const favoriteDiv = document.createElement('div');
    favoriteDiv.className = 'recipe-item';

    // Create and append the favorite button for the recipe
    const favoriteButton = createFavoriteButton(recipe, favoriteDiv);
    favoriteDiv.appendChild(favoriteButton);

    // Create and append the display for the recipe name
    const recipeName = createRecipeName(recipe);
    favoriteDiv.appendChild(recipeName);

    // Create and append the button for viewing more details of the recipe
    const viewMoreButton = createViewMoreButton(recipe, favoriteContainer);
    favoriteDiv.appendChild(viewMoreButton);

    return favoriteDiv;
}

// Function to create Favorite Button
function createFavoriteButton(recipe, favoriteDiv) {
    const favoriteButton = document.createElement('button');
    favoriteButton.className = 'favorite-btn';

    if (recipe.userId != 'ADMIN')
        favoriteButton.innerHTML = '★';
    else
        favoriteButton.innerHTML = '♥';

    favoriteButton.onclick = () => handleFavoriteButtonClick(favoriteButton, recipe._id, favoriteDiv, recipe.userId);
    return favoriteButton;
}

// Function to handle Favorite Button Click
function handleFavoriteButtonClick(button, recipeId, favoriteDiv, userId) {
    const token = sessionStorage.getItem('token');

    if (userId != 'ADMIN') {
        isFavorited = button.innerHTML === '★';
    }
    else {
        isFavorited = button.innerHTML === '♥';
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
            console.log("update", isFavorited)
            if (isFavorited) {
                // Remove the recipe item from the DOM
                favoriteDiv.remove();
                console.log("update remove")
            }
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('user').textContent = translation[lang].login;
        });
}

// Function to update the list of favorite recipes dynamically
function updateFavoritesList() {
    const token = sessionStorage.getItem('token');
    const favoriteContainer = document.querySelector('.favorite-list');
    favoriteContainer.innerHTML = ''; // Clear the current list

    fetch('/getFavorited', {
        headers: {
            'Authorization': 'Bearer ' + token,
        },
    })
        .then(response => response.json())
        .then(recipes => {
            recipes.forEach(recipe => {
                const favoriteDiv = createRecipeItem(recipe, favoriteContainer);
                favoriteContainer.appendChild(favoriteDiv);
            });
        })
        .catch(error => {
            console.error('Error updating favorites:', error);
        });
}

// Function to create Recipe Name
function createRecipeName(recipe) {
    const recipeName = document.createElement('h2');
    recipeName.textContent = recipe.recipeName;
    return recipeName;
}

// Function to create View More Button
function createViewMoreButton(recipe, favoriteContainer) {
    const viewMoreButton = document.createElement('button');
    viewMoreButton.className = 'viewMore-btn';
    viewMoreButton.textContent = translation[lang].viewmore;

    // Attach click event handler to the button
    viewMoreButton.onclick = function () {
        // Slide out the recipe container and search container
        favoriteContainer.classList.add('slide-out-left');

        // After a short delay, hide the search container and recipe container
        setTimeout(() => {
            favoriteContainer.style.display = 'none';
            document.getElementById('backButton').style.display = 'block';

            // Display detailed information about the favorite recipe
            const favoriteDetailContainer = document.querySelector('.favorite-detail-container');
            favoriteDetailContainer.innerHTML = `
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
            favoriteDetailContainer.style.display = 'block';
        }, 1000);
    };

    return viewMoreButton;
}

// Handle 'Back' button click
document.getElementById('backButton').addEventListener('click', function () {
    const favoriteContainer = document.querySelector('.favorite-list');
    favoriteContainer.style.display = 'block'; // Show the recipeContainer
    setTimeout(() => {
        favoriteContainer.classList.remove('slide-out-left'); // Remove the slide-out-left animation from the container
    }, 1); // A short delay to ensure the display change is applied first

    // Hide the "Back" button and the recipe details container
    document.getElementById('backButton').style.display = 'none';
    document.querySelector('.favorite-detail-container').style.display = 'none';
});
