type ToastProps = { message: string; open: boolean };

// The visible text stays while it fades out, so only the hidden copy changes
// for screen readers, and that change is what gets announced.
export function Toast({ message, open }: ToastProps) {
  return (
    <div role="status" aria-live="polite" className="toast" data-open={open || undefined}>
      <span aria-hidden>{message}</span>
      <span className="sr-only">{open ? message : ""}</span>
    </div>
  );
}
