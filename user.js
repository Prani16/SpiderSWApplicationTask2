// Function to add a new user
document.getElementById('profile-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
  
    fetch('http://localhost:3000/users', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email })
    })
    .    .then(response => response.json())
    .then(data => {
        console.log('user added:', data);
        loadBooks(); // Reload the book list
    })
    .catch(error => {
        console.error('Error:', error);
    });
});
