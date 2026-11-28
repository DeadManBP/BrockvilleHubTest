#!/usr/bin/env python3
"""Update Brockville Hub events.json from Brockville Tourism and City notices.

The primary source is the Tourism WordPress REST API. If that endpoint is
unavailable or stops returning JSON, discover event links from the public
Shows & Events page and read each event page instead. Never publish an empty
events list over a previously working feed.
"""
import argparse
import datetime
import html as htmlmod
import json
import re
import sys
import time
import urllib.error
import urllib.request
from html.parser import HTMLParser

try:
    from zoneinfo import ZoneInfo
    TZ = ZoneInfo("America/Toronto")
except Exception:
    TZ = datetime.timezone.utc

API = "https://brockvilletourism.com/wp-json/wp/v2/event_listing?per_page=50&orderby=date&order=desc&_fields=id,link,title,slug"
EVENTS_PAGE = "https://brockvilletourism.com/shows-and-events/"
CITY_ANNOUNCEMENTS = "https://brockville.com/announcements/"
USER_AGENT = "BrockvilleHubEventUpdater/2.0 (+https://github.com/DeadManBP/BrockvilleHubTest)"


def get(url, attempts=3):
    """Fetch a URL with retries and useful errors instead of parsing error pages."""
    last_error = None
    for attempt in range(attempts):
        try:
            req = urllib.request.Request(
                url,
                headers={
                    "User-Agent": USER_AGENT,
                    "Accept": "application/json,text/html,application/xhtml+xml,*/*;q=0.8",
                },
            )
            with urllib.request.urlopen(req, timeout=30) as response:
                status = getattr(response, "status", 200)
                body = response.read().decode("utf-8", "replace")
                content_type = response.headers.get("Content-Type", "")
            if status < 200 or status >= 300:
                raise RuntimeError(f"HTTP {status} from {url}")
            if not body.strip():
                raise RuntimeError(f"Empty response from {url} (HTTP {status})")
            return body, content_type
        except Exception as exc:
            last_error = exc
            if attempt + 1 < attempts:
                time.sleep(2 ** attempt)
    raise RuntimeError(f"Could not fetch {url} after {attempts} attempts: {last_error}")


def clean_text(value):
    value = re.sub(r"<[^>]+>", " ", value or "")
    value = htmlmod.unescape(value)
    return re.sub(r"\s+", " ", value).strip()


def parse_datetime(value):
    if not value:
        return None
    value = str(value).strip()
    for candidate in (value, value.replace("Z", "+00:00")):
        try:
            parsed = datetime.datetime.fromisoformat(candidate)
            if parsed.tzinfo:
                parsed = parsed.astimezone(TZ).replace(tzinfo=None)
            return parsed.replace(tzinfo=TZ)
        except ValueError:
            pass
    for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%d"):
        try:
            return datetime.datetime.strptime(value, fmt).replace(tzinfo=TZ)
        except ValueError:
            pass
    return None


def event_jsonld(page_html):
    for match in re.finditer(
        r'<script[^>]+type=["\']application/ld\+json["\'][^>]*>(.*?)</script>',
        page_html,
        re.I | re.S,
    ):
        try:
            data = json.loads(htmlmod.unescape(match.group(1)))
        except Exception:
            continue
        candidates = data if isinstance(data, list) else [data]
        if isinstance(data, dict) and isinstance(data.get("@graph"), list):
            candidates.extend(data["@graph"])
        for item in candidates:
            if not isinstance(item, dict):
                continue
            kind = item.get("@type", [])
            if isinstance(kind, str):
                kind = [kind]
            if "Event" not in kind:
                continue
            loc = item.get("location") or item.get("Location") or {}
            location = ""
            if isinstance(loc, dict):
                address = loc.get("address", "")
                if isinstance(address, dict):
                    address = ", ".join(str(address.get(k, "")) for k in ("streetAddress", "addressLocality", "addressRegion") if address.get(k))
                location = loc.get("name") or address or ""
            elif isinstance(loc, str):
                location = loc
            return {
                "name": clean_text(item.get("name", "")),
                "start": item.get("startDate", ""),
                "end": item.get("endDate", ""),
                "location": clean_text(location),
            }
    return None


class EventLinkParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []

    def handle_starttag(self, tag, attrs):
        if tag.lower() != "a":
            return
        href = dict(attrs).get("href", "")
        if href:
            href = href.split("#", 1)[0]
            if re.match(r"^https?://brockvilletourism\.com/event/[^/]+/?$", href):
                self.links.append(href)
            elif href.startswith("/event/"):
                self.links.append("https://brockvilletourism.com" + href)


def discover_event_links():
    page, _ = get(EVENTS_PAGE)
    parser = EventLinkParser()
    parser.feed(page)
    links = list(dict.fromkeys(parser.links))
    if not links:
        raise RuntimeError(
            "Tourism API failed and no /event/ links were found on the public "
            "Shows & Events page; keeping the previous feed."
        )
    print(f"Fallback discovered {len(links)} event links from the public events page")
    return links


def parse_event_page(page_html):
    event = event_jsonld(page_html)
    if event and event.get("start"):
        return event

    # Fallback for event pages where the theme omits JSON-LD.
    title_match = re.search(r"<h1[^>]*>(.*?)</h1>", page_html, re.I | re.S)
    text = clean_text(page_html)
    date_match = re.search(
        r"([A-Z][a-z]{2} \d{1,2}, \d{4})\s+(\d{1,2}:\d{2}\s*[AP]M)",
        text,
        re.I,
    )
    if not title_match or not date_match:
        return None
    date_text = date_match.group(1) + " " + date_match.group(2).upper().replace(" ", "")
    try:
        start = datetime.datetime.strptime(date_text, "%b %d, %Y %I:%M%p").replace(tzinfo=TZ)
    except ValueError:
        return None
    return {
        "name": clean_text(title_match.group(1)),
        "start": start.strftime("%Y-%m-%d %H:%M:%S"),
        "end": "",
        "location": "",
    }


def event_from_page(url, title_hint=""):
    page, _ = get(url)
    event = parse_event_page(page)
    if not event or not event.get("start"):
        return None
    start = parse_datetime(event.get("start"))
    end = parse_datetime(event.get("end")) or start
    if not start:
        return None
    title = clean_text(title_hint) or clean_text(event.get("name", ""))
    if not title:
        return None
    return {
        "title": title,
        "url": url,
        "start": start.strftime("%Y-%m-%d %H:%M:%S"),
        "end": end.strftime("%Y-%m-%d %H:%M:%S"),
        "location": clean_text(event.get("location", "")),
    }


def fetch_events_from_api(now):
    body, content_type = get(API)
    try:
        items = json.loads(body)
    except json.JSONDecodeError as exc:
        preview = clean_text(body[:180])
        raise RuntimeError(
            f"Tourism API returned non-JSON content "
            f"(Content-Type: {content_type or 'unknown'}; body starts: {preview!r})"
        ) from exc
    if not isinstance(items, list):
        raise RuntimeError("Tourism API response was valid JSON but was not an event list")
    events = []
    seen = set()
    for item in items:
        url = item.get("link", "")
        if not url or url in seen:
            continue
        seen.add(url)
        title = clean_text((item.get("title") or {}).get("rendered", ""))
        try:
            event = event_from_page(url, title)
        except Exception as exc:
            print(f"Skipping event page {url}: {exc}", file=sys.stderr)
            continue
        if event and parse_datetime(event["end"]) >= now - datetime.timedelta(hours=3):
            events.append(event)
    return events


def fetch_events_from_page(now):
    events = []
    for url in discover_event_links():
        try:
            event = event_from_page(url)
        except Exception as exc:
            print(f"Skipping fallback event page {url}: {exc}", file=sys.stderr)
            continue
        if event and parse_datetime(event["end"]) >= now - datetime.timedelta(hours=3):
            events.append(event)
    return events


def fetch_notices(pages=2, limit=12):
    out, seen = [], set()
    for pg in range(1, pages + 1):
        url = CITY_ANNOUNCEMENTS if pg == 1 else CITY_ANNOUNCEMENTS + f"page/{pg}/"
        page, _ = get(url)
        for match in re.finditer(
            r'<a href="(https://brockville\.com/announcement/[^"]+/)"><div class="announcements">(.*?)</a>',
            page,
            re.S,
        ):
            link, block = match.group(1), match.group(2)
            if link in seen:
                continue
            seen.add(link)
            title_match = re.search(r'<h2 class="announcementstitle">(.*?)</h2>', block, re.S)
            date_match = re.search(r"([A-Za-z]+ \d{1,2}, \d{4})", block)
            excerpt_match = re.search(r'<div class="announcementsexcerpt"><p>(.*?)</p>', block, re.S)
            title = clean_text(title_match.group(1)) if title_match else ""
            if not title:
                continue
            date_iso = ""
            if date_match:
                try:
                    date_iso = datetime.datetime.strptime(date_match.group(1), "%B %d, %Y").date().isoformat()
                except ValueError:
                    pass
            excerpt = clean_text(excerpt_match.group(1)) if excerpt_match else ""
            if len(excerpt) > 180:
                excerpt = excerpt[:177].rstrip() + "..."
            out.append({"title": title, "date": date_iso, "url": link, "excerpt": excerpt})
    out.sort(key=lambda item: item["date"], reverse=True)
    return out[:limit]


def load_previous(path):
    try:
        with open(path, encoding="utf-8") as handle:
            data = json.load(handle)
        return data if isinstance(data, dict) else {}
    except (OSError, json.JSONDecodeError):
        return {}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--out", default="events.json")
    args = parser.parse_args()

    now = datetime.datetime.now(TZ)
    previous = load_previous(args.out)

    try:
        events = fetch_events_from_api(now)
        print(f"Tourism API supplied {len(events)} upcoming events")
        if not events:
            raise RuntimeError("Tourism API returned no usable upcoming events")
    except Exception as api_error:
        print(f"Tourism API unavailable: {api_error}", file=sys.stderr)
        events = fetch_events_from_page(now)

    events.sort(key=lambda item: item["start"])
    events = events[:20]
    if not events:
        raise RuntimeError(
            "No upcoming events were collected. Refusing to overwrite the existing feed."
        )

    try:
        notices = fetch_notices()
        print(f"Fetched {len(notices)} City notices")
    except Exception as exc:
        print(f"City notices fetch failed: {exc}", file=sys.stderr)
        notices = previous.get("notices", [])
        print(f"Preserving {len(notices)} notices from the previous feed")

    feed = {
        "source": EVENTS_PAGE,
        "updated_at": now.isoformat(),
        "count": len(events),
        "events": events,
        "notices_source": CITY_ANNOUNCEMENTS,
        "notices_count": len(notices),
        "notices": notices,
    }
    with open(args.out, "w", encoding="utf-8") as handle:
        json.dump(feed, handle, ensure_ascii=False, indent=1)
    print(f"Wrote {args.out}: {len(events)} upcoming events and {len(notices)} notices")


if __name__ == "__main__":
    main()
