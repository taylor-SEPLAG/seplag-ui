# Regras de agendamento de férias no protótipo

O módulo está em `/prototipos/sigep/ferias`. Os dados de demonstração permanecem no navegador.

- Individual SIGEP: documento formal obrigatório; inicia como Agendada, sem aprovação.
- Individual Portal: a Chefia Imediata avalia os registros pendentes.
- Coletivo e lote SIGEP: portaria obrigatória, aprovação pelo perfil DRE / RH Central.
- Seleção do aquisitivo mais antigo com saldo, descontando solicitações ativas. Cancelados, reprovados e suspensos deixam de reservar saldo.
- Professor SEDUC: parcelas de 15 ou 30 dias. Demais cargos mantêm 10, 15, 20 ou 30. Uma escolha que deixe exatamente 5 dias é bloqueada.
- Recesso: carência de 6 meses para estagiários e 12 para residentes, aferida na data de início do usufruto; blocos de 10, 15 ou 20 e integral de 30 dias. Término calculado inclusivamente.
- Alterações e cancelamentos exigem documento formal. A consulta reúne os documentos dos registros da mesma matrícula.

O calendário mensal da folha é configurável na aba Gestão pelo perfil RH / Gestão de Pessoas. Dia 15 é a referência inicial. A competência seguinte é usada quando o fechamento atual já passou. Alterar um fechamento atualiza os prazos pendentes dessa competência. Solicitações expiradas são reprovadas na leitura e verificadas a cada 30 segundos com a tela aberta.

Os arquivos ficam no IndexedDB, uma única vez por upload; os registros guardam referências. O limite de demonstração é 2 MB por arquivo, PDF, PNG ou JPEG. Isso evita repetir o conteúdo de uma portaria para cada integrante do lote. A pasta funcional exibida é local.

## Integrações necessárias para produção

O repositório contém um protótipo, sem os serviços de saldo ou pasta funcional deste módulo. A integração real deve fornecer períodos e saldos por matrícula/vínculo, lotações e DRE, calendário oficial da folha, armazenamento documental e permissões por equipe/unidade. A seleção/reserva do saldo precisa de transação no servidor; a expiração precisa de rotina agendada independente do navegador. O seletor de perfis demonstra os fluxos e não substitui autorização no servidor.

As regras administrativas existentes de antecedência e intervalo entre parcelas foram preservadas. A validação normativa dos demais cargos deve usar os parâmetros oficiais do órgão.
