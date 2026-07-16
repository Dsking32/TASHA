// Paystack inline popup helper.
//
// The backend already initializes the transaction server-side and hands us
// an `access_code` (Paystack Standard/inline "resume" pattern) — so we never
// send email/amount from the frontend, we just resume the existing
// transaction in a popup using that code.
//
// Paystack's inline callback behaviour has varied across SDK versions, so
// this is written defensively:
//   - it loads the inline script once and caches the promise
//   - it wires up onSuccess/onClose/onError as much as the SDK supports
//   - it ALSO falls back to a window-focus listener, so if the popup closes
//     (payment done or cancelled) without an event ever firing, we still
//     call onSettled and let the backend verification decide what happened.
//
// onSettled is intentionally the *only* signal exposed to callers — the
// caller should never trust "success" here and must re-verify with the
// backend (BookingDetail.jsx already does this).

// v2 is required here — v1's PaystackPop.setup() only knows how to start a
// brand-new transaction (it demands email/amount directly). Resuming a
// transaction that was already initialized server-side via access_code is
// a v2-only capability: new PaystackPop().resumeTransaction(accessCode).
const PAYSTACK_SRC = 'https://js.paystack.co/v2/inline.js';

let scriptPromise = null;

function loadPaystackScript() {
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.PaystackPop) {
      resolve(window.PaystackPop);
      return;
    }

    const existing = document.querySelector(`script[src="${PAYSTACK_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(window.PaystackPop));
      existing.addEventListener('error', () =>
        reject(new Error('Failed to load Paystack.'))
      );
      return;
    }

    const script = document.createElement('script');
    script.src = PAYSTACK_SRC;
    script.async = true;
    script.onload = () => {
      if (window.PaystackPop) {
        resolve(window.PaystackPop);
      } else {
        reject(new Error('Paystack script loaded but PaystackPop is unavailable.'));
      }
    };
    script.onerror = () => reject(new Error('Failed to load Paystack.'));
    document.body.appendChild(script);
  });

  return scriptPromise;
}

/**
 * Open the Paystack popup to resume an already-initialized transaction.
 *
 * @param {Object} params
 * @param {string} params.accessCode - access_code returned by the backend's
 *   initiatePayment call.
 * @param {() => void} params.onSettled - called exactly once, whenever the
 *   popup is done (success, close, or error). The caller is responsible for
 *   re-checking payment status with the backend — this callback carries no
 *   success/failure info on purpose.
 * @param {(err: Error) => void} [params.onError] - called if the popup
 *   itself could not be opened at all (e.g. script failed to load).
 */
export async function openPaystackPopup({ accessCode, onSettled, onError }) {
  if (!accessCode) {
    onError?.(new Error('Missing Paystack access code.'));
    return;
  }

  let settled = false;
  const settleOnce = () => {
    if (settled) return;
    settled = true;
    cleanupFocusFallback();
    onSettled?.();
  };

  // Fallback: if the user closes/completes the popup in a way that doesn't
  // fire any SDK callback, the browser tab regains focus. Treat that as
  // "something happened, go verify" — but debounce briefly so it doesn't
  // race the SDK's own callback firing first.
  let focusTimer = null;
  const onWindowFocus = () => {
    focusTimer = setTimeout(settleOnce, 400);
  };
  const cleanupFocusFallback = () => {
    if (focusTimer) clearTimeout(focusTimer);
    window.removeEventListener('focus', onWindowFocus);
  };

  try {
    const PaystackPop = await loadPaystackScript();
    const popup = new PaystackPop();

    window.addEventListener('focus', onWindowFocus);

    popup.resumeTransaction(accessCode, {
      onSuccess: settleOnce,
      onCancel: settleOnce,
      onClose: settleOnce,
      onError: (err) => {
        // A rejected/failed transaction still counts as "settled" — the
        // caller re-verifies with the backend either way.
        settleOnce();
        console.error('[Paystack] transaction error:', err);
      },
    });
  } catch (err) {
    cleanupFocusFallback();
    onError?.(err instanceof Error ? err : new Error(String(err)));
  }
}