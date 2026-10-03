#!/usr/bin/env python3
"""Update Brockville Hub events.json from Brockville Tourism (WP Event Manager).
Fetches event listings from the Tourism WordPress REST API, reads the
schema.org Event JSON-LD on each event page for start/end/location, drops
past events, sorts by start, and writes a small JSON feed the app reads.
Run by .github/workflows/update-events.yml every 6 hours. Free, no keys.
"""
import argparse, datetime, html as htmlmod, json, re, sys, urllib.request
try:
    from zoneinfo import ZoneInfo
    TZ = ZoneInfo("America/Toronto")
except Exception:
    TZ = datetime.timezone.utc

API = "https://brockvilletourism.com/wp-json/wp/v2/event_listing?per_page=50&orderby=date&order=desc&_fields=id,link,title,slug"

def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": "BrockvilleHubEventUpdater/1.0 (+https://github.com/DeadManBP/BrockvilleHubTest)"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8", "ignore")

def parse_event_page(page_html):
    for m in re.finditer(r'<script type="application/ld\+json"[^>]*>(.*?)</script>', page_html, re.S):
        try:
            d = json.loads(m.group(1))
        except Exception:
            continue
        if isinstance(d, dict) and d.get("@type") == "Event":
            loc = d.get("Location") or {}
            location = ""
            if isinstance(loc, dict):
                location = loc.get("name") or loc.get("address") or ""
            return {"name": (d.get("name") or "").strip(), "start": d.get("startDate", ""), "end": d.get("endDate", ""), "location": location}
    return None

CITY_ANNOUNCEMENTS = "https://brockville.com/announcements/"

def clean_text(x):
    x = re.sub(r"<[^>]+>", " ", x or "")
    x = htmlmod.unescape(x)
    return re.sub(r"\s+", " ", x).strip()

def fetch_notices(pages=2, limit=12):
    """Scrape the City of Brockville announcements listing pages."""
    out, seen = [], set()
    for pg in range(1, pages + 1):
        url = CITY_ANNOUNCEMENTS if pg == 1 else CITY_ANNOUNCEMENTS + f"page/{pg}/"
        page = get(url)
        for m in re.finditer(r'<a href="(https://brockville\.com/announcement/[^"]+/)"><div class="announcements">(.*?)</a>', page, re.S):
            link, block = m.group(1), m.group(2)
            if link in seen:
                continue
            seen.add(link)
            tm = re.search(r'<h2 class="announcementstitle">(.*?)</h2>', block, re.S)
            dm = re.search(r'([A-Za-z]+ \d{1,2}, \d{4})', block)
            em = re.search(r'<div class="announcementsexcerpt"><p>(.*?)</p>', block, re.S)
            title = clean_text(tm.group(1)) if tm else ""
            if not title:
                continue
            date_iso = ""
            if dm:
                try:
                    date_iso = datetime.datetime.strptime(dm.group(1), "%B %d, %Y").date().isoformat()
                except Exception:
                    date_iso = ""
            excerpt = clean_text(em.group(1)) if em else ""
            if len(excerpt) > 180:
                excerpt = excerpt[:177].rstrip() + "..."
            out.append({"title": title, "date": date_iso, "url": link, "excerpt": excerpt})
    out.sort(key=lambda x: x["date"], reverse=True)
    return out[:limit]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default="events.json")
    args = ap.parse_args()
    now = datetime.datetime.now(TZ)
    items = json.loads(get(API))
    events = []
    seen = set()
    for it in items:
        url = it.get("link", "")
        if not url or url in seen:
            continue
        seen.add(url)
        try:
            ev = parse_event_page(get(url))
        except Exception as e:
            print(f"skip {it.get('slug')}: {e}", file=sys.stderr)
            continue
        if not ev or not ev["start"]:
            continue
        try:
            start = datetime.datetime.strptime(ev["start"], "%Y-%m-%d %H:%M:%S").replace(tzinfo=TZ)
            end = datetime.datetime.strptime(ev["end"], "%Y-%m-%d %H:%M:%S").replace(tzinfo=TZ) if ev["end"] else start
        except Exception:
            continue
        if end < now - datetime.timedelta(hours=3):
            continue
        title = htmlmod.unescape(re.sub("<[^>]+>", "", (it.get("title") or {}).get("rendered", ""))).strip() or ev["name"]
        events.append({"title": title, "url": url, "start": ev["start"], "end": ev["end"], "location": ev["location"]})
    events.sort(key=lambda x: x["start"])
    events = events[:20]
    try:
        notices = fetch_notices()
        print(f"fetched {len(notices)} city notices")
    except Exception as e:
        print(f"notices fetch failed: {e}", file=sys.stderr)
        notices = []
    feed = {"source": "https://brockvilletourism.com/shows-and-events/", "updated_at": now.isoformat(), "count": len(events), "events": events, "notices_source": CITY_ANNOUNCEMENTS, "notices_count": len(notices), "notices": notices}
    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(feed, f, ensure_ascii=False, indent=1)
    print(f"wrote {args.out}: {len(events)} upcoming events")

if __name__ == "__main__":
    main()
