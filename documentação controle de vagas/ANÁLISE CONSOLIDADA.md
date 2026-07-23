# Análise consolidada — Controle de Vagas

Data da análise: 23/07/2026.

Esta análise reúne as três transcrições de levantamento/demonstração, o Manual de Cessão e Remoção, o documento sobre ônus da cessão e a Lei nº 8.321/2005 consolidada. Não substitui validação jurídica das normas vigentes nem consulta ao Diário Oficial.

## 1. Conclusões confirmadas

### Quadro legal

- A vaga efetiva nasce de lei, vinculada a carreira, cargo e quantitativo.
- Alterações de quantitativo, transformação, redução e extinção dependem de nova fundamentação legal e devem preservar versões anteriores.
- Antes da vigência futura, o registro pode ser corrigido; após o início da vigência, deve ser criada nova versão.
- Ordem judicial é exceção justificável ao limite, com processo judicial e histórico próprios; não é divergência técnica.
- A Lei nº 8.321/2005 exemplifica bem o versionamento do quadro: o Anexo I teve redações sucessivas e, na redação de 2026, apresenta 300 Peritos Oficiais Criminais, 154 Peritos Médicos-Legistas, 12 Peritos Odonto-Legistas, 218 Papiloscopistas e 106 Técnicos em Necropsia.

### Ocupação e vacância

- A vaga só passa a ocupada no efetivo exercício, não na aprovação, convocação, nomeação ou posse.
- A vaga ocupada só é liberada após o evento oficial que produz a vacância.
- Processos em andamento devem aparecer como comprometimentos/etiquetas sem antecipar a mudança definitiva de estado.
- Uma mesma pessoa pode possuir mais de um vínculo permitido e, portanto, ocupar vagas distintas.
- O histórico da vaga e de seus ocupantes não deve ser apagado nem recriado.

### Distribuição de vagas

- Redistribuição movimenta cargos/vagas livres entre órgãos por ato ou decreto, sem aumentar o total legal.
- Carreiras podem limitar os órgãos aptos a receber vagas.
- A demonstração de 21/07 afirmou que não existe banco genérico de vagas do Estado: as vagas devem terminar vinculadas a órgãos por lei ou decreto.
- Uma autorização ainda sem órgão pode existir apenas como situação transitória pendente de ato de distribuição. Ela não deve funcionar como estoque central movimentável sem fundamento.
- O “recolhimento para saldo central” do protótipo precisa ser revisto. O movimento correto é redistribuição fundamentada entre órgãos ou retorno à destinação prevista no ato aplicável.

### Remoção

- Remoção interna: movimentação definitiva entre unidades do mesmo órgão. Não troca a vaga, não altera o órgão de lotação e não produz mudança financeira.
- Remoção externa: movimentação definitiva entre órgãos do Poder Executivo. Exige possibilidade na lei da carreira e vaga compatível disponível no destino.
- Na remoção externa, a vaga não acompanha o servidor: a vaga de origem é desocupada e o vínculo ocupa outra vaga no órgão de destino.
- A operação deve ser atômica: reservar a vaga de destino, comprometer a vaga de origem, validar o ato e somente então encerrar uma ocupação e abrir a outra.
- Permuta é modalidade específica e depende de legislação e compatibilidade de cargos/perfis.
- A gestão do órgão de origem efetiva a remoção interna; a remoção externa é instruída na origem, analisada pela SEPLAG e publicada por ato administrativo.

### Cessão

- Cessão é temporária e não interrompe o vínculo com o órgão de origem.
- A vaga continua ocupada pelo mesmo vínculo no órgão de origem; muda o órgão/unidade de exercício.
- Devem ser registrados cedente, cessionário, tipo interno/externo, motivo legal, unidade de destino, início, fim, ato, publicação, processo, ônus, reembolso e prorrogações.
- O prazo máximo indicado no Manual é de cinco anos, com possibilidade de prorrogações sucessivas conforme a regra aplicável.
- Cessão interna e externa têm regras financeiras diferentes. Em cessões externas, o pagamento pode permanecer na origem com posterior ressarcimento.
- Três meses consecutivos sem reembolso podem fazer cessar a cessão, conforme a LC nº 265/2006 consolidada no documento analisado.
- Existem exceções por carreira, entidade, fonte de recursos e atividade desempenhada; o campo “ônus” não pode ser apenas uma escolha genérica entre origem e destino.
- O órgão de origem precisa conservar visibilidade funcional suficiente para acompanhar direitos e ocorrências do servidor cedido.

### Perfil, especialidade e CBO

- Cargo, perfil profissional e função/especialidade exercida não são o mesmo cadastro.
- A demonstração recomenda “perfil” para formação/enquadramento profissional, como engenheiro civil ou contador.
- A reunião de CBO usa “especialidade” para a função exercida no evento funcional, como assessor, chefe ou superintendente.
- Registros utilizados historicamente devem ser inativados, nunca excluídos.
- O CBO eSocial é necessário para integração. Os documentos divergem sobre sua vinculação exata a perfil ou especialidade; isso precisa ser validado antes da modelagem definitiva.
- No Controle de Vagas, perfil deve ser informativo ou uma restrição de compatibilidade quando a lei exigir, sem criar quantitativos rígidos não previstos.

### Escopo

- Temporários não possuem o mesmo limite legal de vagas e devem ficar em Quadro de Pessoal/lotacionograma separado.
- Efetivos são o núcleo do controle rigoroso.
- Cargos comissionados possuem limite legal e bloqueio de nomeação, mas a demonstração também mencionou tratamento separado. A decisão atual do produto é mantê-los no Controle de Vagas, diferenciados por tipo de quadro.
- Agregação militar, AVNM, Designação PIB, cooperação técnica e regime de colaboração possuem regras próprias e não devem ser reduzidos a cessão comum.

## 2. Impactos no protótipo atual

### Dashboard

- Manter indicadores de legais, ocupadas, disponíveis, comprometidas, em saída, em extinção, judiciais, cessões e projeções.
- Acrescentar visão de remoções externas em andamento e concluídas.
- “Não distribuídas” deve significar pendência transitória de ato, não banco central disponível.
- Separar órgão titular, órgão de distribuição, lotação e órgão/unidade de exercício.
- Decisões judiciais devem permanecer como exceções legais rastreáveis, não como erro de integridade.

### Quadro Autorizado

- A estrutura de versões está coerente.
- Substituir “Especialidade” por “Perfil” na dimensão profissional do quadro, mantendo especialidade/função no evento funcional quando aplicável.
- A destinação legal precisa distinguir: órgão definido pela lei; órgãos permitidos; distribuição posterior por ato/decreto.
- Quantitativo e distribuição devem possuir vigências próprias e rastreáveis.

### Vagas Individualizadas

- A consulta nominal e o histórico estão alinhados ao levantamento.
- Exibir também perfil exigido, lotação atual, unidade de exercício, remoção/cessão ativa e ato que definiu a distribuição.
- A numeração individual não foi defendida pela reunião de 15/07, mas foi uma decisão posterior do produto para garantir rastreabilidade; deve ser registrada como identificador interno, não necessariamente como “número legal da vaga”.

### Cessões

- A tela atual é insuficiente para o fluxo completo.
- Incluir tipo interna/externa, cedente, cessionário, esfera, unidade, motivo, fundamento, ônus detalhado, reembolso, fonte de recursos, vigência, prorrogação, encerramento, publicação e documentos.
- Implementar etapas: solicitação pelo destino, instrução pela origem, análise/validação da SEPLAG, publicação e efetivação.
- Permitir correção antes da validação e nova versão/retificação depois, sempre com auditoria.

### Distribuição

- Manter distribuição e redistribuição de vagas disponíveis por quadro e ato.
- Remover a ideia de recolhimento para banco central permanente.
- Bloquear vagas ocupadas, comprometidas ou incompatíveis com a carreira.
- Preservar movimentos retroativos e reconstrução histórica.

### Nova área de Movimentações

- Criar uma área própria para movimentações funcionais, separada da distribuição administrativa de vagas.
- Tipos iniciais: remoção interna, remoção externa, remoção por permuta e cessão.
- Remoção interna altera apenas unidade/lotação interna.
- Remoção externa deve localizar simultaneamente vínculo, vaga de origem e vaga compatível de destino.
- A confirmação deve encerrar a ocupação de origem e iniciar a ocupação de destino na mesma transação.

## 3. Fluxo recomendado para remoção externa

1. Localizar pessoa e vínculo ativo.
2. Identificar a vaga atualmente ocupada.
3. Selecionar órgão de destino.
4. Listar somente vagas disponíveis e compatíveis com cargo, carreira, perfil e legislação.
5. Selecionar a vaga de destino.
6. Registrar pedido, motivo, processo, anuências, ato e data de efeito.
7. Comprometer a vaga de origem para disponibilização.
8. Comprometer a vaga de destino para ocupação.
9. Validar pela SEPLAG e publicar o ato.
10. Na data de efeito, liberar a vaga de origem e ocupar a vaga de destino de forma atômica.
11. Manter histórico completo nas duas vagas e no vínculo.

## 4. Pendências para validação funcional/jurídica

- Confirmar se “perfil” substitui especialidade no quadro ou se ambos coexistem com papéis distintos.
- Confirmar se o CBO é vinculado ao perfil, à especialidade funcional ou aos dois.
- Definir como representar autorizações ainda pendentes de decreto de distribuição sem criar banco central fictício.
- Validar regras de compatibilidade para remoção externa e permuta por carreira.
- Catalogar motivos de cessão e suas regras de ônus/reembolso por carreira, entidade e fonte.
- Definir tratamento próprio para agregação militar, AVNM, Designação PIB, cooperação técnica e regime de colaboração.
- Confirmar quais regras do Manual de 2023 e normas citadas continuam vigentes na data da implementação.

## 5. Prioridade recomendada

1. Corrigir Distribuição para eliminar o banco central permanente.
2. Reestruturar Cessões com o fluxo e os campos normativos.
3. Criar Remoções/Movimentações com troca atômica de vagas na remoção externa.
4. Ajustar Cargo, Perfil, Especialidade e CBO.
5. Atualizar Dashboard e Vagas Individualizadas com os novos eventos.
6. Tratar movimentações especiais em fases posteriores.
