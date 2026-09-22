# BreadcrumbSeplag

Trilha de navegação hierárquica (`Cadastro / Setores / ...`). Renderiza semântica `nav > ol > li`, com o último item marcado como página atual (`aria-current="page"`).

## Props

| Prop        | Tipo                    | Obrigatório | Descrição                                              |
| ----------- | ----------------------- | ----------- | -------------------------------------------------------- |
| `items`     | `BreadcrumbItemSeplag[]`| Sim         | Itens da trilha, do nível mais alto ao atual.             |
| `className` | `string`                | Não         | Classes adicionais no `<nav>`.                            |
| `style`     | `CSSProperties`         | Não         | Estilo inline adicional no `<nav>`.                       |

### `BreadcrumbItemSeplag`

| Prop      | Tipo         | Descrição                                                                 |
| --------- | ------------ | -------------------------------------------------------------------------- |
| `label`   | `string`     | Texto exibido.                                                             |
| `href`    | `string`     | Opcional. Renderiza o item como `<a>`.                                     |
| `onClick` | `() => void` | Opcional. Renderiza o item como elemento interativo acessível via teclado. |

O **último item da lista é sempre tratado como a página atual**: nunca é renderizado como link, mesmo que tenha `href`/`onClick`.

## Uso

```tsx
<BreadcrumbSeplag
  items={[
    { label: "Cadastro", onClick: () => navigate("/app/cadastro") },
    { label: "Setores" },
  ]}
/>
```

## Decisões de arquitetura

- **Sem dependência de React Router.** A biblioteca não sabe nada sobre rotas — a aplicação decide como navegar (`href` para link real, `onClick` para navegação via `useNavigate` ou outro mecanismo). Isso evita acoplar a Seplag UI ao roteador da aplicação consumidora.
- **API por `items`**, no mesmo espírito do `TabsSeplag` — cada tela fornece explicitamente sua própria trilha (rótulos + navegação), sem tentar derivar automaticamente segmentos a partir da URL ou do menu.
- **Separador `pi pi-angle-right`** (PrimeIcons), consistente com o restante da biblioteca.

## Débitos técnicos / evolução futura

- Não há truncamento/colapso de itens em telas muito estreitas (ex.: `Cadastro / ... / Setores`). Pode ser necessário se trilhas muito longas aparecerem.
- Não há suporte a ícone por item. Pode ser adicionado como `icon?: string` seguindo o padrão do `TabItemSeplag`, se necessário.
- Não há integração automática com `menuGlobal`/rotas. Caso surja necessidade recorrente de gerar a trilha a partir do menu, considerar um hook na aplicação (não na lib) que converta `IMenuSeplag` + rota ativa em `BreadcrumbItemSeplag[]`.
