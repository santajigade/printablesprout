export const SITE = {
  name: 'PrintableSprout',
  tagline: 'Color, play, read and learn: free fun for kids',
  url: 'https://printablesprout.com',
  email: 'contact@printablesprout.com',
  // Paste the AdSense publisher id (ca-pub-XXXX) to turn on ads site wide
  adsenseClient: '',
  // Paste the GA4 Measurement ID (G-XXXXXXXXXX) to turn on analytics site wide
  ga4Id: 'G-Z900QRHXNK',
};

// Official social profiles (footer icons and Organization sameAs)
export const SOCIAL = [
  { key: 'pinterest', name: 'Pinterest', url: 'https://www.pinterest.com/printablesprout/' },
  { key: 'facebook', name: 'Facebook', url: 'https://www.facebook.com/printablesprout' },
  { key: 'instagram', name: 'Instagram', url: 'https://www.instagram.com/printablesprout/' },
  { key: 'linkedin', name: 'LinkedIn', url: 'https://www.linkedin.com/company/printablesprout/' },
];

export const AUTHOR = {
  name: 'Santaji Gadepatil',
  slug: 'santaji-gadepatil',
  role: 'Founder and designer',
  bio: 'Santaji Gadepatil is an Electronics and Telecommunication engineer from Pune, India, with years of experience in technical content and digital marketing. He designs and tests every printable on PrintableSprout so parents and teachers get clean, ink-friendly pages that print right the first time.',
  linkedin: 'https://www.linkedin.com/in/santaji-gadepatil6680/',
};

export const CATEGORIES = [
  { name: 'Coloring Pages', slug: 'coloring-pages', sub: 'Animals, seasons and holidays', bg: '#fde8d8' },
  { name: 'Holiday Printables', slug: 'holiday-printables', sub: 'Thanksgiving to Halloween', bg: '#fbe3e8' },
  { name: 'Chore and Reward Charts', slug: 'chore-reward-charts', sub: 'Add names, chores and goals', bg: '#e3f1ef' },
  { name: 'Daily Routines', slug: 'daily-routines', sub: 'Morning and bedtime charts', bg: '#e7e3f6' },
  { name: 'Activities', title: 'Free Printable Activities for Kids', slug: 'activities-games', sub: 'Mazes, placemats and bingo', bg: '#fdf1cf' },
  { name: 'For Parents', slug: 'for-parents', sub: 'Planners and checklists', bg: '#e6eef8' },
] as const;

// Occasions drive the seasonal banner and the /holiday/ hub pages.
// `next` = the next date of the occasion (update yearly, the daily run checks this).
export const OCCASIONS = [
  { name: 'Thanksgiving', slug: 'thanksgiving', next: '2026-11-26', label: 'Thanksgiving is Thursday, November 26' },
  { name: 'Christmas', slug: 'christmas', next: '2026-12-25', label: 'Christmas is Friday, December 25' },
  { name: 'Winter', slug: 'winter', next: '2026-12-21', label: 'Winter break activities' },
  { name: 'New Year', slug: 'new-year', next: '2027-01-01', label: 'New Year is Friday, January 1' },
  { name: "Valentine's Day", slug: 'valentines-day', next: '2027-02-14', label: "Valentine's Day is Sunday, February 14" },
  { name: "St. Patrick's Day", slug: 'st-patricks-day', next: '2027-03-17', label: "St. Patrick's Day is Wednesday, March 17" },
  { name: 'Easter', slug: 'easter', next: '2027-03-28', label: 'Easter is Sunday, March 28' },
  { name: 'Earth Day', slug: 'earth-day', next: '2027-04-22', label: 'Earth Day is Thursday, April 22' },
  { name: "Mother's Day", slug: 'mothers-day', next: '2027-05-09', label: "Mother's Day is Sunday, May 9" },
  { name: "Father's Day", slug: 'fathers-day', next: '2027-06-20', label: "Father's Day is Sunday, June 20" },
  { name: 'Back to School', slug: 'back-to-school', next: '2027-08-16', label: 'Back to school' },
  { name: 'Halloween', slug: 'halloween', next: '2027-10-31', label: 'Halloween is Sunday, October 31' },
] as const;

export const NAV = [
  { label: 'Coloring Pages', href: '/category/coloring-pages/' },
  { label: 'Charts and Routines', href: '/category/chore-reward-charts/', children: ['chore-reward-charts', 'daily-routines'] },
  { label: 'Activities', href: '/category/activities-games/' },
  { label: 'Games', href: '/games/' },
  { label: 'Stories', href: '/stories/' },
  { label: 'Holidays', href: '/category/holiday-printables/', occasions: true },
  { label: 'For Parents', href: '/category/for-parents/' },
];

export const CATEGORY_NAMES = CATEGORIES.map((c) => c.name) as unknown as [string, ...string[]];
export const OCCASION_SLUGS = OCCASIONS.map((o) => o.slug) as unknown as [string, ...string[]];
export const catByName = (n: string) => CATEGORIES.find((c) => c.name === n)!;
export const catBySlug = (s: string) => CATEGORIES.find((c) => c.slug === s);
export const occBySlug = (s: string) => OCCASIONS.find((o) => o.slug === s);
export const PER_PAGE = 24;

/** The nearest occasion still ahead (within 60 days of the build), for the banner. */
export function upcomingOccasion(now = new Date()) {
  const day = 86400000;
  return OCCASIONS
    .map((o) => ({ ...o, days: Math.ceil((Date.parse(o.next + 'T23:59:59Z') - now.valueOf()) / day) }))
    .filter((o) => o.days >= 0 && o.days <= 60)
    .sort((a, b) => a.days - b.days)[0];
}

export const fmtDate = (d: Date) =>
  d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'America/New_York' });
