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
      {label && <span className="mb-1.5 block text-[13px] font-bold text-asphalt">{label}</span>}
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        className={`w-full rounded-xl border bg-paper-dim px-4 py-3.5 font-body text-[15px] font-medium text-asphalt placeholder:text-slate/60 transition-[border-color,background-color,box-shadow] duration-200 ease-(--ease-in-out) focus:border-danfo focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky/20 ${
          error ? 'border-alert bg-alert-soft/40' : 'border-transparent'
        }`}
        {...rest}
      />
      {error && <span className="mt-1.5 block text-xs font-semibold text-alert">{error}</span>}
    </label>
  );
}
