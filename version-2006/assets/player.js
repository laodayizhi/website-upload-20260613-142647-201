(function () {
  var player = document.querySelector('[data-player]');

  if (!player) {
    return;
  }

  var video = player.querySelector('video');
  var button = player.querySelector('[data-play-button]');
  var stream = video ? video.getAttribute('data-stream') : '';
  var hlsInstance = null;
  var started = false;

  function hideButton() {
    if (button) {
      button.classList.add('is-hidden');
    }
  }

  function begin() {
    if (!video || !stream) {
      return;
    }

    hideButton();

    if (started) {
      video.play().catch(function () {});
      return;
    }

    started = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      video.play().catch(function () {});
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });

      hlsInstance.loadSource(stream);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
      hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hlsInstance.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hlsInstance.recoverMediaError();
          } else {
            hlsInstance.destroy();
            video.src = stream;
            video.play().catch(function () {});
          }
        }
      });
      return;
    }

    video.src = stream;
    video.play().catch(function () {});
  }

  if (button) {
    button.addEventListener('click', begin);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (!started) {
        begin();
      }
    });
  }

  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
})();
