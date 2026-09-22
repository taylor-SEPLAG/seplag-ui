export interface DotacaoComissionadaSalva {
  id: string;
  perfil: string;
  simbologia: string;
  cargos: number;
  funcoes: number;
  extincaoProgressivaCargos?: boolean;
  extincaoProgressivaFuncoes?: boolean;
}

export interface ItemEstruturaComissionadaSalvo {
  id: string;
  /** Código funcional imutável do quadro; é compartilhado por todas as suas versões. */
  codigo?: string;
  nome: string;
  dotacoes: DotacaoComissionadaSalva[];
  subitens: ItemEstruturaComissionadaSalvo[];
}

export interface NivelComissionadoSalvo {
  id: string;
  nome: string;
  itens: ItemEstruturaComissionadaSalvo[];
}

export interface QuadroComissionadoSalvo {
  id: string;
  nome: string;
  orgao: string;
  dataVigencia: string;
  situacao?: "Ativo" | "Extinto" | "Encerrado";
  documentosLegaisIds: string[];
  niveis: NivelComissionadoSalvo[];
  salvoEm: string;
  quadroBaseId?: string;
  versao?: number;
  versaoAnteriorId?: string;
  motivoVersionamento?: string;
  modeloEstruturaVersao?: number;
  versionamentoConfirmado?: boolean;
  versionamentoOrigem?: "fluxo-confirmado-v2";
  versionamentoModelo?: 2;
}

const CHAVE_RASCUNHO = "sigep:quadros-comissionados:rascunho:v1";
const CHAVE_CADASTROS = "sigep:quadros-comissionados:cadastros:v1";
const nivelApoioPolitec: NivelComissionadoSalvo = {
  "id": "politec-apoio",
  "nome": "NÍVEL DE APOIO ESTRATÉGICO E ESPECIALIZADO",
  "itens": [
    {
      "id": "politec-apoio-1",
      "nome": "1. Corregedoria-Geral da POLITEC",
      "dotacoes": [
        {
          "id": "politec-apoio-1-1",
          "perfil": "Corregedor-Geral da POLITEC",
          "simbologia": "DGA-4",
          "cargos": 0,
          "funcoes": 1
        }
      ],
      "subitens": []
    },
    {
      "id": "politec-apoio-2",
      "nome": "2. Ouvidoria da POLITEC",
      "dotacoes": [
        {
          "id": "politec-apoio-2-1",
          "perfil": "Ouvidor",
          "simbologia": "DGA-5",
          "cargos": 0,
          "funcoes": 1
        }
      ],
      "subitens": [
        {
          "id": "politec-apoio-2-1",
          "nome": "2.1. Núcleo de Atendimento ao Cidadão",
          "dotacoes": [
            {
              "id": "politec-apoio-2-1-1",
              "perfil": "Chefe de Núcleo II",
              "simbologia": "DGA-8",
              "cargos": 1,
              "funcoes": 0
            }
          ],
          "subitens": []
        }
      ]
    },
    {
      "id": "politec-apoio-3",
      "nome": "3. Comissão de Ética",
      "dotacoes": [],
      "subitens": []
    },
    {
      "id": "politec-apoio-4",
      "nome": "4. Unidade de Gestão Executiva",
      "dotacoes": [
        {
          "id": "politec-apoio-4-1",
          "perfil": "Chefe de Unidade I",
          "simbologia": "DGA-3",
          "cargos": 1,
          "funcoes": 0
        },
        {
          "id": "politec-apoio-4-2",
          "perfil": "Gestor de Projetos Especializados nível II",
          "simbologia": "DGA-3",
          "cargos": 1,
          "funcoes": 0
        },
        {
          "id": "politec-apoio-4-3",
          "perfil": "Assistente Técnico I",
          "simbologia": "DGA-8",
          "cargos": 1,
          "funcoes": 0
        }
      ],
      "subitens": []
    },
    {
      "id": "politec-apoio-5",
      "nome": "5. Coordenadoria de Inteligência e Segurança Orgânica",
      "dotacoes": [
        {
          "id": "politec-apoio-5-1",
          "perfil": "Coordenador",
          "simbologia": "DGA-5",
          "cargos": 0,
          "funcoes": 1
        },
        {
          "id": "politec-apoio-5-2",
          "perfil": "Agente de Inteligência",
          "simbologia": "DGA-9",
          "cargos": 0,
          "funcoes": 4
        }
      ],
      "subitens": [
        {
          "id": "politec-apoio-5-1",
          "nome": "5.1. Núcleo de Inteligência",
          "dotacoes": [
            {
              "id": "politec-apoio-5-1-1",
              "perfil": "Chefe de Núcleo II",
              "simbologia": "DGA-8",
              "cargos": 0,
              "funcoes": 1
            }
          ],
          "subitens": []
        },
        {
          "id": "politec-apoio-5-2",
          "nome": "5.2. Núcleo de Segurança Orgânica",
          "dotacoes": [
            {
              "id": "politec-apoio-5-2-1",
              "perfil": "Chefe de Núcleo II",
              "simbologia": "DGA-8",
              "cargos": 0,
              "funcoes": 1
            }
          ],
          "subitens": []
        }
      ]
    },
    {
      "id": "politec-apoio-6",
      "nome": "6. Diretoria de Ações Estratégicas",
      "dotacoes": [
        {
          "id": "politec-apoio-6-1",
          "perfil": "Diretor da POLITEC",
          "simbologia": "DGA-4",
          "cargos": 0,
          "funcoes": 1
        },
        {
          "id": "politec-apoio-6-2",
          "perfil": "Assessor Técnico II",
          "simbologia": "DGA-5",
          "cargos": 1,
          "funcoes": 0
        }
      ],
      "subitens": [
        {
          "id": "politec-apoio-6-1",
          "nome": "6.1. Coordenadoria da Academia de Ciências Forenses",
          "dotacoes": [
            {
              "id": "politec-apoio-6-1-1",
              "perfil": "Coordenador",
              "simbologia": "DGA-5",
              "cargos": 0,
              "funcoes": 1
            }
          ],
          "subitens": [
            {
              "id": "politec-apoio-6-1-1",
              "nome": "6.1.1. Gerência de Formação Inicial e Continuada",
              "dotacoes": [
                {
                  "id": "politec-apoio-6-1-1-1",
                  "perfil": "Gerente",
                  "simbologia": "DGA-6",
                  "cargos": 1,
                  "funcoes": 0
                }
              ],
              "subitens": []
            },
            {
              "id": "politec-apoio-6-1-2",
              "nome": "6.1.2. Núcleo de Pesquisa Experimental",
              "dotacoes": [
                {
                  "id": "politec-apoio-6-1-2-1",
                  "perfil": "Chefe de Núcleo II",
                  "simbologia": "DGA-8",
                  "cargos": 0,
                  "funcoes": 1
                }
              ],
              "subitens": []
            },
            {
              "id": "politec-apoio-6-1-3",
              "nome": "6.1.3. Núcleo de Educação Física",
              "dotacoes": [
                {
                  "id": "politec-apoio-6-1-3-1",
                  "perfil": "Chefe de Núcleo II",
                  "simbologia": "DGA-8",
                  "cargos": 1,
                  "funcoes": 0
                }
              ],
              "subitens": []
            }
          ]
        },
        {
          "id": "politec-apoio-6-2",
          "nome": "6.2. Coordenadoria de Planejamento Estratégico",
          "dotacoes": [
            {
              "id": "politec-apoio-6-2-1",
              "perfil": "Coordenador",
              "simbologia": "DGA-5",
              "cargos": 1,
              "funcoes": 0
            }
          ],
          "subitens": [
            {
              "id": "politec-apoio-6-2-1",
              "nome": "6.2.1. Gerência de Projetos e Inovação",
              "dotacoes": [
                {
                  "id": "politec-apoio-6-2-1-1",
                  "perfil": "Gerente",
                  "simbologia": "DGA-6",
                  "cargos": 1,
                  "funcoes": 0
                }
              ],
              "subitens": []
            }
          ]
        },
        {
          "id": "politec-apoio-6-3",
          "nome": "6.3. Coordenadoria de Qualidade",
          "dotacoes": [
            {
              "id": "politec-apoio-6-3-1",
              "perfil": "Coordenador",
              "simbologia": "DGA-5",
              "cargos": 0,
              "funcoes": 1
            },
            {
              "id": "politec-apoio-6-3-2",
              "perfil": "Assistente Técnico I",
              "simbologia": "DGA-8",
              "cargos": 1,
              "funcoes": 0
            }
          ],
          "subitens": [
            {
              "id": "politec-apoio-6-3-1",
              "nome": "6.3.1. Gerência de Certificação de Equipamentos",
              "dotacoes": [
                {
                  "id": "politec-apoio-6-3-1-1",
                  "perfil": "Gerente",
                  "simbologia": "DGA-6",
                  "cargos": 1,
                  "funcoes": 0
                }
              ],
              "subitens": []
            },
            {
              "id": "politec-apoio-6-3-2",
              "nome": "6.3.2. Núcleo de Normas e Procedimentos",
              "dotacoes": [
                {
                  "id": "politec-apoio-6-3-2-1",
                  "perfil": "Chefe de Núcleo II",
                  "simbologia": "DGA-8",
                  "cargos": 1,
                  "funcoes": 0
                }
              ],
              "subitens": []
            },
            {
              "id": "politec-apoio-6-3-3",
              "nome": "6.3.3. Núcleo de Informações Institucionais",
              "dotacoes": [
                {
                  "id": "politec-apoio-6-3-3-1",
                  "perfil": "Chefe de Núcleo II",
                  "simbologia": "DGA-8",
                  "cargos": 1,
                  "funcoes": 0
                }
              ],
              "subitens": []
            }
          ]
        }
      ]
    }
  ]
};

const nivelAssessoramentoPolitec: NivelComissionadoSalvo = {
  "id": "politec-assessoramento",
  "nome": "NÍVEL DE ASSESSORAMENTO SUPERIOR",
  "itens": [
    {
      "id": "politec-assessoramento-1",
      "nome": "1. Gabinete de Direção",
      "dotacoes": [
        {
          "id": "politec-assessoramento-1-1",
          "perfil": "Chefe de Gabinete",
          "simbologia": "DGA-5",
          "cargos": 1,
          "funcoes": 0
        },
        {
          "id": "politec-assessoramento-1-2",
          "perfil": "Assessor Técnico III",
          "simbologia": "DGA-6",
          "cargos": 1,
          "funcoes": 0
        }
      ],
      "subitens": []
    },
    {
      "id": "politec-assessoramento-2",
      "nome": "2. Unidade de Assessoria",
      "dotacoes": [
        {
          "id": "politec-assessoramento-2-1",
          "perfil": "Assessor Técnico III",
          "simbologia": "DGA-6",
          "cargos": 1,
          "funcoes": 0
        },
        {
          "id": "politec-assessoramento-2-2",
          "perfil": "Assistente Técnico I",
          "simbologia": "DGA-8",
          "cargos": 2,
          "funcoes": 0
        },
        {
          "id": "politec-assessoramento-2-3",
          "perfil": "Assistente de Direção",
          "simbologia": "DGA-10",
          "cargos": 0,
          "funcoes": 2
        }
      ],
      "subitens": []
    },
    {
      "id": "politec-assessoramento-3",
      "nome": "3. Unidade Estratégica Consultiva de Segurança Pública",
      "dotacoes": [
        {
          "id": "politec-assessoramento-3-1",
          "perfil": "Consultor Estratégico Institucional de Segurança Pública",
          "simbologia": "DGA-2",
          "cargos": 0,
          "funcoes": 2
        }
      ],
      "subitens": []
    }
  ]
};

const nivelAdministracaoPolitec: NivelComissionadoSalvo = {
  "id": "politec-administracao",
  "nome": "NÍVEL DE ADMINISTRAÇÃO SISTÊMICA",
  "itens": [
    {
      "id": "politec-administracao-1",
      "nome": "1. Diretoria de Administração Sistêmica",
      "dotacoes": [
        {
          "id": "politec-administracao-1-1",
          "perfil": "Diretor da POLITEC",
          "simbologia": "DGA-4",
          "cargos": 0,
          "funcoes": 1
        },
        {
          "id": "politec-administracao-1-2",
          "perfil": "Assessor Técnico II",
          "simbologia": "DGA-5",
          "cargos": 1,
          "funcoes": 0
        }
      ],
      "subitens": [
        {
          "id": "politec-administracao-1-1",
          "nome": "1.1. Gerência de Suporte à Gestão de Pessoas",
          "dotacoes": [
            {
              "id": "politec-administracao-1-1-1",
              "perfil": "Gerente",
              "simbologia": "DGA-6",
              "cargos": 1,
              "funcoes": 0
            }
          ],
          "subitens": []
        },
        {
          "id": "politec-administracao-1-2",
          "nome": "1.2. Coordenadoria de Patrimônio e Serviços",
          "dotacoes": [
            {
              "id": "politec-administracao-1-2-1",
              "perfil": "Coordenador",
              "simbologia": "DGA-5",
              "cargos": 1,
              "funcoes": 0
            }
          ],
          "subitens": [
            {
              "id": "politec-administracao-1-2-1",
              "nome": "1.2.1. Gerência de Transporte",
              "dotacoes": [
                {
                  "id": "politec-administracao-1-2-1-1",
                  "perfil": "Gerente",
                  "simbologia": "DGA-6",
                  "cargos": 1,
                  "funcoes": 0
                }
              ],
              "subitens": []
            },
            {
              "id": "politec-administracao-1-2-2",
              "nome": "1.2.2. Gerência de Patrimônio",
              "dotacoes": [
                {
                  "id": "politec-administracao-1-2-2-1",
                  "perfil": "Gerente",
                  "simbologia": "DGA-6",
                  "cargos": 1,
                  "funcoes": 0
                }
              ],
              "subitens": []
            },
            {
              "id": "politec-administracao-1-2-3",
              "nome": "1.2.3. Gerência de Almoxarifado",
              "dotacoes": [
                {
                  "id": "politec-administracao-1-2-3-1",
                  "perfil": "Gerente",
                  "simbologia": "DGA-6",
                  "cargos": 1,
                  "funcoes": 0
                }
              ],
              "subitens": []
            },
            {
              "id": "politec-administracao-1-2-4",
              "nome": "1.2.4. Gerência de Materiais Bélicos",
              "dotacoes": [
                {
                  "id": "politec-administracao-1-2-4-1",
                  "perfil": "Gerente",
                  "simbologia": "DGA-6",
                  "cargos": 0,
                  "funcoes": 1
                }
              ],
              "subitens": []
            },
            {
              "id": "politec-administracao-1-2-5",
              "nome": "1.2.5. Gerência de Protocolo e Arquivo",
              "dotacoes": [
                {
                  "id": "politec-administracao-1-2-5-1",
                  "perfil": "Gerente",
                  "simbologia": "DGA-6",
                  "cargos": 1,
                  "funcoes": 0
                }
              ],
              "subitens": []
            }
          ]
        },
        {
          "id": "politec-administracao-1-3",
          "nome": "1.3. Coordenadoria de Aquisições e Contratos",
          "dotacoes": [
            {
              "id": "politec-administracao-1-3-1",
              "perfil": "Coordenador",
              "simbologia": "DGA-5",
              "cargos": 1,
              "funcoes": 0
            }
          ],
          "subitens": [
            {
              "id": "politec-administracao-1-3-1",
              "nome": "1.3.1. Gerência de Aquisições",
              "dotacoes": [
                {
                  "id": "politec-administracao-1-3-1-1",
                  "perfil": "Gerente",
                  "simbologia": "DGA-6",
                  "cargos": 1,
                  "funcoes": 0
                }
              ],
              "subitens": []
            },
            {
              "id": "politec-administracao-1-3-2",
              "nome": "1.3.2. Gerência de Contratos",
              "dotacoes": [
                {
                  "id": "politec-administracao-1-3-2-1",
                  "perfil": "Gerente",
                  "simbologia": "DGA-6",
                  "cargos": 1,
                  "funcoes": 0
                }
              ],
              "subitens": []
            },
            {
              "id": "politec-administracao-1-3-3",
              "nome": "1.3.3. Núcleo de Gestão de Convênios",
              "dotacoes": [
                {
                  "id": "politec-administracao-1-3-3-1",
                  "perfil": "Chefe de Núcleo II",
                  "simbologia": "DGA-8",
                  "cargos": 1,
                  "funcoes": 0
                }
              ],
              "subitens": []
            }
          ]
        },
        {
          "id": "politec-administracao-1-4",
          "nome": "1.4. Coordenadoria de Infraestrutura",
          "dotacoes": [
            {
              "id": "politec-administracao-1-4-1",
              "perfil": "Coordenador",
              "simbologia": "DGA-5",
              "cargos": 1,
              "funcoes": 0
            }
          ],
          "subitens": [
            {
              "id": "politec-administracao-1-4-1",
              "nome": "1.4.1. Gerência de Obras e Engenharia",
              "dotacoes": [
                {
                  "id": "politec-administracao-1-4-1-1",
                  "perfil": "Gerente",
                  "simbologia": "DGA-6",
                  "cargos": 1,
                  "funcoes": 0
                }
              ],
              "subitens": []
            },
            {
              "id": "politec-administracao-1-4-2",
              "nome": "1.4.2. Gerência de Manutenção Predial",
              "dotacoes": [
                {
                  "id": "politec-administracao-1-4-2-1",
                  "perfil": "Gerente",
                  "simbologia": "DGA-6",
                  "cargos": 1,
                  "funcoes": 0
                }
              ],
              "subitens": []
            }
          ]
        },
        {
          "id": "politec-administracao-1-5",
          "nome": "1.5. Coordenadoria de Tecnologia da Informação",
          "dotacoes": [
            {
              "id": "politec-administracao-1-5-1",
              "perfil": "Coordenador",
              "simbologia": "DGA-5",
              "cargos": 1,
              "funcoes": 0
            }
          ],
          "subitens": [
            {
              "id": "politec-administracao-1-5-1",
              "nome": "1.5.1. Gerência de Suporte Técnico",
              "dotacoes": [
                {
                  "id": "politec-administracao-1-5-1-1",
                  "perfil": "Gerente",
                  "simbologia": "DGA-6",
                  "cargos": 1,
                  "funcoes": 0
                }
              ],
              "subitens": []
            },
            {
              "id": "politec-administracao-1-5-2",
              "nome": "1.5.2. Gerência de Redes",
              "dotacoes": [
                {
                  "id": "politec-administracao-1-5-2-1",
                  "perfil": "Gerente",
                  "simbologia": "DGA-6",
                  "cargos": 1,
                  "funcoes": 0
                }
              ],
              "subitens": []
            },
            {
              "id": "politec-administracao-1-5-3",
              "nome": "1.5.3. Gerência de Desenvolvimento de Sistemas",
              "dotacoes": [
                {
                  "id": "politec-administracao-1-5-3-1",
                  "perfil": "Gerente",
                  "simbologia": "DGA-6",
                  "cargos": 1,
                  "funcoes": 0
                }
              ],
              "subitens": []
            }
          ]
        }
      ]
    }
  ]
};

const nivelExecucaoPolitec: NivelComissionadoSalvo = {
  "id": "politec-execucao",
  "nome": "NÍVEL DE EXECUÇÃO PROGRAMÁTICA",
  "itens": [
    {
      "id": "politec-execucao-1",
      "nome": "1. Diretoria de Criminalística",
      "dotacoes": [
        {
          "id": "politec-execucao-1-1",
          "perfil": "Diretor da POLITEC",
          "simbologia": "DGA-4",
          "cargos": 0,
          "funcoes": 1
        }
      ],
      "subitens": [
        {
          "id": "politec-execucao-1-1",
          "nome": "1.1. Coordenadoria de Perícias Internas",
          "dotacoes": [
            {
              "id": "politec-execucao-1-1-1",
              "perfil": "Coordenador",
              "simbologia": "DGA-5",
              "cargos": 0,
              "funcoes": 1
            }
          ],
          "subitens": [
            {
              "id": "politec-execucao-1-1-1",
              "nome": "1.1.1. Gerência de Perícias de Balística",
              "dotacoes": [
                {
                  "id": "politec-execucao-1-1-1-1",
                  "perfil": "Gerente",
                  "simbologia": "DGA-6",
                  "cargos": 0,
                  "funcoes": 1
                }
              ],
              "subitens": []
            },
            {
              "id": "politec-execucao-1-1-2",
              "nome": "1.1.2. Gerência de Perícias de Documentoscopia",
              "dotacoes": [
                {
                  "id": "politec-execucao-1-1-2-1",
                  "perfil": "Gerente",
                  "simbologia": "DGA-6",
                  "cargos": 0,
                  "funcoes": 1
                }
              ],
              "subitens": []
            },
            {
              "id": "politec-execucao-1-1-3",
              "nome": "1.1.3. Gerência de Perícias de Identificação Veicular",
              "dotacoes": [
                {
                  "id": "politec-execucao-1-1-3-1",
                  "perfil": "Gerente",
                  "simbologia": "DGA-6",
                  "cargos": 0,
                  "funcoes": 1
                }
              ],
              "subitens": []
            },
            {
              "id": "politec-execucao-1-1-4",
              "nome": "1.1.4. Gerência de Perícias de Computação Forense",
              "dotacoes": [
                {
                  "id": "politec-execucao-1-1-4-1",
                  "perfil": "Gerente",
                  "simbologia": "DGA-6",
                  "cargos": 0,
                  "funcoes": 1
                }
              ],
              "subitens": []
            },
            {
              "id": "politec-execucao-1-1-5",
              "nome": "1.1.5. Gerência de Perícias em Vestígios de Impressões de Pele",
              "dotacoes": [
                {
                  "id": "politec-execucao-1-1-5-1",
                  "perfil": "Gerente",
                  "simbologia": "DGA-6",
                  "cargos": 0,
                  "funcoes": 1
                }
              ],
              "subitens": []
            },
            {
              "id": "politec-execucao-1-1-6",
              "nome": "1.1.6. Gerência de Perícias em Áudio e Vídeo",
              "dotacoes": [
                {
                  "id": "politec-execucao-1-1-6-1",
                  "perfil": "Gerente",
                  "simbologia": "DGA-6",
                  "cargos": 0,
                  "funcoes": 1
                }
              ],
              "subitens": []
            },
            {
              "id": "politec-execucao-1-1-7",
              "nome": "1.1.7. Gerência de Perícias Contábeis e Financeiras",
              "dotacoes": [
                {
                  "id": "politec-execucao-1-1-7-1",
                  "perfil": "Gerente",
                  "simbologia": "DGA-6",
                  "cargos": 0,
                  "funcoes": 1
                }
              ],
              "subitens": []
            }
          ]
        },
        {
          "id": "politec-execucao-1-2",
          "nome": "1.2. Coordenadoria de Perícias Externas",
          "dotacoes": [
            {
              "id": "politec-execucao-1-2-1",
              "perfil": "Coordenador",
              "simbologia": "DGA-5",
              "cargos": 0,
              "funcoes": 1
            }
          ],
          "subitens": [
            {
              "id": "politec-execucao-1-2-1",
              "nome": "1.2.1. Gerência de Perícias em Crimes de Trânsito",
              "dotacoes": [
                {
                  "id": "politec-execucao-1-2-1-1",
                  "perfil": "Gerente",
                  "simbologia": "DGA-6",
                  "cargos": 0,
                  "funcoes": 1
                }
              ],
              "subitens": []
            },
            {
              "id": "politec-execucao-1-2-2",
              "nome": "1.2.2. Gerência de Perícias em Mortes Violentas",
              "dotacoes": [
                {
                  "id": "politec-execucao-1-2-2-1",
                  "perfil": "Gerente",
                  "simbologia": "DGA-6",
                  "cargos": 0,
                  "funcoes": 1
                }
              ],
              "subitens": []
            },
            {
              "id": "politec-execucao-1-2-3",
              "nome": "1.2.3. Gerência de Perícias em Crimes Contra o Patrimônio",
              "dotacoes": [
                {
                  "id": "politec-execucao-1-2-3-1",
                  "perfil": "Gerente",
                  "simbologia": "DGA-6",
                  "cargos": 0,
                  "funcoes": 1
                }
              ],
              "subitens": []
            },
            {
              "id": "politec-execucao-1-2-4",
              "nome": "1.2.4. Gerência de Perícias de Meio Ambiente",
              "dotacoes": [
                {
                  "id": "politec-execucao-1-2-4-1",
                  "perfil": "Gerente",
                  "simbologia": "DGA-6",
                  "cargos": 0,
                  "funcoes": 1
                }
              ],
              "subitens": []
            },
            {
              "id": "politec-execucao-1-2-5",
              "nome": "1.2.5. Gerência de Perícias de Engenharia Legal",
              "dotacoes": [
                {
                  "id": "politec-execucao-1-2-5-1",
                  "perfil": "Gerente",
                  "simbologia": "DGA-6",
                  "cargos": 0,
                  "funcoes": 1
                }
              ],
              "subitens": []
            },
            {
              "id": "politec-execucao-1-2-6",
              "nome": "1.2.6. Gerência de Perícias de Medicina Veterinária",
              "dotacoes": [
                {
                  "id": "politec-execucao-1-2-6-1",
                  "perfil": "Gerente",
                  "simbologia": "DGA-6",
                  "cargos": 0,
                  "funcoes": 1
                }
              ],
              "subitens": []
            }
          ]
        },
        {
          "id": "politec-execucao-1-3",
          "nome": "1.3. Núcleo de Apoio Operacional de Criminalística",
          "dotacoes": [
            {
              "id": "politec-execucao-1-3-1",
              "perfil": "Chefe de Núcleo II",
              "simbologia": "DGA-8",
              "cargos": 1,
              "funcoes": 0
            }
          ],
          "subitens": []
        },
        {
          "id": "politec-execucao-1-4",
          "nome": "1.4. Núcleo de Custódia e Logística de Criminalística",
          "dotacoes": [
            {
              "id": "politec-execucao-1-4-1",
              "perfil": "Chefe de Núcleo II",
              "simbologia": "DGA-8",
              "cargos": 0,
              "funcoes": 1
            }
          ],
          "subitens": []
        }
      ]
    },
    {
      "id": "politec-execucao-2",
      "nome": "2. Diretoria de Medicina Legal",
      "dotacoes": [
        {
          "id": "politec-execucao-2-1",
          "perfil": "Diretor da POLITEC",
          "simbologia": "DGA-4",
          "cargos": 0,
          "funcoes": 1
        }
      ],
      "subitens": [
        {
          "id": "politec-execucao-2-1",
          "nome": "2.1. Coordenadoria de Perícias em Vivos",
          "dotacoes": [
            {
              "id": "politec-execucao-2-1-1",
              "perfil": "Coordenador",
              "simbologia": "DGA-5",
              "cargos": 0,
              "funcoes": 1
            }
          ],
          "subitens": [
            {
              "id": "politec-execucao-2-1-1",
              "nome": "2.1.1. Gerência de Perícias em Vítimas de Violência Sexual e de Gênero",
              "dotacoes": [
                {
                  "id": "politec-execucao-2-1-1-1",
                  "perfil": "Gerente",
                  "simbologia": "DGA-6",
                  "cargos": 0,
                  "funcoes": 1
                }
              ],
              "subitens": []
            },
            {
              "id": "politec-execucao-2-1-2",
              "nome": "2.1.2. Gerência de Perícias em Psiquiatria Forense",
              "dotacoes": [
                {
                  "id": "politec-execucao-2-1-2-1",
                  "perfil": "Gerente",
                  "simbologia": "DGA-6",
                  "cargos": 0,
                  "funcoes": 1
                }
              ],
              "subitens": []
            }
          ]
        },
        {
          "id": "politec-execucao-2-2",
          "nome": "2.2. Coordenadoria de Perícias em Mortos",
          "dotacoes": [
            {
              "id": "politec-execucao-2-2-1",
              "perfil": "Coordenador",
              "simbologia": "DGA-5",
              "cargos": 0,
              "funcoes": 1
            }
          ],
          "subitens": [
            {
              "id": "politec-execucao-2-2-1",
              "nome": "2.2.1. Gerência de Necropsia",
              "dotacoes": [
                {
                  "id": "politec-execucao-2-2-1-1",
                  "perfil": "Gerente",
                  "simbologia": "DGA-6",
                  "cargos": 0,
                  "funcoes": 1
                }
              ],
              "subitens": []
            },
            {
              "id": "politec-execucao-2-2-2",
              "nome": "2.2.2. Gerência de Antropologia",
              "dotacoes": [
                {
                  "id": "politec-execucao-2-2-2-1",
                  "perfil": "Gerente",
                  "simbologia": "DGA-6",
                  "cargos": 0,
                  "funcoes": 1
                }
              ],
              "subitens": []
            },
            {
              "id": "politec-execucao-2-2-3",
              "nome": "2.2.3. Gerência de Histopatologia",
              "dotacoes": [
                {
                  "id": "politec-execucao-2-2-3-1",
                  "perfil": "Gerente",
                  "simbologia": "DGA-6",
                  "cargos": 0,
                  "funcoes": 1
                }
              ],
              "subitens": []
            }
          ]
        },
        {
          "id": "politec-execucao-2-3",
          "nome": "2.3. Gerência de Atendimento e Processamento de Documentos",
          "dotacoes": [
            {
              "id": "politec-execucao-2-3-1",
              "perfil": "Gerente",
              "simbologia": "DGA-6",
              "cargos": 0,
              "funcoes": 1
            }
          ],
          "subitens": []
        },
        {
          "id": "politec-execucao-2-4",
          "nome": "2.4. Núcleo de Apoio Operacional de Medicina Legal",
          "dotacoes": [
            {
              "id": "politec-execucao-2-4-1",
              "perfil": "Chefe de Núcleo II",
              "simbologia": "DGA-8",
              "cargos": 1,
              "funcoes": 0
            }
          ],
          "subitens": []
        },
        {
          "id": "politec-execucao-2-5",
          "nome": "2.5. Núcleo de Custódia e Logística de Medicina Legal",
          "dotacoes": [
            {
              "id": "politec-execucao-2-5-1",
              "perfil": "Chefe de Núcleo II",
              "simbologia": "DGA-8",
              "cargos": 0,
              "funcoes": 1
            }
          ],
          "subitens": []
        }
      ]
    },
    {
      "id": "politec-execucao-3",
      "nome": "3. Diretoria de Laboratório Forense",
      "dotacoes": [
        {
          "id": "politec-execucao-3-1",
          "perfil": "Diretor da POLITEC",
          "simbologia": "DGA-4",
          "cargos": 0,
          "funcoes": 1
        },
        {
          "id": "politec-execucao-3-2",
          "perfil": "Assistente Técnico I",
          "simbologia": "DGA-8",
          "cargos": 1,
          "funcoes": 0
        }
      ],
      "subitens": [
        {
          "id": "politec-execucao-3-1",
          "nome": "3.1. Coordenadoria de Perícias em Biologia Molecular",
          "dotacoes": [
            {
              "id": "politec-execucao-3-1-1",
              "perfil": "Coordenador",
              "simbologia": "DGA-5",
              "cargos": 0,
              "funcoes": 1
            }
          ],
          "subitens": [
            {
              "id": "politec-execucao-3-1-1",
              "nome": "3.1.1. Gerência Técnica",
              "dotacoes": [
                {
                  "id": "politec-execucao-3-1-1-1",
                  "perfil": "Gerente",
                  "simbologia": "DGA-6",
                  "cargos": 0,
                  "funcoes": 1
                }
              ],
              "subitens": []
            },
            {
              "id": "politec-execucao-3-1-2",
              "nome": "3.1.2. Gerência de Qualidade em Biologia Molecular",
              "dotacoes": [
                {
                  "id": "politec-execucao-3-1-2-1",
                  "perfil": "Gerente",
                  "simbologia": "DGA-6",
                  "cargos": 0,
                  "funcoes": 1
                }
              ],
              "subitens": []
            }
          ]
        },
        {
          "id": "politec-execucao-3-2",
          "nome": "3.2. Coordenadoria do Laboratório de Materiais",
          "dotacoes": [
            {
              "id": "politec-execucao-3-2-1",
              "perfil": "Coordenador",
              "simbologia": "DGA-5",
              "cargos": 0,
              "funcoes": 1
            }
          ],
          "subitens": [
            {
              "id": "politec-execucao-3-2-1",
              "nome": "3.2.1. Gerência de Perícias em Química Forense",
              "dotacoes": [
                {
                  "id": "politec-execucao-3-2-1-1",
                  "perfil": "Gerente",
                  "simbologia": "DGA-6",
                  "cargos": 0,
                  "funcoes": 1
                }
              ],
              "subitens": []
            },
            {
              "id": "politec-execucao-3-2-2",
              "nome": "3.2.2. Gerência de Perícias em Toxicologia Forense",
              "dotacoes": [
                {
                  "id": "politec-execucao-3-2-2-1",
                  "perfil": "Gerente",
                  "simbologia": "DGA-6",
                  "cargos": 0,
                  "funcoes": 1
                }
              ],
              "subitens": []
            },
            {
              "id": "politec-execucao-3-2-3",
              "nome": "3.2.3. Gerência de Perícias em Entorpecentes",
              "dotacoes": [
                {
                  "id": "politec-execucao-3-2-3-1",
                  "perfil": "Gerente",
                  "simbologia": "DGA-6",
                  "cargos": 0,
                  "funcoes": 1
                }
              ],
              "subitens": []
            }
          ]
        },
        {
          "id": "politec-execucao-3-3",
          "nome": "3.3. Núcleo de Apoio Operacional do Laboratório Forense",
          "dotacoes": [
            {
              "id": "politec-execucao-3-3-1",
              "perfil": "Chefe de Núcleo II",
              "simbologia": "DGA-8",
              "cargos": 1,
              "funcoes": 0
            }
          ],
          "subitens": []
        },
        {
          "id": "politec-execucao-3-4",
          "nome": "3.4. Núcleo de Custódia e Logística do Laboratório Forense",
          "dotacoes": [
            {
              "id": "politec-execucao-3-4-1",
              "perfil": "Chefe de Núcleo II",
              "simbologia": "DGA-8",
              "cargos": 0,
              "funcoes": 1
            }
          ],
          "subitens": []
        }
      ]
    },
    {
      "id": "politec-execucao-4",
      "nome": "4. Diretoria de Identificação Técnica",
      "dotacoes": [
        {
          "id": "politec-execucao-4-1",
          "perfil": "Diretor da POLITEC",
          "simbologia": "DGA-4",
          "cargos": 0,
          "funcoes": 1
        },
        {
          "id": "politec-execucao-4-2",
          "perfil": "Assistente Técnico I",
          "simbologia": "DGA-8",
          "cargos": 1,
          "funcoes": 0
        }
      ],
      "subitens": [
        {
          "id": "politec-execucao-4-1",
          "nome": "4.1. Coordenadoria de Identificação Criminal",
          "dotacoes": [
            {
              "id": "politec-execucao-4-1-1",
              "perfil": "Coordenador",
              "simbologia": "DGA-5",
              "cargos": 0,
              "funcoes": 1
            }
          ],
          "subitens": [
            {
              "id": "politec-execucao-4-1-1",
              "nome": "4.1.1. Gerência de Informação Criminal",
              "dotacoes": [
                {
                  "id": "politec-execucao-4-1-1-1",
                  "perfil": "Gerente",
                  "simbologia": "DGA-6",
                  "cargos": 0,
                  "funcoes": 1
                }
              ],
              "subitens": []
            },
            {
              "id": "politec-execucao-4-1-2",
              "nome": "4.1.2. Gerência de Banco de Dados de Padrões",
              "dotacoes": [
                {
                  "id": "politec-execucao-4-1-2-1",
                  "perfil": "Gerente",
                  "simbologia": "DGA-6",
                  "cargos": 0,
                  "funcoes": 1
                }
              ],
              "subitens": []
            }
          ]
        },
        {
          "id": "politec-execucao-4-2",
          "nome": "4.2. Coordenadoria de Identificação Civil",
          "dotacoes": [
            {
              "id": "politec-execucao-4-2-1",
              "perfil": "Coordenador",
              "simbologia": "DGA-5",
              "cargos": 0,
              "funcoes": 1
            }
          ],
          "subitens": [
            {
              "id": "politec-execucao-4-2-1",
              "nome": "4.2.1. Gerência de Processamento Civil",
              "dotacoes": [
                {
                  "id": "politec-execucao-4-2-1-1",
                  "perfil": "Gerente",
                  "simbologia": "DGA-6",
                  "cargos": 0,
                  "funcoes": 1
                }
              ],
              "subitens": []
            },
            {
              "id": "politec-execucao-4-2-2",
              "nome": "4.2.2. Gerência de Atendimento Volante",
              "dotacoes": [
                {
                  "id": "politec-execucao-4-2-2-1",
                  "perfil": "Gerente",
                  "simbologia": "DGA-6",
                  "cargos": 0,
                  "funcoes": 1
                }
              ],
              "subitens": []
            },
            {
              "id": "politec-execucao-4-2-3",
              "nome": "4.2.3. Gerência de Postos de Identificação",
              "dotacoes": [
                {
                  "id": "politec-execucao-4-2-3-1",
                  "perfil": "Gerente",
                  "simbologia": "DGA-6",
                  "cargos": 0,
                  "funcoes": 1
                }
              ],
              "subitens": []
            }
          ]
        },
        {
          "id": "politec-execucao-4-3",
          "nome": "4.3. Gerência de Identificação Integrado",
          "dotacoes": [
            {
              "id": "politec-execucao-4-3-1",
              "perfil": "Gerente",
              "simbologia": "DGA-6",
              "cargos": 0,
              "funcoes": 1
            }
          ],
          "subitens": []
        },
        {
          "id": "politec-execucao-4-4",
          "nome": "4.4. Núcleo de Apoio Operacional de Identificação Técnica",
          "dotacoes": [
            {
              "id": "politec-execucao-4-4-1",
              "perfil": "Chefe de Núcleo II",
              "simbologia": "DGA-8",
              "cargos": 1,
              "funcoes": 0
            }
          ],
          "subitens": []
        }
      ]
    },
    {
      "id": "politec-execucao-5",
      "nome": "5. Coordenadoria de Custódia de Evidências",
      "dotacoes": [
        {
          "id": "politec-execucao-5-1",
          "perfil": "Coordenador",
          "simbologia": "DGA-5",
          "cargos": 0,
          "funcoes": 1
        }
      ],
      "subitens": [
        {
          "id": "politec-execucao-5-1",
          "nome": "5.1. Gerência de Custódia Definitiva",
          "dotacoes": [
            {
              "id": "politec-execucao-5-1-1",
              "perfil": "Gerente",
              "simbologia": "DGA-6",
              "cargos": 0,
              "funcoes": 1
            }
          ],
          "subitens": []
        },
        {
          "id": "politec-execucao-5-2",
          "nome": "5.2. Gerência de Logística de Vestígios",
          "dotacoes": [
            {
              "id": "politec-execucao-5-2-1",
              "perfil": "Gerente",
              "simbologia": "DGA-6",
              "cargos": 0,
              "funcoes": 1
            }
          ],
          "subitens": []
        }
      ]
    },
    {
      "id": "politec-execucao-6",
      "nome": "6. Núcleo de Identificação Humana e Desaparecidos",
      "dotacoes": [
        {
          "id": "politec-execucao-6-1",
          "perfil": "Chefe de Núcleo II",
          "simbologia": "DGA-8",
          "cargos": 0,
          "funcoes": 1
        }
      ],
      "subitens": []
    },
    {
      "id": "politec-execucao-7",
      "nome": "7. Núcleo de Atuações Especiais",
      "dotacoes": [
        {
          "id": "politec-execucao-7-1",
          "perfil": "Chefe de Núcleo II",
          "simbologia": "DGA-8",
          "cargos": 0,
          "funcoes": 1
        }
      ],
      "subitens": []
    },
    {
      "id": "politec-execucao-8",
      "nome": "8. Núcleo Integrado de Ocorrências Externas",
      "dotacoes": [
        {
          "id": "politec-execucao-8-1",
          "perfil": "Chefe de Núcleo II",
          "simbologia": "DGA-8",
          "cargos": 0,
          "funcoes": 1
        }
      ],
      "subitens": []
    }
  ]
};

const nivelRegionalizadaPolitec: NivelComissionadoSalvo = {
  "id": "politec-regionalizada",
  "nome": "NÍVEL DE ADMINISTRAÇÃO REGIONALIZADA",
  "itens": [
    {
      "id": "politec-regionalizada-1",
      "nome": "1. Diretoria de Interiorização",
      "dotacoes": [
        {
          "id": "politec-regionalizada-1-1",
          "perfil": "Diretor da POLITEC",
          "simbologia": "DGA-4",
          "cargos": 0,
          "funcoes": 1
        },
        {
          "id": "politec-regionalizada-1-2",
          "perfil": "Assistente Técnico I",
          "simbologia": "DGA-8",
          "cargos": 3,
          "funcoes": 0
        }
      ],
      "subitens": [
        {
          "id": "politec-regionalizada-1-1",
          "nome": "1.1. Coordenadoria Regional 1 - Rondonópolis",
          "dotacoes": [
            {
              "id": "politec-regionalizada-1-1-1",
              "perfil": "Coordenador",
              "simbologia": "DGA-5",
              "cargos": 0,
              "funcoes": 1
            },
            {
              "id": "politec-regionalizada-1-1-2",
              "perfil": "Assistente Técnico I",
              "simbologia": "DGA-8",
              "cargos": 1,
              "funcoes": 0
            }
          ],
          "subitens": [
            {
              "id": "politec-regionalizada-1-1-1",
              "nome": "1.1.1. Gerência de Criminalística de Rondonópolis",
              "dotacoes": [
                {
                  "id": "politec-regionalizada-1-1-1-1",
                  "perfil": "Gerente",
                  "simbologia": "DGA-6",
                  "cargos": 0,
                  "funcoes": 1
                }
              ],
              "subitens": []
            },
            {
              "id": "politec-regionalizada-1-1-2",
              "nome": "1.1.2. Gerência de Medicina Legal de Rondonópolis",
              "dotacoes": [
                {
                  "id": "politec-regionalizada-1-1-2-1",
                  "perfil": "Gerente",
                  "simbologia": "DGA-6",
                  "cargos": 0,
                  "funcoes": 1
                }
              ],
              "subitens": []
            },
            {
              "id": "politec-regionalizada-1-1-3",
              "nome": "1.1.3. Gerência de Identificação Técnica de Rondonópolis",
              "dotacoes": [
                {
                  "id": "politec-regionalizada-1-1-3-1",
                  "perfil": "Gerente",
                  "simbologia": "DGA-6",
                  "cargos": 0,
                  "funcoes": 1
                }
              ],
              "subitens": []
            },
            {
              "id": "politec-regionalizada-1-1-4",
              "nome": "1.1.4. Gerência Regional de Primavera do Leste",
              "dotacoes": [
                {
                  "id": "politec-regionalizada-1-1-4-1",
                  "perfil": "Gerente",
                  "simbologia": "DGA-6",
                  "cargos": 0,
                  "funcoes": 1
                }
              ],
              "subitens": []
            },
            {
              "id": "politec-regionalizada-1-1-5",
              "nome": "1.1.5. Gerência Regional de Alto Araguaia",
              "dotacoes": [
                {
                  "id": "politec-regionalizada-1-1-5-1",
                  "perfil": "Gerente",
                  "simbologia": "DGA-6",
                  "cargos": 0,
                  "funcoes": 1
                }
              ],
              "subitens": []
            }
          ]
        },
        {
          "id": "politec-regionalizada-1-2",
          "nome": "1.2. Coordenadoria Regional 2 - Barra do Garças",
          "dotacoes": [
            {
              "id": "politec-regionalizada-1-2-1",
              "perfil": "Coordenador",
              "simbologia": "DGA-5",
              "cargos": 0,
              "funcoes": 1
            },
            {
              "id": "politec-regionalizada-1-2-2",
              "perfil": "Assistente Técnico I",
              "simbologia": "DGA-8",
              "cargos": 1,
              "funcoes": 0
            }
          ],
          "subitens": [
            {
              "id": "politec-regionalizada-1-2-1",
              "nome": "1.2.1. Gerência de Criminalística de Barra do Garças",
              "dotacoes": [
                {
                  "id": "politec-regionalizada-1-2-1-1",
                  "perfil": "Gerente",
                  "simbologia": "DGA-6",
                  "cargos": 0,
                  "funcoes": 1
                }
              ],
              "subitens": []
            },
            {
              "id": "politec-regionalizada-1-2-2",
              "nome": "1.2.2. Gerência de Medicina Legal de Barra do Garças",
              "dotacoes": [
                {
                  "id": "politec-regionalizada-1-2-2-1",
                  "perfil": "Gerente",
                  "simbologia": "DGA-6",
                  "cargos": 0,
                  "funcoes": 1
                }
              ],
              "subitens": []
            },
            {
              "id": "politec-regionalizada-1-2-3",
              "nome": "1.2.3. Gerência de Identificação Técnica de Barra do Garças",
              "dotacoes": [
                {
                  "id": "politec-regionalizada-1-2-3-1",
                  "perfil": "Gerente",
                  "simbologia": "DGA-6",
                  "cargos": 0,
                  "funcoes": 1
                }
              ],
              "subitens": []
            },
            {
              "id": "politec-regionalizada-1-2-4",
              "nome": "1.2.4. Gerência Regional de Água Boa",
              "dotacoes": [
                {
                  "id": "politec-regionalizada-1-2-4-1",
                  "perfil": "Gerente",
                  "simbologia": "DGA-6",
                  "cargos": 0,
                  "funcoes": 1
                }
              ],
              "subitens": []
            },
            {
              "id": "politec-regionalizada-1-2-5",
              "nome": "1.2.5. Gerência Regional de Confresa",
              "dotacoes": [
                {
                  "id": "politec-regionalizada-1-2-5-1",
                  "perfil": "Gerente",
                  "simbologia": "DGA-6",
                  "cargos": 0,
                  "funcoes": 1
                }
              ],
              "subitens": []
            }
          ]
        },
        {
          "id": "politec-regionalizada-1-3",
          "nome": "1.3. Coordenadoria Regional 3 - Cáceres",
          "dotacoes": [
            {
              "id": "politec-regionalizada-1-3-1",
              "perfil": "Coordenador",
              "simbologia": "DGA-5",
              "cargos": 0,
              "funcoes": 1
            },
            {
              "id": "politec-regionalizada-1-3-2",
              "perfil": "Assistente Técnico I",
              "simbologia": "DGA-8",
              "cargos": 1,
              "funcoes": 0
            }
          ],
          "subitens": [
            {
              "id": "politec-regionalizada-1-3-1",
              "nome": "1.3.1. Gerência de Criminalística de Cáceres",
              "dotacoes": [
                {
                  "id": "politec-regionalizada-1-3-1-1",
                  "perfil": "Gerente",
                  "simbologia": "DGA-6",
                  "cargos": 0,
                  "funcoes": 1
                }
              ],
              "subitens": []
            },
            {
              "id": "politec-regionalizada-1-3-2",
              "nome": "1.3.2. Gerência de Medicina Legal de Cáceres",
              "dotacoes": [
                {
                  "id": "politec-regionalizada-1-3-2-1",
                  "perfil": "Gerente",
                  "simbologia": "DGA-6",
                  "cargos": 0,
                  "funcoes": 1
                }
              ],
              "subitens": []
            },
            {
              "id": "politec-regionalizada-1-3-3",
              "nome": "1.3.3. Gerência de Identificação Técnica de Cáceres",
              "dotacoes": [
                {
                  "id": "politec-regionalizada-1-3-3-1",
                  "perfil": "Gerente",
                  "simbologia": "DGA-6",
                  "cargos": 0,
                  "funcoes": 1
                }
              ],
              "subitens": []
            },
            {
              "id": "politec-regionalizada-1-3-4",
              "nome": "1.3.4. Gerência Regional de Pontes e Lacerda",
              "dotacoes": [
                {
                  "id": "politec-regionalizada-1-3-4-1",
                  "perfil": "Gerente",
                  "simbologia": "DGA-6",
                  "cargos": 0,
                  "funcoes": 1
                }
              ],
              "subitens": []
            }
          ]
        },
        {
          "id": "politec-regionalizada-1-4",
          "nome": "1.4. Coordenadoria Regional 4 - Sinop",
          "dotacoes": [
            {
              "id": "politec-regionalizada-1-4-1",
              "perfil": "Coordenador",
              "simbologia": "DGA-5",
              "cargos": 0,
              "funcoes": 1
            },
            {
              "id": "politec-regionalizada-1-4-2",
              "perfil": "Assistente Técnico I",
              "simbologia": "DGA-8",
              "cargos": 1,
              "funcoes": 0
            }
          ],
          "subitens": [
            {
              "id": "politec-regionalizada-1-4-1",
              "nome": "1.4.1. Gerência de Criminalística de Sinop",
              "dotacoes": [
                {
                  "id": "politec-regionalizada-1-4-1-1",
                  "perfil": "Gerente",
                  "simbologia": "DGA-6",
                  "cargos": 0,
                  "funcoes": 1
                }
              ],
              "subitens": []
            },
            {
              "id": "politec-regionalizada-1-4-2",
              "nome": "1.4.2. Gerência de Medicina Legal de Sinop",
              "dotacoes": [
                {
                  "id": "politec-regionalizada-1-4-2-1",
                  "perfil": "Gerente",
                  "simbologia": "DGA-6",
                  "cargos": 0,
                  "funcoes": 1
                }
              ],
              "subitens": []
            },
            {
              "id": "politec-regionalizada-1-4-3",
              "nome": "1.4.3. Gerência de Identificação Técnica de Sinop",
              "dotacoes": [
                {
                  "id": "politec-regionalizada-1-4-3-1",
                  "perfil": "Gerente",
                  "simbologia": "DGA-6",
                  "cargos": 0,
                  "funcoes": 1
                }
              ],
              "subitens": []
            },
            {
              "id": "politec-regionalizada-1-4-4",
              "nome": "1.4.4. Gerência Regional de Alta Floresta",
              "dotacoes": [
                {
                  "id": "politec-regionalizada-1-4-4-1",
                  "perfil": "Gerente",
                  "simbologia": "DGA-6",
                  "cargos": 0,
                  "funcoes": 1
                }
              ],
              "subitens": []
            },
            {
              "id": "politec-regionalizada-1-4-5",
              "nome": "1.4.5. Gerência Regional de Guarantã do Norte",
              "dotacoes": [
                {
                  "id": "politec-regionalizada-1-4-5-1",
                  "perfil": "Gerente",
                  "simbologia": "DGA-6",
                  "cargos": 0,
                  "funcoes": 1
                }
              ],
              "subitens": []
            },
            {
              "id": "politec-regionalizada-1-4-6",
              "nome": "1.4.6. Gerência Regional de Sorriso",
              "dotacoes": [
                {
                  "id": "politec-regionalizada-1-4-6-1",
                  "perfil": "Gerente",
                  "simbologia": "DGA-6",
                  "cargos": 0,
                  "funcoes": 1
                }
              ],
              "subitens": []
            }
          ]
        },
        {
          "id": "politec-regionalizada-1-5",
          "nome": "1.5. Coordenadoria Regional 5 - Tangará da Serra",
          "dotacoes": [
            {
              "id": "politec-regionalizada-1-5-1",
              "perfil": "Coordenador",
              "simbologia": "DGA-5",
              "cargos": 0,
              "funcoes": 1
            },
            {
              "id": "politec-regionalizada-1-5-2",
              "perfil": "Assistente Técnico I",
              "simbologia": "DGA-8",
              "cargos": 1,
              "funcoes": 0
            }
          ],
          "subitens": [
            {
              "id": "politec-regionalizada-1-5-1",
              "nome": "1.5.1. Gerência de Criminalística de Tangará da Serra",
              "dotacoes": [
                {
                  "id": "politec-regionalizada-1-5-1-1",
                  "perfil": "Gerente",
                  "simbologia": "DGA-6",
                  "cargos": 0,
                  "funcoes": 1
                }
              ],
              "subitens": []
            },
            {
              "id": "politec-regionalizada-1-5-2",
              "nome": "1.5.2. Gerência de Medicina Legal de Tangará da Serra",
              "dotacoes": [
                {
                  "id": "politec-regionalizada-1-5-2-1",
                  "perfil": "Gerente",
                  "simbologia": "DGA-6",
                  "cargos": 0,
                  "funcoes": 1
                }
              ],
              "subitens": []
            },
            {
              "id": "politec-regionalizada-1-5-3",
              "nome": "1.5.3. Gerência de Identificação Técnica de Tangará da Serra",
              "dotacoes": [
                {
                  "id": "politec-regionalizada-1-5-3-1",
                  "perfil": "Gerente",
                  "simbologia": "DGA-6",
                  "cargos": 0,
                  "funcoes": 1
                }
              ],
              "subitens": []
            },
            {
              "id": "politec-regionalizada-1-5-4",
              "nome": "1.5.4. Gerência Regional de Juína",
              "dotacoes": [
                {
                  "id": "politec-regionalizada-1-5-4-1",
                  "perfil": "Gerente",
                  "simbologia": "DGA-6",
                  "cargos": 0,
                  "funcoes": 1
                }
              ],
              "subitens": []
            },
            {
              "id": "politec-regionalizada-1-5-5",
              "nome": "1.5.5. Gerência Regional de Juara",
              "dotacoes": [
                {
                  "id": "politec-regionalizada-1-5-5-1",
                  "perfil": "Gerente",
                  "simbologia": "DGA-6",
                  "cargos": 0,
                  "funcoes": 1
                }
              ],
              "subitens": []
            }
          ]
        },
        {
          "id": "politec-regionalizada-1-6",
          "nome": "1.6. Coordenadoria Regional 6 - Nova Mutum",
          "dotacoes": [
            {
              "id": "politec-regionalizada-1-6-1",
              "perfil": "Coordenador",
              "simbologia": "DGA-5",
              "cargos": 0,
              "funcoes": 1
            },
            {
              "id": "politec-regionalizada-1-6-2",
              "perfil": "Assistente Técnico I",
              "simbologia": "DGA-8",
              "cargos": 1,
              "funcoes": 0
            }
          ],
          "subitens": [
            {
              "id": "politec-regionalizada-1-6-1",
              "nome": "1.6.1. Gerência de Criminalística de Nova Mutum",
              "dotacoes": [
                {
                  "id": "politec-regionalizada-1-6-1-1",
                  "perfil": "Gerente",
                  "simbologia": "DGA-6",
                  "cargos": 0,
                  "funcoes": 1
                }
              ],
              "subitens": []
            },
            {
              "id": "politec-regionalizada-1-6-2",
              "nome": "1.6.2. Gerência de Medicina Legal de Nova Mutum",
              "dotacoes": [
                {
                  "id": "politec-regionalizada-1-6-2-1",
                  "perfil": "Gerente",
                  "simbologia": "DGA-6",
                  "cargos": 0,
                  "funcoes": 1
                }
              ],
              "subitens": []
            },
            {
              "id": "politec-regionalizada-1-6-3",
              "nome": "1.6.3. Gerência de Identificação Técnica de Nova Mutum",
              "dotacoes": [
                {
                  "id": "politec-regionalizada-1-6-3-1",
                  "perfil": "Gerente",
                  "simbologia": "DGA-6",
                  "cargos": 0,
                  "funcoes": 1
                }
              ],
              "subitens": []
            },
            {
              "id": "politec-regionalizada-1-6-4",
              "nome": "1.6.4. Gerência Regional de Diamantino",
              "dotacoes": [
                {
                  "id": "politec-regionalizada-1-6-4-1",
                  "perfil": "Gerente",
                  "simbologia": "DGA-6",
                  "cargos": 0,
                  "funcoes": 1
                }
              ],
              "subitens": []
            },
            {
              "id": "politec-regionalizada-1-6-5",
              "nome": "1.6.5. Gerência Regional de Lucas do Rio Verde",
              "dotacoes": [
                {
                  "id": "politec-regionalizada-1-6-5-1",
                  "perfil": "Gerente",
                  "simbologia": "DGA-6",
                  "cargos": 0,
                  "funcoes": 1
                }
              ],
              "subitens": []
            }
          ]
        }
      ]
    }
  ]
};

const quadroPolitec2026: QuadroComissionadoSalvo = {
  id: "quadro-politec-decreto-2252-2026",
  codigo: "QC-0001",
  nome: "Estrutura organizacional da POLITEC — Decreto nº 2.252/2026",
  orgao: "POLITEC",
  dataVigencia: "2026-09-11",
  documentosLegaisIds: ["decreto-2252-2026"],
  salvoEm: "2026-09-11T12:00:00.000Z",
  quadroBaseId: "quadro-politec-decreto-2252-2026",
  versao: 1,
  modeloEstruturaVersao: 11,
  niveis: [
    { id: "politec-decisao", nome: "NÍVEL DE DECISÃO COLEGIADA", itens: [{ id: "politec-conselho", nome: "1. Conselho de Política Científica e Tecnológica", dotacoes: [], subitens: [] }] },
    { id: "politec-direcao", nome: "NÍVEL DE DIREÇÃO SUPERIOR", itens: [
      { id: "politec-dg", nome: "1. Diretoria-Geral da POLITEC", dotacoes: [{ id: "politec-dg-diretor", perfil: "Diretor-Geral", simbologia: "DGA-2", cargos: 0, funcoes: 1 }, { id: "politec-dg-assistente", perfil: "Assistente Técnico I", simbologia: "DGA-8", cargos: 1, funcoes: 0 }], subitens: [{ id: "politec-dga", nome: "1.1. Diretoria-Geral Adjunta da POLITEC", dotacoes: [{ id: "politec-dga-diretor", perfil: "Diretor-Geral Adjunto da POLITEC", simbologia: "DGA-3", cargos: 0, funcoes: 1 }, { id: "politec-dga-assistente", perfil: "Assistente Técnico I", simbologia: "DGA-8", cargos: 1, funcoes: 0 }], subitens: [] }] },
    ] },
    nivelApoioPolitec,
    nivelAssessoramentoPolitec,
    nivelAdministracaoPolitec,
    nivelExecucaoPolitec,
    nivelRegionalizadaPolitec,
  ],
};


function normalizarCodigo(codigo: string | undefined) {
  return codigo?.trim().toUpperCase() || "";
}

function proximoCodigoQuadro(codigos: Iterable<string>) {
  let maior = 0;
  for (const codigo of codigos) {
    const encontrado = /^QC-(\d+)$/.exec(codigo);
    if (encontrado) maior = Math.max(maior, Number(encontrado[1]));
  }
  return "QC-" + String(maior + 1).padStart(4, "0");
}

/** Garante que o código seja persistido uma única vez por quadro, inclusive ao migrar registros antigos. */
function garantirCodigosQuadro(quadros: QuadroComissionadoSalvo[]) {
  const codigoPorQuadroBase = new Map<string, string>();
  const usados = new Set<string>();

  quadros.forEach((quadro) => {
    const codigo = normalizarCodigo(quadro.codigo);
    if (!codigo) return;
    const chave = quadro.quadroBaseId ?? quadro.id;
    if (!codigoPorQuadroBase.has(chave)) codigoPorQuadroBase.set(chave, codigo);
    usados.add(codigo);
  });

  quadros.forEach((quadro) => {
    const chave = quadro.quadroBaseId ?? quadro.id;
    if (codigoPorQuadroBase.has(chave)) return;
    const codigo = proximoCodigoQuadro(usados);
    codigoPorQuadroBase.set(chave, codigo);
    usados.add(codigo);
  });

  return quadros.map((quadro) => ({
    ...quadro,
    codigo: codigoPorQuadroBase.get(quadro.quadroBaseId ?? quadro.id)!,
  }));
}
export function listarQuadrosComissionados(): QuadroComissionadoSalvo[] {
  try {
    const valor = window.localStorage.getItem(CHAVE_CADASTROS);
    if (valor) {
      const quadrosLidos = JSON.parse(valor) as QuadroComissionadoSalvo[];
      const modeloAtual = quadroPolitec2026.modeloEstruturaVersao ?? 1;
      const pertenceAoQuadroPolitec = (quadro: QuadroComissionadoSalvo) => (quadro.quadroBaseId ?? quadro.id) === quadroPolitec2026.id;
      const versoesConfirmadas = quadrosLidos.filter((quadro) => pertenceAoQuadroPolitec(quadro) && quadro.id !== quadroPolitec2026.id && quadro.modeloEstruturaVersao === modeloAtual && quadro.versionamentoConfirmado === true && quadro.versionamentoOrigem === "fluxo-confirmado-v2" && quadro.versionamentoModelo === 2);
      const outrosQuadros = quadrosLidos.filter((quadro) => !pertenceAoQuadroPolitec(quadro));
      const resultado = garantirCodigosQuadro([quadroPolitec2026, ...versoesConfirmadas, ...outrosQuadros]);
      window.localStorage.setItem(CHAVE_CADASTROS, JSON.stringify(resultado));
      return resultado;
    }
    // Rascunhos pertencem somente ao formulário. Eles nunca podem aparecer na listagem ou definir a próxima versão.
    return [quadroPolitec2026];
  } catch {
    return [quadroPolitec2026];
  }
}

export function lerRascunhoQuadroComissionado(): QuadroComissionadoSalvo | null {
  try {
    const valor = window.localStorage.getItem(CHAVE_RASCUNHO);
    if (!valor) return null;
    const quadro = JSON.parse(valor) as QuadroComissionadoSalvo;
    const pertenceAoQuadroPolitec = (quadro.quadroBaseId ?? quadro.id) === quadroPolitec2026.id;
    const modeloAtual = quadroPolitec2026.modeloEstruturaVersao ?? 1;
    return pertenceAoQuadroPolitec && ((quadro.modeloEstruturaVersao ?? 1) < modeloAtual || (quadro.id === quadroPolitec2026.id && (quadro.versao ?? 1) !== 1)) ? quadroPolitec2026 : quadro;
  } catch {
    return null;
  }
}

export function salvarRascunhoQuadroComissionado(quadro: QuadroComissionadoSalvo) {
  const quadros = listarQuadrosComissionados();
  const quadroBaseId = quadro.quadroBaseId ?? quadro.id;
  const codigoDaSerie = quadros.find((item) => (item.quadroBaseId ?? item.id) === quadroBaseId)?.codigo;
  const quadroConfirmado = {
    ...quadro,
    codigo: normalizarCodigo(quadro.codigo) || codigoDaSerie,
    versionamentoConfirmado: (quadro.versao ?? 1) > 1 ? true : quadro.versionamentoConfirmado,
    versionamentoOrigem: (quadro.versao ?? 1) > 1 ? "fluxo-confirmado-v2" as const : quadro.versionamentoOrigem,
    versionamentoModelo: (quadro.versao ?? 1) > 1 ? 2 as const : quadro.versionamentoModelo,
  };
  const indice = quadros.findIndex((item) => item.id === quadroConfirmado.id);
  const atualizados = indice >= 0
    ? quadros.map((item, posicao) => posicao === indice ? quadroConfirmado : item)
    : [...quadros, quadroConfirmado];
  const persistidos = garantirCodigosQuadro(atualizados);
  const persistido = persistidos.find((item) => item.id === quadroConfirmado.id)!;
  window.localStorage.setItem(CHAVE_RASCUNHO, JSON.stringify(persistido));
  window.localStorage.setItem(CHAVE_CADASTROS, JSON.stringify(persistidos));
  return persistido;
}
export function prepararNovoQuadroComissionado() {
  window.localStorage.removeItem(CHAVE_RASCUNHO);
}

export function prepararNovaVersaoQuadroComissionado(id: string) {
  const quadros = listarQuadrosComissionados();
  const quadro = quadros.find((item) => item.id === id);
  if (!quadro) return;
  const quadroBaseId = quadro.quadroBaseId ?? quadro.id;
  const maiorVersao = quadros
    .filter((item) => (item.quadroBaseId ?? item.id) === quadroBaseId)
    .reduce((maior, item) => Math.max(maior, item.versao ?? 1), 1);
  const novaVersao: QuadroComissionadoSalvo = {
    ...structuredClone(quadro),
    id: crypto.randomUUID(),
    quadroBaseId,
    versao: maiorVersao + 1,
    versaoAnteriorId: quadro.id,
    motivoVersionamento: "",
    dataVigencia: "",
    salvoEm: new Date().toISOString(),
  };
  window.localStorage.setItem(CHAVE_RASCUNHO, JSON.stringify(novaVersao));
}
export function prepararEdicaoQuadroComissionado(id: string) {
  const quadro = listarQuadrosComissionados().find((item) => item.id === id);
  if (quadro) window.localStorage.setItem(CHAVE_RASCUNHO, JSON.stringify(quadro));
}





