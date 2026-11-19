# PrintableSprout site plan

**Audience:** US parents and teachers of kids aged 2 to 12. Content is written for the adult (keeps ads normal, not child-directed).
**Promise:** original printables that print right on US Letter and A4, can be colored online, and can carry the child's name.

## Categories (menu)
| Category | URL | What goes here |
|---|---|---|
| Coloring Pages | /category/coloring-pages/ | Animals, seasons, nature, vehicles, space |
| Holiday Printables | /category/holiday-printables/ | Holiday crafts, countdowns, cards, wish lists |
| Chore and Reward Charts | /category/chore-reward-charts/ | Chore, reward, reading, potty, screen time charts |
| Daily Routines | /category/daily-routines/ | Morning, bedtime, after school, visual schedules |
| Activities | /category/activities-games/ | Mazes, bingo, scavenger hunts, placemats, tracing |
| For Parents | /category/for-parents/ | Planners, checklists, lunchbox notes |

Header menu: Coloring Pages, Charts and Routines (dropdown), Activities, Holidays (dropdown of occasions), For Parents, Search.

## URL structure
- Printable: `/<slug>/` (flat, short, keyword first)
- Category: `/category/<slug>/`, pages 2+ at `/category/<slug>/2/` (noindex)
- Holiday hub: `/holiday/<occasion>/` (thanksgiving, christmas, winter, new-year, valentines-day, st-patricks-day, easter, earth-day, mothers-day, fathers-day, back-to-school, halloween)
- Author: `/author/santaji-gadepatil/`
- Trust pages: `/about/`, `/editorial-policy/`, `/corrections-policy/`, `/contact/`, `/privacy-policy/`, `/terms-of-use/`, `/disclaimer/`
- Files: `/pdf/<slug>-letter.pdf`, `/pdf/<slug>-a4.pdf`, `/images/<slug>.png`, `/og/<slug>.png`

## Page types
1. **Printable page (layout A):** title, byline, coloring tool (controls left, sheet right), blank PDFs, quick facts, guide text (500 to 900 words), FAQ, author box, related printables.
2. **Home (layout A):** seasonal banner, search, category tiles, new this week, upcoming holiday promo, trust strip.
3. **Category and holiday hubs:** grid of printables.

## Schema
Article (with Person author), BreadcrumbList, FAQPage only where the page shows a FAQ, WebSite with SearchAction, Organization, ProfilePage on the author page.

## Topic queue
90 ideas in `TOPIC_QUEUE.md`, ordered by season (Thanksgiving, Christmas, winter, New Year, Valentine's, spring, Easter, Earth Day, Mother's Day, summer, back to school, fall, Halloween) with evergreen charts and coloring pages mixed in.
