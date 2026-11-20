const variants = {
  // Pink is the single highlight colour — reserved for the main action on a screen.
  primary:
    'bg-rose text-white hover:bg-rose-dark hover:-translate-y-px disabled:bg-rose/50',
  dark:
    'bg-asphalt text-paper hover:bg-asphalt-soft hover:-translate-y-px disabled:bg-asphalt/50',
  ghost:
    'bg-transparent text-asphalt border border-asphalt/15 hover:bg-asphalt/5 hover:border-asphalt/30 disabled:opacity-50',
  'ghost-dark':
    'bg-transparent text-paper border border-paper/30 hover:bg-paper/10 hover:border-paper/60 disabled:opacity-50',
  danger:
    'bg-alert text-white hover:bg-alert/90 disabled:bg-alert/50',
};

const sizes = {
  sm: 'px-4 py-2 text-xs gap-1.5',
  md: 'px-6 py-3 text-sm gap-2',
  lg: 'px-8 py-4 text-base gap-2.5',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
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
      className={`inline-flex cursor-pointer items-center justify-center rounded-full font-display font-bold transition-[background-color,border-color,transform] duration-200 ease-(--ease-out) active:scale-[0.98] disabled:cursor-not-allowed disabled:active:scale-100 disabled:hover:translate-y-0 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}
