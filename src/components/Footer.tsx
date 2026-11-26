export function Footer({ texto }: { texto?: string }) {
  if (!texto?.trim()) return null;
  return (
    <footer className="rodape">
      <p className="container">{texto}</p>
    </footer>
  );
}
