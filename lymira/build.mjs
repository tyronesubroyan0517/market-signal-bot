// Lymira Creations static site generator. No dependencies.
//   node build.mjs            -> dist/          (the real site: separate CSS/JS, sitemap)
//   node build.mjs --preview  -> dist-preview/  (self-contained pages for sharing a preview)
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { site, categories, products, reviews } from './src/content.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const PREVIEW = process.argv.includes('--preview')
const OUT = path.join(here, PREVIEW ? 'dist-preview' : 'dist')
const css = fs.readFileSync(path.join(here, 'src/styles.css'), 'utf8')
const js = fs.readFileSync(path.join(here, 'src/site.js'), 'utf8')
const FONTS =
  'https://fonts.googleapis.com/css2?family=Alex+Brush&family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=EB+Garamond:wght@500&family=Playfair+Display:ital,wght@0,400;0,500;1,400&display=swap'

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const wa = (text) => `${site.whatsapp}?text=${encodeURIComponent(text)}`
const ext = (url) => `href="${esc(url)}" target="_blank" rel="noopener"`
const cat = (id) => categories.find((c) => c.id === id)

// ---------- Assets: drop a file in assets/ and the placeholder is replaced ----------
function asset(rel) {
  for (const e of ['webp', 'jpg', 'jpeg', 'png', 'svg']) {
    if (fs.existsSync(path.join(here, 'assets', `${rel}.${e}`))) return `assets/${rel}.${e}`
  }
  return null
}

// ---------- Ornaments (site decoration only, never a stand-in for product art) ----------
function dandelion() {
  const cx = 60, cy = 46
  let seeds = ''
  for (let i = 0; i < 24; i++) {
    const a = (i * 15 * Math.PI) / 180
    const r = 24 + (i % 3) * 5
    const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r
    const x0 = cx + Math.cos(a) * 4, y0 = cy + Math.sin(a) * 4
    const t = (d) => `${(x + Math.cos(a + d) * 5).toFixed(1)} ${(y + Math.sin(a + d) * 5).toFixed(1)}`
    seeds += `<path d="M${x0.toFixed(1)} ${y0.toFixed(1)}L${x.toFixed(1)} ${y.toFixed(1)}M${x.toFixed(1)} ${y.toFixed(1)}L${t(0.7)}M${x.toFixed(1)} ${y.toFixed(1)}L${t(-0.7)}M${x.toFixed(1)} ${y.toFixed(1)}L${t(0)}"/>`
  }
  const drift = [[104, 14, -0.5], [114, 30, -0.3], [98, 2, -0.8]]
    .map(([x, y, a]) => {
      const t = (d) => `${(x + Math.cos(a + d) * 5).toFixed(1)} ${(y + Math.sin(a + d) * 5).toFixed(1)}`
      const bx = x - Math.cos(a) * 8, by = y - Math.sin(a) * 8
      return `<path d="M${bx.toFixed(1)} ${by.toFixed(1)}L${x} ${y}L${t(0.7)}M${x} ${y}L${t(-0.7)}M${x} ${y}L${t(0)}"/>`
    })
    .join('')
  return `<svg viewBox="0 0 124 140" fill="none" stroke="currentColor" stroke-width="0.9" stroke-linecap="round" aria-hidden="true"><path d="M60 50C58 80 54 108 50 138"/><path d="M54 106C46 102 40 104 36 110C42 113 49 112 54 106Z"/><circle cx="60" cy="46" r="3.2"/>${seeds}${drift}</svg>`
}
const sprig = `<svg class="sprig" viewBox="0 0 180 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" aria-hidden="true"><path d="M2 12H66M114 12H178"/><path d="M90 3C94.5 8 94.5 16 90 21C85.5 16 85.5 8 90 3Z"/><path d="M76 12C79 8.5 84 8.5 87 12C84 15.5 79 15.5 76 12Z"/><path d="M93 12C96 8.5 101 8.5 104 12C101 15.5 96 15.5 93 12Z"/></svg>`

function monogram(root) {
  const src = asset('brand/monogram')
  if (src) return `<img class="monogram" src="${root}${src}" alt="" width="68" height="68">`
  return `<svg class="monogram" viewBox="0 0 68 68" aria-hidden="true"><circle cx="34" cy="34" r="32.5" fill="#FFFBF4" stroke="#D4A874" stroke-width="1.5"/><circle cx="34" cy="34" r="28.5" fill="none" stroke="#D4A874" stroke-width="0.6"/><text x="34" y="46" text-anchor="middle" font-family="'Alex Brush', cursive" font-size="38" fill="#C97C7C">L</text></svg>`
}

// An image slot. Shows the real image when it exists in assets/, otherwise a labelled placeholder.
function slot({ file, alt, wash = 'sage', ratio = 'r-45', arch = false, note = 'Mockup to be placed', root = '', eager = false }) {
  const src = file && asset(file)
  const cls = `slot wash-${wash} ${ratio}${arch ? ' arch' : ''} framed`
  if (src) return `<div class="${cls}"><img src="${root}${src}" alt="${esc(alt)}"${eager ? '' : ' loading="lazy"'}></div>`
  return `<div class="${cls}" role="img" aria-label="${esc(alt)}"><div class="ph">${dandelion()}<span class="ph-note">${esc(note)}</span></div></div>`
}

// ---------- Shared layout ----------
const NAV = [
  ['index.html', 'Home'],
  ['shop.html', 'Shop'],
  ['tailor-made.html', 'Tailor-Made'],
  ['about.html', 'About'],
  ['journal.html', 'Journal'],
  ['contact.html', 'Contact'],
]

function header(root, current) {
  return `<div class="announce"><div class="wrap">Instant digital downloads · Available worldwide</div></div>
<header class="site-header"><div class="wrap header-inner">
  <div class="header-bar">
    <a class="brand" href="${root}index.html" aria-label="Lymira Creations home">${monogram(root)}<span class="wordmark">Lymira Creations</span></a>
    <button class="menu-btn" type="button" aria-expanded="false" aria-controls="site-nav">Menu</button>
  </div>
  <nav class="site-nav" id="site-nav" aria-label="Main"><ul>
    ${NAV.map(([href, label]) => `<li><a href="${root}${href}"${href === current ? ' aria-current="page"' : ''}>${label}</a></li>`).join('\n    ')}
  </ul></nav>
</div></header>`
}

function footer(root) {
  return `<footer class="site-footer"><div class="wrap">
  <div class="footer-top">${monogram(root)}<p class="footer-tagline">Made to Reconnect</p>${sprig}</div>
  <div class="footer-cols">
    <div><h2>Shop</h2><ul>${categories.map((c) => `<li><a href="${root}shop.html#${c.id}">${esc(c.name)}</a></li>`).join('')}</ul></div>
    <div><h2>Studio</h2><ul><li><a href="${root}about.html">About</a></li><li><a href="${root}tailor-made.html">Tailor-made designs</a></li><li><a href="${root}journal.html">Journal</a></li><li><a ${ext(site.store)}>Payhip store</a></li></ul></div>
    <div><h2>Follow</h2><ul>${site.social.map((s) => `<li><a ${ext(s.url)}>${s.label}</a></li>`).join('')}</ul></div>
    <div><h2>Contact</h2><ul><li><a ${ext(site.whatsapp)}>WhatsApp</a></li><li><a href="mailto:${site.email}">${site.email.replace('@', '<wbr>@')}</a></li></ul></div>
  </div>
  <div class="footer-legal"><p>${esc(site.legal)}</p><p>© ${new Date().getFullYear()} Lymira Creations. All creations are digital. Nothing is shipped.</p></div>
</div></footer>`
}

function page({ file, title, description, body, root = '' }) {
  const url = `${site.domain}/${file === 'index.html' ? '' : file.replace(/\.html$/, '')}`
  const head = `<title>${esc(title)}</title>
<meta name="claude:viewport-fit-sides" content="cover">
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Lymira Creations">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FONTS}">
${PREVIEW ? `<style>${css}</style>` : `<link rel="stylesheet" href="${root}styles.css">`}`
  const content = `${header(root, file)}
<main>
${body}
</main>
${footer(root)}
${PREVIEW ? `<script>${js}</script>` : `<script src="${root}site.js" defer></script>`}`
  // The preview home page is published inside a host page that supplies its own <html>/<head>.
  const html =
    PREVIEW && file === 'index.html'
      ? `${head}\n${content}\n`
      : `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n${head}\n</head>\n<body>\n${content}\n</body>\n</html>\n`
  const dest = path.join(OUT, file)
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  fs.writeFileSync(dest, html)
  return { file, url }
}

// ---------- Components ----------
const priceLabel = (p) =>
  p.price
    ? `<p class="price">${p.price}</p>`
    : `<p class="price small">${p.comingSoon ? 'Coming soon' : p.whatsapp ? 'Price on request' : 'See price in store'}</p>`

function card(p, root = '') {
  const c = cat(p.category)
  return `<a class="card" href="${root}products/${p.slug}.html">
  <div style="position:relative">${p.comingSoon ? '<span class="badge">Coming soon</span>' : ''}${slot({ file: `products/${p.slug}`, alt: p.alt, wash: c.wash, root })}</div>
  <p class="card-meta">${esc(p.type)}</p>
  <h3>${esc(p.title)}</h3>
  <p class="card-line">${esc(p.line)}</p>
  ${priceLabel(p)}
</a>`
}

const sectionHead = (eyebrow, title, text = '') =>
  `<div class="section-head"><p class="eyebrow">${eyebrow}</p><h2>${title}</h2>${text ? `<p>${text}</p>` : ''}${sprig}</div>`

const reviewCards = () =>
  `<div class="reviews">${reviews
    .map((r) => `<figure class="review"><blockquote>“${esc(r.quote)}”</blockquote><figcaption><strong>${esc(r.name)}</strong> · ${esc(r.about)}</figcaption></figure>`)
    .join('')}</div>`

const ebook = (root, heading = 'h2') => `<div class="split" id="ebook">
  ${slot({ file: 'products/the-last-time-i-came-last', alt: 'The Last Time I Came Last ebook cover shown on a tablet', wash: 'lavender', arch: true, note: 'Ebook cover to be placed', root })}
  <div class="stack">
    <p class="eyebrow">A gift with every store purchase</p>
    <${heading}>The Last Time I Came Last</${heading}>
    <p>A short ebook with a 0 to 10 quiz, for anyone who has been last on their own list for too long. It arrives free with every purchase from the Lymira store.</p>
    <p class="muted">At the end you will find an invitation to a free 15-minute Reconnect Call, booked on WhatsApp. Tailor-made orders do not include the ebook.</p>
    <div class="btn-row"><a class="btn" href="${root}shop.html">Shop the Collection</a></div>
  </div>
</div>`

// ---------- Pages ----------
fs.rmSync(OUT, { recursive: true, force: true })
fs.mkdirSync(OUT, { recursive: true })
const built = []

// Home
{
  const heroImg = asset('brand/hero-banner')
  const hero = heroImg
    ? `<div class="slot r-banner"><img src="${heroImg}" alt="Watercolour scene of a girl walking a path with a dandelion and a bluebird, with the Lymira Creations wordmark"></div><h1 class="sr-only">Lymira Creations</h1>`
    : `<div class="slot wash-blue r-banner framed"><div class="ph">${dandelion()}<h1 class="hero-wordmark">Lymira Creations</h1><span class="ph-note">Hero banner artwork to be placed</span></div></div>`
  const featured = products.filter((p) => p.featured)
  const showcase = products.filter((p) => p.showcase)
  built.push(page({
    file: 'index.html',
    title: 'Lymira Creations | SEL Storybooks & Canva Invitations',
    description:
      'Lymira Creations is a digital products studio: self-care journals, feelings storybooks for kids, editable Canva invitations and cards, and wedding invitation websites. Instant digital download, available worldwide.',
    body: `<section class="hero"><div class="wrap">
  ${hero}
  <div class="hero-copy">
    <p class="eyebrow">A digital products studio</p>
    <p class="hero-tagline">Made to Reconnect</p>
    <p class="lede">${esc(site.subtagline)}</p>
    <a class="btn" href="shop.html">Shop the Collection</a>
  </div>
</div></section>

<section class="section band-paper"><div class="wrap intro">
  <p class="intro-quote">Journals, storybooks and invitations, crafted by a former teacher with 18 years in classrooms across three continents.</p>
  <div class="stack">
    <p class="eyebrow">The studio</p>
    <p>Lymira began with one self-care journal, Bloom Where You Are. Today the studio makes journals for your own quiet minutes, stories that help children name what they feel, and invitations for the days worth gathering for.</p>
    <p class="muted">Every creation is an instant digital download, available worldwide.</p>
    <a class="text-link" href="about.html">Read our story</a>
  </div>
</div></section>

<section class="section"><div class="wrap stack-lg">
  ${sectionHead('Four ways in', 'Find what you came for')}
  <div class="tiles">
    ${categories.map((c) => `<a class="tile" href="shop.html#${c.id}">${slot({ file: `brand/category-${c.id}`, alt: `${c.name} artwork`, wash: c.wash, arch: true, note: 'Artwork to be placed' })}<h3>${esc(c.name)}</h3><p>${esc(c.blurb)}</p></a>`).join('\n    ')}
  </div>
</div></section>

<section class="section band-sage"><div class="wrap stack-lg">
  ${sectionHead('From the studio', 'Featured creations')}
  <div class="grid four">${featured.map((p) => card(p)).join('\n')}</div>
  <div class="stack center"><a class="btn btn-ghost" href="shop.html">See every creation</a></div>
</div></section>

<section class="section"><div class="wrap stack-lg">
  ${sectionHead('Invitation websites', 'An invitation your guests open like a story', 'Mobile-first invitation websites with your details, countdown and RSVP in one link. Edit a ready-made Canva template yourself, or have yours tailor-made.')}
  <div class="phones">
    ${showcase.map((p) => `<a class="phone-item" href="products/${p.slug}.html"><div class="phone">${slot({ file: `websites/${p.slug}`, alt: p.alt, wash: p.showcase === 'Wedding' ? 'blue' : p.showcase === 'Christmas' ? 'sage' : 'rose', ratio: '', note: 'Screen to be placed' })}</div><p class="card-meta">${p.showcase}${p.comingSoon ? ' · Coming soon' : ''}</p><h3>${esc(p.title)}</h3></a>`).join('\n    ')}
  </div>
  <div class="stack center"><div class="btn-row"><a class="btn" href="shop.html#invitation-websites">Explore invitation websites</a><a class="btn btn-ghost" ${ext(wa('Hello Lymira Creations, I would like price details for a tailor-made invitation website.'))}>WhatsApp us for price details</a></div></div>
</div></section>

<section class="section band-blue"><div class="wrap stack-lg">
  ${sectionHead('Reviews', 'Kind words')}
  ${reviewCards()}
</div></section>

<section class="section"><div class="wrap">${ebook('')}</div></section>`,
  }))
}

// Shop
{
  const inCat = (id, group) => products.filter((p) => p.category === id && (!group || p.group === group))
  const head = (c, extra = '') => `<div class="cat-head"><p class="eyebrow">${esc(c.world || '')}</p><h2>${esc(c.name)}</h2><p>${esc(c.blurb)}</p>${extra}</div>`
  built.push(page({
    file: 'shop.html',
    title: 'Shop the Collection | Lymira Creations',
    description:
      'Printable feelings books for kids, a 30 day self-care journal, editable Canva invitations and cards, and wedding website templates. Instant digital download from Lymira Creations.',
    body: `<section class="page-head"><div class="wrap"><div class="section-head">
  <p class="eyebrow">Lymira Creations</p>
  <h1>Shop the Collection</h1>
  <p class="lede">Every creation is an instant digital download, available worldwide.</p>
  <div class="chips">${categories.map((c) => `<a class="chip" href="#${c.id}">${esc(c.name)}</a>`).join('')}</div>
</div></div></section>

<section class="section-tight" id="journals"><div class="wrap stack-lg">
  ${head(cat('journals'), '<p class="muted">Coming next: an anxiety journal.</p>')}
  <div class="grid">${inCat('journals').map((p) => card(p)).join('\n')}
  <a class="card" href="journal.html#ebook">${slot({ file: 'products/the-last-time-i-came-last', alt: 'The Last Time I Came Last ebook cover shown on a tablet', wash: 'lavender', note: 'Ebook cover to be placed' })}<p class="card-meta">Ebook · Gift with purchase</p><h3>The Last Time I Came Last</h3><p class="card-line">A short read with a 0 to 10 quiz.</p><p class="price small">Free with any store purchase</p></a></div>
</div></section>

<section class="section-tight band-sage" id="little-hearts"><div class="wrap stack-lg">
  ${head(cat('little-hearts'), '<p class="muted">Poppy the fox and Lumi the butterfly star in social-emotional learning stories for ages 3 to 8. Each story has its own activity book.</p>')}
  <div class="grid">${inCat('little-hearts').map((p) => card(p)).join('\n')}</div>
</div></section>

<section class="section-tight" id="becoming"><div class="wrap split">
  ${slot({ file: 'brand/category-becoming', alt: 'Becoming invitation bundle artwork', wash: 'rose', arch: true, note: 'Artwork to be placed' })}
  <div class="stack">
    <p class="eyebrow">A gift, not a listing</p>
    <h2>Becoming</h2>
    <p>An invitation bundle for healing, growth and new beginnings. Becoming is not sold in the store. It is our thank-you gift after a Reconnect Call.</p>
    <p class="muted">The Reconnect Call is a free 15-minute conversation, booked on WhatsApp.</p>
    <div class="btn-row"><a class="btn" ${ext(wa('Hello Lymira Creations, I would like to book a free 15-minute Reconnect Call.'))}>Book a Reconnect Call</a></div>
  </div>
</div></section>

<section class="section-tight band-blue" id="celebrations"><div class="wrap stack-lg">
  ${head(cat('celebrations'), '<p class="muted">Every template is fully editable with a free Canva account. Birthday invitations are coming soon.</p>')}
  <h3 class="sub-head" id="invitations-and-cards">Invitations and cards</h3>
  <div class="grid">${inCat('celebrations', 'cards').map((p) => card(p)).join('\n')}</div>
  <h3 class="sub-head" id="invitation-websites">Invitation websites</h3>
  <div class="grid">${inCat('celebrations', 'websites').map((p) => card(p)).join('\n')}</div>
  <div class="review" style="align-items:flex-start"><p class="eyebrow">Tailor-made designs</p><h3>Want something made only for you?</h3><p>Invitations, cards and invitation websites designed to order, in any style you like. From $10, with a first draft within 3 working days.</p><a class="text-link" href="tailor-made.html">How tailor-made works</a></div>
</div></section>`,
  }))
}

// Product pages
for (const p of products) {
  const c = cat(p.category)
  const root = '../'
  const buy = p.comingSoon
    ? `<a class="btn btn-ghost" ${ext(wa(`Hello Lymira Creations, please let me know when ${p.title} is available.`))}>Tell me when it is ready</a>`
    : p.whatsapp
      ? `<a class="btn" ${ext(wa(`Hello Lymira Creations, I would like price details for the ${p.title}.`))}>WhatsApp us for price details</a>`
      : `<a class="btn" ${ext(p.url || site.store)}>${p.price ? 'Buy now' : 'See price and buy'}</a>`
  const related = products.filter((x) => x.category === p.category && x.slug !== p.slug && (!p.group || x.group === p.group)).slice(0, 3)
  const details = []
  details.push(`<div class="detail"><h2>What you will receive</h2><ul class="ticks">${p.receive.map((r) => `<li>${esc(r)}</li>`).join('')}</ul></div>`)
  if (p.canva)
    details.push(`<div class="detail"><h2>What you can edit</h2><ul class="ticks"><li>Fully editable in Canva: change the wording and details to make it yours</li><li>A free Canva account is all you need. Every element is free, so Canva Pro is not required</li><li>After checkout, open your thank-you PDF and click the template link. Your own copy opens in Canva</li>${p.size ? `<li>Sized ${p.size}, made to send on WhatsApp or by text</li>` : ''}</ul></div>`)
  if (p.website)
    details.push(`<div class="detail"><h2>Good to know</h2><ul class="ticks"><li>Built in Canva and designed for phones first</li>${p.whatsapp ? '<li>Custom domains are not provided</li><li>RSVP forms and gift details stay in your own accounts</li>' : '<li>You publish the site from your own Canva account and share the link</li>'}</ul></div>`)
  if (p.poppy)
    details.push(`<div class="detail"><h2>For parents and teachers</h2><ul class="ticks"><li>Ages 3 to 5: read aloud together</li><li>Ages 6 to 8: early readers can read it themselves</li><li>Suited to Pre-K to Grade 2 classrooms</li><li>Schools: one purchase per teacher, who may print copies for their own class. Not for resale</li></ul></div>`)
  const extra = p.website
    ? `<div class="media-extra">${slot({ file: `products/${p.slug}-receive`, alt: `What you will receive with ${p.title}`, wash: c.wash, ratio: 'r-11', note: 'What you will receive', root })}${slot({ file: `products/${p.slug}-video`, alt: `Preview of ${p.title}`, wash: c.wash, ratio: 'r-11', note: 'Preview video', root })}</div>`
    : p.poppy
      ? `<div class="media-extra">${slot({ file: `products/${p.slug}-sample-1`, alt: `Sample page from ${p.title}`, wash: c.wash, ratio: 'r-11', note: 'Sample page', root })}${slot({ file: `products/${p.slug}-sample-2`, alt: `Second sample page from ${p.title}`, wash: c.wash, ratio: 'r-11', note: 'Sample page', root })}</div>`
      : ''
  built.push(page({
    file: `products/${p.slug}.html`,
    root,
    title: `${p.title} | Lymira Creations`,
    description: `${p.problem} ${p.line} Instant digital download from Lymira Creations.`,
    body: `<div class="wrap">
<nav class="crumbs" aria-label="Breadcrumb"><a href="${root}shop.html">Shop</a> / <a href="${root}shop.html#${c.id}">${esc(c.name)}</a></nav>
<article class="product">
  <div class="product-media"><div style="position:relative">${p.comingSoon ? '<span class="badge">Coming soon</span>' : ''}${slot({ file: `products/${p.slug}`, alt: p.alt, wash: c.wash, root, eager: true })}</div>${extra}</div>
  <div class="product-info">
    <p class="eyebrow">${esc(p.type)}</p>
    <h1>${esc(p.title)}</h1>
    ${p.subtitle ? `<p class="product-sub">${esc(p.subtitle)}</p>` : ''}
    ${p.price ? `<p class="product-price">${p.price}</p>` : p.priceNote ? `<p class="price small">${esc(p.priceNote)}</p>` : p.comingSoon ? '<p class="price small">Coming soon</p>' : ''}
    <p class="problem">${esc(p.problem)}</p>
    ${p.body.map((b) => `<p>${esc(b)}</p>`).join('\n    ')}
    <div class="btn-row">${buy}</div>
    <p class="assure">${p.whatsapp ? '<span>Tailor-made</span><span>Available worldwide</span>' : '<span>Instant digital download</span><span>Available worldwide</span><span>Secure checkout on Payhip</span>'}</p>
    ${details.join('\n    ')}
  </div>
</article>
</div>
${related.length ? `<section class="section band-paper"><div class="wrap stack-lg">${sectionHead(esc(c.name), 'You may also like')}<div class="grid">${related.map((x) => card(x, root)).join('\n')}</div></div></section>` : ''}`,
  }))
}

// Tailor-made
built.push(page({
  file: 'tailor-made.html',
  title: 'Tailor-Made Invitations & Wedding Websites | Lymira Creations',
  description:
    'Custom invitations, cards and wedding invitation websites designed to order by Lymira Creations. From $10, first draft within 3 working days. Order on WhatsApp.',
  body: `<section class="page-head"><div class="wrap"><div class="section-head">
  <p class="eyebrow">Tailor-made designs</p>
  <h1>Designed to order, in any style you like</h1>
  <p class="lede">Invitations, cards and invitation websites made for one occasion: yours. You are not limited to the Lymira styles.</p>
  <a class="btn" ${ext(wa('Hello Lymira Creations, I would like to order a tailor-made design.'))}>Start your order on WhatsApp</a>
</div></div></section>

<section class="section band-paper"><div class="wrap stack-lg">
  ${sectionHead('How it works', 'Three steps to your design')}
  <div class="steps">
    <div class="step"><h3>Tell us about the occasion</h3><p>Message us on WhatsApp and we will send a short order form for your details, wording and style.</p></div>
    <div class="step"><h3>Receive your first draft</h3><p>Invitations and cards arrive within 3 working days. Invitation websites take about 5 working days.</p></div>
    <div class="step"><h3>Refine it together</h3><p>Two rounds of revisions are included, so the final design reads exactly as you want it.</p></div>
  </div>
</div></section>

<section class="section"><div class="wrap two-col">
  <div class="stack">
    <table class="rates"><caption>Invitations and cards</caption><tbody>
      <tr><th scope="row">Tailor-made invitation or card</th><td>from $10</td></tr>
      <tr><th scope="row">Extra page</th><td>+$5</td></tr>
      <tr><th scope="row">Extra photo, QR code, map or size, each</th><td>+$2</td></tr>
      <tr><th scope="row">Extra revision round</th><td>+$2</td></tr>
    </tbody></table>
    <p class="muted">Tailor-made storybooks for schools are priced on request.</p>
  </div>
  <div class="stack">
    <p class="eyebrow">Invitation websites</p>
    <h2>Wedding and bridal party ranges</h2>
    <p>The wedding range covers engagements, save the dates and weddings. The bridal party range covers bachelorettes and similar gatherings. Multi-event weddings are quoted per event.</p>
    <ul class="ticks"><li>Your site stays live until the day of the event</li><li>Custom domains are not provided</li><li>RSVP forms and gift details stay in your own accounts</li></ul>
    <a class="text-link" ${ext(wa('Hello Lymira Creations, I would like price details for a tailor-made invitation website.'))}>WhatsApp us for price details</a>
  </div>
</div></section>

<section class="section band-blue"><div class="wrap stack-lg">
  ${sectionHead('Reviews', 'From a wedding couple')}
  <div class="reviews" style="grid-template-columns:minmax(0,1fr);max-width:44rem;margin-inline:auto">${reviews.slice(0, 1).map((r) => `<figure class="review"><blockquote>“${esc(r.quote)}”</blockquote><figcaption><strong>${esc(r.name)}</strong> · ${esc(r.about)}</figcaption></figure>`).join('')}</div>
  <p class="muted" style="text-align:center">Prefer to order through Fiverr? Find <a ${ext(site.fiverr.invitations)}>custom invitations and invitation websites</a> and <a ${ext(site.fiverr.storybooks)}>storybooks and activity books for kids</a> there.</p>
</div></section>`,
}))

// About
built.push(page({
  file: 'about.html',
  title: 'About | Lymira Creations',
  description:
    'The story behind Lymira Creations: a digital products studio founded by a former teacher with 18 years in classrooms across three continents.',
  body: `<section class="page-head"><div class="wrap"><div class="section-head">
  <p class="eyebrow">Our story</p>
  <h1>“For years I said ‘I’m done.’ Then life finally listened.”</h1>
</div></div></section>

<section class="section-tight"><div class="wrap split flip">
  ${slot({ file: 'brand/about-artwork', alt: 'Made to Reconnect watercolour brand artwork', wash: 'sage', arch: true, note: 'Made to Reconnect artwork' })}
  <div class="stack">
    <p class="lede">I spent 18 years in classrooms across three continents, including work with children with special educational needs. That experience sits behind every Poppy story.</p>
    <p>Lymira began with a single creation: Bloom Where You Are, a 30-day self-care journal. The storybooks, cards, invitations and invitation websites grew from there.</p>
    <p>I art-direct every illustration using AI image tools, then design and assemble each product myself in Canva. Nothing leaves the studio until it looks and reads the way it should.</p>
    <p class="script" style="font-size:2.4rem;color:var(--rose-deep)">Yurika</p>
    <p class="eyebrow">Founder, Lymira Creations</p>
  </div>
</div></section>

<section class="section band-paper"><div class="wrap stack-lg">
  ${sectionHead('Made to Reconnect', 'Three ways to reconnect')}
  <div class="steps" style="counter-reset:none">
    <a class="tile" href="shop.html#journals"><h3>With yourself</h3><p>Self-care journals and a free ebook for the quiet minutes you keep for you.</p></a>
    <a class="tile" href="shop.html#little-hearts"><h3>With your child</h3><p>The Poppy series: stories and activities that help children name big feelings.</p></a>
    <a class="tile" href="shop.html#celebrations"><h3>With loved ones</h3><p>Invitations, cards and invitation websites for the days worth gathering for.</p></a>
  </div>
  <div class="stack center"><a class="btn" href="shop.html">Shop the Collection</a></div>
</div></section>`,
}))

// Journal
built.push(page({
  file: 'journal.html',
  title: 'Journal | Lymira Creations',
  description: 'Stories, reflections and news from the Lymira Creations studio, including the free ebook The Last Time I Came Last.',
  body: `<section class="page-head"><div class="wrap"><div class="section-head">
  <p class="eyebrow">Journal</p>
  <h1>Stories and reflections</h1>
  <p class="lede">A short read to begin with, and news of what is on the desk.</p>
</div></div></section>

<section class="section-tight"><div class="wrap">${ebook('')}</div></section>

<section class="section band-lavender"><div class="wrap stack-lg">
  ${sectionHead('On the desk', 'Coming next from the studio')}
  <div class="steps" style="counter-reset:none">
    <div class="stack"><p class="eyebrow">Journals</p><h3>An anxiety journal</h3><p>The next journal after Bloom Where You Are, with more self-care themes to follow.</p></div>
    <div class="stack"><p class="eyebrow">Celebrations</p><h3>Birthday invitations</h3><p>Editable Canva invitations for birthdays, in the 3D Pop style.</p></div>
    <div class="stack"><p class="eyebrow">Invitation websites</p><h3>Cherry On Top</h3><p>A bachelorette high tea website set in a Paris café, in pink gingham and cherries.</p></div>
  </div>
</div></section>

<section class="section"><div class="wrap narrow stack center">
  <p class="eyebrow">More to read</p>
  <h2>Her Soul Remembered</h2>
  <p>Longer stories are shared on our Facebook page, Her Soul Remembered.</p>
  <a class="btn btn-ghost" ${ext('https://facebook.com/LymiraCreations')}>Read on Facebook</a>
</div></section>`,
}))

// Contact
built.push(page({
  file: 'contact.html',
  title: 'Contact | Lymira Creations',
  description: 'Contact Lymira Creations on WhatsApp or by email for orders, tailor-made designs and enquiries.',
  body: `<section class="page-head"><div class="wrap"><div class="section-head">
  <p class="eyebrow">Contact</p>
  <h1>We would love to hear from you</h1>
  <p class="lede">For orders, tailor-made designs, a Reconnect Call or a question about any creation.</p>
</div></div></section>

<section class="section-tight"><div class="wrap narrow" style="max-width:56rem"><div class="contact-cards">
  <div class="contact-card"><p class="eyebrow">WhatsApp</p><p class="value">+971 50 179 9508</p><p class="muted">The quickest way to reach us, and where tailor-made orders begin.</p><a class="btn" ${ext(site.whatsapp)}>Message us on WhatsApp</a></div>
  <div class="contact-card"><p class="eyebrow">Email</p><p class="value">${site.email}</p><p class="muted">For anything that needs a longer note.</p><a class="btn btn-ghost" href="mailto:${site.email}">Write an email</a></div>
</div></div></section>

<section class="section"><div class="wrap narrow stack center">
  ${sprig}
  <h2>Follow the studio</h2>
  <div class="chips">${site.social.map((s) => `<a class="chip" ${ext(s.url)}>${s.label}</a>`).join('')}<a class="chip" ${ext(site.store)}>Payhip store</a></div>
</div></section>`,
}))

// ---------- Static files ----------
if (fs.existsSync(path.join(here, 'assets'))) fs.cpSync(path.join(here, 'assets'), path.join(OUT, 'assets'), { recursive: true })
if (!PREVIEW) {
  fs.writeFileSync(path.join(OUT, 'styles.css'), css)
  fs.writeFileSync(path.join(OUT, 'site.js'), js)
  fs.writeFileSync(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${site.domain}/sitemap.xml\n`)
  fs.writeFileSync(
    path.join(OUT, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${built.map((b) => `  <url><loc>${b.url}</loc></url>`).join('\n')}\n</urlset>\n`,
  )
}
console.log(`Built ${built.length} pages into ${path.relative(here, OUT)}/`)
