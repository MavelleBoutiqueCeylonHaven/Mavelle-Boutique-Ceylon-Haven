/**
 * ==========================================================================
 * CEYLON HAVEN BOUTIQUE RETREAT | MAVELLE BOUTIQUE by Madumi Hotels
 * Master Interactive JavaScript
 * Location: Bentota, Sri Lanka
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  initStickyHeader();
  initMobileNavigation();
  initActiveNavLink();
  initDateValidation();
  initRoomPreselection();
  initBookingFormValidation();
  initGalleryFilterAndLightbox();
  initFaqAccordion();
  initScrollTop();
  initNewsletterForm();
});

/* --------------------------------------------------------------------------
 * 1. Sticky Navigation Header
 * -------------------------------------------------------------------------- */
function initStickyHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // Initial check on load
}

/* --------------------------------------------------------------------------
 * 2. Mobile Navigation Drawer & Hamburger
 * -------------------------------------------------------------------------- */
function initMobileNavigation() {
  const navToggle = document.querySelector('.mobile-nav-toggle');
  const mainNav = document.querySelector('.main-nav');
  if (!navToggle || !mainNav) return;

  const toggleMenu = (open) => {
    const isOpen = open !== undefined ? open : !mainNav.classList.contains('is-open');
    mainNav.classList.toggle('is-open', isOpen);
    navToggle.classList.toggle('is-active', isOpen);
    navToggle.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  };

  navToggle.addEventListener('click', () => toggleMenu());

  // Close menu when clicking nav links
  const navLinks = mainNav.querySelectorAll('.nav-link, .btn');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (mainNav.classList.contains('is-open')) {
        toggleMenu(false);
      }
    });
  });

  // Close when clicking outside drawer
  document.addEventListener('click', (e) => {
    if (
      mainNav.classList.contains('is-open') &&
      !mainNav.contains(e.target) &&
      !navToggle.contains(e.target)
    ) {
      toggleMenu(false);
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mainNav.classList.contains('is-open')) {
      toggleMenu(false);
    }
  });
}

/* --------------------------------------------------------------------------
 * 3. Active Nav Link Highlighting
 * -------------------------------------------------------------------------- */
function initActiveNavLink() {
  const navLinks = document.querySelectorAll('.nav-link');
  if (!navLinks.length) return;

  const currentPath = window.location.pathname.split('/').pop() || 'index.html';

  navLinks.forEach(link => {
    const linkPath = link.getAttribute('href');
    if (linkPath === currentPath || (currentPath === '' && linkPath === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

/* --------------------------------------------------------------------------
 * 4. Room Preselection via URL Parameter
 * -------------------------------------------------------------------------- */
function initRoomPreselection() {
  const roomSelect = document.getElementById('preferred-room');
  if (!roomSelect) return;

  const urlParams = new URLSearchParams(window.location.search);
  const requestedRoom = urlParams.get('room');

  if (requestedRoom) {
    const options = Array.from(roomSelect.options);
    const matchingOption = options.find(
      opt => opt.value.toLowerCase() === requestedRoom.toLowerCase() ||
             opt.text.toLowerCase().includes(requestedRoom.toLowerCase())
    );

    if (matchingOption) {
      roomSelect.value = matchingOption.value;
      // Scroll to form smoothly if room parameter is present
      const formCard = document.querySelector('.inquiry-form-card');
      if (formCard) {
        setTimeout(() => {
          formCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
      }
    }
  }
}

/* --------------------------------------------------------------------------
 * 5. Date Validation & Logical Restrictions
 * -------------------------------------------------------------------------- */
function initDateValidation() {
  const checkInInput = document.getElementById('check-in');
  const checkOutInput = document.getElementById('check-out');
  if (!checkInInput || !checkOutInput) return;

  // Format today's date as YYYY-MM-DD
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const todayFormatted = `${yyyy}-${mm}-${dd}`;

  // Set minimum check-in date to today
  checkInInput.min = todayFormatted;

  const getNextDay = (dateString) => {
    const date = new Date(dateString);
    date.setDate(date.getDate() + 1);
    const nextYyyy = date.getFullYear();
    const nextMm = String(date.getMonth() + 1).padStart(2, '0');
    const nextDd = String(date.getDate()).padStart(2, '0');
    return `${nextYyyy}-${nextMm}-${nextDd}`;
  };

  // Set initial check-out minimum to tomorrow
  checkOutInput.min = getNextDay(todayFormatted);

  checkInInput.addEventListener('change', () => {
    if (!checkInInput.value) return;

    const minCheckOut = getNextDay(checkInInput.value);
    checkOutInput.min = minCheckOut;

    // If check-out is currently before or equal to check-in, advance check-out
    if (checkOutInput.value && checkOutInput.value <= checkInInput.value) {
      checkOutInput.value = minCheckOut;
    }
  });

  checkOutInput.addEventListener('change', () => {
    if (checkInInput.value && checkOutInput.value <= checkInInput.value) {
      alert('Check-out date must be at least one day after your check-in date.');
      checkOutInput.value = getNextDay(checkInInput.value);
    }
  });
}

/* --------------------------------------------------------------------------
 * 6. Booking Inquiry Form Validation & Submission
 * -------------------------------------------------------------------------- */
function initBookingFormValidation() {
  const form = document.getElementById('inquiry-form');
  const modal = document.getElementById('inquiry-success-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  if (!form) return;

  const fields = {
    fullName: document.getElementById('full-name'),
    email: document.getElementById('email'),
    telephone: document.getElementById('telephone'),
    country: document.getElementById('country'),
    checkIn: document.getElementById('check-in'),
    checkOut: document.getElementById('check-out'),
    adults: document.getElementById('adults'),
    preferredRoom: document.getElementById('preferred-room')
  };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[\d\s\-+()]{7,20}$/;

  const validateField = (field, condition) => {
    if (!field) return true;
    if (condition) {
      field.classList.remove('is-invalid');
      return true;
    } else {
      field.classList.add('is-invalid');
      return false;
    }
  };

  // Real-time error removal on input
  Object.values(fields).forEach(field => {
    if (!field) return;
    ['input', 'change'].forEach(evt => {
      field.addEventListener(evt, () => {
        if (field.classList.contains('is-invalid')) {
          field.classList.remove('is-invalid');
        }
      });
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let isValid = true;

    // Full name: min 3 chars
    if (!validateField(fields.fullName, fields.fullName && fields.fullName.value.trim().length >= 3)) {
      isValid = false;
    }

    // Email
    if (!validateField(fields.email, fields.email && emailRegex.test(fields.email.value.trim()))) {
      isValid = false;
    }

    // Phone
    if (!validateField(fields.telephone, fields.telephone && phoneRegex.test(fields.telephone.value.trim()))) {
      isValid = false;
    }

    // Country
    if (!validateField(fields.country, fields.country && fields.country.value.trim() !== '')) {
      isValid = false;
    }

    // Check-in
    if (!validateField(fields.checkIn, fields.checkIn && fields.checkIn.value !== '')) {
      isValid = false;
    }

    // Check-out
    const datesValid = fields.checkIn && fields.checkOut &&
                       fields.checkOut.value !== '' &&
                       fields.checkOut.value > fields.checkIn.value;
    if (!validateField(fields.checkOut, datesValid)) {
      isValid = false;
    }

    // Adults
    if (!validateField(fields.adults, fields.adults && parseInt(fields.adults.value, 10) >= 1)) {
      isValid = false;
    }

    // Room
    if (!validateField(fields.preferredRoom, fields.preferredRoom && fields.preferredRoom.value !== '')) {
      isValid = false;
    }

    if (!isValid) {
      const firstInvalid = form.querySelector('.is-invalid');
      if (firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstInvalid.focus();
      }
      return;
    }

    // Capture guest inquiry data for confirmation modal
    const guestName = fields.fullName.value.trim();
    const guestEmail = fields.email.value.trim();
    const checkInVal = fields.checkIn.value;
    const checkOutVal = fields.checkOut.value;
    const roomType = fields.preferredRoom.options[fields.preferredRoom.selectedIndex].text;
    const guestsCount = `${fields.adults.value} Adult(s)`;

    // Update modal summary content
    const summaryTarget = document.getElementById('modal-summary-content');
    if (summaryTarget) {
      summaryTarget.innerHTML = `
        <p><strong>Guest Name:</strong> ${escapeHtml(guestName)}</p>
        <p><strong>Contact Email:</strong> ${escapeHtml(guestEmail)}</p>
        <p><strong>Stay Dates:</strong> ${escapeHtml(checkInVal)} to ${escapeHtml(checkOutVal)}</p>
        <p><strong>Selected Suite:</strong> ${escapeHtml(roomType)}</p>
        <p><strong>Party:</strong> ${escapeHtml(guestsCount)}</p>
      `;
    }

    // Open success modal
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    } else {
      alert(`Thank you, ${guestName}! Your inquiry for Ceylon Haven Boutique Retreat has been received. Our concierge will contact you at ${guestEmail} within 24 hours.`);
    }

    form.reset();
    initDateValidation(); // Reset min dates after form reset
  });

  if (modalCloseBtn && modal) {
    modalCloseBtn.addEventListener('click', () => {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    });
  }

  // Close modal when clicking outside card
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }
}

/* --------------------------------------------------------------------------
 * 7. Gallery Category Filtering & Lightbox Modal
 * -------------------------------------------------------------------------- */
function initGalleryFilterAndLightbox() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
  const lightbox = document.getElementById('lightbox-modal');

  if (!galleryItems.length) return;

  // Category Filtering
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      galleryItems.forEach(item => {
        const itemCategory = item.getAttribute('data-category');
        if (filterValue === 'all' || itemCategory === filterValue) {
          item.classList.remove('hidden');
          item.style.display = 'block';
        } else {
          item.classList.add('hidden');
          item.style.display = 'none';
        }
      });
    });
  });

  // Lightbox Functionality
  if (!lightbox) return;

  const lightboxImg = lightbox.querySelector('.lightbox-image');
  const lightboxTitle = lightbox.querySelector('.lightbox-caption-title');
  const lightboxMeta = lightbox.querySelector('.lightbox-caption-meta');
  const closeBtn = lightbox.querySelector('.lightbox-close-btn');
  const prevBtn = lightbox.querySelector('.lightbox-prev-btn');
  const nextBtn = lightbox.querySelector('.lightbox-next-btn');

  let currentIndex = 0;
  let visibleItems = [];

  const updateVisibleItems = () => {
    visibleItems = galleryItems.filter(item => !item.classList.contains('hidden'));
  };

  const showLightboxImage = (index) => {
    updateVisibleItems();
    if (!visibleItems.length) return;

    if (index < 0) index = visibleItems.length - 1;
    if (index >= visibleItems.length) index = 0;
    currentIndex = index;

    const item = visibleItems[currentIndex];
    const img = item.querySelector('img');
    const title = item.getAttribute('data-title') || img.alt;
    const category = item.getAttribute('data-category-name') || '';
    const source = item.getAttribute('data-source') || 'Ceylon Haven Archives / Unsplash';

    if (lightboxImg) {
      lightboxImg.src = img.src;
      lightboxImg.alt = title;
    }
    if (lightboxTitle) lightboxTitle.textContent = title;
    if (lightboxMeta) lightboxMeta.textContent = `${category} • Source: ${source}`;
  };

  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      updateVisibleItems();
      const clickedIndex = visibleItems.indexOf(item);
      if (clickedIndex !== -1) {
        showLightboxImage(clickedIndex);
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  const closeLightbox = () => {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  };

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (prevBtn) prevBtn.addEventListener('click', () => showLightboxImage(currentIndex - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => showLightboxImage(currentIndex + 1));

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showLightboxImage(currentIndex - 1);
    if (e.key === 'ArrowRight') showLightboxImage(currentIndex + 1);
  });
}

/* --------------------------------------------------------------------------
 * 8. Interactive FAQ Accordion
 * -------------------------------------------------------------------------- */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  if (!faqItems.length) return;

  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question-btn');
    if (!questionBtn) return;

    questionBtn.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');

      // Close all other FAQs for a clean accordion experience
      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
          const btn = otherItem.querySelector('.faq-question-btn');
          if (btn) btn.setAttribute('aria-expanded', 'false');
        }
      });

      item.classList.toggle('active', !isOpen);
      questionBtn.setAttribute('aria-expanded', !isOpen);
    });
  });
}

/* --------------------------------------------------------------------------
 * 9. Scroll to Top Floating Button
 * -------------------------------------------------------------------------- */
function initScrollTop() {
  const scrollBtn = document.querySelector('.scroll-top-btn');
  if (!scrollBtn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      scrollBtn.classList.add('visible');
    } else {
      scrollBtn.classList.remove('visible');
    }
  }, { passive: true });

  scrollBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* --------------------------------------------------------------------------
 * 10. Footer Newsletter Form
 * -------------------------------------------------------------------------- */
function initNewsletterForm() {
  const form = document.querySelector('.newsletter-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = form.querySelector('.newsletter-input');
    if (!input) return;

    const email = input.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address to subscribe.');
      input.focus();
      return;
    }

    alert('Ayubowan! Thank you for subscribing to Ceylon Haven Boutique Retreat stories and seasonal private offers.');
    input.value = '';
  });
}

/**
 * Utility: HTML Escape for safe DOM insertion
 */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
