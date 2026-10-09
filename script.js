document.addEventListener('DOMContentLoaded', function () {
    const backToTopButton = document.querySelector('.back-to-top');
    const navbarCollapse = document.getElementById('navbarNav');
    const navbarToggler = document.querySelector('.navbar-toggler');

    function closeNavbarIfOpen() {
        if (!navbarCollapse || !navbarCollapse.classList.contains('show')) {
            return;
        }

        // Prefer clicking the toggler — most reliable with Bootstrap on mobile
        if (navbarToggler && navbarToggler.getAttribute('aria-expanded') === 'true') {
            navbarToggler.click();
            return;
        }

        if (typeof bootstrap !== 'undefined') {
            const instance =
                bootstrap.Collapse.getInstance(navbarCollapse) ||
                new bootstrap.Collapse(navbarCollapse, { toggle: false });
            instance.hide();
        }
    }

    function getScrollY() {
        return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    }

    let lastScrollY = getScrollY();
    let ignoreScrollCloseUntil = 0;

    // Opening the menu mid-page can nudge scroll/layout — don't treat that as "user scrolled"
    if (navbarToggler) {
        navbarToggler.addEventListener('click', function () {
            ignoreScrollCloseUntil = Date.now() + 400;
            lastScrollY = getScrollY();
        });
    }

    if (navbarCollapse) {
        navbarCollapse.addEventListener('shown.bs.collapse', function () {
            ignoreScrollCloseUntil = Date.now() + 400;
            lastScrollY = getScrollY();
        });
    }

    window.addEventListener(
        'scroll',
        function () {
            const scrollY = getScrollY();

            if (backToTopButton) {
                if (scrollY > 300) {
                    backToTopButton.classList.add('active');
                } else {
                    backToTopButton.classList.remove('active');
                }
            }

            const delta = Math.abs(scrollY - lastScrollY);
            lastScrollY = scrollY;

            // Only close after a real scroll gesture, not tiny layout shifts
            if (Date.now() < ignoreScrollCloseUntil || delta < 20) {
                return;
            }

            closeNavbarIfOpen();
        },
        { passive: true }
    );

    // Close mobile navbar when tapping/clicking outside it
    document.addEventListener('click', function (e) {
        if (!navbarCollapse || !navbarCollapse.classList.contains('show')) {
            return;
        }

        const header = document.querySelector('header');
        if (header && header.contains(e.target)) {
            return;
        }

        closeNavbarIfOpen();
    });

    if (backToTopButton) {
        backToTopButton.addEventListener('click', function (e) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            closeNavbarIfOpen();
        });
    }

    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        if (anchor.classList.contains('back-to-top')) {
            return;
        }

        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (!targetId || targetId === '#') {
                return;
            }

            const targetElement = document.querySelector(targetId);
            if (!targetElement) {
                return;
            }

            e.preventDefault();
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
            closeNavbarIfOpen();
        });
    });

    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async function (e) {
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
                    headers: { Accept: 'application/json' }
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    status.textContent = "Message sent successfully! I'll get back to you soon.";
                    status.className = 'alert alert-success';
                    contactForm.reset();
                } else {
                    status.textContent =
                        result.message || 'There was an error sending your message. Please try again.';
                    status.className = 'alert alert-danger';
                }
            } catch (error) {
                status.textContent =
                    'Oops! There was a problem sending your message. Please email me at 8jeremiasibiya@gmail.com';
                status.className = 'alert alert-danger';
            } finally {
                submitBtn.disabled = false;
                spinner.classList.add('d-none');
                status.classList.remove('d-none');
                status.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    }

    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
});
