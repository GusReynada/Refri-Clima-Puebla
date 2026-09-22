/* ==========================================================================
   Refri Clima Puebla - Modern Interactive JavaScript Core
   Features:
   - Dynamic Carousel with autoscroll, pause on hover, touch swipe & pagination
   - Clipboard copy actions with animated Toast feedback
   - Mobile responsive navigation menu
   - Scroll-triggered dynamic header background
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Carousel Controller setup
  initCarousel();

  // 2. Copy to Clipboard system initialization
  initClipboardButtons();

  // 3. Responsive Navigation Menu toggle
  initMobileMenu();

  // 4. Header scroll styling logic
  initHeaderScrollEffect();
});

/**
 * Interactive Carousel System
 */
function initCarousel() {
  const track = document.getElementById('carouselTrack');
  const slides = Array.from(track ? track.children : []);
  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');
  const dotsNav = document.getElementById('carouselDots');
  const viewport = document.getElementById('carouselViewport');

  if (!track || slides.length === 0) return;

  let currentIndex = 0;
  let autoplayTimer = null;
  const autoplayInterval = 4000; // 4 seconds per slide

  // Generate pagination dots dynamically
  slides.forEach((_, idx) => {
    const dot = document.createElement('button');
    dot.classList.add('carousel-dot');
    dot.setAttribute('aria-label', `Ir a diapositiva ${idx + 1}`);
    if (idx === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToSlide(idx));
    dotsNav.appendChild(dot);
  });

  const dots = Array.from(dotsNav.children);

  function updateCarouselState() {
    // Translate track
    track.style.transform = `translateX(-${currentIndex * 100}%)`;

    // Update dots state
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentIndex);
    });
  }

  function goToSlide(index) {
    if (index < 0) {
      currentIndex = slides.length - 1;
    } else if (index >= slides.length) {
      currentIndex = 0;
    } else {
      currentIndex = index;
    }
    updateCarouselState();
  }

  function nextSlide() {
    goToSlide(currentIndex + 1);
  }

  function prevSlide() {
    goToSlide(currentIndex - 1);
  }

  // Event Listeners for Nav Buttons
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      nextSlide();
      resetAutoplay();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      prevSlide();
      resetAutoplay();
    });
  }

  // Autoplay Logic
  function startAutoplay() {
    if (!autoplayTimer) {
      autoplayTimer = setInterval(nextSlide, autoplayInterval);
    }
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  function resetAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  // Pause autoscroll on mouse hover & resume on mouse leave
  if (viewport) {
    viewport.addEventListener('mouseenter', stopAutoplay);
    viewport.addEventListener('mouseleave', startAutoplay);
    viewport.addEventListener('touchstart', stopAutoplay, { passive: true });
    viewport.addEventListener('touchend', startAutoplay, { passive: true });
  }

  // Touch Swipe Gesture Support
  let touchStartX = 0;
  let touchEndX = 0;

  if (viewport) {
    viewport.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    viewport.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });
  }

  function handleSwipe() {
    const swipeThreshold = 50;
    if (touchEndX < touchStartX - swipeThreshold) {
      nextSlide();
      resetAutoplay();
    } else if (touchEndX > touchStartX + swipeThreshold) {
      prevSlide();
      resetAutoplay();
    }
  }

  // Keyboard navigation & resize handler
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') nextSlide();
    if (e.key === 'ArrowLeft') prevSlide();
  });

  window.addEventListener('resize', () => {
    updateCarouselState();
  });

  // Start Autoplay initially
  startAutoplay();
}

/**
 * Copy to Clipboard System with Custom Toast Alert
 */
function initClipboardButtons() {
  const copyBtns = document.querySelectorAll('.btn-copy');

  copyBtns.forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const textToCopy = btn.getAttribute('data-copy');
      const label = btn.getAttribute('data-label') || 'Información';

      if (!textToCopy) return;

      try {
        await navigator.clipboard.writeText(textToCopy);
        showToast(`¡${label} copiado al portapapeles!`);
      } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showToast(`¡${label} copiado al portapapeles!`);
      }
    });
  });
}

/**
 * Floating Toast Notification Display
 */
function showToast(message) {
  let toast = document.getElementById('toastNotification');

  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toastNotification';
    toast.className = 'toast-notification';
    toast.innerHTML = `
      <span class="toast-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      </span>
      <span class="toast-message" id="toastMessage"></span>
    `;
    document.body.appendChild(toast);
  }

  const toastMsg = document.getElementById('toastMessage');
  toastMsg.textContent = message;

  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}

/**
 * Mobile Navigation Drawer Toggle
 */
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobileMenuToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!toggleBtn || !navMenu) return;

  toggleBtn.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    toggleBtn.classList.toggle('open');
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('active');
      toggleBtn.classList.remove('open');
    });
  });
}

/**
 * Header dynamic background transition on scroll
 */
function initHeaderScrollEffect() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.4)';
    } else {
      header.style.boxShadow = 'none';
    }
  });
}
