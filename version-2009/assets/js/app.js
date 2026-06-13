(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var mobileNav = document.querySelector(".mobile-nav");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            var opened = mobileNav.classList.toggle("is-open");
            menuButton.setAttribute("aria-expanded", opened ? "true" : "false");
        });
    }

    var hero = document.querySelector("[data-hero-slider]");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var current = 0;

        function activateSlide(index) {
            current = index % slides.length;
            if (current < 0) {
                current = slides.length - 1;
            }
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                activateSlide(Number(dot.getAttribute("data-slide")) || 0);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                activateSlide(current + 1);
            }, 5200);
        }
    }

    var searchInput = document.getElementById("siteSearchInput");
    var searchForm = document.getElementById("siteSearchForm");
    var searchResults = document.getElementById("searchResults");
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));

    function normalizeText(value) {
        return String(value || "").toLowerCase().trim();
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function createResultCard(item) {
        var link = document.createElement("a");
        var safeTitle = escapeHtml(item.title);
        var safeOneLine = escapeHtml(item.oneLine);
        var safeType = escapeHtml(item.type);
        var safeYear = escapeHtml(item.year);
        var safeRegion = escapeHtml(item.region);
        var safeGenre = escapeHtml(item.genre);
        var safeCover = escapeHtml(item.cover);

        link.className = "movie-card";
        link.href = item.url;
        link.innerHTML = "" +
            '<figure class="movie-cover">' +
            '<img src="' + safeCover + '" alt="' + safeTitle + '" loading="lazy">' +
            '<span class="movie-badge">' + safeType + '</span>' +
            '</figure>' +
            '<div class="movie-card-body">' +
            '<h3>' + safeTitle + '</h3>' +
            '<p>' + safeOneLine + '</p>' +
            '<div class="movie-meta">' +
            '<span>' + safeYear + '</span>' +
            '<span>' + safeRegion + '</span>' +
            '<span>' + safeGenre + '</span>' +
            '</div>' +
            '</div>';
        return link;
    }

    function renderSearch(query) {
        if (!searchResults || typeof siteSearchItems === "undefined") {
            return;
        }
        var text = normalizeText(query);
        var results = siteSearchItems.filter(function (item) {
            if (!text) {
                return true;
            }
            return normalizeText(item.title + " " + item.region + " " + item.type + " " + item.year + " " + item.genre + " " + item.tags).indexOf(text) !== -1;
        }).slice(0, 120);

        searchResults.innerHTML = "";

        if (!results.length) {
            var empty = document.createElement("div");
            empty.className = "empty-state";
            empty.textContent = "没有找到匹配内容";
            searchResults.appendChild(empty);
            return;
        }

        results.forEach(function (item) {
            searchResults.appendChild(createResultCard(item));
        });
    }

    if (searchInput && searchForm && searchResults) {
        var params = new URLSearchParams(window.location.search);
        var initialKeyword = params.get("keyword") || "";
        searchInput.value = initialKeyword;
        renderSearch(initialKeyword);

        searchForm.addEventListener("submit", function (event) {
            event.preventDefault();
            renderSearch(searchInput.value);
        });

        searchInput.addEventListener("input", function () {
            renderSearch(searchInput.value);
        });

        filterButtons.forEach(function (button) {
            button.addEventListener("click", function () {
                searchInput.value = button.getAttribute("data-filter") || "";
                renderSearch(searchInput.value);
            });
        });
    }
}());
