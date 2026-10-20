import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowUpRight } from 'lucide-react';
import type { IMenuSeplag } from '../Config/menu';
import './globalSearch.css';

export function indexarFuncionalidades(items: IMenuSeplag[], caminho: string[] = []): {nome:string;rota:string;contexto:string}[] {
  return items.flatMap(item => {
    if (!item.label || item.disabled || item.visibleOnMenu === false || item.visibleOnRouter === false) return [];
    const pais = [...caminho,item.label];
    return [
      ...(item.to && item.to !== '#' ? [{nome:item.label,rota:item.to,contexto:caminho.join(' › ')}] : []),
      ...indexarFuncionalidades(item.items ?? [],pais),
    ];
  });
}
const normalizar = (texto:string) => texto.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR');

export function GlobalSearch({items}:{items:IMenuSeplag[]}) {
  const [query,setQuery]=useState('');
  const [aberto,setAberto]=useState(false);
  const [selecionado,setSelecionado]=useState(0);
  const [mobile,setMobile]=useState(false);
  const input=useRef<HTMLInputElement>(null);
  const id=useId();
  const navigate=useNavigate();
  useEffect(()=>{if(mobile)input.current?.focus();},[mobile]);
  const indice=useMemo(()=>indexarFuncionalidades(items),[items]);
  const termos=normalizar(query.trim()).split(/\s+/).filter(Boolean);
  const resultados=termos.length ? indice.filter(item=>termos.every(t=>normalizar(item.nome+' '+item.contexto).includes(t))).filter((item,i,lista)=>lista.findIndex(outro=>outro.rota===item.rota)===i).slice(0,8) : [];
  const visivel=aberto && termos.length>0;
  const escolher=(rota:string)=>{setAberto(false);setMobile(false);setQuery('');navigate(rota);input.current?.blur();};
  return <div className={`sigep-global-search${mobile?' is-mobile-open':''}`} onBlur={event=>{
    if(!event.currentTarget.contains(event.relatedTarget as Node|null)){setAberto(false);setMobile(false);}
  }}>
    <button type="button" className="sigep-search-mobile-button" aria-label="Pesquisar funcionalidades" onClick={()=>{setMobile(true);input.current?.focus();}}><Search size={19} aria-hidden="true"/></button>
    <label className="sigep-search-field">
      <Search size={18} aria-hidden="true"/>
      <input ref={input} role="combobox" aria-label="Buscar funcionalidade" placeholder="Buscar funcionalidade..." autoComplete="off"
        aria-expanded={visivel} aria-controls={`${id}-resultados`} aria-autocomplete="list"
        aria-activedescendant={visivel && resultados[selecionado] ? `${id}-${selecionado}`:undefined}
        value={query} onFocus={()=>setAberto(true)} onChange={event=>{setQuery(event.target.value);setSelecionado(0);setAberto(true);}}
        onKeyDown={event=>{
          if(event.key==='Escape'){event.preventDefault();event.stopPropagation();setAberto(false);setMobile(false);input.current?.blur();}
          if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();setAberto(true);setSelecionado(atual=>resultados.length ? (atual+(event.key==='ArrowDown'?1:-1)+resultados.length)%resultados.length : 0);}
          if(event.key==='Enter'&&visivel&&resultados[selecionado]){event.preventDefault();escolher(resultados[selecionado].rota);}
        }}/>
    </label>
    {visivel && <div className="sigep-search-results">
      <ul role="listbox" id={`${id}-resultados`} aria-label="Funcionalidades encontradas">
        {resultados.map((item,i)=><li role="option" aria-selected={selecionado===i} id={`${id}-${i}`} key={item.rota}
          onMouseDown={event=>event.preventDefault()} onMouseEnter={()=>setSelecionado(i)} onClick={()=>escolher(item.rota)}>
          <span><strong>{item.nome}</strong>{item.contexto&&<small>{item.contexto}</small>}</span><ArrowUpRight size={16} aria-hidden="true"/>
        </li>)}
      </ul>
      {!resultados.length&&<div className="sigep-search-empty" role="status">Nenhuma funcionalidade encontrada.</div>}
    </div>}
  </div>;
}
