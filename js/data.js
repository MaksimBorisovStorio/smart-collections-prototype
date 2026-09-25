/* Mocked Smart Collections.
   Covers are temporary placeholders (Unsplash, stored locally per the "no
   external CDN" constraint) — swap `cover` for the real photo later.
   `group` decides which of the two top sections a collection appears in;
   "All Smart Collections" lists every entry, newest `year` first, and the year
   pills jump to a group rather than filtering the list.
   `interactive: true` is the only collection you can open — the rest are
   display-only for now, so they render as plain tiles with no tap target. */
const Collections = [
  // ── Travels (long trips) ──
  // `days` drives the album page's date-grouped grid. Counts mirror the Figma
  // mock's 3 / 7 / 11 grouping; tiles are grey placeholders until real photos land.
  { id: 'florence',  group: 'travels', title: 'Florence, Italy',    dates: '12 - 21 July, 2026',    year: 2026, photos: 645, cover: 'assets/photos/photo-2.png',        interactive: true,
    days: [
      { date: '12 July 2026', count: 3 },
      { date: '13 July 2026', count: 7 },
      { date: '14 July 2026', count: 11 }
    ] },
  { id: 'lisbon',    group: 'travels', title: 'Lisbon, Portugal',   dates: '5 - 14 May, 2026',      year: 2026, photos: 412, cover: 'assets/photos/cover-lisbon.jpg' },
  { id: 'istanbul',  group: 'travels', title: 'Istanbul, Turkey',   dates: '3 - 12 July, 2025',     year: 2025, photos: 538, cover: 'assets/photos/cover-istanbul.jpg' },
  { id: 'santorini', group: 'travels', title: 'Santorini, Greece',  dates: '18 - 27 August, 2024',  year: 2024, photos: 287, cover: 'assets/photos/cover-santorini.jpg' },
  { id: 'kyoto',     group: 'travels', title: 'Kyoto, Japan',       dates: '2 - 13 April, 2023',    year: 2023, photos: 731, cover: 'assets/photos/cover-kyoto.jpg' },
  { id: 'barcelona', group: 'travels', title: 'Barcelona, Spain',   dates: '9 - 16 June, 2022',     year: 2022, photos: 194, cover: 'assets/photos/cover-barcelona.jpg' },

  // ── Short trips and occasions ──
  { id: 'london',    group: 'short', title: 'One day in London',      dates: '12 August, 2026',    year: 2026, photos: 84,  cover: 'assets/photos/cover-london.jpg' },
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
Collections.years = [2026, 2025, 2024, 2023, 2022, 2021];

window.Collections = Collections;
