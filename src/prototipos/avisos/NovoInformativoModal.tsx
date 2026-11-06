import type { ArquivoAnexadoSeplag } from "../../componentes/AnexarDocumento";
import { lerDocumento } from "../gestaoLicencas/documentosSolicitacao";
import { useRef, useState, type FormEvent } from "react";
import type { Comunicado } from "./model";
import { ModalSeplag } from "../../componentes/Modal";
import { BotaoSalvarSeplag, BotaoVoltarSeplag } from "../../componentes/Botao";
import {
  atualizarInformativosPaginaInicial,
  listarInformativosPaginaInicial,
} from "../paginaInicial/informativos";

const opcoes = [
  {
    nome: "Alerta",
    icon: "pi pi-exclamation-triangle",
    destaque: "is-warning",
  },
  { nome: "Informação", icon: "pi pi-info-circle", destaque: "is-info" },
  { nome: "Aviso", icon: "pi pi-thumbtack", destaque: "is-pin" },
  { nome: "Importante", icon: "pi pi-star", destaque: "is-warning" },
  { nome: "Atualização", icon: "pi pi-refresh", destaque: "is-update" },
];

export function NovoInformativoModal({
  fechar,
  adicionado,
}: {
  fechar: () => void;
  adicionado: (aviso: Comunicado) => void;
}) {
  const arquivoRef = useRef<HTMLInputElement>(null);
  const [arrastando, setArrastando] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [texto, setTexto] = useState("");
  const [tipo, setTipo] = useState("Informação");
  const [documentos, setDocumentos] = useState<ArquivoAnexadoSeplag[]>([]);
  const [lendo, setLendo] = useState(false);
  const [erro, setErro] = useState("");
  const anexar = async (arquivos: File[]) => {
    if (!arquivos.length || lendo) return;
    setLendo(true);
    setErro("");
    try {
      if (arquivos.some(arquivo => arquivo.size > 2_000_000)) {
        throw new Error("O documento deve ter no máximo 2 MB.");
      }
      const novos = await Promise.all(arquivos.map(lerDocumento));
      setDocumentos((atuais) => [...atuais, ...novos]);
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível anexar os documentos.",
      );
    } finally {
      setLendo(false);
    }
  };
  const salvar = (e: FormEvent) => {
    e.preventDefault();
    if (lendo) return;
    if (!titulo.trim() || !texto.trim()) {
      setErro("Preencha o título e o texto do informativo.");
      return;
    }
    const meta = opcoes.find((o) => o.nome === tipo)!;
    const atuais = listarInformativosPaginaInicial();
    const novo = {
      id: Math.max(0, ...atuais.map((a) => a.id)) + 1,
      documentos,
      titulo: titulo.trim(),
      texto: texto.trim(),
      icon: meta.icon,
      destaque: meta.destaque,
      dataPostagem: new Intl.DateTimeFormat("pt-BR", {
        timeZone: "America/Cuiaba",
      }).format(new Date()),
    };
    atualizarInformativosPaginaInicial([novo, ...atuais]);
    adicionado(novo);
  };
  return (
    <ModalSeplag
      visible
      titulo="Novo Informativo"
      fechar={fechar}
      tamanho="min(620px, 94vw)"
      hideFooter
    >
      <form onSubmit={salvar} className="sigep-novo-informativo">
        {erro && <p role="alert">{erro}</p>}
        <label>
          <span>
            Título{" "}
            <span className="sigep-informativo-obrigatorio" aria-hidden="true">
              *
            </span>
          </span>
          <input
            aria-label="Título"
            autoFocus
            required
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />
        </label>
        <fieldset>
          <legend>Ícone</legend>
          <div className="sigep-informativo-icones">
            {opcoes.map((o) => (
              <button
                key={o.nome}
                type="button"
                aria-pressed={tipo === o.nome}
                onClick={() => setTipo(o.nome)}
              >
                <i className={o.icon} aria-hidden="true" />
                <span>{o.nome}</span>
              </button>
            ))}
          </div>
        </fieldset>
        <label>
          <span>
            Texto{" "}
            <span className="sigep-informativo-obrigatorio" aria-hidden="true">
              *
            </span>
          </span>
          <textarea
            aria-label="Texto"
            required
            rows={4}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
          />
        </label>
        <div className="sigep-informativo-documentos">
          <label htmlFor="informativo-documentos">Documentos (opcional)</label>
          <div
            className={`sigep-informativo-upload${arrastando ? " is-dragging" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              if (!lendo) setArrastando(true);
            }}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node))
                setArrastando(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setArrastando(false);
              void anexar(Array.from(e.dataTransfer.files));
            }}
          >
            <input
              ref={arquivoRef}
              id="informativo-documentos"
              className="sigep-informativo-file-input"
              aria-label="Documentos (opcional)"
              type="file"
              multiple
              accept=".pdf,.doc,.docx"
              disabled={lendo}
              aria-describedby="informativo-anexos-ajuda"
              onChange={(e) => {
                const arquivos = Array.from(e.target.files ?? []);
                e.target.value = "";
                void anexar(arquivos);
              }}
            />
            <button
              type="button"
              className="sigep-informativo-escolher"
              disabled={lendo}
              onClick={() => arquivoRef.current?.click()}
            >
              <i className="pi pi-upload" aria-hidden="true" /> Escolher arquivo
            </button>
            <button
              type="button"
              className="sigep-informativo-soltar"
              disabled={lendo}
              onClick={() => arquivoRef.current?.click()}
            >
              Arraste e solte o arquivo aqui ou clique para selecionar
            </button>
            <small id="informativo-anexos-ajuda">
              Formatos aceitos: PDF, DOC, DOCX (Máx. 2MB)
            </small>
          </div>
        </div>
        {lendo && <p role="status">Carregando documentos...</p>}
        {documentos.length > 0 && (
          <ul className="sigep-informativo-anexos">
            {documentos.map((arquivo, i) => (
              <li key={i}>
                <span>
                  <i className="pi pi-paperclip" aria-hidden="true" />{" "}
                  {arquivo.nome}
                </span>
                <button
                  type="button"
                  aria-label={`Remover ${arquivo.nome}`}
                  onClick={() =>
                    setDocumentos((atuais) =>
                      atuais.filter((_, indice) => indice !== i),
                    )
                  }
                >
                  <i className="pi pi-times" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="sigep-informativo-acoes">
          <BotaoVoltarSeplag type="button" label="Cancelar" onClick={fechar} />
          <BotaoSalvarSeplag
            type="submit"
            label="Adicionar"
            disabled={lendo}
            icon="pi pi-check"
          />
        </div>
      </form>
    </ModalSeplag>
  );
}
