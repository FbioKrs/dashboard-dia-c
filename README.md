# dashboard-dia-c
Dashboard de acompanhamento Dia C

## Visões em produção

- `visoes/dia-c.html` — DC-V1
- `visoes/metas-executiva.html` — META-V1, com visão geral e rotação interna automática das categorias que possuem subcategorias.

### Dados da visão de metas

A visão META-V1 lê `dados/metas-executiva.json`, atualiza a carga a cada 60 segundos e mantém a última informação válida em memória caso uma atualização falhe.

