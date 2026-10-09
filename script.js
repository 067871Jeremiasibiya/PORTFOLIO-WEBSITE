document.addEventListener('DOMContentLoaded', function() {
    // Back to top button functionality
    const backToTopButton = document.querySelector('.back-to-top');

    if (backToTopButton) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTopButton.classList.add('active');
            } else {
                backToTopButton.classList.remove('active');
            }
        });
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });

                const navbarCollapse = document.querySelector('.navbar-collapse');
                if (navbarCollapse && navbarCollapse.classList.contains('show')) {
                    const bsCollapse = new bootstrap.Collapse(navbarCollapse, { toggle: false });
                    bsCollapse.hide();
                }
            }
        });
    });

    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const spinner = submitBtn.querySelector('.spinner-border');
            const status = document.getElementById('form-status');

            submitBtn.disabled = true;
            spinner.classList.remove('d-none');
            status.classList.add('d-none');

            try {
                const formData = new FormData(contactForm);
                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    status.textContent = 'Thank you for your message! I will get back to you soon.';
                    status.className = 'alert alert-success';
                    contactForm.reset();
                } else {
                    status.textContent = result.message || 'There was an error sending your message. Please try again.';
                    status.className = 'alert alert-danger';
                }
            } catch (error) {
                status.textContent = 'There was an error sending your message. Please try again.';
                status.className = 'alert alert-danger';
            } finally {
                submitBtn.disabled = false;
                spinner.classList.add('d-none');
                status.classList.remove('d-none');
                status.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });
    }

    const currentYear = new Date().getFullYear();
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = currentYear;
    }

    const animateOnScroll = function() {
        const elements = document.querySelectorAll('.fade-in');
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.3;

            if (elementPosition < screenPosition) {
                element.classList.add('fadeInUp');
            }
        });
    };

    animateOnScroll();
    window.addEventListener('scroll', animateOnScroll);
});

const track = document.querySelector('.scroll-track');
if (track) {
    track.addEventListener('mouseover', () => {
        track.style.animationPlayState = 'paused';
    });

    track.addEventListener('mouseout', () => {
        track.style.animationPlayState = 'running';
    });
}

if (typeof SmoothScroll !== 'undefined') {
    new SmoothScroll('a[href*="#"]', {
        speed: 800,
        speedAsDuration: true,
        offset: 80
    });
}
