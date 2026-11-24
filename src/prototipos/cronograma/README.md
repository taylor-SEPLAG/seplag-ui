# Gestão de ciclos do cronograma

Rotas: gestão em `/prototipos/sigep/cronograma/ciclos`; configuração em `/prototipos/sigep/cronograma/configurar/:competencia`. Título e breadcrumb da listagem: **Gestão de Ciclos do Cronograma**.

Fluxo: calendário existente → **Configurar cronograma** → gestão de ciclos → Novo ciclo/Editar/Visualizar/Excluir. A listagem reutiliza CardSeplag, BreadcrumbSeplag, SplitButton, estilos e PaginacaoV2 da Gestão de Vínculos. Somente o ano filtra os registros. O ano atual usa America/Cuiaba.

Novo ciclo seleciona ano/mês e abre o editor existente com configuração vazia. O cadastro ocorre exclusivamente ao salvar. Voltar descarta o rascunho. Editar carrega apenas a configuração daquela competência; a gravação automática do editor antigo é desabilitada nesse fluxo. O fluxo antigo da Folha é preservado. Visualizar reutiliza calendário/lista sem botão de configuração.

Persistência: IndexedDB `sigep-cronograma-ciclos`, store `ciclos`, chave primária `competencia` (AAAA-MM). A criação usa `add` em transação, impedindo duplicidade mesmo entre abas; edição exige registro existente e usa `put`. Exclusão remove o registro e seus eventos na mesma transação. Eventos de atualização e BroadcastChannel atualizam outras consultas abertas. Os dados continuam locais ao navegador, sem sincronização com servidor.

A primeira consulta migra uma única vez a configuração já salva em `prototipos.folha.cronograma`, agrupando seus eventos pelo mês/ano da data de início. Eventos sem data permanecem na competência original. Não são criados eventos nem utilizadas as contagens ilustrativas do pedido. Uma revisão transacional corrige cópias intactas da migração anterior que reunia todos os meses em um único ciclo; ciclos editados, excluídos ou com conflitos de competência são preservados. A fonte anterior fica preservada. Falhas de leitura interrompem a migração e são apresentadas. A exclusão de todos os ciclos não reimporta a fonte antiga.

Não existe API de cronograma neste repositório. `supabase/cronograma-ciclos.sql` prepara a chave única (ano, mês) e validação de estrutura no PostgreSQL; não foi aplicado a um serviço remoto. A integração de API, autenticação e políticas de acesso é necessária para persistência compartilhada. Na futura API, conflitos SQLSTATE 23505 devem usar a mensagem de duplicidade definida no repositório.

Validação: `npx vitest run src/prototipos/cronograma`.

Novo ciclo permite iniciar do zero ou ativar **Utilizar ciclo anterior como base**. Todas as competências cadastradas são oferecidas como referência em ordem decrescente, inclusive meses posteriores ao destino e outros anos. O ciclo anterior mais recente é sugerido quando disponível; caso contrário, o mais recente cadastrado. A escolha é enviada apenas para o rascunho do editor. A cópia profunda preserva grupos, eventos, ordem, observações e horários, sem vínculo persistente com a origem. Datas mantêm o deslocamento mensal relativo à competência de origem; dias inexistentes são limitados ao último dia válido e sinalizados no editor. Datas ausentes/inválidas são mantidas para revisão com aviso. Só Salvar persiste o novo ciclo.

A coluna Última atualização usa data/hora de America/Cuiaba. Ciclos antigos sem registro recebem, uma única vez, o instante em que a atualização inicial é persistida. Esse instante não representa a data histórica de edição da configuração legada. Datas válidas existentes são preservadas; novas gravações atualizam o instante automaticamente.
