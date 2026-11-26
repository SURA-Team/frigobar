import { Mail, MessageCircle, Phone, PhoneForwarded } from 'lucide-react';
import { linkEmail, linkTelefone, linkWhatsapp } from '../content/format';
import type { Contatos } from '../content/schema';

const ICONE = { size: 18, 'aria-hidden': true, focusable: false } as const;

/** Contatos opcionais: só os preenchidos aparecem; sem nenhum, o bloco some (FR-008a). */
export function ContactBlock({ contatos }: { contatos: Contatos }) {
  const { telefone, whatsapp, email, ramal } = contatos;
  if (!telefone && !whatsapp && !email && !ramal) return null;

  return (
    <section className="contatos container" aria-labelledby="contatos-titulo">
      <h2 id="contatos-titulo" className="contatos__titulo">
        Fale com a recepção
      </h2>
      <ul className="contatos__lista">
        {whatsapp && (
          <li>
            <a
              className="botao"
              href={linkWhatsapp(whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle {...ICONE} />
              Conversar no WhatsApp
            </a>
          </li>
        )}
        {telefone && (
          <li>
            <a className="botao" href={linkTelefone(telefone)}>
              <Phone {...ICONE} />
              Ligar para a recepção
            </a>
          </li>
        )}
        {email && (
          <li>
            <a className="botao" href={linkEmail(email)}>
              <Mail {...ICONE} />
              Enviar e-mail
            </a>
          </li>
        )}
        {ramal && (
          <li className="contatos__ramal">
            <PhoneForwarded {...ICONE} />
            <span>
              Do telefone do quarto, disque o ramal <strong>{ramal}</strong>
            </span>
          </li>
        )}
      </ul>
    </section>
  );
}
