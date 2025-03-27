document.addEventListener('DOMContentLoaded', () => {
    const { body } = document;
    const themeToggle = document.querySelector('.theme-toggle');
    const hamburger = document.querySelector('.hamburger');
    const nav = document.querySelector('nav');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');
    const searchForm = document.querySelector('.barre-de-recherche');
    const searchInput = document.querySelector('#search-input');
    const filters = document.querySelectorAll('.filtres select');
    const favorisList = document.querySelector('.favoris-list');
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    const toggleTheme = () => {
        const isDarkMode = body.classList.toggle('dark-mode');
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
        themeToggle.textContent = isDarkMode ? '☀️' : '🌙';
        themeToggle.setAttribute('aria-label', isDarkMode ? 'Passer au mode clair' : 'Passer au mode sombre');
    };

    themeToggle.addEventListener('click', toggleTheme);
    if (localStorage.getItem('theme') === 'dark') toggleTheme();

    const toggleMenu = () => {
        const isExpanded = nav.classList.toggle('active');
        hamburger.textContent = isExpanded ? '✖' : '☰';
        hamburger.setAttribute('aria-expanded', isExpanded);
    };

    hamburger.addEventListener('click', toggleMenu);
    document.addEventListener('click', (e) => {
        if (!nav.contains(e.target) && !hamburger.contains(e.target)) {
            nav.classList.remove('active');
            hamburger.textContent = '☰';
            hamburger.setAttribute('aria-expanded', 'false');
        }
    });

    const switchSection = (sectionId, link) => {
        const targetSection = document.getElementById(sectionId);
        if (!targetSection) {
            console.warn(`Section "${sectionId}" non trouvée.`);
            alert(`Section "${sectionId}" non implémentée.`);
            return;
        }

        sections.forEach(section => {
            section.classList.toggle('active', section === targetSection);
            section.setAttribute('aria-hidden', section !== targetSection);
        });

        if (link.closest('header')) {
            navLinks.forEach(l => l.removeAttribute('aria-current'));
            link.setAttribute('aria-current', 'page');
        }

        nav.classList.remove('active');
        hamburger.textContent = '☰';
        hamburger.setAttribute('aria-expanded', 'false');
    };

    navLinks.forEach(link => link.addEventListener('click', (e) => {
        e.preventDefault();
        switchSection(link.getAttribute('data-section'), link);
    }));

    const updateFavoritesDisplay = () => {
        favorisList.innerHTML = favorites.length === 0
            ? '<p>Aucune recette dans vos favoris pour le moment.</p>'
            : favorites.map(recipe => `
                <article class="recette-card" data-id="${recipe.id}" role="listitem">
                    <div class="recette-image">
                        <img src="${recipe.image}" alt="${recipe.title}">
                        <button class="favorite-btn active" data-id="${recipe.id}" aria-label="Retirer ${recipe.title} des favoris">
                            <span class="heart-icon">♥</span>
                        </button>
                    </div>
                    <h2>${recipe.title}</h2>
                    <div class="recipe-tags">
                        <span class="tag category">${recipe.category}</span>
                        <span class="tag time">${recipe.time}</span>
                    </div>
                    <a href="#" class="recette-button">Voir la recette</a>
                </article>
            `).join('');

        document.querySelectorAll('.favoris-list .favorite-btn').forEach(button => {
            button.addEventListener('click', () => toggleFavorite(button.getAttribute('data-id'), button));
        });
    };

    const toggleFavorite = (recipeId, button) => {
        const card = button.closest('.recette-card');
        const title = card.querySelector('h2').textContent;
        const tags = Array.from(card.querySelectorAll('.tag')).map(tag => tag.textContent);
        const image = card.querySelector('img')?.src || 'default.jpg';
        const isFavorite = favorites.some(fav => fav.id === recipeId);

        favorites = isFavorite
            ? favorites.filter(fav => fav.id !== recipeId)
            : [...favorites, { id: recipeId, title, image, category: tags[0], time: tags[1] }];

        button.classList.toggle('active');
        button.querySelector('.heart-icon').textContent = isFavorite ? '♡' : '♥';
        button.setAttribute('aria-label', `${isFavorite ? 'Ajouter' : 'Retirer'} ${title} ${isFavorite ? 'aux' : 'des'} favoris`);
        alert(`"${title}" a été ${isFavorite ? 'retiré de' : 'ajouté à'} vos favoris.`);

        localStorage.setItem('favorites', JSON.stringify(favorites));
        updateFavoritesDisplay();
    };

    const filterRecipes = () => {
        const searchTerm = searchInput.value.toLowerCase();
        const filterValues = Array.from(filters).map(select => select.value.toLowerCase());
        document.querySelectorAll('.recettes .recette-card').forEach(card => {
            const title = card.querySelector('h2').textContent.toLowerCase();
            const tags = Array.from(card.querySelectorAll('.tag')).map(tag => tag.textContent.toLowerCase());
            card.style.display = title.includes(searchTerm) && filterValues.every((val, i) => !val || tags[i] === val) ? 'block' : 'none';
        });
    };

    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        filterRecipes();
    });

    searchInput.addEventListener('input', filterRecipes);
    filters.forEach(select => select.addEventListener('change', filterRecipes));

    document.addEventListener('click', (e) => {
        const favoriteBtn = e.target.closest('.favorite-btn');
        const ajouterBtn = e.target.closest('.ajouter-button');
        if (favoriteBtn) toggleFavorite(favoriteBtn.getAttribute('data-id'), favoriteBtn);
        if (ajouterBtn) {
            const title = ajouterBtn.closest('.recette-card').querySelector('h2').textContent;
            alert(`Fonctionnalité "Ajouter une recette" pour ${title} à implémenter !`);
        }
    });

    document.querySelectorAll('.recettes .favorite-btn').forEach(button => {
        const recipeId = button.getAttribute('data-id');
        if (favorites.some(fav => fav.id === recipeId)) {
            button.classList.add('active');
            button.querySelector('.heart-icon').textContent = '♥';
            button.setAttribute('aria-label', `Retirer ${button.closest('.recette-card').querySelector('h2').textContent} des favoris`);
        }
    });

    updateFavoritesDisplay();
    sections.forEach(section => section.setAttribute('aria-hidden', section.classList.contains('active') ? 'false' : 'true'));
});