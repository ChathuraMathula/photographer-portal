export function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-body-caption text-red-500">{msg}</p>;
}
