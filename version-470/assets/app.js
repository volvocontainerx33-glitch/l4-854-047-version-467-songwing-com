(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var slider = document.querySelector('[data-hero-slider]');

  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var active = 0;

    function showSlide(index) {
      active = index;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var next = Number(dot.getAttribute('data-hero-dot')) || 0;
        showSlide(next);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide((active + 1) % slides.length);
      }, 5200);
    }
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-search-area]')).forEach(function (area) {
    var input = area.querySelector('[data-search-input]');
    var select = area.querySelector('[data-filter-select]');
    var cards = Array.prototype.slice.call(area.querySelectorAll('[data-movie-card]'));

    function applyFilter() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var category = select ? select.value.trim() : '';

      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-year'),
          card.getAttribute('data-tags'),
          card.textContent
        ].join(' ').toLowerCase();
        var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchesCategory = !category || text.indexOf(category.toLowerCase()) !== -1;
        card.style.display = matchesKeyword && matchesCategory ? '' : 'none';
      });
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    if (select) {
      select.addEventListener('change', applyFilter);
    }
  });
})();

function initMoviePlayer(source) {
  var root = document.querySelector('[data-player]');

  if (!root) {
    return;
  }

  var video = root.querySelector('video');
  var button = root.querySelector('[data-play-button]');
  var attached = false;
  var hlsInstance = null;

  function attach() {
    if (attached || !video || !source) {
      return;
    }

    attached = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
    } else {
      video.src = source;
    }
  }

  function play() {
    attach();

    if (button) {
      button.classList.add('is-hidden');
    }

    var action = video.play();

    if (action && typeof action.catch === 'function') {
      action.catch(function () {
        if (button) {
          button.classList.remove('is-hidden');
        }
      });
    }
  }

  if (button) {
    button.addEventListener('click', play);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener('play', function () {
      if (button) {
        button.classList.add('is-hidden');
      }
    });
  }

  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
