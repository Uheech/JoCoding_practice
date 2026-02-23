// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 70, // Adjust for sticky header
                behavior: 'smooth'
            });
        }
    });
});

// Basic tracking (simulated for AdSense-friendly behavior)
console.log('Strategic Partners Site Loaded Successfully.');
