function initMoviePlayer(streamUrl) {
    var video = document.getElementById("moviePlayer");
    var startButton = document.getElementById("playerStart");
    var overlay = document.querySelector(".player-overlay");
    var hlsInstance = null;
    var attached = false;

    if (!video || !streamUrl) {
        return;
    }

    function attachStream() {
        if (attached) {
            return;
        }

        attached = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
            return;
        }

        video.src = streamUrl;
    }

    function beginPlayback() {
        attachStream();

        if (overlay) {
            overlay.classList.add("is-hidden");
        }

        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {
                if (overlay) {
                    overlay.classList.remove("is-hidden");
                }
            });
        }
    }

    if (startButton) {
        startButton.addEventListener("click", beginPlayback);
    }

    if (overlay) {
        overlay.addEventListener("click", beginPlayback);
    }

    video.addEventListener("click", function () {
        if (video.paused) {
            beginPlayback();
        } else {
            video.pause();
        }
    });

    window.addEventListener("pagehide", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
    });
}
