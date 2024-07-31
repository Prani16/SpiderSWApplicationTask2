document.getElementById('book-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const title = document.getElementById('title').value;
    const author = document.getElementById('author').value;
    const genre = document.getElementById('genre').value;
    const cover_image = document.getElementById('cover_image').value;
    const description = document.getElementById('description').value;

    fetch('http://localhost:3000/books', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, author, genre, cover_image, description })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Book added:', data);
        loadBooks(); // Reload the book list
    })
    .catch(error => {
        console.error('Error:', error);
    });
});

	function loadBooks() {
    fetch('http://localhost:3000/books')
        .then(response => response.json())
        .then(data => {
            const booksDiv = document.getElementById('book-list');
            booksDiv.innerHTML = '';
            data.forEach(book => {
                const bookElement = document.createElement('div');
                bookElement.innerHTML = `
                    <h2>${book.title}</h2>
                    <p>Author: ${book.author}</p>
                    <p>Genre: ${book.genre}</p>
                    <img src="${book.cover_image}" alt="Cover Image" style="width:100px;height:150px;">
                    <p>${book.description}</p>
                    <button onclick="deleteBook(${book.id})">Delete</button>
                    <button onclick="toggleFavorite(${book.id}, ${book.is_favorite})">
                        ${book.is_favorite ? 'Unfavorite' : 'Favorite'}
                    </button>
                    <button onclick="buyBook(${book.id})">Buy</button>
                `;
                booksDiv.appendChild(bookElement);
            });
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function deleteBook(id) {
    fetch(`http://localhost:3000/books/${id}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        console.log('Book deleted:', data);
        loadBooks(); // Reload the book list
    })
    .catch(error => {
        console.error('Error:', error);
    });
}


function toggleFavorite(id, isFavorite) {
    fetch(`http://localhost:3000/books/${id}/favorite`, {
        method: 'PUT'
    })
    .then(response => response.json())
    .then(data => {
        console.log('Book favorite status updated:', data);
        loadBooks(); // Reload the book list
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function buyBook(id) {
    fetch(`http://localhost:3000/books/${id}/buy`, {
        method: 'PUT'
    })
    .then(response => response.json())
    .then(data => {
        console.log('Book marked as bought:', data);
        loadBooks(); // Reload the book list
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

