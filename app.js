/**** GameDoobe app.js — vanilla JS, no libraries ****/
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const toFa = (n) => Number(n).toLocaleString("fa-IR");

function fmtPrice(n) {
  try {
    return new Intl.NumberFormat("fa-IR").format(n) + " تومان";
  } catch (e) {
    return toFa(n) + " تومان";
  }
}

/* کلیدهای ذخیره‌سازی */
const K_CART = "gd_cart_v1";
const K_ORDERS = "gd_orders_v1";
const K_USERS = "gd_users_v1";
const K_SESSION = "gd_session_v1";

function readJSON(k, fb) {
  try {
    const v = localStorage.getItem(k);
    return v ? JSON.parse(v) : fb;
  } catch (e) { return fb; }
}
function writeJSON(k, v) {
  try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {}
}

/* ---------- محصولات ---------- */
const PRODUCTS = [
  {
    slug: "life-is-strange-remastered", en: "Life is Strange Remastered", fa: "لایف ایز استرنج ریمسترد",
    short: "ماجراجویی احساسی مکس و کلویی با قدرت بازگشت در زمان.",
    price: 890000, rating: 4.6, status: "دوبله کامل",
    cover: "Photo/Life%20is%20Strange%20Remastered.jpg",
    audio: "#",
    desc: "مکس کالفیلد قدرت بازگشت در زمان را کشف می‌کند و باید سرنوشت شهر آرکیدیا بی را تغییر دهد. انتخاب‌های شما داستان دوستی مکس و کلویی را شکل می‌دهد.",
    features: ["دوبله کامل فارسی", "هماهنگ با نسخه اصلی بازی", "ترجمه حرفه‌ای دیالوگ‌ها", "کیفیت صدای استودیویی"]
  },
  {
    slug: "martha-is-dead", en: "Martha Is Dead", fa: "مارتا ایز دد",
    short: "روایت تلخ و رازآلود جنگ جهانی دوم در دل ایتالیا.",
    price: 790000, rating: 4.4, status: "دوبله کامل",
    cover: "Photo/Martha%20Is%20Dead.jpg",
    audio: "#",
    desc: "در سال ۱۹۴۴ و در دل توسکانی ایتالیا، جسد مارتا پیدا می‌شود و خواهر دوقلویش به دنبال حقیقت می‌رود. روایتی تلخ از جنگ، خاطره و جنون.",
    features: ["دوبله کامل فارسی", "هماهنگ با نسخه اصلی بازی", "ترجمه حرفه‌ای دیالوگ‌ها", "کیفیت صدای استودیویی"]
  },
  {
    slug: "the-last-of-us-part-1", en: "The Last of Us Part I", fa: "آخرین بازمانده از ما پارت ۱",
    short: "سفر فراموش‌نشدنی جوئل و الی در دنیایی ویران‌شده.",
    price: 1490000, rating: 4.9, status: "دوبله کامل",
    cover: "Photo/The%20Last%20of%20Us%20Part%20I.jpg",
    audio: "#",
    desc: "جوئل مامور می‌شود الی را در سراسر آمریکای ویران‌شده همراهی کند. بازسازی کامل شاهکار ناتی‌داگ با دوبله احساسی فارسی.",
    features: ["دوبله کامل فارسی", "هماهنگ با نسخه اصلی بازی", "ترجمه حرفه‌ای دیالوگ‌ها", "کیفیت صدای استودیویی"]
  },
  {
    slug: "cyberpunk-2077", en: "Cyberpunk 2077", fa: "سایبرپانک ۲۰۷۷",
    short: "ماجراجویی جهان‌باز در شهر آینده‌نگر نایت سیتی.",
    price: 1290000, rating: 4.8, status: "دوبله کامل",
    cover: "Photo/Cyberpunk%202077.jpg",
    audio: "#",
    desc: "در نقش وی وارد نایت سیتی شوید؛ شهری پر از خلافکاران، سایبورگ‌ها و فرصت‌ها. سرنوشت تراشه جانی سیلورهند در دستان شماست.",
    features: ["دوبله کامل فارسی", "هماهنگ با نسخه اصلی بازی", "ترجمه حرفه‌ای دیالوگ‌ها", "کیفیت صدای استودیویی"]
  },
  {
    slug: "red-dead-redemption-2", en: "Red Dead Redemption 2", fa: "رد دد ریدمپشن ۲",
    short: "حماسه وسترن آرتور مورگان در غرب وحشی آمریکا.",
    price: 1390000, rating: 4.9, status: "دوبله کامل",
    cover: "Photo/Red%20Dead%20Redemption%202.jpg",
    audio: "#",
    desc: "آرتور مورگان و دارودسته داچ در غرب وحشی رو به زوال برای بقا می‌جنگند. یکی از پرجزئیات‌ترین دنیاهای تاریخ بازی با دوبله فارسی.",
    features: ["دوبله کامل فارسی", "هماهنگ با نسخه اصلی بازی", "ترجمه حرفه‌ای دیالوگ‌ها", "کیفیت صدای استودیویی"]
  }
];

function findProduct(slug) { return PRODUCTS.find((p) => p.slug === slug); }

/* ---------- سبد خرید ---------- */
function getCart() { return readJSON(K_CART, []); }
function saveCart(c) { writeJSON(K_CART, c); updateBadge(); }
function cartQty() { return getCart().reduce((a, i) => a + (i.qty || 1), 0); }
function cartDetailed() {
  return getCart().map((i) => ({ ...i, p: findProduct(i.slug) })).filter((i) => i.p);
}
function cartSubtotal() { return cartDetailed().reduce((a, i) => a + i.p.price * i.qty, 0); }
let appliedCode = "";
function discountRate() { return appliedCode === "GAME10" ? 0.1 : 0; }
function cartTotal() { return Math.round(cartSubtotal() * (1 - discountRate())); }

/* ---------- سفارش / کاربر ---------- */
function getOrders() { return readJSON(K_ORDERS, []); }
function saveOrders(o) { writeJSON(K_ORDERS, o); }
function getUsers() { return readJSON(K_USERS, []); }
function saveUsers(u) { writeJSON(K_USERS, u); }
function getSession() { return readJSON(K_SESSION, null); }
function setSession(s) {
  if (s && s.email) {
    const orders = getOrders();
    let changed = false;
    orders.forEach((o) => { if (o.email === "guest") { o.email = s.email; changed = true; } });
    if (changed) saveOrders(orders);
  }
  writeJSON(K_SESSION, s); renderCurrentUser(); renderDownloads(); renderOrders();
}

/* ---------- اعلان‌ها ---------- */
function toast(msg, type) {
  const box = $("#toasts");
  if (!box) return;
  const el = document.createElement("div");
  el.className = "toast" + (type ? " toast-" + type : "");
  el.textContent = msg;
  box.appendChild(el);
  setTimeout(() => { el.classList.add("show"); }, 10);
  setTimeout(() => {
    el.classList.remove("show");
    setTimeout(() => el.remove(), 300);
  }, 2500);
}

/* ---------- بج سبد ---------- */
function updateBadge() {
  const n = cartQty();
  const badges = $$("#cartCount, #cartBadge, [data-cart-count]");
  badges.forEach((b) => { b.textContent = toFa(n); b.hidden = false; });
}

/* ---------- کاتالوگ: جستجو / فیلتر / مرتب‌سازی ---------- */
function starHTML(r) {
  return '<span class="stars" aria-label="امتیاز ' + r + ' از ۵">★ ' + toFa(r) + "</span>";
}
function cardHTML(p) {
  const wished = isWished(p.slug) ? " active" : "";
  const pressed = isWished(p.slug) ? "true" : "false";
  return '<article class="card" data-slug="' + p.slug + '">' +
    '<a class="card-media-link" href="product.html?slug=' + encodeURIComponent(p.slug) + '">' +
    '<img class="card-media" loading="lazy" src="' + p.cover + '" alt="' + p.en + '" width="600" height="450">' +
    '<span class="badge">' + p.status + "</span>" +
    '<button class="card-wish' + wished + '" type="button" data-wish data-slug="' + p.slug + '" aria-pressed="' + pressed + '" aria-label="افزودن به علاقه‌مندی‌ها">♥</button></a>' +
    '<div class="card-body">' +
    '<h3 class="card-title" dir="ltr">' + p.en + "</h3>" +
    '<p class="card-desc">' + p.short + "</p>" +
    '<div class="card-meta">' + starHTML(p.rating) + '<span class="price">' + fmtPrice(p.price) + "</span></div>" +
    '<div class="card-actions"><button class="btn btn-dark" data-add-to-cart data-slug="' + p.slug + '">افزودن به سبد</button>' +
    '<a class="btn btn-ghost" href="product.html?slug=' + encodeURIComponent(p.slug) + '">مشاهده و خرید</a></div>' +
    "</div></article>";
}
function getFilters() {
  const q = ($("#searchInput") || $("#search") || {}).value || "";
  const st = ($("#statusFilter") || {}).value || "all";
  const sort = ($("#sortSelect") || $("#sort") || {}).value || "featured";
  return { q: q.trim(), st, sort };
}
function renderCatalog() {
  const grid = $("#productGrid") || $("#catalog") || $("#products");
  if (!grid) return;
  const { q, st, sort } = getFilters();
  let list = PRODUCTS.slice();
  if (st && st !== "all") list = list.filter((p) => p.status === st);
  if (q) list = list.filter((p) => (p.fa + " " + p.en + " " + p.short).includes(q));
  if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
  else if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
  else if (sort === "name") list.sort((a, b) => a.fa.localeCompare(b.fa, "fa"));
  else if (sort === "rating") list.sort((a, b) => b.rating - a.rating);
  grid.innerHTML = list.map(cardHTML).join("");
  const rc = $("#resultCount");
  if (rc) rc.textContent = list.length ? toFa(list.length) + " محصول" : "محصولی یافت نشد";
  const empty = $("#emptyState");
  if (empty) empty.hidden = list.length !== 0;
}
function initCatalog() {
  const grid = $("#productGrid") || $("#catalog") || $("#products");
  if (!grid) return;
  const s = $("#searchInput") || $("#search");
  const f = $("#statusFilter");
  const o = $("#sortSelect") || $("#sort");
  if (s) s.addEventListener("input", renderCatalog);
  if (f) f.addEventListener("change", renderCatalog);
  if (o) o.addEventListener("change", renderCatalog);
  renderCatalog();
}

/* ---------- اسلایدر محصولات ویژه ---------- */
function initSlider() {
  const slider = $("#featuredSlider") || $("#slider");
  const track = $("#featuredTrack") || $("#sliderTrack");
  if (!slider || !track) return;
  const feat = PRODUCTS.slice().sort((a, b) => b.rating - a.rating);
  if (!feat.length) return;
  track.innerHTML = feat.map(cardHTML).join("");
  const items = Array.from(track.children);
  const prev = $("#featPrev") || $("#sliderPrev");
  const next = $("#featNext") || $("#sliderNext");
  const dotsBox = $("#featDots") || $("#sliderDots");
  if (items.length < 2) {
    if (prev) prev.hidden = true;
    if (next) next.hidden = true;
    if (dotsBox) dotsBox.hidden = true;
    return;
  }
  let idx = 0, timer = null;
  const perView = () => (window.innerWidth < 640 ? 1 : window.innerWidth < 1024 ? 2 : 3);
  const maxIdx = () => Math.max(0, items.length - perView());
  function paint() {
    const pv = perView();
    items.forEach((el) => { el.style.flex = "0 0 " + 100 / pv + "%"; });
    if (idx > maxIdx()) idx = 0;
    track.style.transform = "translateX(" + (idx * (100 / pv)) + "%)";
    if (dotsBox) {
      dotsBox.innerHTML = "";
      for (let i = 0; i <= maxIdx(); i++) {
        const d = document.createElement("button");
        d.className = "dot" + (i === idx ? " active" : "");
        d.setAttribute("aria-label", "اسلاید " + toFa(i + 1));
        d.addEventListener("click", () => { idx = i; paint(); restart(); });
        dotsBox.appendChild(d);
      }
    }
  }
  function go(d) { idx = (idx + d + maxIdx() + 1) % (maxIdx() + 1); paint(); }
  function restart() { stop(); timer = setInterval(() => go(1), 5000); }
  function stop() { if (timer) clearInterval(timer); timer = null; }
  if (prev) prev.addEventListener("click", () => { go(1); restart(); });
  if (next) next.addEventListener("click", () => { go(-1); restart(); });
  slider.addEventListener("mouseenter", stop);
  slider.addEventListener("mouseleave", restart);
  // سوایپ لمسی برای موبایل
  let touchX = null;
  const viewport = slider.querySelector(".slider-viewport") || slider;
  viewport.addEventListener("touchstart", (e) => {
    touchX = e.touches[0].clientX;
    stop();
  }, { passive: true });
  viewport.addEventListener("touchend", (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
    touchX = null;
    restart();
  }, { passive: true });
  window.addEventListener("resize", paint);
  paint(); restart();
}

/* ---------- سبد کشویی ---------- */
function lockScroll(on) {
  document.body.style.overflow = on ? "hidden" : "";
  document.documentElement.style.overflow = on ? "hidden" : "";
}
function openCart() {
  const d = $("#cartDrawer");
  const o = $("#cartOverlay");
  if (!d) return;
  d.classList.add("open"); d.setAttribute("aria-hidden", "false");
  if (o) o.hidden = false;
  lockScroll(true);
  renderCart();
}
function closeCart() {
  const d = $("#cartDrawer");
  const o = $("#cartOverlay");
  if (!d) return;
  d.classList.remove("open"); d.setAttribute("aria-hidden", "true");
  if (o) o.hidden = true;
  const modal = $("#authModal");
  if (!modal || modal.hidden) lockScroll(false);
}
function addToCart(slug, qty) {
  const p = findProduct(slug);
  if (!p) return;
  const c = getCart();
  const it = c.find((i) => i.slug === slug);
  if (it) it.qty = (it.qty || 1) + (qty || 1);
  else c.push({ slug, qty: qty || 1 });
  saveCart(c); renderCart();
  toast("«" + p.fa + "» به سبد اضافه شد", "success");
}
function renderCart() {
  const box = $("#cartItems");
  if (!box) { updateBadge(); return; }
  const items = cartDetailed();
  if (!items.length) {
    box.innerHTML = '<p class="cart-empty">سبد خرید خالی است.</p>';
  } else {
    box.innerHTML = items.map((i) =>
      '<div class="cart-item" data-slug="' + i.slug + '">' +
      '<img src="' + i.p.cover + '" alt="' + i.p.fa + '" width="72" height="72" loading="lazy">' +
      '<div class="ci-info"><strong>' + i.p.fa + "</strong>" +
      '<span class="price">' + fmtPrice(i.p.price) + "</span>" +
      '<div class="ci-qty"><button data-dec data-slug="' + i.slug + '" aria-label="کم کردن">−</button>' +
      "<span>" + toFa(i.qty) + "</span>" +
      '<button data-inc data-slug="' + i.slug + '" aria-label="زیاد کردن">+</button>' +
      '<button class="ci-remove" data-remove data-slug="' + i.slug + '">حذف</button></div></div></div>'
    ).join("");
  }
  const sub = cartSubtotal(), tot = cartTotal();
  const subEl = $("#cartSubtotal"), totEl = $("#cartTotal"), discEl = $("#cartDiscount");
  if (subEl) subEl.textContent = fmtPrice(sub);
  if (totEl) totEl.textContent = fmtPrice(tot);
  if (discEl) discEl.textContent = discountRate() ? "−" + fmtPrice(Math.round(sub * discountRate())) + " (GAME10)" : fmtPrice(0);
  updateBadge();
}
function checkout() {
  const items = cartDetailed();
  if (!items.length) { toast("سبد خرید خالی است", "error"); return; }
  const ses = getSession();
  const email = (ses && ses.email) || "guest";
  const orders = getOrders();
  orders.push({
    id: "GD-" + Date.now().toString().slice(-6),
    date: new Date().toISOString(),
    email,
    items: getCart(),
    subtotal: cartSubtotal(),
    code: appliedCode,
    total: cartTotal()
  });
  saveOrders(orders);
  saveCart([]); appliedCode = "";
  const dIn = $("#discountInput");
  if (dIn) dIn.value = "";
  renderCart(); closeCart();
  toast("سفارش شما ثبت شد", "success");
  openAuth();
}
function initCart() {
  document.addEventListener("click", (e) => {
    const legacyAdd = e.target.closest("[data-add]");
    if (legacyAdd && !legacyAdd.hasAttribute("data-add-to-cart")) {
      addToCart(legacyAdd.dataset.add, 1); return;
    }
    const wish = e.target.closest("[data-wish]");
    if (wish) { toggleWish(wish.dataset.slug); return; }
    const add = e.target.closest("[data-add-to-cart]");
    if (add) { addToCart(add.dataset.slug, 1); return; }
    const inc = e.target.closest("[data-inc]");
    if (inc) {
      const c = getCart();
      const it = c.find((i) => i.slug === inc.dataset.slug);
      if (it) it.qty++;
      saveCart(c); renderCart(); return;
    }
    const dec = e.target.closest("[data-dec]");
    if (dec) {
      let c = getCart();
      const it = c.find((i) => i.slug === dec.dataset.slug);
      if (it) { it.qty--; if (it.qty < 1) c = c.filter((i) => i.slug !== it.slug); }
      saveCart(c); renderCart(); return;
    }
    const rem = e.target.closest("[data-remove]");
    if (rem) {
      saveCart(getCart().filter((i) => i.slug !== rem.dataset.slug));
      renderCart();
      toast("محصول از سبد حذف شد");
      return;
    }
    if (e.target.closest("[data-open-cart]") || e.target.closest("#cartBtn") || e.target.closest("#openCart")) openCart();
    if (e.target.closest("[data-close-cart]") || e.target.closest("#cartClose")) closeCart();
  });
  const overlay = $("#cartOverlay");
  if (overlay) overlay.addEventListener("click", closeCart);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") { closeCart(); closeAuth(); } });
  const co = $("#checkoutBtn") || $("#checkout");
  if (co) co.addEventListener("click", checkout);
  const dBtn = $("#discountBtn") || $("#applyDiscount");
  const dIn = $("#discountInput") || $("#discountCode");
  const applyDisc = () => {
    if (!dIn) return;
    const v = (dIn.value || "").trim().toUpperCase();
    if (v === "GAME10") { appliedCode = "GAME10"; toast("کد تخفیف ۱۰٪ اعمال شد", "success"); }
    else { appliedCode = ""; toast("کد تخفیف معتبر نیست", "error"); }
    renderCart();
  };
  if (dBtn) dBtn.addEventListener("click", applyDisc);
  renderCart();
}

/* ---------- صفحه محصول (‎?slug=‎) ---------- */
function initProductPage() {
  const detail = $("#productDetail") || $("#product");
  if (!detail) return;
  let slug = null;
  try { slug = new URLSearchParams(location.search).get("slug"); } catch (e) {}
  if (!slug) {
    const m = /[?&]slug=([^&#]*)/.exec(location.href);
    if (m) { try { slug = decodeURIComponent(m[1]); } catch (e) { slug = m[1]; } }
  }
  const p = slug && findProduct(slug);
  const nf = $("#pNotFound") || $("#notFound");
  const crumb = $("#crumbCurrent");
  if (!p) {
    detail.innerHTML = "";
    if (nf) nf.hidden = false;
    document.title = "بازی پیدا نشد | GameDoobe";
    return;
  }
  if (nf) nf.hidden = true;
  if (crumb) crumb.textContent = p.fa;
  document.title = "خرید " + p.fa + " دوبله فارسی | GameDoobe";
  const audioRow = p.audio && p.audio !== "#"
    ? '<audio controls preload="none" src="' + p.audio + '">مرورگر شما از پخش صوت پشتیبانی نمی‌کند.</audio>'
    : '<p class="muted">نمونه صوت دوبله به‌زودی افزوده می‌شود.</p>';
  const wished = isWished(p.slug);
  detail.innerHTML =
    '<div class="p-media"><img src="' + p.cover + '" alt="' + p.en + '" width="600" height="450" fetchpriority="high">' +
    '<span class="badge">' + p.status + "</span></div>" +
    '<div class="p-info"><h1 dir="ltr">' + p.en + "</h1>" +
    '<div class="p-meta">' + starHTML(p.rating) + '<span class="price price-big">' + fmtPrice(p.price) + "</span></div>" +
    '<p class="p-short">' + p.short + "</p>" +
    '<p class="p-desc">' + p.desc + "</p>" +
    '<div class="audio-sample"><h2 style="font-size:1rem">نمونه صدای دوبله</h2>' + audioRow + "</div>" +
    '<ul class="features-checklist">' + p.features.map((f) => "<li>" + f + "</li>").join("") + "</ul>" +
    '<div class="price-box"><div class="qty-row"><span>قیمت نهایی:</span><strong class="price">' + fmtPrice(p.price) + "</strong></div>" +
    '<div class="buy-row"><button class="btn btn-dark" data-add-to-cart data-slug="' + p.slug + '">افزودن به سبد</button>' +
    '<button class="btn btn-ghost" data-wish data-slug="' + p.slug + '" aria-pressed="' + (wished ? "true" : "false") + '">' + (wished ? "♥ در علاقه‌مندی‌ها" : "♡ علاقه‌مندی") + "</button>" +
    '<button class="btn btn-ghost" data-open-cart>مشاهده سبد</button></div></div>' +
    '<div class="trust-mini"><span>پرداخت امن</span></div></div>';
  const jp = $("#jsonProduct");
  if (jp) {
    try {
      jp.textContent = JSON.stringify({
        "@context": "https://schema.org", "@type": "Product",
        name: p.fa, alternateName: p.en, description: p.desc,
        brand: { "@type": "Brand", name: "GameDoobe" },
        aggregateRating: { "@type": "AggregateRating", ratingValue: String(p.rating), reviewCount: "120" },
        offers: {
          "@type": "Offer", url: "https://gamedoobe.ir/product.html?slug=" + p.slug,
          priceCurrency: "IRR", price: String(p.price), availability: "https://schema.org/InStock"
        }
      });
    } catch (e) {}
  }
  const rel = $("#relatedGrid") || $("#related");
  if (rel) {
    const others = PRODUCTS.filter((x) => x.slug !== p.slug).slice(0, 3);
    rel.innerHTML = others.map(cardHTML).join("");
  }
}

/* ---------- احراز هویت / حساب کاربری ---------- */
function openAuth() {
  const m = $("#authModal");
  if (!m) return;
  m.hidden = false;
  lockScroll(true);
  renderCurrentUser(); renderDownloads(); renderOrders();
}
function closeAuth() {
  const m = $("#authModal");
  if (!m) return;
  m.hidden = true;
  const drawer = $("#cartDrawer");
  if (!drawer || !drawer.classList.contains("open")) lockScroll(false);
}
function switchTab(which) {
  const l = $("#loginForm"), r = $("#registerForm");
  const tl = $("#tabLogin"), tr = $("#tabRegister");
  if (!l || !r) return;
  const login = which !== "register";
  l.hidden = !login; r.hidden = login;
  if (tl) { tl.classList.toggle("active", login); tl.setAttribute("aria-selected", login); }
  if (tr) { tr.classList.toggle("active", !login); tr.setAttribute("aria-selected", !login); }
}
function renderCurrentUser() {
  const ses = getSession();
  const spots = $$("#currentUser, #userName, #authStatus, #accountName");
  spots.forEach((el) => { el.textContent = ses ? (ses.name || ses.email) : "مهمان"; });
  const lo = $("#logoutBtn") || $("#logout");
  if (lo) lo.hidden = !ses;
  const lb = $("#loginBtn");
  if (lb && ses) lb.textContent = ses.name || ses.email;
  else if (lb) lb.textContent = "ورود / ثبت‌نام";
}
function renderDownloads() {
  const box = $("#downloadsList") || $("#downloads");
  if (!box) return;
  const ses = getSession();
  if (!ses) {
    box.innerHTML = '<p class="muted">پس از ورود، لینک‌های دانلود شما اینجا نمایش داده می‌شود.</p>';
    return;
  }
  const orders = getOrders().filter((o) => o.email === ses.email);
  const owned = [...new Set(orders.flatMap((o) => o.items.map((i) => i.slug)))];
  let html = "";
  if (owned.length) {
    html += "<p>بازی‌های خریداری‌شده شما:</p>" + owned.map((s) => {
      const p = findProduct(s);
      if (!p) return "";
      return '<div class="dl-item"><strong>' + p.fa + '</strong><button class="btn btn-dark" type="button" data-demo="' + p.slug + '">دانلود دوبله</button></div>';
    }).join("");
  } else {
    html += '<p class="muted">هنوز خریدی ندارید؛ پس از خرید، لینک دانلود اینجا نمایش داده می‌شود.</p>';
  }
  box.innerHTML = html;
}
function faDate(iso) {
  try { return new Date(iso).toLocaleDateString("fa-IR"); }
  catch (e) { return iso; }
}
function renderOrders() {
  const body = $("#ordersBody") || $("#orderHistory tbody") || $("#ordersTable tbody");
  if (!body) return;
  const ses = getSession();
  if (!ses) {
    body.innerHTML = '<tr><td colspan="4">برای مشاهده سفارش‌ها وارد شوید.</td></tr>';
    return;
  }
  const orders = getOrders().filter((o) => o.email === ses.email).reverse();
  body.innerHTML = orders.length ? orders.map((o) =>
    "<tr><td>" + o.id + "</td><td>" + faDate(o.date) + "</td><td>" +
    toFa(o.items.reduce((a, i) => a + (i.qty || 1), 0)) + "</td><td>" + fmtPrice(o.total) + "</td></tr>"
  ).join("") : '<tr><td colspan="4">سفارشی ثبت نشده است.</td></tr>';
}
function initAuth() {
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-open-auth]") || e.target.closest("#openAuth") || e.target.closest("#loginBtn")) { openAuth(); return; }
    if (e.target.closest("[data-close-auth]") || e.target.closest("#authClose")) { closeAuth(); return; }
    const t = e.target.closest("[data-auth-tab]");
    if (t) switchTab(t.dataset.authTab);
    if (e.target.closest("#tabLogin")) switchTab("login");
    if (e.target.closest("#tabRegister")) switchTab("register");
    if (e.target.closest("#logoutBtn") || e.target.closest("#logout")) {
      setSession(null); toast("با موفقیت خارج شدید"); closeAuth(); return;
    }
    if (e.target.closest("#authModal") && !e.target.closest(".modal-box")) { closeAuth(); return; }
    const demo = e.target.closest("[data-demo]");
    if (demo) toast("لینک دانلود به‌زودی فعال می‌شود", "success");
  });
  const lf = $("#loginForm");
  if (lf) lf.addEventListener("submit", (e) => {
    e.preventDefault();
    const em = ($("#loginEmail") || {}).value || "";
    const pw = ($("#loginPass") || $("#loginPassword") || {}).value || "";
    const u = getUsers().find((x) => x.email === em.trim() && x.pass === pw);
    if (!u) { toast("ایمیل یا رمز عبور اشتباه است", "error"); return; }
    setSession({ email: u.email, name: u.name });
    toast("خوش آمدید " + u.name, "success"); closeAuth(); lf.reset();
  });
  const rf = $("#registerForm");
  if (rf) rf.addEventListener("submit", (e) => {
    e.preventDefault();
    const nm = ((($("#regName") || $("#registerName") || {}).value) || "").trim();
    const em = ((($("#regEmail") || $("#registerEmail") || {}).value) || "").trim();
    const pw = ((($("#regPass") || $("#registerPassword") || {}).value) || "");
    if (!nm || !em || !pw) { toast("همه فیلدها را کامل کنید", "error"); return; }
    const users = getUsers();
    if (users.some((x) => x.email === em)) { toast("این ایمیل قبلا ثبت شده است", "error"); return; }
    users.push({ name: nm, email: em, pass: pw });
    saveUsers(users); setSession({ email: em, name: nm });
    toast("حساب شما ساخته شد", "success"); closeAuth(); rf.reset();
  });
  renderCurrentUser(); renderDownloads(); renderOrders();
}

/* ---------- فرم‌ها ---------- */
function initForms() {
  const c = $("#contactForm");
  if (c) c.addEventListener("submit", (e) => {
    e.preventDefault(); toast("پیام شما ارسال شد. به‌زودی پاسخ می‌دهیم", "success"); c.reset();
  });
  const n = $("#newsletterForm") || $("#newsletter");
  if (n) n.addEventListener("submit", (e) => {
    e.preventDefault(); toast("عضویت شما در خبرنامه ثبت شد", "success"); n.reset();
  });
}

/* ---------- ناوبری موبایل ---------- */
function initNav() {
  const t = $("#navToggle") || $("#menuBtn");
  const m = $("#mobileNav") || $("#navMenu") || $("#mainNav");
  if (t && m) t.addEventListener("click", () => {
    const open = m.classList.toggle("open");
    t.setAttribute("aria-expanded", open);
  });
  if (m) m.addEventListener("click", (e) => {
    if (e.target.closest("a")) { m.classList.remove("open"); }
  });
}

/* ---------- اسکرول نرم ---------- */
function initSmooth() {
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (!id || id.length < 2) return;
      const el = $(id);
      if (el) { e.preventDefault(); el.scrollIntoView({ behavior: "smooth" }); }
    });
  });
}

/* ---------- سال فوتر ---------- */
function initYear() {
  const y = $("#year") || $("#footerYear");
  if (y) { try { y.textContent = new Date().toLocaleDateString("fa-IR", { year: "numeric" }); } catch (e) {} }
}

/* ---------- علاقه‌مندی‌ها ---------- */
const K_WISH = "gd_wish_v1";
function getWish() { return readJSON(K_WISH, []); }
function isWished(slug) { return getWish().indexOf(slug) !== -1; }
function toggleWish(slug) {
  const p = findProduct(slug);
  if (!p) return;
  let w = getWish();
  if (w.indexOf(slug) !== -1) {
    w = w.filter((s) => s !== slug);
    writeJSON(K_WISH, w);
    toast("«" + p.en + "» از علاقه‌مندی‌ها حذف شد");
  } else {
    w.push(slug);
    writeJSON(K_WISH, w);
    toast("«" + p.en + "» به علاقه‌مندی‌ها اضافه شد", "success");
  }
  paintWish();
}
function paintWish() {
  const w = getWish();
  $$("[data-wish]").forEach((b) => {
    const on = w.indexOf(b.dataset.slug) !== -1;
    b.classList.toggle("active", on);
    b.setAttribute("aria-pressed", on);
    if (b.classList.contains("card-wish")) b.textContent = "♥";
    else if (b.closest(".p-info")) b.textContent = on ? "♥ در علاقه‌مندی‌ها" : "♡ علاقه‌مندی";
  });
  const badge = $("#wishCount");
  if (badge) { badge.textContent = toFa(w.length); badge.hidden = false; }
  const t = $("#wishOnly");
  if (t) {
    const grid = $("#productGrid");
    if (t.getAttribute("aria-pressed") === "true") {
      const list = PRODUCTS.filter((p) => w.indexOf(p.slug) !== -1);
      if (grid) grid.innerHTML = list.length ? list.map(cardHTML).join("") : '<p class="empty-state">هنوز چیزی به علاقه‌مندی‌ها اضافه نکرده‌اید. روی ♥ هر بازی بزنید.</p>';
      const rc = $("#resultCount");
      if (rc) rc.textContent = list.length ? toFa(list.length) + " علاقه‌مندی" : "علاقه‌مندی خالی است";
      const empty = $("#emptyState");
      if (empty) empty.hidden = true;
      paintWish();
    } else {
      renderCatalog();
    }
  }
}
function initWishlist() {
  const chip = $("#wishOnly");
  if (chip) chip.addEventListener("click", () => {
    const on = chip.getAttribute("aria-pressed") !== "true";
    chip.setAttribute("aria-pressed", on);
    paintWish();
  });
  const wb = $("#wishBtn");
  if (wb) wb.addEventListener("click", () => {
    const c = $("#wishOnly");
    if (c && c.getAttribute("aria-pressed") !== "true") {
      c.setAttribute("aria-pressed", "true");
      paintWish();
    }
  });
  paintWish();
}

/* ---------- چرخش سه‌بعدی کارت با موس (فقط دستگاه ماوس‌دار) ---------- */
function bindTilt() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (window.matchMedia("(hover: none), (pointer: coarse)").matches) return;
  if ((window.innerWidth || 1024) < 1024) return;
  document.addEventListener("pointermove", (e) => {
    const card = e.target.closest && e.target.closest(".card");
    $$(".card").forEach((c) => { if (c !== card) { c.style.setProperty("--rx", "0deg"); c.style.setProperty("--ry", "0deg"); } });
    if (!card) return;
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    card.style.setProperty("--ry", (px * 7).toFixed(2) + "deg");
    card.style.setProperty("--rx", (-py * 7).toFixed(2) + "deg");
  });
  document.addEventListener("pointerleave", () => {
    $$(".card").forEach((c) => { c.style.setProperty("--rx", "0deg"); c.style.setProperty("--ry", "0deg"); });
  }, true);
}

/* ---------- شمارش معکوس پیشنهاد ---------- */
function initDeal() {
  const box = $("#dealTimer");
  if (!box) return;
  const end = Date.now() + 1000 * 60 * 60 * 26 + 1000 * 60 * 14;
  const dd = $("#dealD"), hh = $("#dealH"), mm = $("#dealM"), ss = $("#dealS");
  const pad = (n) => String(n).padStart(2, "0");
  const tick = () => {
    let left = Math.max(0, end - Date.now());
    const d = Math.floor(left / 86400000); left -= d * 86400000;
    const h = Math.floor(left / 3600000); left -= h * 3600000;
    const m = Math.floor(left / 60000); left -= m * 60000;
    const s = Math.floor(left / 1000);
    if (dd) dd.textContent = toFa(d);
    if (hh) hh.textContent = toFa(pad(h));
    if (mm) mm.textContent = toFa(pad(m));
    if (ss) ss.textContent = toFa(pad(s));
  };
  tick();
  setInterval(tick, 1000);
  const apply = $("#dealApply");
  if (apply) apply.addEventListener("click", () => {
    const inp = $("#discountInput");
    if (inp) inp.value = "GAME10";
    appliedCode = "GAME10";
    renderCart();
    openCart();
    toast("کد تخفیف ۱۰٪ اعمال شد", "success");
  });
}

/* ---------- سوالات پرتکرار ---------- */
function initFaq() {
  const list = $("#faqList");
  if (!list) return;
  list.addEventListener("toggle", (e) => {
    const open = e.target;
    if (!open.open) return;
    list.querySelectorAll("details[open]").forEach((d) => { if (d !== open) d.open = false; });
  }, true);
}

/* ---------- افکت‌های ظاهری ---------- */
function initImgFade() {
  const show = (img) => img.classList.add("loaded");
  $$("img.card-media, .p-media img").forEach((img) => {
    if (img.complete && img.naturalWidth > 0) show(img);
    else {
      img.addEventListener("load", () => show(img), { once: true });
      img.addEventListener("error", () => show(img), { once: true });
    }
  });
  new MutationObserver((muts) => {
    muts.forEach((m) => m.addedNodes.forEach((n) => {
      if (n.querySelectorAll) n.querySelectorAll("img.card-media, .p-media img").forEach((img) => {
        if (img.complete && img.naturalWidth > 0) show(img);
        else {
          img.addEventListener("load", () => show(img), { once: true });
          img.addEventListener("error", () => show(img), { once: true });
        }
      });
    }));
  }).observe(document.body, { childList: true, subtree: true });
}

function initExtras() {
  document.documentElement.classList.add("js");
  // نوار پیشرفت اسکرول + دکمه بازگشت + سایه هدر
  const bar = $("#scrollBar"), top = $("#toTop"), header = $(".site-header");
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? window.scrollY / max : 0;
    if (bar) bar.style.inlineSize = (p * 100).toFixed(1) + "%";
    if (top) top.classList.toggle("show", window.scrollY > 600);
    if (header) header.classList.toggle("scrolled", window.scrollY > 8);
    spyNav();
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  if (top) top.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  // ظاهر شدن تدریجی سکشن‌ها و کارت‌ها هنگام اسکرول
  try {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    const mark = () => {
      $$("main section, .card, .stat, .testimonial, .plan, .about-grid > *, .contact-grid > *").forEach((el) => {
        if (!el.classList.contains("reveal")) el.classList.add("reveal");
        io.observe(el);
      });
    };
    mark();
    // کارت‌ها با رندر مجدد ساخته می‌شوند؛ دوباره علامت بزن
    new MutationObserver(mark).observe(document.body, { childList: true, subtree: true });
  } catch (e) {}
  // شمارش انیمیشنی آمار
  try {
    const stats = $$(".stat-num");
    const sio = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        sio.unobserve(en.target);
        countUp(en.target);
      });
    }, { threshold: 0.5 });
    stats.forEach((el) => sio.observe(el));
  } catch (e) {}
  // زوم تصویر محصول با کلیک
  document.addEventListener("click", (e) => {
    const img = e.target.closest && e.target.closest(".p-media img");
    if (!img) return;
    if (img.requestFullscreen) { try { img.requestFullscreen(); } catch (err) {} }
  });
}

/* هایلایت آیتم فعال منو هنگام اسکرول */
function spyNav() {
  const links = $$('.main-nav a[href^="#"], .mobile-nav a[href^="#"]');
  if (!links.length) return;
  const ids = ["home", "featured", "shop", "about", "contact"];
  let current = "";
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el && el.getBoundingClientRect().top < window.innerHeight * 0.4) current = id;
  });
  links.forEach((a) => {
    const on = a.getAttribute("href") === "#" + current;
    if (on) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
}

/* شمارش انیمیشنی عدد فارسی */
function countUp(el) {
  const raw = (el.textContent || "").replace(/[^\d۰-۹]/g, "");
  const toLatin = (s) => s.replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d));
  const target = parseInt(toLatin(raw), 10);
  if (!target || target <= 0) return;
  const suffix = (el.textContent || "").replace(/[\d۰-۹٬,.\s]/g, "").trim();
  const dur = 1200, t0 = performance.now();
  const step = (t) => {
    const p = Math.min(1, (t - t0) / dur);
    const eased = 1 - Math.pow(1 - p, 3);
    const val = Math.round(target * eased);
    el.textContent = toFa(val) + (suffix ? " " + suffix : "");
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = toFa(target) + (suffix ? " " + suffix : "");
  };
  requestAnimationFrame(step);
}

/* ذرات شناور روی هیرو (فقط دسکتاپ، سبک) */
function initParticles() {
  const hero = $(".hero");
  if (!hero) return;
  if ((window.innerWidth || 1024) < 768) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const cv = document.createElement("canvas");
  cv.setAttribute("aria-hidden", "true");
  cv.className = "hero-particles";
  cv.style.cssText = "position:absolute;inset:0;inline-size:100%;block-size:100%;pointer-events:none;opacity:.5";
  hero.style.position = "relative";
  hero.prepend(cv);
  const ctx = cv.getContext("2d");
  let W, H, dots = [];
  const size = () => {
    W = cv.width = hero.offsetWidth;
    H = cv.height = hero.offsetHeight;
  };
  size();
  window.addEventListener("resize", size);
  for (let i = 0; i < 40; i++) {
    dots.push({ x: Math.random(), y: Math.random(), r: Math.random() * 1.6 + 0.4, s: Math.random() * 0.0006 + 0.0002, o: Math.random() * 0.5 + 0.2 });
  }
  (function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#fff";
    dots.forEach((d) => {
      d.y -= d.s;
      if (d.y < -0.02) { d.y = 1.02; d.x = Math.random(); }
      ctx.globalAlpha = d.o;
      ctx.beginPath();
      ctx.arc(d.x * W, d.y * H, d.r, 0, 6.283);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  })();
}

/* ---------- انیمیشن موبایل کارت‌ها: ورود به دید + لمس ---------- */
function initMobileCards() {
  if (!window.matchMedia("(hover: none), (pointer: coarse)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const inView = (el) => {
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight || 800;
    const vis = Math.min(r.bottom, vh) - Math.max(r.top, 0);
    return vis > Math.min(r.height * 0.25, 160);
  };
  const check = () => {
    const cards = $$("#productGrid .card, #featuredTrack .card, #relatedGrid .card");
    if (!cards.length) return;
    const vh = window.innerHeight || document.documentElement.clientHeight || 800;
    if (vh < 10) {
      // محیط تعبیه‌شده بدون ویوپورت واقعی: همه کارت‌ها را روشن کن
      cards.forEach((card) => card.classList.add("m-inview"));
      return;
    }
    cards.forEach((card) => {
      if (inView(card)) {
        if (!card.classList.contains("m-inview")) {
          card.classList.remove("m-inview");
          void card.offsetWidth;
          card.classList.add("m-inview");
        }
      } else {
        card.classList.remove("m-inview");
      }
    });
  };
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { check(); ticking = false; });
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  new MutationObserver(check).observe(document.body, { childList: true, subtree: true });
  check();
  setTimeout(check, 500);
  setInterval(check, 1500);
  // اگر کارت‌ها رندر نشده‌اند، با رندر بعدی دوباره چک کن
  const waitCards = setInterval(() => {
    if ($$("#productGrid .card, #featuredTrack .card, #relatedGrid .card").length) { check(); clearInterval(waitCards); }
  }, 400);
  setTimeout(() => clearInterval(waitCards), 8000);
  document.addEventListener("touchstart", (e) => {
    const card = e.target.closest && e.target.closest(".card");
    if (card) card.classList.add("m-touch");
  }, { passive: true });
  const release = () => $$(".card.m-touch").forEach((c) => c.classList.remove("m-touch"));
  document.addEventListener("touchend", release, { passive: true });
  document.addEventListener("touchcancel", release, { passive: true });
}

function init() {
  updateBadge();
  initCatalog();
  initMobileCards();
  initSlider();
  initCart();
  initProductPage();
  initAuth();
  initForms();
  initNav();
  initSmooth();
  initYear();
  initExtras();
  initParticles();
  initWishlist();
  initDeal();
  initFaq();
  initImgFade();
  bindTilt();
  window.addEventListener("storage", (e) => {
    if (e.key === K_CART) updateBadge();
    if (e.key === K_WISH) paintWish();
  });
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
else init();
