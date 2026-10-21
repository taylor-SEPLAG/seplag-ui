import './dashboardTema.css';

export const coresDashboard = {
  ativo: 'var(--dv-ativo)',
  encerrado: 'var(--dv-encerrado)',
  destaque: 'var(--dv-destaque)',
  trilha: 'var(--dv-trilha)',
  categoria: 'var(--dv-categoria)',
  naoInformado: 'var(--dv-nao-informado)',
};
export const coresCategorias = [
  coresDashboard.categoria,
  'var(--dv-categoria-2)',
  'var(--dv-categoria-3)',
  'var(--dv-categoria-4)',
  'var(--dv-categoria-5)',
  'var(--dv-categoria-6)',
];
export function corCategoria(nome: string, indice: number) {
  return nome.trim().toLocaleLowerCase('pt-BR') === 'não informado'
    ? coresDashboard.naoInformado
    : coresCategorias[indice % coresCategorias.length];
}

export function corSexo(nome: string) {
  switch (nome.trim().toLocaleLowerCase('pt-BR')) {
    case 'feminino': return 'var(--dv-sexo-feminino)';
    case 'masculino': return 'var(--dv-sexo-masculino)';
    case 'não informado': return coresDashboard.naoInformado;
    default: return coresDashboard.categoria;
  }
}
