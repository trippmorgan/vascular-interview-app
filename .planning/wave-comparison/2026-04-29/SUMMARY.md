---
date: 2026-04-29
scenarios: 5
waves: 3
total_runs: 15
all_succeeded: true
---

# Wave comparison — 2026-04-29

## How to use this file

The reports live next to this file as `<wave>__<scenario>.txt`. Read each
one and grade it 1–5 in the **Grades** table below (5 = ready to drop into
a final report with no edits, 1 = unusable / dangerous). The **Notes**
column is for the one-or-two-word reason behind the grade — that's what
makes the recommendation actionable later.

Once every cell has a grade, the recommendation section at the bottom can
be filled in.

## Per-wave aggregate (from `metrics.csv`)

| Wave | Successes | TTFB p50 | Total p50 | Total max | Cost mean | Cost total | Out tokens (mean) |
|------|----------:|---------:|----------:|----------:|----------:|-----------:|------------------:|
| api      | 5/5 | 11.0s | 16.4s | 39.0s | $0.0223 | $0.111 | 1,365 |
| sdk      | 5/5 | 21.8s | 26.6s | 90.7s | $0.0595 | $0.298 | 2,717 |
| managed  | 5/5 | 20.2s | 20.6s | 35.0s | $0.0210 | $0.105 | 1,138 |

**Quick reading:**
- **api** is fastest on TTFB by ~2× and produces mid-length output for the lowest mean cost.
- **sdk** is consistently the slowest and most expensive — the headless harness inflates input tokens 4–5× (it always sends ~13.5K tokens regardless of scenario, vs ~2.7K for `api`) and the model also generates more output. Worst-case (lower_arterial_clti) hit 90 seconds.
- **managed** is comparable to `api` on cost and output length but pays a ~10–20s container-provisioning floor that's visible on shorter scenarios (carotid: 7.8s on api vs 15.3s on managed).

## Grades (Tripp fills in 1–5 per cell, plus a one-line note)

| Scenario | api | sdk | managed | Notes / which is best |
|---|---:|---:|---:|---|
| `carotid_unilateral_tight`     | _ /5 | _ /5 | _ /5 |   |
| `lower_arterial_clti`          | _ /5 | _ /5 | _ /5 |   |
| `venous_reflux_bilateral_gsv`  | _ /5 | _ /5 | _ /5 |   |
| `aaa_surveillance`             | _ /5 | _ /5 | _ /5 |   |
| `avf_dysfunction`              | _ /5 | _ /5 | _ /5 |   |
| **Mean** | _.__ | _.__ | _.__ |  |

## Per-scenario raw metrics

(Cross-reference for the grades.)

| Scenario | Wave | TTFB | Total | Out tok | Cost |
|---|---|---:|---:|---:|---:|
| carotid_unilateral_tight     | api      |  4.8s |  7.8s |   494 | $0.0094 |
| carotid_unilateral_tight     | sdk      | 21.8s | 25.3s | 1,676 | $0.0768 |
| carotid_unilateral_tight     | managed  | 15.3s | 15.3s |   482 | $0.0187 |
| lower_arterial_clti          | api      | 32.3s | 39.0s | 2,464 | $0.0388 |
| lower_arterial_clti          | sdk      | 87.6s | 90.7s | 6,164 | $0.1031 |
| lower_arterial_clti          | managed  | 35.0s | 35.0s | 1,734 | $0.0281 |
| venous_reflux_bilateral_gsv  | api      | 11.0s | 16.4s | 1,708 | $0.0275 |
| venous_reflux_bilateral_gsv  | sdk      | 20.3s | 26.6s | 2,264 | $0.0447 |
| venous_reflux_bilateral_gsv  | managed  | 24.9s | 24.9s | 1,782 | $0.0289 |
| aaa_surveillance             | api      |  6.2s |  8.3s |   599 | $0.0105 |
| aaa_surveillance             | sdk      | 21.0s | 23.7s | 1,573 | $0.0338 |
| aaa_surveillance             | managed  | 15.0s | 15.4s |   674 | $0.0119 |
| avf_dysfunction              | api      | 18.3s | 21.4s | 1,562 | $0.0251 |
| avf_dysfunction              | sdk      | 26.4s | 29.7s | 1,911 | $0.0391 |
| avf_dysfunction              | managed  | 20.2s | 20.6s | 1,019 | $0.0172 |

## Recommendation (fill in after grading)

**Default backend for v2 standardization:** _api / sdk / managed / mixed_

**Why:**
_(One paragraph — what mattered most among latency, output quality, output length, cost, and where the trade-offs land for ultrasound report generation specifically.)_

**Per-exam exceptions, if any:**

- carotid: _____
- lower extremity arterial: _____
- venous reflux: _____
- aorta: _____
- AVF / dialysis: _____

**Open questions raised by the comparison:**

- _____
- _____
- _____

## Methodology notes

- Same model (`claude-sonnet-4-6`) and same SVS system prompt (`buildSystemPrompt`) across all three waves, so output-quality differences attribute to the **transport** (direct API vs subprocess agent vs server-managed agent), not the prompt or model.
- Cost figures use Sonnet 4.6 list pricing ($3 / $15 per M input/output, 1.25× cache write, 0.10× cache read). For `sdk`, the Agent SDK reports its own `total_cost_usd` directly so caching benefits (or lack thereof) inside the harness are reflected; for `api` and `managed`, cost is computed from token usage by the dispatcher.
- The five scenarios are `.planning/wave-comparison/scenarios.json` — clinically representative but synthetic, no PHI.
- Reports were generated against the office daemon at `http://100.75.237.36:3000` (server1, NodeId=office). Each request hit `POST /api/clinical/ultrasound`, streamed text deltas via SSE, and persisted a row to `clinical_ai_metrics`.
- TTFB on `managed` and `sdk` is dominated by container/subprocess startup; `api` TTFB is true model latency.
