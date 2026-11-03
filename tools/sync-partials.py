"""Keep the header and footer identical on every page.

Edit partials/header.html or partials/footer.html, then run from the site root:

    python tools/sync-partials.py

Every .html file that contains the <!-- site-header:start/end --> and
<!-- site-footer:start/end --> markers gets the current partial copied in.
This is an editing helper only: the site itself needs no build step.
Add --check to report pages that are out of date without changing them.
"""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SKIP_DIRS = {"partials", "tools", "node_modules", ".git"}


def block(name):
    text = (ROOT / "partials" / f"{name}.html").read_text(encoding="utf-8").strip()
    if not text.startswith(f"<!-- site-{name}:start -->"):
        sys.exit(f"partials/{name}.html must start with <!-- site-{name}:start -->")
    return text


def main():
    check_only = "--check" in sys.argv
    blocks = {name: block(name) for name in ("header", "footer")}
    changed, stale = 0, []
    for page in sorted(ROOT.rglob("*.html")):
        if SKIP_DIRS & set(page.relative_to(ROOT).parts):
            continue
        original = page.read_text(encoding="utf-8")
        updated = original
        for name, html in blocks.items():
            pattern = re.compile(rf"<!-- site-{name}:start -->.*?<!-- site-{name}:end -->", re.S)
            updated = pattern.sub(lambda _: html, updated)
        if updated != original:
            stale.append(page.relative_to(ROOT).as_posix())
            if not check_only:
                page.write_text(updated, encoding="utf-8", newline="\n")
                changed += 1
    if check_only:
        print("\n".join(stale) if stale else "All pages are up to date.")
        sys.exit(1 if stale else 0)
    print(f"Updated {changed} page(s).")


if __name__ == "__main__":
    main()
