// Listas de domínio estáticas que alimentam o cadastro de Locais.
import { CIDADES_POR_UF } from "./cidadesPorUf";

export const ESTADOS_BRASIL = [
 { label:"Acre-AC", value:"AC" },
 { label:"Alagoas-AL", value:"AL" },
 { label:"Amapá-AP", value:"AP" },
 { label:"Amazonas-AM", value:"AM" },
 { label:"Bahia-BA", value:"BA" },
 { label:"Ceará-CE", value:"CE" },
 { label:"Distrito Federal-DF", value:"DF" },
 { label:"Espírito Santo-ES", value:"ES" },
 { label:"Goiás-GO", value:"GO" },
 { label:"Maranhão-MA", value:"MA" },
 { label:"Mato Grosso-MT", value:"MT" },
 { label:"Mato Grosso do Sul-MS", value:"MS" },
 { label:"Minas Gerais-MG", value:"MG" },
 { label:"Pará-PA", value:"PA" },
 { label:"Paraíba-PB", value:"PB" },
 { label:"Paraná-PR", value:"PR" },
 { label:"Pernambuco-PE", value:"PE" },
 { label:"Piauí-PI", value:"PI" },
 { label:"Rio de Janeiro-RJ", value:"RJ" },
 { label:"Rio Grande do Norte-RN", value:"RN" },
 { label:"Rio Grande do Sul-RS", value:"RS" },
 { label:"Rondônia-RO", value:"RO" },
 { label:"Roraima-RR", value:"RR" },
 { label:"Santa Catarina-SC", value:"SC" },
 { label:"São Paulo-SP", value:"SP" },
 { label:"Sergipe-SE", value:"SE" },
 { label:"Tocantins-TO", value:"TO" },
] as const;

export function cidadesPorEstado(uf?:string) {
 if (!uf) return [];
 return CIDADES_POR_UF[uf] ?? [];
}

// Todas as cidades do Brasil, já identificadas com a UF (ex.: "Abadia de Goiás/GO") — usada em
// filtros que não têm um seletor de Estado separado, já que nomes de cidade se repetem entre UFs.
export const CIDADES_COM_UF = Object.entries(CIDADES_POR_UF)
 .flatMap(([uf, cidades]) => cidades.map((cidade) => ({ label:`${cidade.label}/${uf}`, value:`${cidade.value}/${uf}` })))
 .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
