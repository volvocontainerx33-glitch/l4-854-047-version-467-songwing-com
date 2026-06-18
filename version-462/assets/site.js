(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function uniqueValues(cards, key) {
    var values = [];
    cards.forEach(function (card) {
      var value = card.getAttribute("data-" + key) || "";
      if (value && values.indexOf(value) === -1) {
        values.push(value);
      }
    });
    return values.sort(function (a, b) {
      return b.localeCompare(a, "zh-CN", { numeric: true });
    });
  }

  function fillSelect(select, values) {
    if (!select) {
      return;
    }
    values.forEach(function (value) {
      var option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  ready(function () {
    var toggle = document.querySelector("[data-nav-toggle]");
    var menu = document.querySelector("[data-nav-menu]");

    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        menu.classList.toggle("is-open");
      });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var current = 0;
      var timer = null;

      function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5000);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");

      if (prev) {
        prev.addEventListener("click", function () {
          show(current - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(current + 1);
          start();
        });
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(parseInt(dot.getAttribute("data-hero-dot"), 10) || 0);
          start();
        });
      });

      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
      start();
    }

    document.querySelectorAll("[data-filter-form]").forEach(function (form) {
      var scope = form.parentElement || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
      var input = form.querySelector("[data-filter-input]");
      var year = form.querySelector("[data-filter-year]");
      var region = form.querySelector("[data-filter-region]");
      var type = form.querySelector("[data-filter-type]");
      var empty = scope.querySelector("[data-empty-state]");

      fillSelect(year, uniqueValues(cards, "year"));
      fillSelect(region, uniqueValues(cards, "region"));
      fillSelect(type, uniqueValues(cards, "type"));

      function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : "";
        var yearValue = year ? year.value : "";
        var regionValue = region ? region.value : "";
        var typeValue = type ? type.value : "";
        var visible = 0;

        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search") || "").toLowerCase();
          var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
          var matchYear = !yearValue || card.getAttribute("data-year") === yearValue;
          var matchRegion = !regionValue || card.getAttribute("data-region") === regionValue;
          var matchType = !typeValue || card.getAttribute("data-type") === typeValue;
          var matched = matchKeyword && matchYear && matchRegion && matchType;

          card.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      [input, year, region, type].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
    });
  });
})();
