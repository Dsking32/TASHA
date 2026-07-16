export default function Field({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  required = false,
  autoComplete,
  ...rest
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-body text-[13px] font-semibold text-slate">
        {label}
      </span>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        className={`w-full rounded-2xl border-2 bg-white px-4 py-3 font-body text-[15px] text-asphalt placeholder:text-slate/50 focus:border-danfo focus:outline-none focus:ring-4 focus:ring-danfo/10 ${
          error ? 'border-alert' : 'border-asphalt/10'
        }`}
        {...rest}
      />
      {error && <span className="mt-1 block text-xs text-alert">{error}</span>}
    </label>
  );
}
