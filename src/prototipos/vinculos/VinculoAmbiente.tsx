import { type ReactNode } from 'react';
import { PrototypeSystemPage, menuGestaoPessoas } from '../PrototiposPage';
import { USUARIOS_VINCULOS, alternarUsuarioVinculos, useUsuarioVinculos } from './vinculoSessao';

export function VinculoAmbiente({children}: {children:ReactNode}) {
  const usuario = useUsuarioVinculos();
  return <PrototypeSystemPage nomeSistema="GESTÃO DE PESSOAS" ambienteSistema="Teste" menuItems={menuGestaoPessoas}
    nomeApresentacao={usuario?.nome}
    profileExtraActions={<li className="v2v-demo-profile"><label>Usuário de demonstração<select aria-label="Usuário de demonstração" value={usuario?.login || ''} onChange={e => alternarUsuarioVinculos(e.target.value)}><option value="">Usuário atual (acessos existentes)</option>{USUARIOS_VINCULOS.map(u => <option key={u.login} value={u.login}>{u.nome} — {u.perfil} ({u.login})</option>)}</select></label></li>}>
    {children}
  </PrototypeSystemPage>;
}

export function AtalhoPerfisVinculos() {
  const usuario = useUsuarioVinculos();
  const perfil = usuario?.perfil || 'Usuário atual — acessos existentes';
  return <div className="v2v-profile-variation">
    <div className="prototype-ingresso-profile">
      <label>Perfil da variação
        <select aria-label="Perfil da variação" value={usuario?.login || ''} onChange={e => alternarUsuarioVinculos(e.target.value)}>
          <option value="">Usuário atual — acessos existentes</option>
          {USUARIOS_VINCULOS.map(u => <option key={u.login} value={u.login}>{u.perfil}</option>)}
        </select>
      </label>
      <strong>{perfil}</strong>
      <small className="v2v-profile-demo">{usuario ? `Demonstração · ${usuario.nome} · ${usuario.login}` : 'Ambiente de demonstração'}</small>
    </div>
  </div>;
}
