export function IconButton({ label, ...props }) {
  return (
    <button type="button" aria-label={label} title={label} {...props}>
      {label}
    </button>
  );
}
