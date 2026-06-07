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

Append JSONL lines to `datasets/<chapter>.jsonl` (`real_estate.jsonl` or
`financial_accounts.jsonl`). Each case: a prior `profile` (with asset `id`s for
entity-resolution tests), optional `history`, the `user` message, and an
`expect` block (see `score.py` for the supported checks: `must_create`,
`forbid_create`, `must_reference_id`, `args_present`, `args_absent`,
`args_value`, `args_value_substr`, `args_numeric`).

## Capture flywheel (real turns -> eval cases)

Instead of authoring every case by hand, harvest them from real onboarding turns:

```bash
# Mine stored turns into eval-case STUBS (real data -> evals/review/, gitignored):
pnpm tsx --env-file=.env.local scripts/harvest-eval-cases.ts

# See what people say, the intent mix, and the desync (capture-failure) rate:
pnpm tsx --env-file=.env.local scripts/onboarding-insights.ts
```

`harvest-eval-cases.ts` flags two kinds of turn:
- **desync** (substantive input, zero capture — the production canary): emitted as
  `mode: under_extraction` with a BLANK `expect` for you to fill in.
- **capture** (tools fired): emitted with `expect` derived from the applied tool.

Promotion is manual: review `evals/review/<chapter>-harvest.jsonl`, fill/confirm
each `expect`, and move good cases into `datasets/<chapter>.jsonl`. `evals/review/`
is gitignored — it holds real family data and never leaves the family boundary.
Few-shot examples in `fewshot/` (injected into the live extraction prompt) must be
**synthetic** — see `src/lib/yourLife/fewshot.ts`.
