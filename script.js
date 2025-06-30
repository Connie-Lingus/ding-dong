document.getElementById('contact-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission for demo
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;

    // Basic validation
    if (name && email) {
        document.getElementById('form-message').textContent = 'Thank you for your submission! We’ll be in touch soon.';
        this.reset(); // Clear the form
    } else {
        document.getElementById('form-message').textContent = 'Please fill out all required fields.';
        document.getElementById('form-message').style.color = '#ff0000'; /* Red for errors */
    }
});
