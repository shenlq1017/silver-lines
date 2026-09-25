#!/usr/bin/env python3
"""quotes-only 金句门禁（2026-09-25）

Fail if any NEW draft entry:
  - missing / blank ``character``
  - ``curator_note`` contains 策展句 / 非逐字 / 主题性 / 概括题旨
  - ``line`` empty / blank

Usage (from site root):
  python3 scripts/check-quotes-only.py data/c27-draft-quotes.json
  python3 scripts/check-quotes-only.py data/cXX-draft-quotes.json

Exit 0 = pass; exit 1 = fail. Merge MUST run this before merging a draft
into data/quotes.json (see docs/quotes-policy.md). Does not modify any files.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

FORBIDDEN = re.compile(r"策展句|非逐字|主题性|概括题旨")


def load_quotes(path: Path) -> list[dict]:
    raw = json.loads(path.read_text(encoding="utf-8"))
    if isinstance(raw, list):
        return raw
    if isinstance(raw, dict) and isinstance(raw.get("quotes"), list):
        return raw["quotes"]
    raise SystemExit(f"unrecognized draft shape: {path} (want list or {{quotes: [...]}})")


def check_entry(q: dict, idx: int) -> list[str]:
    qid = q.get("id") or f"#{idx}"
    issues: list[str] = []
    char = q.get("character")
    if char is None or not str(char).strip():
        issues.append(f"{qid}: missing character")
    line = q.get("line")
    if line is None or not str(line).strip():
        issues.append(f"{qid}: empty line")
    note = q.get("curator_note")
    note_s = "" if note is None else str(note)
    m = FORBIDDEN.search(note_s)
    if m:
        issues.append(f"{qid}: curator_note contains forbidden «{m.group(0)}»")
    return issues


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description="quotes-only gate for NEW draft entries")
    ap.add_argument(
        "draft",
        nargs="+",
        type=Path,
        help="path(s) to *-draft-quotes.json",
    )
    args = ap.parse_args(argv)

    all_issues: list[str] = []
    total = 0
    for path in args.draft:
        if not path.is_file():
            print(f"FAIL: draft not found: {path}", file=sys.stderr)
            return 1
        quotes = load_quotes(path)
        total += len(quotes)
        for i, q in enumerate(quotes):
            if not isinstance(q, dict):
                all_issues.append(f"{path.name}:#{i}: entry is not an object")
                continue
            for issue in check_entry(q, i):
                all_issues.append(f"{path.name}: {issue}")

    if all_issues:
        print(f"FAIL: quotes-only gate — {len(all_issues)} issue(s) in {total} entr(y/ies)")
        for line in all_issues:
            print(f"  - {line}")
        print(
            "Policy: only verifiable on-screen dialogue; "
            "curator_note = verification basis (通行译法/字幕/剧本/Wikiquote…); "
            "never 策展句/非逐字/主题性/概括题旨. See docs/quotes-policy.md"
        )
        return 1

    names = ", ".join(p.name for p in args.draft)
    print(f"PASS: quotes-only gate — {total} entr(y/ies) in {names}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
