Run the insertion script to add the GTM snippet to every HTML page.

Commands:

Dry run (shows which files would be changed):

```bash
python scripts/insert_gtm.py --root "." 
```

Apply changes (creates `.bak` backups of modified files):

```bash
python scripts/insert_gtm.py --apply --root "."
```

Notes:
- The script skips files that already contain `GTM-597CBPND`.
- Backups are created next to each modified file with the `.bak` suffix.
