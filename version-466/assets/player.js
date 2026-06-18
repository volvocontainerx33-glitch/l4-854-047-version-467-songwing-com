function initMoviePlayer(source) {
  var video = document.querySelector('[data-player-video]');
  var cover = document.querySelector('[data-player-cover]');
  var button = document.querySelector('[data-player-start]');
  var started = false;
  var hlsInstance = null;

  function attach() {
    if (!video || !source || started) {
      return;
    }
    started = true;
    if (cover) {
      cover.classList.add('hidden');
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.play().catch(function () {});
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
      return;
    }
    video.src = source;
    video.play().catch(function () {});
  }

  if (cover) {
    cover.addEventListener('click', attach);
  }
  if (button) {
    button.addEventListener('click', function (event) {
      event.stopPropagation();
      attach();
    });
  }
  if (video) {
    video.addEventListener('click', function () {
      if (!started) {
        attach();
      }
    });
  }
  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
