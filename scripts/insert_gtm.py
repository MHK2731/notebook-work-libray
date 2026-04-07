"""
Script: insert_gtm.py
Insert a Google Tag Manager snippet into every HTML file in the repository.

Usage:
  python scripts/insert_gtm.py         # dry run, shows files that would be changed
  python scripts/insert_gtm.py --apply  # actually modify files (creates .bak backup)

The script will skip files that already contain the GTM ID `GTM-597CBPND`.
"""
import argparse
import os
import re
from pathlib import Path

GTM_SNIPPET = '''<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-597CBPND');</script>
<!-- End Google Tag Manager -->\n'''

HEAD_RE = re.compile(r'<head[^>]*>', re.IGNORECASE)
GTM_ID = 'GTM-597CBPND'


def process_file(path: Path, apply: bool=False) -> bool:
    text = path.read_text(encoding='utf-8', errors='replace')
    if GTM_ID in text:
        return False
    m = HEAD_RE.search(text)
    if not m:
        return False
    insert_at = m.end()
    new_text = text[:insert_at] + '\n' + GTM_SNIPPET + text[insert_at:]
    if apply:
        bak = path.with_suffix(path.suffix + '.bak')
        bak.write_text(text, encoding='utf-8')
        path.write_text(new_text, encoding='utf-8')
    return True


def main():
    parser = argparse.ArgumentParser(description='Insert GTM snippet into HTML files')
    parser.add_argument('--apply', action='store_true', help='Actually modify files')
    parser.add_argument('--root', default='.', help='Repository root to scan')
    args = parser.parse_args()

    root = Path(args.root)
    files = list(root.rglob('*.html'))
    changed = []
    skipped = []

    for p in files:
        try:
            ok = process_file(p, apply=args.apply)
            if ok:
                changed.append(str(p))
            else:
                skipped.append(str(p))
        except Exception as e:
            print(f'Error processing {p}: {e}')

    print('\nScan complete.')
    print(f'HTML files scanned: {len(files)}')
    print(f'Would modify: {len(changed)} files' + (" (applied)" if args.apply else " (dry run)"))
    if changed:
        for f in changed:
            print('  ', f)


if __name__ == '__main__':
    main()
