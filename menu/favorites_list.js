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
    if (document.location.pathname.endsWith('recipe_favorites.html')) {
        fetchPhotosAndDisplay();
    }
});