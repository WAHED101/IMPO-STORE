// Mobile Menu Toggle
document.querySelector('.menu-toggle').addEventListener('click', function() {
    document.querySelector('.nav-links').classList.toggle('active');
});

// Copy IP Address
document.getElementById('copy-ip').addEventListener('click', function() {
    const ip = document.getElementById('server-ip').textContent;
    navigator.clipboard.writeText(ip).then(() => {
        const originalText = this.textContent;
        this.textContent = 'Copied!';
        setTimeout(() => {
            this.textContent = originalText;
        }, 2000);
    });
});

// Smooth Scrolling for Anchor Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 70,
                behavior: 'smooth'
            });
            
            // Close mobile menu if open
            document.querySelector('.nav-links').classList.remove('active');
        }
    });
});

// Purchase Buttons
document.querySelectorAll('.btn-secondary, .btn-primary').forEach(button => {
    if (button.textContent.includes('Purchase') || button.textContent.includes('Vote Now')) {
        button.addEventListener('click', function() {
            const item = this.parentElement.querySelector('h3').textContent;
            
            // In a real implementation, you would connect to a payment processor or vote site
            
        });
    }
});