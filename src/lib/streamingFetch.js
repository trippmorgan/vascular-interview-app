/**
 * SSE streaming receiver for /api/clinical/ultrasound.
 *
 * Posts the request body as JSON and parses the response body as a stream
 * of Server-Sent Events. The server emits three event types per request:
 *
 *   event: text   data: {"type":"text","delta":"..."}      // many
 *   event: done   data: {"type":"done","totalMs":...,...}  // one (success)
 *   event: error  data: {"type":"error","message":"..."}   // one (failure)
 *
 * Calls onChunk(chunk) for every parsed `data:` payload. Resolves when the
 * stream closes; rejects on transport errors or HTTP non-2xx.
 *
 * @param {object} opts
 * @param {string} opts.url           Endpoint to POST to
 * @param {object} opts.body          JSON body to send
 * @param {(chunk: object) => void} opts.onChunk
 * @param {AbortSignal} [opts.signal] Optional cancel
 * @returns {Promise<void>}
 */
export async function streamSse({ url, body, onChunk, signal }) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    },
    body: JSON.stringify(body),
    signal,
  });

  if (!response.ok) {
    const errBody = await response.text().catch(() => '');
    throw new Error(`HTTP ${response.status}: ${errBody.slice(0, 300)}`);
  }
  if (!response.body) {
    throw new Error('Response has no body to stream');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // SSE frames are separated by a blank line ("\n\n").
      let sep;
      while ((sep = buffer.indexOf('\n\n')) !== -1) {
        const frame = buffer.slice(0, sep);
        buffer = buffer.slice(sep + 2);
        const dataLine = frame
          .split('\n')
          .find((line) => line.startsWith('data:'));
        if (!dataLine) continue;
        const json = dataLine.slice(5).trim();
        if (!json) continue;
        try {
          onChunk(JSON.parse(json));
        } catch (parseErr) {
          // Bad frame -- log and continue rather than killing the stream.
          console.warn('[streamSse] failed to parse frame:', json, parseErr);
        }
      }
    }
  } finally {
    try {
      reader.releaseLock();
    } catch {
      /* already released */
    }
  }
}
