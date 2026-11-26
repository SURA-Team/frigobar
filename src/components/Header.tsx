import type { Site } from '../content/schema';
import { Picture } from '../images/Picture';

export function Header({ site }: { site: Site }) {
  return (
    <header className="cabecalho">
      {site.fotoCapa && (
        <div className="cabecalho__capa" aria-hidden="true">
          <Picture src={site.fotoCapa} alt="" sizes="(max-width: 640px) 100vw, 640px" prioridade />
        </div>
      )}
      <div className="container cabecalho__conteudo">
        <Picture
          src={site.logo}
          alt={site.nomeHotel}
          className="cabecalho__logo"
          sizes="200px"
          prioridade
        />
        <h1 className="cabecalho__nome">{site.nomeHotel}</h1>
        {site.boasVindas && <p className="cabecalho__boas-vindas">{site.boasVindas}</p>}
      </div>
    </header>
  );
}
