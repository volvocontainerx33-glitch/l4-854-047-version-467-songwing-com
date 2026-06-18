(function () {
  function rootPrefix() {
    var depth = Number(window.SITE_DEPTH || 0);
    return '../'.repeat(depth);
  }

  function buildUrl(url) {
    if (/^https?:\/\//.test(url)) {
      return url;
    }
    return rootPrefix() + url;
  }

  function setupMobileMenu() {
    var button = document.querySelector('[data-menu-button]');
    var panel = document.querySelector('[data-nav-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5500);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupSiteSearch() {
    var container = document.querySelector('[data-site-search]');
    var input = document.querySelector('[data-search-input]');
    var results = document.querySelector('[data-search-results]');
    var data = window.MOVIE_SEARCH_DATA || [];

    if (!container || !input || !results || !data.length) {
      return;
    }

    function render(items) {
      if (!items.length) {
        results.innerHTML = '<div class="search-result-item"><div></div><div><strong>没有找到相关影片</strong><small>换一个关键词试试</small></div></div>';
        results.classList.add('is-open');
        return;
      }

      results.innerHTML = items.slice(0, 8).map(function (item) {
        return [
          '<a class="search-result-item" href="' + buildUrl(item.url) + '">',
          '  <img src="' + buildUrl(item.image) + '" alt="' + item.title.replace(/"/g, '&quot;') + '">',
          '  <span>',
          '    <strong>' + item.title + '</strong>',
          '    <small>' + item.year + ' · ' + item.region + ' · ★ ' + item.rating + '</small>',
          '  </span>',
          '</a>'
        ].join('');
      }).join('');
      results.classList.add('is-open');
    }

    input.addEventListener('input', function () {
      var query = input.value.trim().toLowerCase();
      if (!query) {
        results.classList.remove('is-open');
        results.innerHTML = '';
        return;
      }

      var matched = data.filter(function (item) {
        return item.search.indexOf(query) !== -1;
      });
      render(matched);
    });

    document.addEventListener('click', function (event) {
      if (!container.contains(event.target)) {
        results.classList.remove('is-open');
      }
    });
  }

  function setupPageFilter() {
    var panel = document.querySelector('[data-page-filter]');
    var list = document.querySelector('[data-page-filter-list]');
    if (!panel || !list) {
      return;
    }

    var input = panel.querySelector('[data-page-filter-input]');
    var buttons = Array.prototype.slice.call(panel.querySelectorAll('[data-year-filter]'));
    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-movie-card]'));
    var empty = document.querySelector('[data-empty-message]');
    var currentYear = 'all';

    function apply() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-region') || '',
          card.getAttribute('data-year') || '',
          card.getAttribute('data-tags') || ''
        ].join(' ').toLowerCase();
        var year = card.getAttribute('data-year') || '';
        var matchesText = !query || haystack.indexOf(query) !== -1;
        var matchesYear = currentYear === 'all' || year === currentYear;
        var show = matchesText && matchesYear;
        card.style.display = show ? '' : 'none';
        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    if (input) {
      input.addEventListener('input', apply);
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        currentYear = button.getAttribute('data-year-filter') || 'all';
        buttons.forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        apply();
      });
    });
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('.js-hls-player'));
    players.forEach(function (video) {
      var source = video.getAttribute('data-hls-src');
      var shell = video.closest('[data-video-shell]');
      var playButton = shell ? shell.querySelector('[data-video-play]') : null;

      function attachSource() {
        if (video.dataset.ready === 'true') {
          return;
        }
        video.dataset.ready = 'true';

        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          video._hls = hls;
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else {
          video.dataset.error = '当前浏览器不支持 HLS 播放，请更换浏览器或开启 HLS.js。';
        }
      }

      function play() {
        attachSource();
        var result = video.play();
        if (result && typeof result.catch === 'function') {
          result.catch(function () {
            if (playButton) {
              playButton.style.opacity = '1';
              playButton.style.pointerEvents = 'auto';
            }
          });
        }
      }

      if (playButton) {
        playButton.addEventListener('click', play);
      }

      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        } else {
          video.pause();
        }
      });

      video.addEventListener('play', function () {
        if (shell) {
          shell.classList.add('is-playing');
        }
      });

      video.addEventListener('pause', function () {
        if (shell) {
          shell.classList.remove('is-playing');
        }
      });

      video.addEventListener('loadedmetadata', function () {
        if (shell) {
          shell.classList.add('is-ready');
        }
      });
    });
  }

  function setupImageFallback() {
    document.addEventListener('error', function (event) {
      var target = event.target;
      if (target && target.tagName === 'IMG') {
        target.style.opacity = '0';
        target.parentElement && target.parentElement.classList.add('image-missing');
      }
    }, true);
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupHero();
    setupSiteSearch();
    setupPageFilter();
    setupPlayers();
    setupImageFallback();
  });
})();
