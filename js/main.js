(function () {
  (function themeToggle() {
    var root = document.documentElement;
    var btn = document.getElementById("theme-toggle");
    function syncLabel(theme) {
      if (!btn) return;
      var light = theme === "light";
      btn.setAttribute("aria-label", light ? "Switch to dark theme" : "Switch to light theme");
      btn.setAttribute("title", light ? "Dark mode" : "Light mode");
    }
    function setTheme(theme) {
      root.setAttribute("data-theme", theme);
      try {
        localStorage.setItem("portfolio-theme", theme);
      } catch (e) {}
      syncLabel(theme);
    }
    if (btn) {
      syncLabel(root.getAttribute("data-theme") || "dark");
      btn.addEventListener("click", function () {
        var next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
        setTheme(next);
      });
    }
  })();

  const hamburger = document.querySelector(".hamburger");
  const navLinks = document.querySelector(".nav-links");

  if (hamburger && navLinks) {
    hamburger.addEventListener("click", function () {
      const open = !navLinks.classList.contains("is-open");
      navLinks.classList.toggle("is-open", open);
      hamburger.setAttribute("aria-expanded", open);
    });

    navLinks.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navLinks.classList.remove("is-open");
        hamburger.setAttribute("aria-expanded", "false");
      });
    });
  }

  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxClose = document.querySelector(".lightbox-close");

  function openLightbox(src, alt) {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = src;
    lightboxImg.alt = alt || "";
    lightbox.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("is-open");
    lightboxImg.src = "";
    document.body.style.overflow = "";
  }

  if (lightboxClose) {
    lightboxClose.addEventListener("click", closeLightbox);
  }

  if (lightbox) {
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });
  }

  document.querySelectorAll("[data-lightbox]").forEach(function (el) {
    el.addEventListener("click", function () {
      openLightbox(this.getAttribute("src"), this.getAttribute("alt"));
    });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && lightbox && lightbox.classList.contains("is-open")) {
      closeLightbox();
    }
  });

  const revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* TX Dynamics tenure — fixed 1 year remote experience */
  (function experienceMonths() {
    var MONTHS = 12;

    function monthWord(n) {
      return n === 1 ? "month" : "months";
    }

    function yearWord(n) {
      return n === 1 ? "year" : "years";
    }

    function formatDuration(months) {
      if (months < 12) {
        return months + " " + monthWord(months);
      }
      var years = Math.floor(months / 12);
      var rem = months % 12;
      if (rem === 0) {
        return years + " " + yearWord(years);
      }
      return years + " " + yearWord(years) + " " + rem + " " + monthWord(rem);
    }

    function formatDurationShort(months) {
      if (months < 12) {
        return months + " mo";
      }
      var years = Math.floor(months / 12);
      var rem = months % 12;
      if (rem === 0) {
        return years + " yr";
      }
      return years + " yr " + rem + " mo";
    }

    function formatExperience(n, format) {
      switch (format) {
        case "count":
          return String(n);
        case "mo":
          return formatDurationShort(n);
        case "months":
        case "months-ongoing":
        case "duration-ongoing":
          return formatDuration(n);
        case "months-in-role":
          return formatDuration(n) + " in role.";
        case "lead":
          return formatDuration(n) + " as a frontend developer at TX Dynamics";
        case "meta":
          if (n >= 12) {
            var years = Math.floor(n / 12);
            return years + "+ " + yearWord(years);
          }
          return n + "+ months";
        default:
          return formatDuration(n);
      }
    }

    var months = MONTHS;
    document.querySelectorAll("[data-experience]").forEach(function (el) {
      var format = el.getAttribute("data-experience") || "months";
      el.textContent = formatExperience(months, format);
    });

    var meta = document.querySelector('meta[name="description"][data-experience-meta]');
    if (meta) {
      var tpl = meta.getAttribute("content") || "";
      meta.setAttribute("content", tpl.replace("__EXPERIENCE__", formatExperience(months, "meta")));
    }
  })();

  /* Reviews (contact.html): name + stars + list in localStorage */
  var REVIEW_STORAGE_KEY = "areesha-portfolio-reviews";
  var REVIEW_MAX = 60;
  var reviewForm = document.getElementById("review-form");
  if (reviewForm) {
    var ratingInput = document.getElementById("rating-value");
    var starHint = document.getElementById("star-hint");
    var starBtns = reviewForm.querySelectorAll(".star-rating__btn");
    var reviewsList = document.getElementById("reviews-list");
    var reviewsEmpty = document.getElementById("reviews-empty");
    var reviewsAverage = document.getElementById("reviews-average");
    var formNote = document.getElementById("review-form-note");

    function getReviews() {
      try {
        var raw = localStorage.getItem(REVIEW_STORAGE_KEY);
        var arr = raw ? JSON.parse(raw) : [];
        return Array.isArray(arr) ? arr : [];
      } catch (e) {
        return [];
      }
    }

    function setReviews(arr) {
      try {
        localStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(arr.slice(0, REVIEW_MAX)));
      } catch (e) {}
    }

    function setStarVisual(value) {
      var v = parseInt(value, 10) || 0;
      starBtns.forEach(function (btn) {
        var n = parseInt(btn.getAttribute("data-value"), 10);
        var on = n <= v && v > 0;
        btn.classList.toggle("is-active", on);
        btn.setAttribute("aria-pressed", on ? "true" : "false");
      });
      if (ratingInput) ratingInput.value = v > 0 ? String(v) : "";
      if (starHint) {
        starHint.textContent = v > 0 ? v + " out of 5 stars selected." : "Tap a star to choose 1–5.";
        starHint.classList.toggle("is-ok", v > 0);
      }
    }

    starBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        setStarVisual(btn.getAttribute("data-value"));
      });
    });

    function renderStars(n) {
      var frag = document.createDocumentFragment();
      for (var i = 1; i <= 5; i++) {
        var icon = document.createElement("i");
        icon.setAttribute("aria-hidden", "true");
        icon.className = i <= n ? "fas fa-star" : "far fa-star";
        frag.appendChild(icon);
      }
      return frag;
    }

    function formatDate(iso) {
      try {
        var d = new Date(iso);
        if (isNaN(d.getTime())) return "";
        return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
      } catch (e) {
        return "";
      }
    }

    function renderReviews() {
      if (!reviewsList) return;
      var items = getReviews();
      reviewsList.innerHTML = "";

      if (reviewsEmpty) {
        reviewsEmpty.classList.toggle("is-hidden", items.length > 0);
      }

      if (reviewsAverage) {
        if (items.length === 0) {
          reviewsAverage.hidden = true;
          reviewsAverage.textContent = "";
        } else {
          var sum = 0;
          for (var i = 0; i < items.length; i++) sum += Math.min(5, Math.max(1, parseInt(items[i].rating, 10) || 0));
          var avg = (sum / items.length).toFixed(1);
          reviewsAverage.hidden = false;
          reviewsAverage.textContent = "Average rating: " + avg + " / 5 · " + items.length + " review" + (items.length === 1 ? "" : "s");
        }
      }

      for (var j = 0; j < items.length; j++) {
        var r = items[j];
        var rating = Math.min(5, Math.max(1, parseInt(r.rating, 10) || 1));
        var li = document.createElement("li");
        li.className = "review-item";
        li.setAttribute("role", "listitem");

        var top = document.createElement("div");
        top.className = "review-item__top";

        var nameEl = document.createElement("p");
        nameEl.className = "review-item__name";
        nameEl.textContent = String(r.name || "Anonymous").slice(0, 80);

        var starsWrap = document.createElement("div");
        starsWrap.className = "review-item__stars";
        starsWrap.setAttribute("aria-label", rating + " out of 5 stars");
        starsWrap.appendChild(renderStars(rating));

        top.appendChild(nameEl);
        top.appendChild(starsWrap);
        li.appendChild(top);

        var dateEl = document.createElement("p");
        dateEl.className = "review-item__date";
        dateEl.textContent = formatDate(r.createdAt);
        li.appendChild(dateEl);

        var comment = (r.comment || "").trim();
        if (comment) {
          var c = document.createElement("p");
          c.className = "review-item__comment";
          c.textContent = comment.slice(0, 500);
          li.appendChild(c);
        }

        reviewsList.appendChild(li);
      }
    }

    reviewForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (formNote) formNote.textContent = "";

      var nameInput = document.getElementById("reviewer-name");
      var commentInput = document.getElementById("review-comment");
      var name = nameInput ? nameInput.value.trim() : "";
      var rating = parseInt(ratingInput && ratingInput.value ? ratingInput.value : "0", 10);
      var comment = commentInput ? commentInput.value.trim() : "";

      if (!name) {
        if (formNote) formNote.textContent = "Please enter your name.";
        if (nameInput) nameInput.focus();
        return;
      }
      if (!rating || rating < 1 || rating > 5) {
        if (formNote) formNote.textContent = "Please choose a star rating.";
        return;
      }

      var list = getReviews();
      list.unshift({
        id: Date.now(),
        name: name,
        rating: rating,
        comment: comment,
        createdAt: new Date().toISOString(),
      });
      setReviews(list);
      renderReviews();
      reviewForm.reset();
      setStarVisual(0);
      if (formNote) formNote.textContent = "Thanks, " + name + " — your review was added below.";

      var payload = {
        name: name,
        rating: rating,
        comment: comment || "(no comment)",
        _subject: "Portfolio review — Areesha Umar",
      };
      fetch("https://formsubmit.co/ajax/areeshaumar44@gmail.com", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      }).catch(function () {});

      setTimeout(function () {
        if (formNote && formNote.textContent.indexOf("Thanks") === 0) formNote.textContent = "";
      }, 5000);
    });

    renderReviews();
  }
})();
