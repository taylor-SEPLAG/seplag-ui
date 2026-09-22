# BarraProporcionalSeplag

Barra segmentada puramente apresentacional para comparar proporções. O consumidor fornece os
valores, as cores e os textos acessíveis; o componente não consulta dados nem conhece regras de
negócio.

```tsx
<BarraProporcionalSeplag
  ariaLabel="Distribuição dos itens"
  total={100}
  segmentos={[
    { id: "processados", valor: 80, cor: "#16a34a", titulo: "80 processados" },
    { id: "erros", valor: 20, cor: "#dc2626", titulo: "20 com erro" },
  ]}
/>
```

Quando `total` é maior que a soma dos segmentos, a parcela restante mantém `corFundo`. Valores
negativos, infinitos ou `NaN` não são renderizados.
