document.addEventListener('DOMContentLoaded', function () {
    const backToTopButton = document.querySelector('.back-to-top');
    const navbarCollapse = document.getElementById('navbarNav');
    const navbarToggler = document.querySelector('.navbar-toggler');

    // Blocks outside-close while the menu is opening (stops the curtain snap-shut)
    let suppressOutsideClose = false;
    let suppressTimer = null;

    function armOutsideCloseSuppress(ms) {
        suppressOutsideClose = true;
        clearTimeout(suppressTimer);
        suppressTimer = setTimeout(function () {
            suppressOutsideClose = false;
        }, ms);
    }

    function hideNavbar() {
        if (!navbarCollapse || !navbarCollapse.classList.contains('show')) {
            return;
        }

        if (typeof bootstrap === 'undefined') {
            navbarCollapse.classList.remove('show');
            if (navbarToggler) {
                navbarToggler.setAttribute('aria-expanded', 'false');
            }
            return;
        }

        // Never use toggler.click() — it races with open and causes open-then-close
        bootstrap.Collapse.getOrCreateInstance(navbarCollapse, { toggle: false }).hide();
    }

    function getScrollY() {
        return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    }

    // Back-to-top arrow only — scrolling must NOT close the menu
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
        // Capture phase: arm suppress BEFORE Bootstrap's document click handler
        navbarToggler.addEventListener(
            'click',
            function () {
                armOutsideCloseSuppress(800);
            },
            true
        );
    }

    if (navbarCollapse) {
        navbarCollapse.addEventListener('show.bs.collapse', function () {
            armOutsideCloseSuppress(800);
        });
        navbarCollapse.addEventListener('shown.bs.collapse', function () {
            armOutsideCloseSuppress(400);
        });
    }

    // Close only on a real outside tap/click — not the same gesture that opened it
    document.addEventListener('click', function (e) {
        if (suppressOutsideClose) {
            return;
        }

        if (!navbarCollapse || !navbarCollapse.classList.contains('show')) {
            return;
        }

        if (e.target.closest('header')) {
            return;
        }

        hideNavbar();
    });

    if (backToTopButton) {
        backToTopButton.addEventListener('click', function (e) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            hideNavbar();
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
            hideNavbar();
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
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
