# `NotFound/` — NotFoundSeplag

## Objetivo

Página de erro 404 institucional, com painel de identidade visual do Governo do Estado de
Mato Grosso, exibição da rota não encontrada e ações de retorno.

## Responsabilidade principal

Padronizar a resposta a rotas inexistentes em todos os sistemas SEPLAG.

## Ponto de entrada

[`NotFound.tsx`](./NotFound.tsx) — 92 linhas.

```ts
export { NotFoundSeplag } from "./NotFound/NotFound";
export type { NotFoundSeplagProps } from "./NotFound/NotFound";
```

## Funcionalidades existentes

### Props

| Prop | Default | Papel |
| --- | --- | --- |
| `homeRoute` | `"/"` | Destino do botão "Ir para o início" |
| `sistemaLabel` | `"Governo do Estado de Mato Grosso · SEPLAG"` | Texto do topo do painel |
| `orgaoLabel` | `SEPLAG_NOME_ORGAO_SEPLAG` | Texto institucional do rodapé do painel |

### Estrutura

```
<div class={layout}>                       ← duas colunas
  <aside class={panel}>                    ← painel institucional (azul)
    <img brasão aria-hidden>
    <div class={panelTop}>  ● {sistemaLabel}
    <div class={panelMid}>  404 / régua / "O endereço solicitado não foi encontrado."
    <p   class={panelBottom}> {orgaoLabel}
  </aside>

  <main class={content}>
    <p class={eyebrow}>  ⚠ Erro 404
    <h1>Não conseguimos localizar esta página.</h1>
    <p>O link pode ter sido movido, removido ou digitado incorretamente...</p>
    <div class={path}>   › segmento / segmento / segmento     ← só se houver segmentos
    <div class={actions}>
      <BotaoSeplag variant="back" label="Voltar"          onClick={() => navigate(-1)}>
      <BotaoSeplag variant="save" label="Ir para o início" onClick={() => navigate(homeRoute)}>
  </main>
</div>
```

### Trilha da rota

```ts
const segmentosRota = location.pathname.split("/").filter(Boolean);
```

Renderiza cada segmento separado por `/`, dando ao usuário (e ao suporte) a informação exata
do endereço tentado. O bloco é omitido quando a rota é a raiz.

## Dependências

### Externas
- `react-router-dom` — `useNavigate`, `useLocation` (**exige Router no host**)

### Internas
- [`../Botao`](../Botao/) — `BotaoSeplag` (variantes `back` e `save`)
- [`../layout/Config/institucional`](../layout/Config/institucional.ts) — `SEPLAG_NOME_ORGAO_SEPLAG`
- `../../assets/img/Logo_Branco_Estado_MT.png` — brasão
- [`NotFound.module.css`](./NotFound.module.css) — 15 classes escopadas

## Módulos relacionados

| Módulo | Relação |
| --- | --- |
| [`layout/Config/institucional`](../layout/Config/institucional.ts) | Fonte compartilhada do texto do órgão — o comentário no arquivo diz que existe "para evitar divergência de redação" entre o rodapé do layout e a página 404 |
| [`PermissaoNegadaRedirect`](../PermissaoNegadaRedirect/) | Cobre o caso **403** (rota existe, mas o usuário não tem permissão) |
| [`layout/`](../layout/) | A 404 é tipicamente registrada como rota filha do `LayoutSeplag` |

## Fluxos importantes

```tsx
<Routes>
  <Route element={<LayoutSeplag ...>}>
    <Route path="/servidores" element={<Servidores />} />
    {/* ... */}
    <Route path="*" element={<NotFoundSeplag homeRoute="/inicio" />} />
  </Route>
</Routes>
```

Duas saídas possíveis:
- **"Voltar"** → `navigate(-1)` — volta no histórico do navegador
- **"Ir para o início"** → `navigate(homeRoute)` — rota inicial do sistema

## Arquivos críticos

- [`NotFound.tsx`](./NotFound.tsx) — arquivo único.
- [`NotFound.module.css`](./NotFound.module.css) — todo o layout visual da página.

## Observações técnicas e débitos identificados

| Severidade | Item | Detalhe |
| --- | --- | --- |
| Baixa | **`navigate(-1)` pode não sair da 404** | Se o usuário chegou por link direto (sem histórico anterior na aplicação), `navigate(-1)` sai do site ou não faz nada. Não há verificação de `window.history.length`. |
| Baixa | **Textos fixos** | Título, subtítulo e "Erro 404" são literais; apenas `sistemaLabel`, `orgaoLabel` e `homeRoute` são configuráveis. Rótulos dos botões também não são props. |
| Baixa | **`key` por índice na trilha** | `key={`${segmento}-${indice}`}` — aceitável para lista estática derivada da URL. |
| Baixa | **Sem `<h1>` único garantido** | O componente declara um `<h1>`; se o `LayoutSeplag` já contiver outro, haverá dois na página. |
| Baixa | **Sem estado de "rota protegida"** | Não distingue "não existe" de "existe mas sem permissão" — para isso use [`PermissaoNegadaRedirectSeplag`](../PermissaoNegadaRedirect/). |
| Baixa | **Sem testes** | Sem cobertura. |
| Positivo | **Bom uso de CSS Module** | Todo o estilo está escopado em `NotFound.module.css`, sem literais de cor inline no TSX — um dos componentes mais bem organizados nesse aspecto. |

## Documentos relacionados

- [Arquitetura da biblioteca](../../../docs/arquitetura-da-biblioteca-de-componentes.md) — §5.3
- [`layout/README.md`](../layout/README.md) · [`PermissaoNegadaRedirect/README.md`](../PermissaoNegadaRedirect/README.md)
