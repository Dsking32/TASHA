const variants = {
  primary:
    'bg-danfo text-white shadow-md shadow-danfo/25 hover:bg-danfo-dark hover:shadow-lg hover:shadow-danfo/30 disabled:bg-danfo/50 disabled:shadow-none',
  dark:
    'bg-asphalt text-paper hover:bg-asphalt-soft disabled:bg-asphalt/50',
  ghost:
    'bg-transparent text-asphalt border-2 border-asphalt/15 hover:bg-asphalt/5 hover:border-asphalt/25 disabled:opacity-50',
  'ghost-dark':
    'bg-transparent text-paper border-2 border-paper/25 hover:bg-paper/10 hover:border-paper/50 disabled:opacity-50',
  danger:
    'bg-alert text-white shadow-md shadow-alert/25 hover:bg-alert/90 disabled:bg-alert/50',
};

export default function Button({
  children,
  variant = 'primary',
  className = '',
  loading = false,
  disabled = false,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-full px-6 py-3 font-display font-bold text-sm transition-all duration-200 active:scale-95 disabled:cursor-not-allowed disabled:active:scale-100 ${variants[variant]} ${className}`}
      {...props}
    >
      {loading && (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}
