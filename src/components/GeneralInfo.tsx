export function GeneralInfo({ texto }: { texto?: string }) {
  if (!texto?.trim()) return null;
  return (
    <section className="info container" aria-labelledby="info-titulo">
      <h2 id="info-titulo" className="info__titulo">
        Informações
      </h2>
      <p className="info__texto">{texto}</p>
    </section>
  );
}
