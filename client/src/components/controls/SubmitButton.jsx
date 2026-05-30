export function SubmitButton({ children, ...props }) {
  return (
    <button className="primary-button" type="submit" {...props}>
      {children}
    </button>
  );
}
