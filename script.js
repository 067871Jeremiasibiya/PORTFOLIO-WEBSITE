document.addEventListener('DOMContentLoaded', function () {
    const backToTopButton = document.querySelector('.back-to-top');
    const navbarCollapse = document.getElementById('navbarNav');
    const navbarToggler = document.querySelector('.navbar-toggler');
    const header = document.querySelector('header');

    let ignoreOutsideClickUntil = 0;

    function closeNavbarIfOpen() {
        if (!navbarCollapse || !navbarCollapse.classList.contains('show')) {
            return;
        }

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

    // Back-to-top visibility only — do NOT close the menu on scroll
    // (opening mid-page causes layout scroll and was closing it immediately)
    window.addEventListener(
        'scroll',
        function () {
            if (!backToTopButton) {
                return;
            }

            if (getScrollY() > 300) {
                backToTopButton.classList.add('active');
            } else {
                backToTopButton.classList.remove('active');
            }
        },
        { passive: true }
    );

    if (navbarToggler) {
        navbarToggler.addEventListener('click', function () {
            // Ignore the follow-up / ghost click that lands on page content after open
            ignoreOutsideClickUntil = Date.now() + 500;
        });
    }

    if (navbarCollapse) {
        navbarCollapse.addEventListener('shown.bs.collapse', function () {
            ignoreOutsideClickUntil = Date.now() + 500;
        });
    }

    // Close when tapping/clicking outside the header
    document.addEventListener('click', function (e) {
        if (!navbarCollapse || !navbarCollapse.classList.contains('show')) {
            return;
        }

        if (Date.now() < ignoreOutsideClickUntil) {
            return;
        }

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
