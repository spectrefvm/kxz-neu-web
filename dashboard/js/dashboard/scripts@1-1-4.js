// === Global Interaction Blocks ===
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('copy', e => e.preventDefault());
document.addEventListener('dragstart', e => e.preventDefault());
document.addEventListener('dblclick', e => e.preventDefault());

// === Copy Key Function ===
window.copyKey = function () {
  const key = document.getElementById("licenseKey").textContent.trim();
  navigator.clipboard.writeText(key).then(() => {
    const successMsg = document.getElementById("copySuccess");
    successMsg.style.display = "block";
    setTimeout(() => {
      successMsg.style.display = "none";
    }, 2000);
  });
};

// === FEEDBACK SHI ===
  document.addEventListener('DOMContentLoaded', () => {
    const feedbacks = document.querySelectorAll('.feedback-card');

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Optional: log to check it's working
          console.log('Showing:', entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.25
    });

    feedbacks.forEach(card => {
      observer.observe(card);
    });
  });

// === NAV SWITCH FUNCTION ===
    document.addEventListener('DOMContentLoaded', function () {
      const navItems = document.querySelectorAll('.nav-item');
      const pageSections = document.querySelectorAll('.page-section');

      navItems.forEach(item => {
        item.addEventListener('click', function (e) {
          e.preventDefault();
          navItems.forEach(nav => nav.classList.remove('active'));
          this.classList.add('active');
          pageSections.forEach(section => section.classList.remove('active'));
          const pageId = this.getAttribute('data-page');
          document.getElementById(pageId).classList.add('active');
        });
      });

      const cards = document.querySelectorAll('.card');
      cards.forEach((card, index) => {
        card.style.setProperty('--animation-order', index + 1);
      });
    });

// === Toggle Feedback Show More ===
window.toggleFeedback = function () {
  const more = document.getElementById("moreFeedback");
  const btn = document.getElementById("toggleFeedbackBtn");
  if (more.style.display === "none") {
    more.style.display = "block";
    btn.textContent = "Show Less";
  } else {
    more.style.display = "none";
    btn.textContent = "Show More";
  }
};

// === DOM Content Loaded ===
document.addEventListener('DOMContentLoaded', function () {
  // Nav navigation logic
  const navItems = document.querySelectorAll('.nav-item');
  const pageSections = document.querySelectorAll('.page-section');

  navItems.forEach(item => {
    item.addEventListener('click', function (e) {
      e.preventDefault();
      navItems.forEach(nav => nav.classList.remove('active'));
      this.classList.add('active');
      pageSections.forEach(section => section.classList.remove('active'));
      const pageId = this.getAttribute('data-page');
      document.getElementById(pageId).classList.add('active');
    });
  });

  // Animate cards in order
  const cards = document.querySelectorAll('.card');
  cards.forEach((card, index) => {
    card.style.setProperty('--animation-order', index + 1);
  });

  // Set random UID
  const uidElement = document.getElementById('uid');
  if (uidElement) {
    const randomUID = Math.floor(Math.random() * 9000) + 1000;
    uidElement.textContent = randomUID;
  }

  // Auto-open GetKey section if ?getkey in URL
  const params = new URLSearchParams(window.location.search);
  if (params.has('getkey')) {
    document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
    document.getElementById('getkey')?.classList.add('active');
    document.querySelectorAll('.nav-item').forEach(i => {
      i.classList.toggle('active', i.getAttribute('data-page') === 'getkey');
    });
  }
});












$(document).ready(function(){
  $(".owl-carousel").owlCarousel({
    items: 1,
    loop: true,
    margin: 20,
    nav: true,
    dots: true,
    autoplay: true,
    autoplayTimeout: 5000,
    responsive: {
      0: {
        items: 1
      },
      768: {
        items: 2
      },
      1200: {
        items: 4
      }
    }
  });
});

