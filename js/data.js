/* Mocked Smart Collections.
   Covers are temporary placeholders (Unsplash, stored locally per the "no
   external CDN" constraint) — swap `cover` for the real photo later.
   `group` decides which of the two top sections a collection appears in;
   "All Smart Collections" lists every entry, newest `year` first, and the year
   pills jump to a group rather than filtering the list.
   Only `interactive: true` collections (Canada, Berlin) can be opened; they
   carry real photos from js/photos.js. The rest are
   display-only for now, so they render as plain tiles with no tap target. */
const Collections = [
  // ── Travels (long trips) ──
  // `days` drives the album page's date-grouped grid: [{ date, photos: [paths] }].
  { id: 'canada',    group: 'travels', title: 'Canada',             dates: '5 - 14 July, 2025',     year: 2025, photos: 317, cover: 'assets/photos/cover-canada.jpg',    interactive: true,
    days: AlbumPhotos.canada },
  { id: 'lisbon',    group: 'travels', title: 'Lisbon, Portugal',   dates: '5 - 14 May, 2026',      year: 2026, photos: 412, cover: 'assets/photos/cover-lisbon.jpg' },
  { id: 'istanbul',  group: 'travels', title: 'Istanbul, Turkey',   dates: '3 - 12 July, 2025',     year: 2025, photos: 538, cover: 'assets/photos/cover-istanbul.jpg' },
  { id: 'santorini', group: 'travels', title: 'Santorini, Greece',  dates: '18 - 27 August, 2024',  year: 2024, photos: 287, cover: 'assets/photos/cover-santorini.jpg' },
  { id: 'kyoto',     group: 'travels', title: 'Kyoto, Japan',       dates: '2 - 13 April, 2023',    year: 2023, photos: 731, cover: 'assets/photos/cover-kyoto.jpg' },
  { id: 'barcelona', group: 'travels', title: 'Barcelona, Spain',   dates: '9 - 16 June, 2022',     year: 2022, photos: 194, cover: 'assets/photos/cover-barcelona.jpg' },

  // ── Short trips and occasions ──
  { id: 'berlin',    group: 'short', title: 'Trip to Berlin',         dates: '11 - 19 April, 2026', year: 2026, photos: 96,  cover: 'assets/photos/cover-berlin.jpg', interactive: true,
    days: AlbumPhotos.berlin },
  { id: 'paris',     group: 'short', title: 'Weekend in Paris',       dates: '11 July, 2026',      year: 2026, photos: 132, cover: 'assets/photos/cover-paris.jpg' },
  { id: 'brighton',  group: 'short', title: 'Sunday in Brighton',     dates: '3 May, 2026',        year: 2026, photos: 57,  cover: 'assets/photos/cover-brighton.jpg' },
  { id: 'borough',   group: 'short', title: 'Evening at the market',  dates: '21 July, 2025',      year: 2025, photos: 41,  cover: 'assets/photos/cover-borough.jpg' },
  { id: 'amsterdam', group: 'short', title: 'Amsterdam city break',   dates: '28 September, 2025', year: 2025, photos: 168, cover: 'assets/photos/cover-amsterdam.jpg' },
  { id: 'birthday',  group: 'short', title: 'Birthday at home',       dates: '14 February, 2024',  year: 2024, photos: 96,  cover: 'assets/photos/cover-birthday.jpg' },
  { id: 'cotswolds', group: 'short', title: 'Autumn in the Cotswolds', dates: '19 October, 2023',  year: 2023, photos: 73,  cover: 'assets/photos/cover-cotswolds.jpg' },
  { id: 'edinburgh', group: 'short', title: 'New Year in Edinburgh',  dates: '31 December, 2021',  year: 2021, photos: 205, cover: 'assets/photos/cover-edinburgh.jpg' }
];

Collections.byId = id => Collections.find(c => c.id === id);
Collections.byGroup = group => Collections.filter(c => c.group === group);
// Selection ids are "<collectionId>:<dayIndex>-<photoIndex>" (see collection-detail).
Collections.photoPath = id => {
  const [cid, pos] = id.split(':');
  const [day, idx] = pos.split('-').map(Number);
  const c = Collections.byId(cid);
  return c && c.days && c.days[day] && c.days[day].photos ? c.days[day].photos[idx] : null;
};

// Selected photos as paths, oldest first. Days carry "5 July 2025"-style dates
// and photos within a day are already in capture order.
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const dayKey = date => { const [d, m, y] = date.split(' '); return (+y) * 10000 + (MONTHS.indexOf(m) + 1) * 100 + (+d); };
Collections.chronological = ids => ids
  .map(id => {
    const [cid, pos] = id.split(':');
    const [day, idx] = pos.split('-').map(Number);
    const c = Collections.byId(cid);
    return { src: Collections.photoPath(id), key: dayKey(c.days[day].date), idx };
  })
  .filter(p => p.src)
  .sort((a, b) => a.key - b.key || a.idx - b.idx)
  .map(p => p.src);
Collections.years = [2026, 2025, 2024, 2023, 2022, 2021];

window.Collections = Collections;

/* Photo book products, shared by Book options and the product page.
   Only Landscape has designs; Square / Portrait reuse these with the
   orientation name swapped in for `{o}`. */
const Books = {
  orientations: { landscape: 'Landscape', square: 'Square', portrait: 'Portrait' },
  products: [
    { id: 'hardcover', name: 'Large {o} Hardcover',         price: '£43.99', img: 'assets/photos/book-landscape-hardcover.jpg',
      hero: 'assets/photos/pdp-landscape-hardcover.jpg', size: '28 x 21cm (~A4)', pages: 'From 24 to 120 pages' },
    { id: 'layflat',   name: 'Large {o} Hardcover Layflat', price: '£57.19', img: 'assets/photos/book-landscape-layflat.jpg',
      hero: 'assets/photos/pdp-landscape-hardcover.jpg', size: '28 x 21cm (~A4)', pages: 'From 24 to 120 pages' }
  ],
  label(o) { return this.orientations[o] || this.orientations.landscape; },
  product(id) { return this.products.find(p => p.id === id) || this.products[0]; },
  nameOf(p, o) { return p.name.replace('{o}', this.label(o)); }
};

window.Books = Books;

/* Editor photo slots. Empty string = grey placeholder. Drop images into
   assets/photos/book/ and put their paths here to fill the pages. */
const EditorPhotos = {
  cover: '',        // front cover image
  insideCover: ''   // page 1, opposite the inside cover
};

window.EditorPhotos = EditorPhotos;
