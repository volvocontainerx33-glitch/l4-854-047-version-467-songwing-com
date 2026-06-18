(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var box = document.querySelector("[data-player]");
    var video = document.getElementById("site-player");
    var button = document.querySelector("[data-play-button]");
    var error = document.querySelector("[data-player-error]");

    if (!box || !video || !button) {
      return;
    }

    var stream = video.getAttribute("data-stream");
    var hls = null;
    var attached = false;

    function showError() {
      if (error) {
        error.hidden = false;
      }
    }

    function attach() {
      if (attached || !stream) {
        return;
      }

      attached = true;

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (data && data.fatal) {
            showError();
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else {
        showError();
      }
    }

    function play() {
      attach();
      box.classList.add("is-playing");
      var started = video.play();

      if (started && typeof started.catch === "function") {
        started.catch(function () {
          box.classList.remove("is-playing");
        });
      }
    }

    button.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener("play", function () {
      box.classList.add("is-playing");
    });
    video.addEventListener("pause", function () {
      box.classList.remove("is-playing");
    });
    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
