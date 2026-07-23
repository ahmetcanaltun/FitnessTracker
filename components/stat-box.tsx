export function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="fit-card px-2 py-3 flex flex-col items-center">
      <span className="font-mono text-sm">{value}</span>
      <span
        className="text-muted text-center"
        style={{ fontSize: "10px", marginTop: "2px" }}
      >
        {label}
      </span>
    </div>
  );
}
