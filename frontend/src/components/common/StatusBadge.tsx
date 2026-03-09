type StatusBadgeProps = {
  label: string;
  tone?: "default" | "success" | "warning" | "danger";
};

export default function StatusBadge({
  label,
  tone = "default",
}: StatusBadgeProps) {
  return <span className={`badge badge-${tone}`}>{label}</span>;
}
