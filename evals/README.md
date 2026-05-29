# Agent evals

Offline evals for the intake agent (real-estate chapter). They replay scripted
conversations against the **same prompt + tools as production** (read from
`../agent-contract.json`) and score the emitted tool calls against the four
failure modes the product canon cares about:

- **under-extraction** — dropped a fact the person stated
- **hallucination** — invented a value/name/number that wasn't stated
- **garble** — captured the wrong value (esp. numbers, worse with voice)
- **entity-duplication** — created a second row instead of updating by id

No database is touched — these test model behavior only.

## Run

```bash
cd NextOfKin
python3 -m venv evals/.venv
source evals/.venv/bin/activate
pip install -r evals/requirements.txt

# offline sanity check (no API calls):
python -m evals.run --check

# live run (uses DEEPSEEK_* from your shell env):
export DEEPSEEK_API_KEY=...          # and optionally DEEPSEEK_BASE_URL / DEEPSEEK_MODEL
python -m evals.run
```

Output: per-case PASS/FAIL in the terminal + a summary in `evals/report.md`.

## Add cases

Append JSONL lines to `datasets/real_estate.jsonl`. Each case: a prior
`profile` (with asset `id`s for entity-resolution tests), optional `history`,
the `user` message, and an `expect` block (see `score.py` for the supported
checks: `must_create`, `forbid_create`, `must_reference_id`, `args_present`,
`args_absent`, `args_value`, `args_value_substr`, `args_numeric`).
