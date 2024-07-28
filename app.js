
const token = localStorage.getItem('jwtToken');

function loadPage(page) {
 switch (page) {
     case 'home':
         document.getElementById('content').innerHTML = `
             <h2>Welcome to BookHub</h2>
             <p>Your one-stop platform for managing your book collection, reading reviews, and more.</p>`;
         break;
     case 'books':
		 window.location.href = 'book.html';
         break;
     case 'profile':
         window.location.href = 'profile.html';
         break;
     default:
         document.getElementById('content').innerHTML = '<h2>Page not found</h2>';
         break;
 }
        }

// Event listeners for navigation
document.addEventListener('DOMContentLoaded', () => {
    // Make sure this code runs after the DOM has fully loaded
    const navLinks = document.querySelectorAll('.navbar a');
    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const page = event.target.getAttribute('onclick').match(/'([^']+)'/)[1];
            loadPage(page);
        });
    });
});
