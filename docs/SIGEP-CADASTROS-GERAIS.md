# Documentação Geral dos Cadastros SIGEP

## 1. Objetivo

Este documento apresenta o funcionamento das telas de Regime Jurídico, Tipo de Vínculo, Carreira, Perfil Profissional e Cargo. Em conjunto, elas estruturam os dados usados na Gestão de Pessoas e nos fluxos de ingresso, vínculo funcional e controle de vagas.

## 2. Navegação e padrão das telas

As telas ficam no menu **Cadastro > Cargo e Concurso** e seguem o mesmo padrão visual da biblioteca SEPLAG UI:

- Breadcrumb com a localização e o modo atual.
- Cabeçalho com título e descrição.
- Cards de seção organizados por assunto.
- Campos em grid responsivo.
- Tabela paginada nas listagens.
- Badges para situação.
- Botões de visualizar, editar, voltar e salvar.

Cada cadastro possui listagem, cadastro, visualização e edição. A visualização reutiliza a estrutura da edição com os controles bloqueados. O ícone de olho abre a visualização, o lápis da listagem abre a edição e o lápis do cabeçalho da visualização também leva à edição.

## 3. Vigência, encerramento e extinção

### 3.1 Vigência

A seção **Vigência** informa quando o registro passa a valer e apresenta sua situação calculada. As situações utilizadas são:

- **A definir:** data inicial ainda não informada.
- **Agendado:** a data inicial é futura.
- **Ativo:** o registro está vigente.
- **Encerrado:** o período de utilização foi finalizado.
- **Extinto:** o registro não possui dependências ativas conforme as relações funcionais.

### 3.2 Encerramento

O encerramento ocorre exclusivamente na edição, por meio do botão **Encerrar** dentro da seção Vigência. Ao acioná-lo, o sistema:

- preenche a data atual como data de encerramento;
- exibe o campo **Motivo do encerramento**;
- torna o motivo obrigatório;
- valida que a data não seja anterior à data de início;
- mantém o registro disponível para consulta histórica.

### 3.3 Extinção

Após o encerramento, o sistema reavalia as dependências ativas. A extinção pode ocorrer quando não existir mais registro dependente em situação ativa. As relações consideradas são:

- Regime Jurídico utilizado por Tipo de Vínculo.
- Tipo de Vínculo utilizado por Cargo.
- Carreira relacionada a Cargo.
- Perfil Profissional associado a Cargo.

## 4. Regime Jurídico

### Finalidade

Representa as regras jurídicas que fundamentam os vínculos funcionais com a Administração Pública.

### Listagem e filtros

A listagem consulta os regimes e permite filtrar por código ou nome e por situação. A tabela apresenta nome, descrição, instituições vinculadas e situação.

### Cadastro, visualização e edição

O formulário contém:

- **Identificação:** sigla, nome e descrição.
- **Vigência:** data de início e situação calculada; na edição, permite iniciar o encerramento.
- **Base legal:** documentos legais associados ao regime.

## 5. Tipo de Vínculo

### Finalidade

Define a natureza do vínculo funcional e os comportamentos aplicáveis aos fluxos de pessoas, cargos, vagas e folha.

### Listagem e filtros

A listagem permite filtrar por código, nome ou descrição, Regime Jurídico e situação. A tabela apresenta código, nome, regimes relacionados, vigência e situação.

### Cadastro, visualização e edição

O formulário contém:

- **Identificação:** sigla ou código e nome do Tipo de Vínculo.
- **Classificação:** natureza e Regimes Jurídicos relacionados.
- **Comportamentos:** Permite controle de vagas?, Concurso público? e Processo seletivo?.
- **Vigência:** data de início, situação calculada e encerramento durante a edição.
- **Observação:** informações complementares sobre o vínculo.

## 6. Carreira

### Finalidade

Organiza cargos em agrupamentos funcionais com identidade própria e relações institucionais.

### Listagem e filtros

A listagem permite filtrar por sigla ou nome, órgão e situação. A tabela apresenta sigla, nome, órgãos vinculados e situação.

### Cadastro, visualização e edição

O formulário contém:

- **Identificação:** sigla e nome da carreira.
- **Vigência:** data de início, situação calculada e encerramento durante a edição.
- **Base legal:** documentos legais que fundamentam a carreira.
- **Órgãos vinculados:** associação dos órgãos relacionados à carreira.
- **Observação:** informações complementares.

## 7. Perfil Profissional

### Finalidade

Define o perfil profissional associado aos cargos, incluindo formação, classificação ocupacional e registro profissional.

### Listagem e filtros

A listagem permite filtrar por nome ou CBO, área de formação e situação. A tabela apresenta perfil, área de formação, CBO, quantidade de cargos relacionados e situação.

### Cadastro, visualização e edição

O formulário contém:

- **Base legal:** documentos legais associados.
- **Identificação:** nome do Perfil Profissional.
- **Requisitos profissionais:** nível de formação, formação, especialização, CBO, exigência de registro e conselho profissional.
- **Vigência:** data de início, situação calculada e encerramento durante a edição.
- **Observação:** informações complementares.

## 8. Cargo

### Finalidade

Representa o cargo funcional utilizado nos vínculos de pessoas, na estrutura de carreira e nos fluxos de ingresso.

### Listagem e filtros

A listagem permite filtrar por código ou nome, carreira ou categoria, Tipo de Vínculo e situação. A tabela apresenta código, cargo, vigência e situação.

### Cadastro, visualização e edição

O formulário contém:

- **Base legal:** documentos legais associados.
- **Identificação:** código ou sigla e nome do cargo.
- **Classificação funcional:** carreira ou categoria, Tipo de Vínculo e Perfis Profissionais.
- **Características:** descrição, jornada, natureza, forma de provimento, Regime Jurídico, escolaridade, CBO, chefia, substituição e exibição no portal.
- **Vigência:** data de início, situação calculada e encerramento durante a edição.
- **Dados do registro:** identificador, categoria e situação atual.

## 9. Relação funcional entre os cadastros

1. O Regime Jurídico fundamenta os Tipos de Vínculo.
2. O Tipo de Vínculo define comportamentos aplicáveis aos Cargos.
3. A Carreira organiza os Cargos em agrupamentos funcionais.
4. O Perfil Profissional descreve formação e habilitação associadas aos Cargos.
5. O Cargo consolida a classificação funcional utilizada nos fluxos de pessoas.

## 10. Rotas principais

```text
/prototipos/sigep/regime-juridico
/prototipos/sigep/tipo-vinculo
/prototipos/sigep/carreira
/prototipos/sigep/perfil-profissional
/prototipos/sigep/cargo
```

Para cada rota existem os complementos `/novo`, `/:id/visualizar` e `/:id/editar`.

## 11. Referências técnicas

- Rotas: `src/App.tsx`.
- Telas e dados do protótipo: `src/prototipos/PrototiposPage.tsx`.
- Estilos: `src/prototipos/prototipos.css`.
- Componentes reutilizáveis: `src/componentes`.
