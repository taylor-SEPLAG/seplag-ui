import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { DropdownFieldSeplag } from "../Fields/DropdownField";
import { TabelaEditavelSeplag, type ColunaTabelaEditavelSeplag } from "./index";

/**
 * Isola o efeito da identidade da coluna sobre o estado interno dos widgets das células —
 * aquele que NÃO passa pelo formulário: painel aberto do Dropdown, texto do filtro, foco.
 *
 * Como `id` é uma string livre, dá para simular chave por índice passando ids posicionais
 * (`col-0`, `col-1`, ...), sem precisar alterar o componente. As duas montagens abaixo são
 * idênticas em tudo, menos nisso.
 */

interface Linha {
  id: number;
  nome: string;
}

const LINHAS: Linha[] = [{ id: 1, nome: "SEMA" }];

const ORGAOS = [
  { id: 1, nome: "SEMA" },
  { id: 2, nome: "SEPLAG" },
  { id: 3, nome: "SEFAZ" },
];

const colunaDropdown: Omit<ColunaTabelaEditavelSeplag<Linha>, "id"> = {
  header: "Órgão",
  body: () => (
    <DropdownFieldSeplag
      name="orgaoId"
      options={ORGAOS}
      optionLabel="nome"
      optionValue="id"
      value={null}
      onChange={() => undefined}
      semMoldura
    />
  ),
};

const colunaTexto: Omit<ColunaTabelaEditavelSeplag<Linha>, "id"> = {
  header: "Nome",
  field: "nome",
};

const colunaExtra: Omit<ColunaTabelaEditavelSeplag<Linha>, "id"> = {
  header: "Ações",
  body: () => <span>ação</span>,
};

/**
 * `identidade: "semantica"` → ids fixos por papel da coluna (o que o componente exige hoje).
 * `identidade: "posicional"` → ids derivados da posição, equivalente a `key={index}`.
 */
function Harness({ identidade }: { readonly identidade: "semantica" | "posicional" }) {
  const [comExtra, setComExtra] = useState(false);

  const base = comExtra
    ? [
        { ...colunaExtra, papel: "acoes" },
        { ...colunaDropdown, papel: "orgao" },
        { ...colunaTexto, papel: "nome" },
      ]
    : [
        { ...colunaDropdown, papel: "orgao" },
        { ...colunaTexto, papel: "nome" },
      ];

  const columns: ColunaTabelaEditavelSeplag<Linha>[] = base.map((coluna, indice) => ({
    ...coluna,
    id: identidade === "semantica" ? coluna.papel : `col-${indice}`,
  }));

  return (
    <>
      <button type="button" onClick={() => setComExtra(true)}>
        Inserir coluna à esquerda
      </button>
      <TabelaEditavelSeplag id="t" items={LINHAS} getKey={(l) => l.id} columns={columns} />
    </>
  );
}

const painelAberto = () => document.querySelector(".p-dropdown-panel") !== null;

describe("TabelaEditavelSeplag — identidade da coluna e estado interno das células", () => {
  it("com id semântico, inserir uma coluna à esquerda preserva o painel aberto", async () => {
    const user = userEvent.setup();
    render(<Harness identidade="semantica" />);

    await user.click(screen.getByTestId("orgaoId"));
    expect(painelAberto()).toBe(true);

    await user.click(screen.getByRole("button", { name: "Inserir coluna à esquerda" }));

    expect(painelAberto()).toBe(true);
  });

  it("com id posicional, a mesma inserção destrói a célula e fecha o painel", async () => {
    const user = userEvent.setup();
    render(<Harness identidade="posicional" />);

    await user.click(screen.getByTestId("orgaoId"));
    expect(painelAberto()).toBe(true);

    await user.click(screen.getByRole("button", { name: "Inserir coluna à esquerda" }));

    // A coluna do dropdown saiu de `col-0` para `col-1`: o React casa `col-0` antigo com o
    // novo (que agora é "Ações") e desmonta o Dropdown; em `col-1` monta um Dropdown novo,
    // fechado. O valor do campo sobreviveria — este estado, não.
    expect(painelAberto()).toBe(false);
  });

  it("as duas montagens renderizam a mesma tabela — só a identidade difere", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<Harness identidade="semantica" />);
    await user.click(screen.getByRole("button", { name: "Inserir coluna à esquerda" }));
    const semantica = screen.getAllByRole("columnheader").map((th) => th.textContent);
    unmount();

    render(<Harness identidade="posicional" />);
    await user.click(screen.getByRole("button", { name: "Inserir coluna à esquerda" }));
    const posicional = screen.getAllByRole("columnheader").map((th) => th.textContent);

    expect(semantica).toEqual(posicional);
    expect(semantica).toEqual(["Ações", "Órgão", "Nome"]);
  });
});
