  <script>
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
  
  </script>

<script>
  // Rechtsklick blockieren
  document.addEventListener('contextmenu', e => e.preventDefault());

  // Copy blockieren
  document.addEventListener('copy', e => e.preventDefault());

  // Drag blockieren
  document.addEventListener('dragstart', e => e.preventDefault());

  // Doppelklick blockieren
  document.addEventListener('dblclick', e => e.preventDefault());
</script>


<script>
function copyKey() {
  const key = document.getElementById("licenseKey").textContent.trim();
  navigator.clipboard.writeText(key).then(() => {
    const successMsg = document.getElementById("copySuccess");
    successMsg.style.display = "block";
    setTimeout(() => {
      successMsg.style.display = "none";
    }, 2000);
  });
}
</script>







<script>
  document.addEventListener('DOMContentLoaded', function () {
    const params = new URLSearchParams(window.location.search);

    if (params.has('getkey')) {
      const allSections = document.querySelectorAll('.page-section');
      const allNavItems = document.querySelectorAll('.nav-item');

      // Hide all sections
      allSections.forEach(section => section.classList.remove('active'));

      // Show the getkey section
      const getkeySection = document.getElementById('getkey');
      if (getkeySection) {
        getkeySection.classList.add('active');
      }

      // Set nav active state
      allNavItems.forEach(item => {
        const page = item.getAttribute('data-page');
        if (page === 'getkey') {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });
    }
  });
</script>


<script>
  document.addEventListener('DOMContentLoaded', function () {
    const randomUID = Math.floor(Math.random() * 9000) + 1000; // 4-digit UID
    const uidElement = document.getElementById('uid');
    if (uidElement) {
      uidElement.textContent = randomUID;
    }
  });
</script>

<script>
  function toggleFeedback() {
    const more = document.getElementById("moreFeedback");
    const btn = document.getElementById("toggleFeedbackBtn");
    if (more.style.display === "none") {
      more.style.display = "block";
      btn.textContent = "Show Less";
    } else {
      more.style.display = "none";
      btn.textContent = "Show More";
    }
  }
</script>
