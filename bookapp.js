document.addEventListener('DOMContentLoaded', function() {
    const bookForm = document.getElementById('book-form');
    const bookList = document.getElementById('book-list');
});

const token = localStorage.getItem('jwtToken');		
bookForm.onsubmit = function(event) {
        event.preventDefault();
        const book = {
            title: document.getElementById('title').value,
            author: document.getElementById('author').value,
            genre: document.getElementById('published_year').value,
			cover_image: document.getElementById('cover_image').value,
			description: document.getElementById('description').value
        };
        fetch('http://localhost:3000/books', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(book)
        })
        .then(response => response.json())
        .then(() => {
            bookForm.reset();
            loadBooks();
        });
    };

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

});
