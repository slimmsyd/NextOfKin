"""Offline evals for the NextOfKin intake agent (real-estate chapter).

Reads the shared agent contract (agent-contract.json — the same prompt + tools
prod uses), replays each dataset case against the configured DeepSeek endpoint,
captures the emitted tool calls (no DB writes), and scores per failure mode.

Usage:
    python -m evals.run            # live run against DEEPSEEK_* env
    python -m evals.run --check    # offline: validate contract + dataset only

Env: DEEPSEEK_API_KEY (required for live), DEEPSEEK_BASE_URL
(default https://api.deepseek.com/v1), DEEPSEEK_MODEL (default deepseek-chat).
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path

from .score import score_case

ROOT = Path(__file__).resolve().parent.parent
CONTRACT_PATH = ROOT / "agent-contract.json"
DATASET_PATH = ROOT / "evals" / "datasets" / "real_estate.jsonl"
REPORT_PATH = ROOT / "evals" / "report.md"
CHAPTER = "real_estate"


def load_contract() -> dict:
    return json.loads(CONTRACT_PATH.read_text())


def load_cases() -> list[dict]:
    cases = []
    for line in DATASET_PATH.read_text().splitlines():
        line = line.strip()
        if line:
            cases.append(json.loads(line))
    return cases


def serialize_profile(profile: dict) -> str:
    u = profile.get("user") or {}
    who = (
        f"The person: {u.get('legalName') or 'unknown'}, state {u.get('stateCode') or 'unknown'}, "
        f"marital status {u.get('maritalStatus') or 'unknown'}."
        if u
        else "The person's identity is not yet on record."
    )
    assets = profile.get("assets") or []
    if not assets:
        items = "Items already on record: none yet."
    else:
        lines = []
        for a in assets:
            deed = a.get("deedRecorded")
            deed_s = "?" if deed is None else ("recorded" if deed else "not recorded")
            lines.append(
                f"- [id={a.get('id')}] {a.get('label') or '(unlabeled)'} — "
                f"{a.get('location') or 'location unknown'}; source {a.get('acquisitionSource') or '?'}; "
                f"title {a.get('titleStatus') or '?'}; deed {deed_s}"
            )
        items = (
            "Items already on record (reference these IDs to UPDATE, do not duplicate):\n"
            + "\n".join(lines)
        )
    return f"{who}\n{items}"


def build_system(contract: dict, profile: dict) -> str:
    goal = contract["chapterGoals"][CHAPTER]
    return (
        f"{contract['baseRules']}\n\n{goal}\n\n--- CURRENT RECORD ---\n"
        + serialize_profile(profile)
    )


def build_messages(case: dict) -> list[dict]:
    msgs = []
    for t in case.get("history", []):
        role = "assistant" if t.get("role") == "agent" else "user"
        msgs.append({"role": role, "content": t["text"]})
    msgs.append({"role": "user", "content": case["user"]})
    return msgs


def extract_tool_calls(message) -> list[dict]:
    calls = []
    for tc in getattr(message, "tool_calls", None) or []:
        try:
            args = json.loads(tc.function.arguments or "{}")
        except json.JSONDecodeError:
            args = {}
        calls.append({"name": tc.function.name, "args": args})
    return calls


def run_live(contract: dict, cases: list[dict]) -> list[dict]:
    from openai import OpenAI

    client = OpenAI(
        base_url=os.environ.get("DEEPSEEK_BASE_URL", "https://api.deepseek.com/v1"),
        api_key=os.environ.get("DEEPSEEK_API_KEY"),
    )
    model = os.environ.get("DEEPSEEK_MODEL", "deepseek-chat")
    tools = contract["tools"]

    results = []
    for case in cases:
        system = build_system(contract, case["profile"])
        messages = [{"role": "system", "content": system}, *build_messages(case)]
        resp = client.chat.completions.create(
            model=model, messages=messages, tools=tools, tool_choice="auto"
        )
        tool_calls = extract_tool_calls(resp.choices[0].message)
        verdict = score_case(case, tool_calls)
        results.append({"id": case["id"], "mode": case["mode"], **verdict, "tool_calls": tool_calls})
    return results


def write_report(results: list[dict]) -> None:
    passed = sum(1 for r in results if r["passed"])
    lines = [
        "# Agent eval report — real estate",
        "",
        f"**{passed}/{len(results)} passed**",
        "",
        "| case | mode | result | detail |",
        "|------|------|--------|--------|",
    ]
    for r in results:
        mark = "PASS" if r["passed"] else "FAIL"
        lines.append(f"| {r['id']} | {r['mode']} | {mark} | {r['reason']} |")
    REPORT_PATH.write_text("\n".join(lines) + "\n")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true", help="offline validation only")
    args = ap.parse_args()

    contract = load_contract()
    cases = load_cases()
    print(f"Loaded contract ({len(contract['tools'])} tools) and {len(cases)} cases.")

    if args.check:
        for case in cases:
            assert "expect" in case, f"case {case.get('id')} missing expect"
            _ = build_system(contract, case["profile"])
            _ = build_messages(case)
        print("--check OK: contract + dataset assemble cleanly. No API calls made.")
        return 0

    if not os.environ.get("DEEPSEEK_API_KEY"):
        print("DEEPSEEK_API_KEY not set — cannot run live evals. Use --check, or set the key.")
        return 1

    results = run_live(contract, cases)
    write_report(results)
    passed = sum(1 for r in results if r["passed"])
    for r in results:
        print(f"  [{'PASS' if r['passed'] else 'FAIL'}] {r['id']} ({r['mode']}): {r['reason']}")
    print(f"\n{passed}/{len(results)} passed. Report: {REPORT_PATH}")
    return 0 if passed == len(results) else 2


if __name__ == "__main__":
    sys.exit(main())
