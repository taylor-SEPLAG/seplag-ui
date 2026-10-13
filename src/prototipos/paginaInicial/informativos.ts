// Fonte compartilhada com o Painel Informativo. Mantém os dados demonstrativos originais.
export const informativosIniciais = [
  {
    id: 1,
    icon: "pi pi-exclamation-triangle",
    titulo: "Prazo Final para Ajustes",
    dataPostagem: "15/06/2026",
    texto:
      "Prazo para lançamento de horas extras vence em 15/06/2026 às 23:59. Após essa data, não será possível fazer alterações no sistema.",
    destaque: "is-warning",
  },
  {
    id: 2,
    icon: "pi pi-info-circle",
    titulo: "Processamento em Andamento",
    dataPostagem: "14/06/2026",
    texto:
      "Processamento da folha de junho iniciou em 16/06/2026. Você receberá notificação quando disponível para consulta.",
    destaque: "is-info",
  },
  {
    id: 3,
    icon: "pi pi-thumbtack",
    titulo: "Férias - saldo residual e intervalo mínimo",
    dataPostagem: "09/06/2026",
    texto:
      "O sistema não permitirá mais o registro de gozos que resultem em um saldo final de 5 dias. Verifique suas solicitações pendentes.",
    destaque: "is-pin",
  },
];
let informativos = informativosIniciais;
const ouvintes = new Set<() => void>();
export function assinarInformativos(ouvinte: () => void) {
  ouvintes.add(ouvinte);
  return () => {
    ouvintes.delete(ouvinte);
  };
}
export function listarInformativosPaginaInicial() {
  return informativos;
}
export function atualizarInformativosPaginaInicial(
  itens: typeof informativosIniciais,
) {
  informativos = itens;
  ouvintes.forEach((ouvinte) => ouvinte());
}
