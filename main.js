document.addEventListener('DOMContentLoaded', function () {

  const progressBar = document.createElement('div');
  progressBar.id = 'progress-bar';
  document.body.prepend(progressBar);

  window.addEventListener('scroll', function () {
    const scrollTop    = window.scrollY;
    const docHeight    = document.documentElement.scrollHeight - window.innerHeight;
    const progress     = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = progress + '%';
  }, { passive: true });

  const topBtn = document.createElement('button');
  topBtn.id            = 'back-to-top';
  topBtn.textContent   = '↑';
  topBtn.title         = 'Back to top';
  topBtn.setAttribute('aria-label', 'Scroll back to top');
  document.body.appendChild(topBtn);

  window.addEventListener('scroll', function () {
    if (window.scrollY > 300) {
      topBtn.classList.add('visible');
    } else {
      topBtn.classList.remove('visible');
    }
  }, { passive: true });

  topBtn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks    = document.querySelectorAll('nav[aria-label="Site navigation"] a');

  navLinks.forEach(function (link) {
    const href = link.getAttribute('href');

    if (!link.classList.contains('active')) {
      if (href === currentPage || (currentPage === '' && href === 'index.html')) {
        link.classList.add('active');
      }
    }
  });

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const rawHash = this.getAttribute('href').slice(1);

      const target = document.getElementById(rawHash);
      if (target) {
        e.preventDefault();

        const navEl  = document.querySelector('nav[aria-label="Site navigation"]');
        const offset = navEl ? navEl.offsetHeight + 12 : 70;
        const top    = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });

  const sections = document.querySelectorAll('section');

  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          sectionObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });

    sections.forEach(function (section) {
      sectionObserver.observe(section);
    });
  } else {

    sections.forEach(function (s) { s.classList.add('visible'); });
  }

  const tocLinks = document.querySelectorAll('nav.toc a[href^="#"]');
  const headings = Array.from(tocLinks).map(function (link) {
    const id = link.getAttribute('href').slice(1);
    return document.getElementById(id);
  }).filter(Boolean);

  if (tocLinks.length > 0 && headings.length > 0) {
    window.addEventListener('scroll', function () {
      const navEl  = document.querySelector('nav[aria-label="Site navigation"]');
      const offset = navEl ? navEl.offsetHeight + 20 : 80;
      let activeId = null;

      headings.forEach(function (heading) {
        if (heading.getBoundingClientRect().top <= offset) {
          activeId = heading.id;
        }
      });

      tocLinks.forEach(function (link) {
        link.classList.remove('toc-active');
        if (activeId && link.getAttribute('href') === '#' + activeId) {
          link.classList.add('toc-active');
        }
      });
    }, { passive: true });
  }

  const isFunFacts = window.location.pathname.includes('funfacts');

  if (isFunFacts) {
    buildFunFactCards();
  }

  function buildFunFactCards() {
    const mainEl = document.querySelector('main');
    if (!mainEl) return;

    const icons = ['🦓', '😴', '🦁', '👁️', '👂', '🌙', '🌿', '🐣', '👶', '🦷'];

    const factH2s = mainEl.querySelectorAll('h2');

    const intro = document.createElement('div');
    intro.innerHTML = `
      <h2 class="funfacts-page-title" style="border:none;padding:0;margin-top:0;">Did You Know?</h2>
      <p class="funfacts-intro">10 amazing facts about zebras</p>
    `;
    mainEl.insertBefore(intro, mainEl.firstChild);

    factH2s.forEach(function (h2, index) {
      const p = h2.nextElementSibling;
      if (!p || p.tagName !== 'P') return;

      const card = document.createElement('div');
      card.className = 'fact-card';
      card.dataset.num = String(index + 1).padStart(2, '0');
      card.style.transitionDelay = (index * 0.07) + 's';

      const iconSpan = document.createElement('span');
      iconSpan.className = 'fact-icon';
      iconSpan.textContent = icons[index] || '🦓';

      const cardH = document.createElement('h2');
      cardH.textContent = 'Fact ' + String(index + 1).padStart(2, '0');

      const cardP = p.cloneNode(true);

      card.appendChild(iconSpan);
      card.appendChild(cardH);
      card.appendChild(cardP);

      mainEl.insertBefore(card, h2);
      h2.remove();
      p.remove();

      if ((index + 1) % 5 === 0 && index !== factH2s.length - 1) {
        const divider = document.createElement('div');
        divider.className = 'stripe-divider';
        mainEl.insertBefore(divider, card.nextSibling);
      }
    });

    const cards = document.querySelectorAll('.fact-card');

    if ('IntersectionObserver' in window) {
      const cardObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            cardObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });

      cards.forEach(function (card) {
        cardObserver.observe(card);
      });
    } else {
      cards.forEach(function (c) { c.classList.add('visible'); });
    }
  }

  const tables = document.querySelectorAll('table.species-comparison-table');
  tables.forEach(function (table) {
    table.removeAttribute('border');
    table.removeAttribute('style');
    const ths = table.querySelectorAll('th, td');
    ths.forEach(function (cell) { cell.removeAttribute('style'); });
  });

  const isHomePage = document.querySelector('table.species-comparison-table') !== null;
  if (isHomePage) {
    buildHomeExtras();
  }

  function buildHomeExtras() {
    const topSection = document.querySelector('.top-section .content');
    if (!topSection) return;

    const infobox = document.createElement('aside');
    infobox.className = 'infobox';
    infobox.setAttribute('aria-label', 'Zebra quick facts');
    infobox.innerHTML = `
      <div class="infobox-title">Zebra</div>
      <div class="infobox-subtitle">Subgenus: <em>Hippotigris</em></div>
      <table>
        <tr>
          <th>Kingdom</th>
          <td>Animalia</td>
        </tr>
        <tr>
          <th>Order</th>
          <td>Perissodactyla</td>
        </tr>
        <tr>
          <th>Family</th>
          <td>Equidae</td>
        </tr>
        <tr>
          <th>Genus</th>
          <td><em>Equus</em></td>
        </tr>
        <tr>
          <th>Species</th>
          <td>3 living species</td>
        </tr>
        <tr>
          <th>Habitat</th>
          <td>Savannas, grasslands, mountains</td>
        </tr>
        <tr>
          <th>Range</th>
          <td>Eastern &amp; Southern Africa</td>
        </tr>
        <tr>
          <th>Diet</th>
          <td>Herbivore (grasses, sedges)</td>
        </tr>
        <tr>
          <th>Lifespan</th>
          <td>20–30 years (wild)</td>
        </tr>
        <tr>
          <th>Status</th>
          <td>
            <span class="infobox-status status-endangered">Endangered</span>
            <span class="infobox-status status-vulnerable">Vulnerable</span>
            <span class="infobox-status status-near-threatened">Near Threatened</span>
          </td>
        </tr>
      </table>
    `;

    const firstP = topSection.querySelector('p');
    if (firstP) {
      topSection.insertBefore(infobox, firstP);
    } else {
      topSection.prepend(infobox);
    }

    const mainEl = document.querySelector('main');
    if (!mainEl) return;

    const exploreSection = document.createElement('div');
    exploreSection.className = 'explore-section';
    exploreSection.innerHTML = `
      <p>Explore this article</p>
      <div class="explore-grid">
        <a href="captivity.html" class="explore-card">
          <span class="explore-card-icon">🏛️</span>
          <span class="explore-card-label">Page 2</span>
          <span class="explore-card-title">Captivity &amp; Domestication</span>
        </a>
        <a href="culture.html" class="explore-card">
          <span class="explore-card-icon">🎨</span>
          <span class="explore-card-label">Page 3</span>
          <span class="explore-card-title">Culture &amp; Media</span>
        </a>
        <a href="funfacts.html" class="explore-card">
          <span class="explore-card-icon">🦓</span>
          <span class="explore-card-label">Page 4</span>
          <span class="explore-card-title">Fun Facts</span>
        </a>
        <a href="references.html" class="explore-card">
          <span class="explore-card-icon">📚</span>
          <span class="explore-card-label">Page 5</span>
          <span class="explore-card-title">References</span>
        </a>
      </div>
    `;

    const topDiv = document.querySelector('.top-section');
    const firstSection = mainEl.querySelector('section');
    if (topDiv && firstSection) {
      mainEl.insertBefore(exploreSection, firstSection);
    } else if (topDiv) {
      topDiv.after(exploreSection);
    }
  }

});
