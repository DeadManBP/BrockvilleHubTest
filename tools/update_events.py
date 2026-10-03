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
    feed = {"source": "https://brockvilletourism.com/shows-and-events/", "updated_at": now.isoformat(), "count": len(events), "events": events}
    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(feed, f, ensure_ascii=False, indent=1)
    print(f"wrote {args.out}: {len(events)} upcoming events")

if __name__ == "__main__":
    main()
