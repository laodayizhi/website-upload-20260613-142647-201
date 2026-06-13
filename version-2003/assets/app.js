(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function bindMenu() {
        var button = document.querySelector("[data-menu-button]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function bindHero() {
        var root = document.querySelector("[data-hero-carousel]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        var prev = root.querySelector("[data-hero-prev]");
        var next = root.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5600);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });

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

        root.addEventListener("mouseenter", stop);
        root.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function textOf(card) {
        return [
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-category"),
            card.textContent
        ].join(" ").toLowerCase();
    }

    function bindFilters() {
        document.querySelectorAll(".filter-panel").forEach(function (panel) {
            var targetSelector = panel.getAttribute("data-target");
            var target = targetSelector ? document.querySelector(targetSelector) : null;
            if (!target) {
                return;
            }
            var input = panel.querySelector(".filter-input");
            var selects = Array.prototype.slice.call(panel.querySelectorAll("select[data-filter-key]"));
            var cards = Array.prototype.slice.call(target.querySelectorAll(".searchable-card"));
            var noResults = document.querySelector("[data-no-results]");

            function apply() {
                var query = input ? input.value.trim().toLowerCase() : "";
                var visible = 0;

                cards.forEach(function (card) {
                    var matched = true;
                    if (query && textOf(card).indexOf(query) === -1) {
                        matched = false;
                    }

                    selects.forEach(function (select) {
                        var key = select.getAttribute("data-filter-key");
                        var value = select.value;
                        if (value && card.getAttribute("data-" + key) !== value) {
                            matched = false;
                        }
                    });

                    card.classList.toggle("is-hidden", !matched);
                    if (matched) {
                        visible += 1;
                    }
                });

                if (noResults) {
                    noResults.classList.toggle("is-visible", visible === 0);
                }
            }

            if (input) {
                input.addEventListener("input", apply);
                var params = new URLSearchParams(window.location.search);
                var q = params.get("q");
                if (q) {
                    input.value = q;
                }
            }

            selects.forEach(function (select) {
                select.addEventListener("change", apply);
            });

            apply();
        });
    }

    window.initMoviePlayer = function (url, videoId, maskId) {
        var video = document.getElementById(videoId);
        var mask = document.getElementById(maskId);
        if (!video || !url) {
            return;
        }

        var prepared = false;
        var hls = null;

        function prepare() {
            if (prepared) {
                return Promise.resolve();
            }
            prepared = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = url;
                return Promise.resolve();
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(url);
                hls.attachMedia(video);
                return new Promise(function (resolve) {
                    hls.on(Hls.Events.MANIFEST_PARSED, function () {
                        resolve();
                    });
                    window.setTimeout(resolve, 1200);
                });
            }

            video.src = url;
            return Promise.resolve();
        }

        function start() {
            if (mask) {
                mask.classList.add("is-hidden");
            }

            prepare().then(function () {
                var attempt = video.play();
                if (attempt && typeof attempt.catch === "function") {
                    attempt.catch(function () {
                        if (mask) {
                            mask.classList.remove("is-hidden");
                        }
                    });
                }
            });
        }

        if (mask) {
            mask.addEventListener("click", start);
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });

        window.addEventListener("pagehide", function () {
            if (hls && typeof hls.destroy === "function") {
                hls.destroy();
            }
        });
    };

    ready(function () {
        bindMenu();
        bindHero();
        bindFilters();
    });
})();
