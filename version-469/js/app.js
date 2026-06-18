(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
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

        function show(target) {
            index = (target + slides.length) % slides.length;
            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle('is-active', itemIndex === index);
            });
            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle('is-active', itemIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

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

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupHomeSearch() {
        var form = document.querySelector('[data-home-search]');
        if (!form) {
            return;
        }
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = form.querySelector('input[name="q"]');
            var query = input ? input.value.trim() : '';
            window.location.href = './search.html' + (query ? '?q=' + encodeURIComponent(query) : '');
        });
    }

    function setupFilters() {
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-card]'));
        if (!cards.length) {
            return;
        }
        var search = document.querySelector('[data-site-search]');
        var typeSelect = document.querySelector('[data-filter-type]');
        var yearSelect = document.querySelector('[data-filter-year]');
        var clear = document.querySelector('[data-clear-filters]');
        var count = document.querySelector('[data-result-count]');
        var empty = document.querySelector('[data-empty-state]');
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';

        if (search && initialQuery) {
            search.value = initialQuery;
        }

        function apply() {
            var query = search ? search.value.trim().toLowerCase() : '';
            var typeValue = typeSelect ? typeSelect.value : '';
            var yearValue = yearSelect ? yearSelect.value : '';
            var shown = 0;

            cards.forEach(function (card) {
                var text = (card.getAttribute('data-search') || '').toLowerCase();
                var type = card.getAttribute('data-type') || '';
                var year = card.getAttribute('data-year') || '';
                var matched = true;

                if (query && text.indexOf(query) === -1) {
                    matched = false;
                }
                if (typeValue && type !== typeValue) {
                    matched = false;
                }
                if (yearValue && year !== yearValue) {
                    matched = false;
                }

                card.hidden = !matched;
                if (matched) {
                    shown += 1;
                }
            });

            if (count) {
                count.textContent = shown + ' 部影片';
            }
            if (empty) {
                empty.hidden = shown !== 0;
            }
        }

        if (search) {
            search.addEventListener('input', apply);
        }
        if (typeSelect) {
            typeSelect.addEventListener('change', apply);
        }
        if (yearSelect) {
            yearSelect.addEventListener('change', apply);
        }
        if (clear) {
            clear.addEventListener('click', function () {
                if (search) {
                    search.value = '';
                }
                if (typeSelect) {
                    typeSelect.value = '';
                }
                if (yearSelect) {
                    yearSelect.value = '';
                }
                apply();
            });
        }
        apply();
    }

    function setupPlayer() {
        var player = document.querySelector('[data-player]');
        if (!player) {
            return;
        }
        var video = player.querySelector('video');
        var button = player.querySelector('[data-play-button]');
        var source = player.getAttribute('data-source');
        var hlsInstance = null;

        if (!video || !source) {
            return;
        }

        function attachSource() {
            if (video.getAttribute('data-ready') === '1') {
                return;
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                video.setAttribute('data-ready', '1');
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                video.setAttribute('data-ready', '1');
                return;
            }
            video.src = source;
            video.setAttribute('data-ready', '1');
        }

        function playVideo() {
            attachSource();
            player.classList.add('is-playing');
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    player.classList.remove('is-playing');
                });
            }
        }

        if (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                playVideo();
            });
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                playVideo();
            }
        });

        video.addEventListener('play', function () {
            player.classList.add('is-playing');
        });

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupHomeSearch();
        setupFilters();
        setupPlayer();
    });
})();
