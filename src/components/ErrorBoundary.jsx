import { Component } from 'react';

/**
 * Without this, any uncaught error anywhere in the component tree
 * unmounts the entire app to a blank white page with zero explanation —
 * a genuinely bad experience for something handling real payments.
 * This catches render-time errors and shows a recoverable screen instead.
 *
 * Note: this does NOT catch errors inside async code (fetch handlers,
 * setTimeout, event handlers) — those are already handled per-page with
 * try/catch. This is specifically the last line of defense for render bugs.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // In a real deploy, this is the spot to send to an error-tracking
    // service (Sentry, etc). Left as console.error so it's at least
    // visible during development and QA.
    console.error('[TashaXpress] Unhandled render error:', error, info);
  }

  handleReload = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-6 text-center">
          <h1 className="font-display text-2xl font-bold text-asphalt">
            Something went wrong
          </h1>
          <p className="mt-3 max-w-sm font-mono text-sm text-slate">
            This screen hit an unexpected error. Your booking and payment
            data are safe — this is just a display issue.
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            className="mt-6 cursor-pointer rounded-full bg-asphalt px-6 py-3 font-display text-sm font-semibold text-paper"
          >
            Back to homepage
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
