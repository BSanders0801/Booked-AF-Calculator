"""Read-only verification of the exact public assets and matching email engine."""
import hashlib
import json
import os
from pathlib import Path
import re
import time
import urllib.request

base = 'https://bookedandfabulous.com'
version = re.search(r"PERSONALIZATION_VERSION = '([^']+)'", Path('personalization.js').read_text()).group(1)
files = ['index.html', 'app.js', 'breakdown-core.js', 'personalization.js', 'site-ui.js', 'site-content.js', 'site.css', 'lifecycle-ui.js', 'paid-loader.js']
revision = os.environ.get('GITHUB_SHA', version)

def get(url):
    request = urllib.request.Request(url, headers={'User-Agent': 'BookedAF-LaunchCheck/2.0', 'Cache-Control': 'no-cache'})
    with urllib.request.urlopen(request, timeout=15) as response:
        return response.read(2_000_000)

# Pages deploys independently. Compare bytes, not an old cache label or headline.
for attempt in range(12):
    failures = []
    for name in files:
        try:
            live = get(base + '/' + ('' if name == 'index.html' else name) + '?release=' + revision)
            if hashlib.sha256(live).digest() != hashlib.sha256(Path(name).read_bytes()).digest():
                failures.append(name + ': deployed content differs')
        except Exception as error:
            failures.append(name + ': ' + str(error))
    if not failures:
        break
    if attempt == 11:
        raise SystemExit('; '.join(failures))
    time.sleep(10)
print('PASS all nine public assets match this release')

health = json.loads(get('https://booked-af-email.wild-recipe-42df.workers.dev/health'))
assert health.get('ready') is True and health.get('launchReady') is True, 'Email service not ready'
assert health.get('personalizationVersion') == version, 'Website/email engine versions differ'
assert 'short-v5' in health.get('schemas', []), 'Questionnaire schema unavailable'
print('PASS live email engine version:', version)
print('Read-only deployment verified. Inbox delivery and physical iPhone checks are separate gates.')
