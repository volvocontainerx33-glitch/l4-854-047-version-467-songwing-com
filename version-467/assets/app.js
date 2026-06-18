(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        menu.classList.toggle("is-open");
      });
    }

    var input = document.querySelector("[data-search-input]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    var empty = document.querySelector("[data-empty-result]");
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-category]"));
    var activeCategory = "all";

    function applyFilter() {
      var query = input ? input.value.trim().toLowerCase() : "";
      var visible = 0;
      cards.forEach(function (card) {
        var text = (card.getAttribute("data-title") || "").toLowerCase();
        var category = card.getAttribute("data-category") || "";
        var matchText = !query || text.indexOf(query) !== -1;
        var matchCategory = activeCategory === "all" || category === activeCategory;
        var show = matchText && matchCategory;
        card.style.display = show ? "" : "none";
        if (show) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    if (input && cards.length) {
      input.addEventListener("input", applyFilter);
    }

    filterButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        activeCategory = button.getAttribute("data-filter-category") || "all";
        filterButtons.forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });
        applyFilter();
      });
    });
  });
})();

function initPlayer(source) {
  var video = document.getElementById("movie-player");
  var cover = document.querySelector(".player-cover");
  if (!video || !source) {
    return;
  }
  var started = false;
  var hlsInstance = null;

  function playVideo() {
    var action = video.play();
    if (action && typeof action.catch === "function") {
      action.catch(function () {});
    }
  }

  function start() {
    if (started) {
      playVideo();
      return;
    }
    started = true;
    if (cover) {
      cover.classList.add("is-hidden");
    }
    video.controls = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      video.addEventListener("loadedmetadata", playVideo, { once: true });
      video.load();
      playVideo();
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        maxBufferLength: 45,
        enableWorker: true
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
      hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hlsInstance.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hlsInstance.recoverMediaError();
          } else {
            hlsInstance.destroy();
          }
        }
      });
      return;
    }
    video.src = source;
    video.load();
    playVideo();
  }

  if (cover) {
    cover.addEventListener("click", start);
  }
  video.addEventListener("click", function () {
    if (!started) {
      start();
    }
  });
}
