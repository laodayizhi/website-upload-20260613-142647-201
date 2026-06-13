(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var thumbs = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-thumb]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });

      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });

      thumbs.forEach(function (thumb, i) {
        thumb.classList.toggle('is-active', i === index);
      });
    }

    function startTimer() {
      clearInterval(timer);
      timer = setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        showSlide(i);
        startTimer();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        startTimer();
      });
    }

    startTimer();
  }

  var params = new URLSearchParams(window.location.search);
  var q = params.get('q') || '';
  var searchInput = document.querySelector('[data-search-input]');
  var regionFilter = document.querySelector('[data-region-filter]');
  var typeFilter = document.querySelector('[data-type-filter]');
  var yearFilter = document.querySelector('[data-year-filter]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));

  if (searchInput && q) {
    searchInput.value = q;
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function matchCard(card) {
    var keyword = normalize(searchInput ? searchInput.value : '');
    var region = regionFilter ? regionFilter.value : '';
    var type = typeFilter ? typeFilter.value : '';
    var year = yearFilter ? yearFilter.value : '';
    var text = normalize([
      card.getAttribute('data-title'),
      card.getAttribute('data-tags'),
      card.getAttribute('data-region'),
      card.getAttribute('data-type'),
      card.getAttribute('data-year'),
      card.getAttribute('data-category'),
      card.textContent
    ].join(' '));

    if (keyword && text.indexOf(keyword) === -1) {
      return false;
    }

    if (region && card.getAttribute('data-region') !== region) {
      return false;
    }

    if (type && card.getAttribute('data-type') !== type) {
      return false;
    }

    if (year && card.getAttribute('data-year') !== year) {
      return false;
    }

    return true;
  }

  function applyFilters() {
    cards.forEach(function (card) {
      card.classList.toggle('is-hidden', !matchCard(card));
    });
  }

  [searchInput, regionFilter, typeFilter, yearFilter].forEach(function (field) {
    if (field) {
      field.addEventListener('input', applyFilters);
      field.addEventListener('change', applyFilters);
    }
  });

  document.querySelectorAll('[data-chip-region]').forEach(function (chip) {
    chip.addEventListener('click', function () {
      if (regionFilter) {
        regionFilter.value = chip.getAttribute('data-chip-region') || '';
        applyFilters();
      }
    });
  });

  document.querySelectorAll('[data-chip-category]').forEach(function (chip) {
    chip.addEventListener('click', function () {
      if (searchInput) {
        searchInput.value = chip.getAttribute('data-chip-category') || '';
        applyFilters();
      }
    });
  });

  if (cards.length) {
    applyFilters();
  }
})();
