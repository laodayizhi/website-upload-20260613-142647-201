(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function text(value) {
        return (value || "").toString().toLowerCase();
    }

    function renderSearch(panel, list) {
        if (!panel) {
            return;
        }
        if (!list.length) {
            panel.innerHTML = '<div class="search-hit"><div></div><div><strong>未找到匹配影片</strong><span>换一个片名、类型或标签试试</span></div></div>';
            panel.classList.add("is-open");
            return;
        }
        panel.innerHTML = list.map(function (item) {
            return '<a class="search-hit" href="' + item.url + '">' +
                '<img src="' + item.cover + '" alt="' + item.title.replace(/"/g, '&quot;') + '">' +
                '<span><strong>' + item.title + '</strong><span>' + item.year + ' · ' + item.type + ' · ' + item.channel + '</span></span>' +
                '</a>';
        }).join("");
        panel.classList.add("is-open");
    }

    function initSiteSearch() {
        var inputs = document.querySelectorAll("[data-site-search]");
        var data = window.siteSearchData || [];
        inputs.forEach(function (input) {
            var form = input.closest(".site-search");
            var panel = form ? form.querySelector(".search-panel") : null;
            input.addEventListener("input", function () {
                var keyword = text(input.value).trim();
                if (!keyword) {
                    if (panel) {
                        panel.classList.remove("is-open");
                        panel.innerHTML = "";
                    }
                    return;
                }
                var hits = data.filter(function (item) {
                    return text(item.title + " " + item.year + " " + item.type + " " + item.channel + " " + item.tags).indexOf(keyword) >= 0;
                }).slice(0, 10);
                renderSearch(panel, hits);
            });
            input.addEventListener("focus", function () {
                if (input.value.trim() && panel && panel.innerHTML) {
                    panel.classList.add("is-open");
                }
            });
            document.addEventListener("click", function (event) {
                if (form && !form.contains(event.target) && panel) {
                    panel.classList.remove("is-open");
                }
            });
            if (form) {
                form.addEventListener("submit", function (event) {
                    event.preventDefault();
                    var keyword = text(input.value).trim();
                    var first = data.find(function (item) {
                        return text(item.title + " " + item.tags).indexOf(keyword) >= 0;
                    });
                    if (first) {
                        window.location.href = first.url;
                    }
                });
            }
        });
    }

    function initMobileNav() {
        var toggle = document.querySelector(".nav-toggle");
        var panel = document.querySelector(".mobile-panel");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        if (!slides.length) {
            return;
        }
        var index = 0;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
            });
        });
        show(0);
        window.setInterval(function () {
            show(index + 1);
        }, 5600);
    }

    function initLocalFilters() {
        var input = document.querySelector("[data-local-filter]");
        var buttons = document.querySelectorAll("[data-filter-value]");
        var cards = document.querySelectorAll("[data-filter-text]");
        function apply() {
            var keyword = input ? text(input.value).trim() : "";
            var active = document.querySelector("[data-filter-value].is-active");
            var value = active ? active.getAttribute("data-filter-value") : "all";
            cards.forEach(function (card) {
                var body = text(card.getAttribute("data-filter-text"));
                var type = text(card.getAttribute("data-filter-type"));
                var year = text(card.getAttribute("data-filter-year"));
                var passKeyword = !keyword || body.indexOf(keyword) >= 0;
                var passValue = value === "all" || type === text(value) || year === text(value);
                card.classList.toggle("hide-by-filter", !(passKeyword && passValue));
            });
        }
        if (input) {
            input.addEventListener("input", apply);
        }
        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                buttons.forEach(function (item) {
                    item.classList.remove("is-active");
                });
                button.classList.add("is-active");
                apply();
            });
        });
    }

    function initPlayerButtons() {
        var triggers = document.querySelectorAll("[data-player-trigger]");
        triggers.forEach(function (trigger) {
            trigger.addEventListener("click", function () {
                var cover = document.getElementById(trigger.getAttribute("data-player-trigger"));
                var player = document.getElementById("player");
                if (player && player.scrollIntoView) {
                    player.scrollIntoView({ behavior: "smooth", block: "center" });
                }
                if (cover) {
                    cover.click();
                }
            });
        });
    }

    window.initHlsPlayer = function (videoId, coverId, streamUrl) {
        var video = document.getElementById(videoId);
        var cover = document.getElementById(coverId);
        var loaded = false;
        var hlsPlayer = null;
        if (!video || !streamUrl) {
            return;
        }
        function start() {
            if (!loaded) {
                loaded = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = streamUrl;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsPlayer = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                    hlsPlayer.loadSource(streamUrl);
                    hlsPlayer.attachMedia(video);
                } else {
                    video.src = streamUrl;
                }
                video.setAttribute("controls", "controls");
            }
            if (cover) {
                cover.classList.add("is-hidden");
            }
            var playTask = video.play();
            if (playTask && typeof playTask.catch === "function") {
                playTask.catch(function () {});
            }
        }
        if (cover) {
            cover.addEventListener("click", start);
        }
        video.addEventListener("click", function () {
            if (!loaded || video.paused) {
                start();
            }
        });
        window.addEventListener("pagehide", function () {
            if (hlsPlayer) {
                hlsPlayer.destroy();
                hlsPlayer = null;
            }
        });
    };

    ready(function () {
        initMobileNav();
        initSiteSearch();
        initHero();
        initLocalFilters();
        initPlayerButtons();
    });
}());
