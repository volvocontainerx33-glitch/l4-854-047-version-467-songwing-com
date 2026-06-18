function initMoviePlayer(sourceUrl, videoId) {
    var video = document.getElementById(videoId);
    var startButton = document.getElementById('player-start');
    var message = document.getElementById('player-message');
    var hlsInstance = null;
    var attached = false;

    function showMessage(text) {
        if (!message) {
            return;
        }
        message.textContent = text;
        message.hidden = false;
    }

    function attachSource() {
        if (attached || !video) {
            return;
        }
        attached = true;
        video.controls = true;

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(sourceUrl);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    showMessage('视频加载失败，请稍后重试');
                }
            });
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = sourceUrl;
            return;
        }

        showMessage('当前浏览器暂不支持播放');
    }

    function playVideo() {
        attachSource();
        if (startButton) {
            startButton.hidden = true;
        }
        var playTask = video.play();
        if (playTask && typeof playTask.catch === 'function') {
            playTask.catch(function () {
                if (startButton) {
                    startButton.hidden = false;
                }
            });
        }
    }

    if (!video) {
        return;
    }

    if (startButton) {
        startButton.addEventListener('click', playVideo);
    }

    video.addEventListener('click', function () {
        if (!attached || video.paused) {
            playVideo();
        } else {
            video.pause();
        }
    });

    video.addEventListener('play', function () {
        if (startButton) {
            startButton.hidden = true;
        }
    });

    video.addEventListener('pause', function () {
        if (startButton && video.currentTime === 0) {
            startButton.hidden = false;
        }
    });

    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
