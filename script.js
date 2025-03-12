const input = document.getElementById('input');
const searchGrid = document.getElementById('search-grid');
const favoritesSection = document.getElementById('favorites-section');
const favoritesGrid = document.getElementById('favorites-grid');
const noFavoritesMessage = document.getElementById('no-favorites-message');
const toggleFavoritesBtn = document.getElementById('toggle-favorites');
const resultsSection = document.querySelector('.container');

let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

// Mostrar/ocultar favoritos
toggleFavoritesBtn.addEventListener('click', () => {
    if (favorites.length === 0) {
        alert("Todavía no has seleccionado imágenes favoritas.");
        return; 
    }

    // Ocultar la sección de resultados de búsqueda
    resultsSection.style.display = 'none';
    // Limpiar la sección de resultados de búsqueda
    searchGrid.innerHTML = '';
    favoritesSection.style.display = 'block';
    updateFavorites();
});

const backToSearchBtn = document.createElement('button');
backToSearchBtn.textContent = 'Regresar a la búsqueda';
backToSearchBtn.className = 'back-to-search-btn';
backToSearchBtn.addEventListener('click', () => {
    // Ocultar la sección de favoritos
    favoritesSection.style.display = 'none';
    resultsSection.style.display = 'block';
});


favoritesSection.appendChild(backToSearchBtn);

input.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        loadImg();
    }
});

async function loadImg() {
    const searchText = input.value.trim();
    if (searchText === '') {
        alert("Por favor, introduce un texto para buscar.");
        return;
    }
    document.getElementById("default-image").style.display = "none";
    removeImages();
    const url = `https://api.unsplash.com/search/photos?page=1&query=${searchText}&per_page=9&client_id=4fOc7PzgOMmzqx_8goqeQqAwyyrtnbsUrIZoopdcf1c`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Error ${response.status}`);

        const data = await response.json();

        // Validar si no hay resultados
        if (data.results.length === 0) {
            alert(`No se encontraron resultados para "${searchText}".`);
            // Mostrar nuevamente la imagen predeterminada si no hay resultados
            document.getElementById("default-image").style.display = "block";
            return;
        }
        data.results.forEach(photo => {
            const imageContainer = createImageContainer(photo, favorites.some(fav => fav.url === photo.urls.regular));
            searchGrid.appendChild(imageContainer);
        });
    } catch (error) {
        alert(error.message);
    }
}

// Mostrar la imagen por defecto al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("search-grid").children.length === 0) {
        document.getElementById("default-image").style.display = "block";
    }
});


function removeImages() {
    searchGrid.innerHTML = '';
}

function createImageContainer(photo, isFavorite) {
    const imageContainer = document.createElement('div');
    imageContainer.className = 'img';
    imageContainer.style.backgroundImage = `url(${photo.urls.regular})`;

    const downloadBtn = document.createElement('button');
    downloadBtn.className = 'download-btn';
    downloadBtn.innerHTML = `<span class="material-symbols-outlined">download</span>`;

    // Evento para descargar la imagen
    downloadBtn.addEventListener('click', async () => {
        const confirmDownload = confirm("¿Deseas descargar esta imagen?");
        if (confirmDownload) {
            try {
                const imageResponse = await fetch(photo.urls.full);
                const imageBlob = await imageResponse.blob();
                const imageURL = URL.createObjectURL(imageBlob);

                const a = document.createElement('a');
                a.href = imageURL;
                a.download = `imagen-${Date.now()}.jpg`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(imageURL);
            } catch (error) {
                alert('Error al descargar la imagen');
                console.error(error);
            }
        }
    });

    const favoriteBtn = document.createElement('button');
    favoriteBtn.className = 'favorite-btn';
    favoriteBtn.innerHTML = `<span class="material-symbols-outlined">${isFavorite ? "delete" : "favorite"}</span>`;

    favoriteBtn.addEventListener('click', () => {
        if (isFavorite) {
            favorites = favorites.filter(fav => fav.url !== photo.urls.regular);
            favoriteBtn.innerHTML = `<span class="material-symbols-outlined">favorite</span>`;
        } else {
            if (!favorites.some(fav => fav.url === photo.urls.regular)) {
                favorites.push({ url: photo.urls.regular });
                favoriteBtn.innerHTML = `<span class="material-symbols-outlined">delete</span>`;
            }
        }
        localStorage.setItem('favorites', JSON.stringify(favorites));
        updateFavorites();
    });

    imageContainer.appendChild(downloadBtn);
    imageContainer.appendChild(favoriteBtn);
    return imageContainer;
}

function updateFavorites() {
    favoritesGrid.innerHTML = '';

    if (favorites.length === 0) {
        noFavoritesMessage.style.display = 'block';
    } else {
        noFavoritesMessage.style.display = 'none';
        favorites.forEach(fav => {
            const favImg = createImageContainer({ urls: { regular: fav.url } }, true);
            favoritesGrid.appendChild(favImg);
        });
    }
}

// Cargar favoritos al iniciar la página
updateFavorites();

const themeToggleBtn = document.getElementById("theme-toggle");
const body = document.body;

// Función para cambiar el tema
function toggleTheme() {
    body.classList.toggle("dark-mode");

    const isDarkMode = body.classList.contains("dark-mode");
    
    // Guardar la preferencia en localStorage
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    themeToggleBtn.innerHTML = isDarkMode 
        ? '<span class="material-symbols-outlined">light_mode</span> Modo Claro' 
        : '<span class="material-symbols-outlined">dark_mode</span> Modo Oscuro';
}

themeToggleBtn.addEventListener("click", toggleTheme);

window.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem("theme") === "dark") {
        body.classList.add("dark-mode");
        themeToggleBtn.innerHTML = '<span class="material-symbols-outlined">light_mode</span> Modo Claro';
    }
});
