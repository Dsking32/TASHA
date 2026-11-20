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
//
// Callers must never trust "success" here and always re-verify with the
// backend (BookingDetail.jsx does this).

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
 * The caller must re-verify with the backend after onSuccess — this helper
 * never decides whether a payment went through.
 *
 * There is deliberately no "window regained focus" fallback: on phones,
 * switching to a bank app for transfer/USSD fires focus before the money is
 * sent, which used to trigger verification mid-payment.
 *
 * @param {Object} params
 * @param {string} params.accessCode - access_code from initiatePayment.
 * @param {() => void} params.onSuccess - Paystack says the charge went through.
 * @param {() => void} [params.onClose] - popup closed without paying.
 * @param {(err: Error) => void} [params.onError] - popup could not open.
 */
export async function openPaystackPopup({ accessCode, onSuccess, onClose, onError }) {
  if (!accessCode) {
    onError?.(new Error('Missing Paystack access code.'));
    return;
  }

  let settled = false;
  const once = (fn) => (...args) => {
    if (settled) return;
    settled = true;
    fn?.(...args);
  };

  try {
    const PaystackPop = await loadPaystackScript();
    const popup = new PaystackPop();

    popup.resumeTransaction(accessCode, {
      onSuccess: once(onSuccess),
      onCancel: once(onClose),
      onError: once((err) => {
        console.error('[Paystack] transaction error:', err);
        onClose?.();
      }),
    });
  } catch (err) {
    onError?.(err instanceof Error ? err : new Error(String(err)));
  }
}
