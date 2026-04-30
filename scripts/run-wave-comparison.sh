#!/usr/bin/env bash
# Run all 5 scenarios through all 3 Claude waves against the office daemon.
#
# Output: .planning/wave-comparison/<YYYY-MM-DD>/
#   <wave>__<scenario>.txt   -- the generated report (just the text deltas)
#   <wave>__<scenario>.json  -- the final 'done' SSE event
#   metrics.csv              -- one row per (wave, scenario) with latency / cost
#
# Usage:
#   scripts/run-wave-comparison.sh                 # default base = office Tailscale
#   CLAUDE_BASE=http://10.66.19.201:3000 scripts/run-wave-comparison.sh
# Note: deliberately NOT using -e -- inline `grep` for the error event
# returns 1 on success runs (no error lines present), which would kill
# the loop. Branching on done_line / err_line is explicit.
set -uo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SCENARIOS="$REPO_ROOT/.planning/wave-comparison/scenarios.json"
BASE="${CLAUDE_BASE:-http://100.75.237.36:3000}"
DATE="$(date +%Y-%m-%d)"
OUT="$REPO_ROOT/.planning/wave-comparison/$DATE"
WAVES=(api sdk managed)

if [[ ! -f "$SCENARIOS" ]]; then
  echo "ERROR: $SCENARIOS not found" >&2
  exit 1
fi

mkdir -p "$OUT"
METRICS="$OUT/metrics.csv"
echo "wave,scenario_id,exam_type,status,first_token_ms,total_ms,wall_ms,input_tokens,output_tokens,cost_usd,request_id,error" > "$METRICS"

count=$(jq 'length' "$SCENARIOS")
echo "[run] $count scenarios × ${#WAVES[@]} waves = $((count * ${#WAVES[@]})) requests"
echo "[run] daemon: $BASE"
echo "[run] output: $OUT"
echo

for ((i=0; i<count; i++)); do
  scenario_id=$(jq -r ".[$i].id" "$SCENARIOS")
  exam_type=$(jq -r ".[$i].examType" "$SCENARIOS")
  label=$(jq -r ".[$i].label" "$SCENARIOS")
  measurements=$(jq -r ".[$i].measurements" "$SCENARIOS")

  for wave in "${WAVES[@]}"; do
    body=$(jq -n \
      --arg examType "$exam_type" \
      --arg measurements "$measurements" \
      --arg wave "$wave" \
      '{examType: $examType, measurements: $measurements, wave: $wave}')

    out_txt="$OUT/${wave}__${scenario_id}.txt"
    out_json="$OUT/${wave}__${scenario_id}.json"
    raw_sse="$OUT/${wave}__${scenario_id}.sse"

    printf "  [%s | %s] " "$wave" "$scenario_id"
    t0=$(date +%s%N)
    if curl -sS -N --max-time 120 -X POST \
        -H 'Content-Type: application/json' \
        -d "$body" \
        "$BASE/api/clinical/ultrasound" > "$raw_sse" 2>/dev/null; then
      t1=$(date +%s%N)
      wall_ms=$(( (t1 - t0) / 1000000 ))

      # Extract concatenated text deltas into the .txt file.
      grep '^data: {"type":"text"' "$raw_sse" \
        | sed 's/^data: //' \
        | jq -r '.delta' > "$out_txt" 2>/dev/null \
        || true
      # Pull the done event (or error if no done) into the .json file.
      done_line=$(grep '^data: {"type":"done"' "$raw_sse" | head -1 | sed 's/^data: //')
      err_line=$(grep '^data: {"type":"error"' "$raw_sse" | head -1 | sed 's/^data: //')

      if [[ -n "$done_line" ]]; then
        echo "$done_line" > "$out_json"
        first_token_ms=$(echo "$done_line" | jq -r '.firstTokenMs // ""')
        total_ms=$(echo "$done_line" | jq -r '.totalMs // ""')
        input_tokens=$(echo "$done_line" | jq -r '.inputTokens // ""')
        output_tokens=$(echo "$done_line" | jq -r '.outputTokens // ""')
        cost_usd=$(echo "$done_line" | jq -r '.costUsd // ""')
        request_id=$(echo "$done_line" | jq -r '.requestId // ""')
        printf "OK  total=%6sms  out=%4s tok  cost=\$%s\n" "$total_ms" "$output_tokens" "$cost_usd"
        echo "$wave,$scenario_id,$exam_type,success,$first_token_ms,$total_ms,$wall_ms,$input_tokens,$output_tokens,$cost_usd,$request_id," >> "$METRICS"
      elif [[ -n "$err_line" ]]; then
        echo "$err_line" > "$out_json"
        err_msg=$(echo "$err_line" | jq -r '.message // "unknown"' | tr ',' ';')
        request_id=$(echo "$err_line" | jq -r '.requestId // ""')
        printf "ERR %s\n" "$err_msg"
        echo "$wave,$scenario_id,$exam_type,error,,,$wall_ms,,,,$request_id,$err_msg" >> "$METRICS"
      else
        echo "no done / no error event in stream" > "$out_json"
        printf "??  no terminal event\n"
        echo "$wave,$scenario_id,$exam_type,unknown,,,$wall_ms,,,,," >> "$METRICS"
      fi
    else
      t1=$(date +%s%N)
      wall_ms=$(( (t1 - t0) / 1000000 ))
      printf "FAIL curl exit=%s after %sms\n" "$?" "$wall_ms"
      echo "$wave,$scenario_id,$exam_type,transport_error,,,$wall_ms,,,,,curl_failed" >> "$METRICS"
    fi
  done
  echo "  --- scenario $scenario_id done ---" $(printf '%.0s ' {1..3})
done

echo
echo "[run] complete. summary:"
echo
column -t -s, "$METRICS" | head -20
echo "..."
echo
echo "[run] reports:  $OUT"
echo "[run] metrics:  $METRICS"
