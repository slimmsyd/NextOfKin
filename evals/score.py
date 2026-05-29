"""Scoring for the agent extraction evals.

Each dataset case carries an `expect` block; we score the model's emitted tool
calls against it. The four failure modes from the product canon map to the
checks below:

- under_extraction -> `must_create` / `args_present` (did it capture the fact?)
- hallucination    -> `args_absent`               (did it invent a value?)
- garble           -> `args_numeric` / `args_value` (did it get the value right?)
- entity_dup       -> `must_reference_id` / `forbid_create` (update, not duplicate)
"""

from __future__ import annotations

from typing import Any


def _find_call(tool_calls: list[dict], name: str) -> dict | None:
    for c in tool_calls:
        if c.get("name") == name:
            return c
    return None


def score_case(case: dict, tool_calls: list[dict]) -> dict:
    expect = case.get("expect", {})
    tool = expect.get("tool")
    call = _find_call(tool_calls, tool) if tool else None
    fails: list[str] = []

    if tool and call is None:
        return {"passed": False, "reason": f"expected tool '{tool}' was not called"}

    args: dict[str, Any] = (call or {}).get("args", {}) or {}

    if expect.get("must_create") and "id" in args:
        fails.append("expected a CREATE (no id) but model passed an id")

    if expect.get("forbid_create") and "id" not in args:
        fails.append("expected an UPDATE (id) but model created a new asset")

    ref = expect.get("must_reference_id")
    if ref and args.get("id") != ref:
        fails.append(f"expected id={ref!r} to update, got id={args.get('id')!r}")

    for key in expect.get("args_present", []):
        if key not in args or args.get(key) in (None, ""):
            fails.append(f"expected field '{key}' to be captured")

    for key in expect.get("args_absent", []):
        if key in args and args.get(key) not in (None, ""):
            fails.append(f"field '{key}'={args.get(key)!r} was invented (should be null/absent)")

    for key, val in expect.get("args_value", {}).items():
        if args.get(key) != val:
            fails.append(f"field '{key}' expected {val!r}, got {args.get(key)!r}")

    for key, sub in expect.get("args_value_substr", {}).items():
        got = str(args.get(key, ""))
        if sub.lower() not in got.lower():
            fails.append(f"field '{key}' expected to contain {sub!r}, got {got!r}")

    # substring that may land in any of several fields (e.g. a street that the
    # model may put in label or location)
    for spec in expect.get("args_any_substr", []):
        sub = spec["substr"]
        fields = spec["fields"]
        joined = " ".join(str(args.get(f, "")) for f in fields).lower()
        if sub.lower() not in joined:
            fails.append(
                f"expected {sub!r} in any of {fields}, got "
                + ", ".join(f"{f}={args.get(f)!r}" for f in fields)
            )

    for key, num in expect.get("args_numeric", {}).items():
        try:
            got = float(args.get(key))
        except (TypeError, ValueError):
            got = None
        if got is None or abs(got - float(num)) > 0.5:
            fails.append(f"field '{key}' expected ~{num}, got {args.get(key)!r}")

    if fails:
        return {"passed": False, "reason": "; ".join(fails)}
    return {"passed": True, "reason": "ok"}
