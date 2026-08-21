export function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="fit-card px-2 py-3 flex flex-col items-center">
      {/* Değer okunması gereken şey: etiketten belirgin biçimde büyük */}
      <span className="font-mono text-body">{value}</span>
      <span className="text-muted text-center text-micro" style={{ marginTop: "3px" }}>
        {label}
      </span>
    </div>
  );
}
