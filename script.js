document.getElementById('contact-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    if (name && email) {
        document.getElementById('form-message').textContent = 'Thank you for your submission! We’ll be in touch soon.';
        this.submit(); // Allow Formspree submission
        this.reset();
    } else {
        document.getElementById('form-message').textContent = 'Please fill out all required fields.';
        document.getElementById('form-message').style.color = '#ff0000';
    }
});
