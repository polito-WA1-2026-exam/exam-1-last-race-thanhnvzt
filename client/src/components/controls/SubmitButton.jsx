export function SubmitButton({
  children,
  className = '',
  disabled = false,
  isSubmitting = false,
  loadingLabel = 'Submitting...',
  type = 'submit',
  ...props
}) {
  const buttonClassName = ['primary-button', className].filter(Boolean).join(' ');

  return (
    <button
      {...props}
      className={buttonClassName}
      type={type}
      disabled={disabled || isSubmitting}
    >
      {isSubmitting ? loadingLabel : children}
    </button>
  );
}
