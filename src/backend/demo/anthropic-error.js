// Anthropic error classifier.
// Pure function: returns 'workspace_cap' | 'transient' | 'unknown'.
//
// Workspace-cap pattern (verified empirically via Anthropic public
// GitHub issue 55998 and the Rate Limits docs):
//   HTTP status: 400
//   error.type:  'invalid_request_error'
//   message:     contains the literal phrase 'workspace API usage limits'
//
// Transient pattern: any 5xx, any rate-limit (429), or network-level
// failures (no response shape).

const WORKSPACE_CAP_PHRASE = 'workspace API usage limits';

/**
 * @param {unknown} err — caught from the Anthropic SDK or fetch wrapper.
 * @returns {'workspace_cap' | 'transient' | 'unknown'}
 */
export function classifyError(err) {
  if (!err || typeof err !== 'object') return 'unknown';

  // SDK-style error shape: err.status, err.error.type, err.error.message
  const status = err.status ?? err.response?.status;
  const errorType = err.error?.type ?? err.body?.error?.type;
  const message = err.error?.message ?? err.body?.error?.message ?? err.message ?? '';

  if (
    status === 400 &&
    errorType === 'invalid_request_error' &&
    typeof message === 'string' &&
    message.includes(WORKSPACE_CAP_PHRASE)
  ) {
    return 'workspace_cap';
  }

  if (typeof status === 'number' && (status >= 500 || status === 429)) {
    return 'transient';
  }

  // Network-level failure (no status, e.g. ECONNRESET, fetch threw).
  if (status === undefined) {
    return 'transient';
  }

  return 'unknown';
}

export default classifyError;
