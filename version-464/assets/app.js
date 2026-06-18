(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');
  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer;

    function showSlide(nextIndex) {
      if (!slides.length) return;
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function startTimer() {
      clearInterval(timer);
      timer = setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

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

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(parseInt(dot.getAttribute('data-hero-dot'), 10) || 0);
        startTimer();
      });
    });

    startTimer();
  }

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    var input = scope.querySelector('[data-filter-input]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
    var chips = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-value]'));
    var activeField = '';
    var activeValue = 'all';

    function applyFilter() {
      var term = input ? input.value.trim().toLowerCase() : '';
      cards.forEach(function (card) {
        var searchText = card.getAttribute('data-search') || '';
        var matchesText = !term || searchText.indexOf(term) !== -1;
        var matchesChip = activeValue === 'all';
        if (!matchesChip && activeField) {
          matchesChip = (card.getAttribute(activeField) || '') === activeValue;
        }
        card.classList.toggle('hidden-by-filter', !(matchesText && matchesChip));
      });
    }

    if (input) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q');
      if (query) {
        input.value = query;
      }
      input.addEventListener('input', applyFilter);
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (item) {
          item.classList.remove('active');
        });
        chip.classList.add('active');
        activeField = chip.getAttribute('data-filter-field') || '';
        activeValue = chip.getAttribute('data-filter-value') || 'all';
        applyFilter();
      });
    });

    applyFilter();
  });

  document.querySelectorAll('[data-player]').forEach(function (wrap) {
    var video = wrap.querySelector('video');
    var button = wrap.querySelector('[data-play-button]');
    var playerReady = false;
    var playerLoading = false;

    function attachStream(done) {
      if (!video || playerReady || playerLoading) {
        if (done) done();
        return;
      }
      var source = video.getAttribute('data-src');
      if (!source) {
        if (done) done();
        return;
      }
      playerLoading = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        playerReady = true;
        playerLoading = false;
        if (done) done();
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          playerReady = true;
          playerLoading = false;
          if (done) done();
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            playerLoading = false;
          }
        });
        video._hls = hls;
      } else {
        video.src = source;
        playerReady = true;
        playerLoading = false;
        if (done) done();
      }
    }

    function playVideo() {
      attachStream(function () {
        var result = video.play();
        wrap.classList.add('playing');
        if (result && typeof result.catch === 'function') {
          result.catch(function () {
            wrap.classList.remove('playing');
          });
        }
      });
    }

    if (button) {
      button.addEventListener('click', playVideo);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          playVideo();
        }
      });
      video.addEventListener('play', function () {
        wrap.classList.add('playing');
      });
      video.addEventListener('pause', function () {
        if (!video.ended) {
          wrap.classList.remove('playing');
        }
      });
      video.addEventListener('ended', function () {
        wrap.classList.remove('playing');
      });
    }
  });
})();
