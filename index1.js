const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");

hamburger.addEventListener("click", mobileMenu);

function mobileMenu() {
  hamburger.classList.toggle("active");
  navMenu.classList.toggle("active");
}

// Close navbar when link is clicked
const navLink = document.querySelectorAll(".nav-link");

navLink.forEach((n) => n.addEventListener("click", closeMenu));

function closeMenu() {
  hamburger.classList.remove("active");
  navMenu.classList.remove("active");
}

// Event Listeners: Handling toggle event
const toggleSwitch = document.querySelector(
  '.theme-switch input[type="checkbox"]'
);

function switchTheme(e) {
  if (e.target.checked) {
    document.documentElement.setAttribute("data-theme", "dark");
  } else {
    document.documentElement.setAttribute("data-theme", "light");
  }
}

toggleSwitch.addEventListener("change", switchTheme, false);

//  Store color theme for future visits

function switchTheme(e) {
  if (e.target.checked) {
    document.documentElement.setAttribute("data-theme", "dark");
    localStorage.setItem("theme", "dark"); //add this
  } else {
    document.documentElement.setAttribute("data-theme", "light");
    localStorage.setItem("theme", "light"); //add this
  }
}

// Save user preference on load

const currentTheme = localStorage.getItem("theme")
  ? localStorage.getItem("theme")
  : null;

if (currentTheme) {
  document.documentElement.setAttribute("data-theme", currentTheme);

  if (currentTheme === "dark") {
    toggleSwitch.checked = true;
  }
}

//Adding date

let myDate = document.querySelector("#datee");

const yes = new Date().getFullYear();
myDate.innerHTML = yes;

(() => {
  // Respect user perference
  const isReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // Helper to apply inline CSS
  const setStyleProps = ($el, styles) => {
    for (const [key, value] of Object.entries(styles)) {
      if (value === false) {
        $el.style.removeProperty(key);
      } else {
        $el.style.setProperty(key, value);
      }
    }
  };

  document.querySelectorAll(".Carousel").forEach(($carousel) => {
    $carousel.scrollLeft = 0;

    const $cards = Array.from($carousel.querySelectorAll(".Card"));
    const $pagination = $carousel.nextElementSibling;
    const [$previous, $next] = $pagination.querySelectorAll(".Arrow");
    $pagination.querySelector(".Dot").classList.add("Dot--active");

    const $start = document.createElement("div");
    const $end = document.createElement("div");
    $carousel.prepend($start);
    $carousel.append($end);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.target === $start) {
          if ($previous) {
            $previous.disabled = entry.isIntersecting;
          }
        }
        if (entry.target === $end) {
          if ($next) {
            $next.disabled = entry.isIntersecting;
          }
        }
      });
    });
    observer.observe($start);
    observer.observe($end);

    const scrollTo = ($card) => {
      let offset = getOffset($card);
      const left = document.dir === "rtl" ? -offset : offset;
      const behavior = isReducedMotion ? "auto" : "smooth";
      $carousel.scrollTo({ left, behavior });
    };

    const getOffset = ($el) => {
      let offset = $el.offsetLeft;
      if (document.dir === "rtl") {
        offset = $carousel.offsetWidth - (offset + $el.offsetWidth);
      }
      return offset;
    };

    $previous.addEventListener("click", (ev) => {
      ev.preventDefault();
      let $card = $cards[0];
      const scroll = Math.abs($carousel.scrollLeft);
      $cards.forEach(($item) => {
        const offset = getOffset($item);
        if (offset - scroll < -1 && offset > getOffset($card)) {
          $card = $item;
        }
      });
      scrollTo($card);
    });

    $next.addEventListener("click", (ev) => {
      ev.preventDefault();
      let $card = $cards[$cards.length - 1];
      const scroll = Math.abs($carousel.scrollLeft);
      $cards.forEach(($item) => {
        const offset = getOffset($item);
        if (offset - scroll > 1 && offset < getOffset($card)) {
          $card = $item;
        }
      });
      scrollTo($card);
    });

    $pagination.addEventListener("click", (ev) => {
      if (ev.target.classList.contains("Dot")) {
        ev.preventDefault();
        const $card = document.querySelector(
          new URL(ev.target.href).hash
        );
        if ($card) scrollTo($card);
      }
    });

    // Highlight nearest "Dot" in pagination
    let scrollTimeout;
    $carousel.addEventListener(
      "scroll",
      () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          let $dot = $pagination.querySelector(".Dot--active");
          if ($dot) $dot.classList.remove("Dot--active");
          let $active;
          const scroll = Math.abs($carousel.scrollLeft);
          if (scroll <= 0) {
            $active = $cards[0];
          }
          if (scroll >= $carousel.scrollWidth - $carousel.offsetWidth) {
            $active = $cards[$cards.length - 1];
          }
          if (!$active) {
            let oldDiff;
            $cards.forEach(($card) => {
              const newDiff = Math.abs(scroll - getOffset($card));
              if (!$active || newDiff < oldDiff) {
                $active = $card;
                oldDiff = newDiff;
              }
            });
          }
          $dot = $pagination.querySelector(
            `[href="#${($active ?? $card[0]).id}"]`
          );
          if ($dot) $dot.classList.add("Dot--active");
        }, 50);
      },
      { passive: true }
    );

    // Improve arrow key navigation
    $carousel.addEventListener("keydown", (ev) => {
      if (/^(Arrow)?Left$/.test(ev.key)) {
        ev.preventDefault();
        (document.dir === "rtl" ? $next : $previous).click();
      } else if (/(Arrow)?Right$/.test(ev.key)) {
        ev.preventDefault();
        (document.dir === "rtl" ? $previous : $next).click();
      }
    });

    // Improve transition when tabbing focus

    let scrollLeft = 0;
    $carousel.addEventListener(
      "blur",
      (ev) => {
        scrollLeft = $carousel.scrollLeft;
      },
      { capture: true }
    );
    $carousel.addEventListener(
      "focus",
      (ev) => {
        $carousel.scrollLeft = scrollLeft;
        const $card = ev.target.closest(".Card");
        if ($card) scrollTo($card);
      },
      { capture: true }
    );
  });

  // Optional polyfill for Safari 14
  if (
    !isReducedMotion &&
    !window.CSS.supports("scroll-behavior: smooth")
  ) {
    import("https://cdn.skypack.dev/smoothscroll-polyfill").then(
      (module) => {
        module.polyfill();
      }
    );
  }
})();

(() => {
  // Toggle right-to-left for demo
  document
    .querySelector("#toggle-rtl")
    .addEventListener("change", (ev) => {
      document.dir = ev.target.checked ? "rtl" : "ltr";
      document.querySelectorAll(".Carousel").forEach(($carousel) => {
        $carousel.scrollLeft = 0;
      });
    });

  // Toggle single slides class for demo
  document
    .querySelector("#toggle-single")
    .addEventListener("change", (ev) => {
      document.querySelectorAll(".Carousel").forEach(($carousel) => {
        $carousel.classList.toggle("Carousel--single", ev.target.checked);
      });
    });
})();
