curl -s -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" \
  -L "https://www.youtube.com/@concursinomedia/videos" \
  | python3 -c "
import sys, re, json

html = sys.stdin.read()
match = re.search(r'var ytInitialData = ', html)
start = match.end()
depth, i = 0, start
while i < len(html):
    c = html[i]
    if c == '{': depth += 1
    elif c == '}':
        depth -= 1
        if depth == 0: break
    i += 1
data = json.loads(html[start:i+1])

def find_videos(obj, results=None):
    if results is None: results = []
    if isinstance(obj, dict):
        if 'lockupViewModel' in obj:
            lvm = obj['lockupViewModel']
            metadata = lvm.get('metadata', {}).get('lockupMetadataViewModel', {})
            title = metadata.get('title', {}).get('content', '')
            content_id = lvm.get('contentId', '')
            if title and content_id:
                results.append((content_id, title))
        for v in obj.values(): find_videos(v, results)
    elif isinstance(obj, list):
        for item in obj: find_videos(item, results)
    return results

for vid_id, title in find_videos(data):
    print(f'{vid_id}  {title}')
"