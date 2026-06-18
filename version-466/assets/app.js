(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  ready(function () {
    var toggle = document.querySelector('.menu-toggle');
    var nav = document.querySelector('.site-nav');
    if (toggle && nav) {
      toggle.addEventListener('click', function () {
        nav.classList.toggle('open');
      });
    }

    var slider = document.querySelector('.hero-slider');
    if (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
      var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
      var prev = slider.querySelector('.hero-prev');
      var next = slider.querySelector('.hero-next');
      var current = 0;
      var timer = null;
      var show = function (index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('active', i === current);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('active', i === current);
          dot.setAttribute('aria-selected', i === current ? 'true' : 'false');
        });
      };
      var start = function () {
        if (timer) {
          clearInterval(timer);
        }
        timer = setInterval(function () {
          show(current + 1);
        }, 5000);
      };
      if (prev) {
        prev.addEventListener('click', function () {
          show(current - 1);
          start();
        });
      }
      if (next) {
        next.addEventListener('click', function () {
          show(current + 1);
          start();
        });
      }
      dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
          show(i);
          start();
        });
      });
      show(0);
      start();
    }

    var query = document.getElementById('siteSearch');
    var year = document.getElementById('filterYear');
    var region = document.getElementById('filterRegion');
    var type = document.getElementById('filterType');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.search-card'));
    var empty = document.querySelector('.no-results');
    var params = new URLSearchParams(window.location.search);
    if (query && params.get('q')) {
      query.value = params.get('q');
    }
    var applySearch = function () {
      if (!cards.length) {
        return;
      }
      var q = normalize(query && query.value);
      var y = normalize(year && year.value);
      var r = normalize(region && region.value);
      var t = normalize(type && type.value);
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.genre,
          card.dataset.region,
          card.dataset.type,
          card.dataset.tags,
          card.dataset.year
        ].join(' '));
        var matched = (!q || haystack.indexOf(q) !== -1) &&
          (!y || normalize(card.dataset.year) === y) &&
          (!r || normalize(card.dataset.region).indexOf(r) !== -1) &&
          (!t || normalize(card.dataset.type).indexOf(t) !== -1);
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    };
    [query, year, region, type].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applySearch);
        control.addEventListener('change', applySearch);
      }
    });
    applySearch();

    var pageFilter = document.querySelector('.page-filter-input');
    if (pageFilter) {
      var localCards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
      pageFilter.addEventListener('input', function () {
        var q = normalize(pageFilter.value);
        localCards.forEach(function (card) {
          var text = normalize(card.textContent);
          card.style.display = !q || text.indexOf(q) !== -1 ? '' : 'none';
        });
      });
    }
  });
})();
