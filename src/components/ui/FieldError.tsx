interface FieldErrorProps {
  message?: string;
}

/** Inline validation message shown under a form field. */
export function FieldError({ message }: FieldErrorProps) {
  if (!message) return null;
  return <div className="text-xs text-red-600 mt-1">{message}</div>;
}
