(() => {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".menu-toggle");
  const shop = document.querySelector(".nav-shop");
  const shopBtn = document.querySelector(".nav-shop-btn");

  const setHeaderH = () => {
    if (!header) return;
    document.documentElement.style.setProperty("--header-h", header.offsetHeight + "px");
  };
  setHeaderH();
  if (header && "ResizeObserver" in window) {
    new ResizeObserver(setHeaderH).observe(header);
  }
  window.addEventListener("resize", setHeaderH);

  const onScroll = () => {
    if (header) header.classList.toggle("is-stuck", window.scrollY > 8);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const closeMenu = () => {
    if (header) header.classList.remove("is-open");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
    if (shop) shop.classList.remove("is-open");
    if (shopBtn) shopBtn.setAttribute("aria-expanded", "false");
  };

  if (toggle && header) {
    toggle.addEventListener("click", () => {
      const open = header.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
  }

  if (shop && shopBtn) {
    shopBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      const open = shop.classList.toggle("is-open");
      shopBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  document.addEventListener("click", (event) => {
    if (header && !header.contains(event.target)) closeMenu();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  const hashes = window.EKOTOPIA_HASHES || {};
  const rawHash = decodeURIComponent((location.hash || "").replace("#", ""));
  if (rawHash && hashes[rawHash] && !document.getElementById(rawHash)) {
    const dest = hashes[rawHash];
    const destPath = dest.split("#")[0];
    if (destPath && destPath !== location.pathname) {
      location.replace(dest);
      return;
    }
  }

  const cutButtons = [...document.querySelectorAll(".cut-btn")];
  const cutStatus = document.getElementById("cut-status");
  const cutLabels = {
    "fabric:organic-cotton": "organic cotton",
    "fabric:hemp": "organic hemp",
    "fabric:linen": "organic linen",
    "country:usa": "Made in USA",
    "country:peru": "Peru",
    "country:turkey": "Turkey",
    "country:india": "India",
    "country:pakistan": "Pakistan",
    "country:vietnam": "Vietnam",
    "country:europe": "Europe",
    "country:colombia": "Colombia",
    "country:guatemala": "Guatemala",
    "fairtrade:yes": "Fair Trade",
    "indigenous:yes": "Indigenous-made"
  };

  const matchesCut = (card, cut) => {
    if (!cut) return true;
    const [key, value] = cut.split(":");
    const attr = key === "fairtrade" ? "data-fairtrade" : key === "country" ? "data-country" : key === "indigenous" ? "data-indigenous" : "data-fabric";
    const raw = (card.getAttribute(attr) || "").split(/\s+/).filter(Boolean);
    return raw.includes(value);
  };

  const applyCut = (cut) => {
    document.body.classList.toggle("is-cut", Boolean(cut));
    cutButtons.forEach((btn) => btn.classList.toggle("is-on", btn.dataset.cut === cut));
    document.querySelectorAll(".aisle .card").forEach((card) => {
      card.classList.toggle("is-hidden", cut && !matchesCut(card, cut));
    });
    document.querySelectorAll(".brand-line").forEach((line) => {
      const grid = line.nextElementSibling;
      if (!grid || !grid.classList.contains("grid")) return;
      const cards = [...grid.querySelectorAll(".card")];
      const any = cards.some((card) => !card.classList.contains("is-hidden"));
      line.classList.toggle("is-hidden", Boolean(cut) && !any);
      grid.classList.toggle("is-hidden", Boolean(cut) && !any);
    });
    document.querySelectorAll("section.aisle").forEach((aisle) => {
      const cards = [...aisle.querySelectorAll(".card")];
      if (!cards.length) {
        aisle.classList.toggle("is-hidden", Boolean(cut));
        return;
      }
      const any = cards.some((card) => !card.classList.contains("is-hidden"));
      aisle.classList.toggle("is-hidden", Boolean(cut) && !any);
    });
    document.querySelectorAll(".beauty-shell").forEach((shell) => {
      shell.classList.toggle("is-hidden", Boolean(cut));
    });
    if (cutStatus) {
      const count = document.querySelectorAll("section.aisle:not(#featured) .card:not(.is-hidden)").length;
      cutStatus.textContent = cut
        ? "Showing items the official brand page names as " + (cutLabels[cut] || cut) + ". " + count + " on this page. Clear the filter to return to category sort."
        : "";
    }
  };

  const setCut = (cut, push) => {
    applyCut(cut);
    if (!push) return;
    const url = new URL(window.location.href);
    if (cut) url.hash = "cut-" + cut.replace(":", "-");
    else if (url.hash.startsWith("#cut-")) url.hash = "specialty";
    history.replaceState(null, "", url);
  };

  const aisleTypeConfigs = {
    clothes: {
      sectionId: "wear",
      hashPrefix: "clothes-type-",
      clearHash: "wear",
      attr: "data-clothes",
      labels: {
        tops: "Tops",
        dresses: "Dresses",
        bottoms: "Bottoms",
        underwear: "Underwear + bras",
        lounge: "Lounge + nightwear",
        socks: "Socks",
        shoes: "Shoes",
        outerwear: "Outerwear"
      }
    },
    baby: {
      sectionId: "baby",
      hashPrefix: "baby-type-",
      clearHash: "baby",
      attr: "data-baby",
      labels: {
        bodysuits: "Bodysuits",
        sleepers: "Sleepers + PJs",
        clothes: "Clothes",
        socks: "Socks",
        bibs: "Bibs",
        bedding: "Bedding"
      }
    },
    household: {
      sectionId: "household",
      hashPrefix: "household-type-",
      clearHash: "household",
      attr: "data-household",
      hideIdsWhenTyped: ["cleaning"],
      labels: {
        bath: "Bath",
        kitchen: "Kitchen",
        reusables: "Reusables"
      }
    },
    beauty: {
      sectionId: "beauty",
      hashPrefix: "beauty-type-",
      clearHash: "beauty",
      attr: "data-beauty",
      emptyTypes: ["makeup", "hair"],
      labels: {
        face: "Face / facial cleansing",
        makeup: "Makeup",
        hair: "Hair",
        body: "Body + skin balm",
        spf: "SPF",
        deodorant: "Deodorant",
        lips: "Lips",
        oral: "Oral",
        hands: "Hands"
      }
    },
    health: {
      sectionId: "health",
      hashPrefix: "health-type-",
      clearHash: "health",
      attr: "data-health",
      labels: {
        daily: "Daily wellness",
        oils: "Oils",
        blends: "Blends",
        kits: "Kits",
        topical: "Topical"
      }
    },
    sleep: {
      sectionId: "sleep",
      hashPrefix: "sleep-type-",
      clearHash: "sleep",
      attr: "data-sleep",
      labels: {
        sheets: "Sheets",
        blankets: "Blankets",
        sleepwear: "Sleepwear",
        pillows: "Pillows + masks"
      }
    },
    cleaning: {
      sectionId: "cleaning",
      hashPrefix: "cleaning-type-",
      clearHash: "cleaning",
      attr: "data-clean",
      labels: {
        surface: "Surface",
        laundry: "Laundry",
        hands: "Hands",
        dish: "Dish",
        paper: "Paper",
        castile: "Castile"
      }
    },
    grocery: {
      sectionId: document.getElementById("grocery") ? "grocery" : "grocery-named",
      hashPrefix: "grocery-type-",
      clearHash: "grocery",
      attr: "data-grocery",
      labels: {
        produce: "Produce",
        dairy: "Dairy",
        eggs: "Eggs",
        meat: "Meat & poultry",
        "plant-proteins": "Plant proteins",
        frozen: "Frozen",
        bread: "Bread",
        pantry: "Pantry",
        coffee: "Coffee",
        tea: "Tea & herbs",
        oils: "Oils",
        condiments: "Condiments",
        snacks: "Snacks",
        "plant-milks": "Plant milks",
        smoothies: "Smoothies & protein",
        "ice-cream": "Ice cream",
        chocolate: "Chocolate",
        "baby-food": "Baby food pouches"
      }
    }
  };

  const clearTypeHidden = () => {
    document.querySelectorAll(".is-type-hidden, .is-beauty-hidden").forEach((el) => {
      el.classList.remove("is-type-hidden", "is-beauty-hidden");
    });
  };

  const applyAisleType = (key, type) => {
    const isOn = Boolean(key && type);
    document.body.classList.toggle("is-aisle-type", isOn);
    document.body.classList.toggle("is-beauty-cut", key === "beauty" && isOn);
    document.querySelectorAll(".aisle-types").forEach((group) => {
      group.classList.toggle("is-filtering", group.getAttribute("data-aisle-types") === key && isOn);
    });
    document.querySelectorAll(".type-cut-btn").forEach((btn) => {
      const on = isOn && btn.dataset.aisleType === key && btn.dataset.type === type;
      btn.classList.toggle("is-on", on);
    });
    document.querySelectorAll(".beauty-cut-btn").forEach((btn) => {
      const cut = btn.dataset.beautyCut || "";
      btn.classList.toggle("is-on", key === "beauty" && isOn && cut === type);
    });
    clearTypeHidden();
    document.querySelectorAll(".aisle-types .cut-status").forEach((el) => {
      el.textContent = "";
    });
    if (!isOn) return;
    const cfg = aisleTypeConfigs[key];
    if (!cfg) return;
    const aisle = document.getElementById(cfg.sectionId);
    if (!aisle) return;
    aisle.querySelectorAll(".card").forEach((card) => {
      const match = card.getAttribute(cfg.attr) === type;
      card.classList.toggle("is-type-hidden", !match);
      if (key === "beauty") card.classList.toggle("is-beauty-hidden", !match);
    });
    aisle.querySelectorAll(".brand-line").forEach((line) => {
      const grid = line.nextElementSibling;
      if (!grid || !grid.classList.contains("grid")) return;
      const cards = [...grid.querySelectorAll(".card")];
      const any = cards.some((card) => !card.classList.contains("is-type-hidden") && !card.classList.contains("is-hidden"));
      const hide = !any;
      line.classList.toggle("is-type-hidden", hide);
      grid.classList.toggle("is-type-hidden", hide);
      if (key === "beauty") {
        line.classList.toggle("is-beauty-hidden", hide);
        grid.classList.toggle("is-beauty-hidden", hide);
      }
    });
    aisle.querySelectorAll(".beauty-shell, .type-shell").forEach((shell) => {
      const shellType = shell.getAttribute("data-beauty-shell") || shell.getAttribute("data-type-shell");
      const show = shellType === type;
      shell.classList.toggle("is-type-hidden", !show);
      if (key === "beauty") shell.classList.toggle("is-beauty-hidden", !show);
    });
    aisle.querySelectorAll(".ig-block, .aisle-note").forEach((el) => {
      el.classList.add("is-type-hidden");
    });
    (cfg.hideIdsWhenTyped || []).forEach((id) => {
      const extra = document.getElementById(id);
      if (extra) extra.classList.add("is-type-hidden");
    });
    const status = document.getElementById(key + "-cut-status");
    if (status) {
      const label = cfg.labels[type] || type;
      status.textContent = (cfg.emptyTypes || []).includes(type)
        ? label + ". Products post when the list lands."
        : "Showing " + label + ".";
    }
  };

  const setAisleType = (key, type, push) => {
    applyAisleType(key, type);
    if (!push) return;
    const cfg = aisleTypeConfigs[key] || aisleTypeConfigs.beauty;
    const url = new URL(window.location.href);
    url.hash = type ? cfg.hashPrefix + type : (cfg.clearHash || "");
    history.replaceState(null, "", url);
  };

  cutButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      applyAisleType("", "");
      const next = btn.classList.contains("is-on") ? "" : btn.dataset.cut;
      setCut(next, true);
      const specialty = document.getElementById("specialty");
      if (specialty) specialty.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  document.querySelectorAll(".type-cut-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      applyCut("");
      const key = btn.dataset.aisleType;
      const clicked = btn.dataset.type || "";
      const next = !clicked || btn.classList.contains("is-on") ? "" : clicked;
      setAisleType(key, next, true);
      const cfg = aisleTypeConfigs[key];
      const aisle = cfg ? document.getElementById(cfg.sectionId) : null;
      if (aisle) aisle.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  const readHashCut = () => {
    const hash = decodeURIComponent(location.hash.replace("#", ""));
    if (!hash.startsWith("cut-")) return "";
    const raw = hash.slice(4);
    const known = cutButtons.map((btn) => btn.dataset.cut);
    const mapped = raw.includes("-") ? raw.replace("-", ":") : "";
    return known.includes(mapped) ? mapped : "";
  };

  const readHashAisleType = () => {
    const hash = decodeURIComponent(location.hash.replace("#", ""));
    for (const [key, cfg] of Object.entries(aisleTypeConfigs)) {
      if (hash.startsWith(cfg.hashPrefix)) {
        const type = hash.slice(cfg.hashPrefix.length);
        if (cfg.labels[type]) return { key, type };
      }
    }
    return { key: "", type: "" };
  };

  const bootType = readHashAisleType();
  const bootCut = readHashCut();
  if (bootType.type) applyAisleType(bootType.key, bootType.type);
  else if (bootCut) applyCut(bootCut);
  window.addEventListener("hashchange", () => {
    const typed = readHashAisleType();
    if (typed.type) {
      applyCut("");
      applyAisleType(typed.key, typed.type);
      return;
    }
    applyAisleType("", "");
    applyCut(readHashCut());
  });
})();
