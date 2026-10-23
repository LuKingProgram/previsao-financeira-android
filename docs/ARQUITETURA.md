# Arquitetura inicial

## Visão

O app é Android-first e local-first. A tela React Native coleta entradas e apresenta projeções; módulos de domínio transformam dados em resultados financeiros puros; repositórios validam e persistem os dados em SQLite criptografado.

~~~mermaid
flowchart LR
    UI[Expo Router e componentes] --> APP[Casos de uso]
    APP --> DOMAIN[Domínio financeiro TypeScript]
    APP --> REPO[Repositórios]
    REPO --> DB[(SQLite com SQLCipher)]
    KEY[Expo SecureStore] --> REPO
    DOMAIN --> APP
~~~

## Stack inicial

- Expo SDK 58, React Native e TypeScript.
- Expo Router para rotas por arquivo.
- pnpm e pnpm-lock.yaml para dependências reproduzíveis.
- expo-sqlite para persistência local; plugin configurado com SQLCipher.
- expo-secure-store para proteger a chave do banco no armazenamento seguro do dispositivo.
- expo-crypto para gerar material aleatório da chave.
- Continuous Native Generation: diretórios android e ios são gerados localmente e não entram no repositório por padrão.

O SQLCipher exige um build nativo próprio e não está disponível no Expo Go. A configuração atual prepara o plugin, mas a implementação futura deve configurar a chave, comprovar PRAGMA cipher_version, testar abertura/fechamento e tratar corrupção. Até isso estar pronto, não considerar o armazenamento seguro implementado.

## Limites de módulo

Estrutura desejada conforme as issues adicionarem código:

~~~text
src/
  app/                  rotas, navegação e composição da interface
  features/             fluxos de movimentos, cartões, recorrências e resumos
  domain/
    money/              valores, datas e regras de projeção sem dependência visual
    forecasting/        geração de eventos previstos e cálculo de saldos
  data/
    database/           abertura criptografada, migrações e transações SQLite
    repositories/       leitura e escrita para cada entidade
  shared/
    formatting/         moeda, datas e apresentação
    components/         controles reutilizáveis e acessíveis
~~~

Regras de domínio não devem importar React, React Native, expo-router ou SQLite. A interface não deve executar SQL nem recalcular saldo no componente.

## Fluxo de inicialização dos dados

1. Carregar a chave do banco do SecureStore; se não existir, gerar uma chave criptograficamente segura e persistir antes de abrir o banco.
2. Abrir o banco nativo configurado para SQLCipher.
3. Aplicar PRAGMA key imediatamente após a abertura, sem interpolação insegura de entrada.
4. Confirmar que PRAGMA cipher_version retorna uma versão.
5. Só então executar migrações e expor repositórios à interface.
6. Em qualquer falha, não recriar banco vazio automaticamente. Mostrar estado de recuperação sem registrar dados financeiros.

O formato, o tamanho e a codificação da chave devem ser fixados em uma issue de implementação e documentados junto à migração inicial. Chaves nunca entram em logs, arquivos de configuração, issue ou commit.

## Domínio e casos de uso

Casos de uso iniciais:

- criar/editar/remover conta;
- definir saldo inicial com data de referência;
- criar/editar/cancelar movimento;
- gerar eventos recorrentes do intervalo solicitado;
- calcular saldo por conta e saldo projetado;
- gerar fatura prevista por cartão;
- montar resultado mensal sem transferências internas duplicadas.

Operações de gravação que envolvem mais de uma tabela devem usar uma transação SQLite. A projeção deve receber dados e data de referência como parâmetros, sem ler relógio global escondido.

## Persistência e sincronização

O primeiro release não depende de backend. A fonte de verdade é o banco local criptografado. Exportação pode ser considerada após definir formato e proteção. Sincronização exige identidade, controle de conflito, transporte cifrado, exclusão remota e consentimento; portanto permanece fora do MVP.

## Segurança e privacidade

- Não escrever dados financeiros em logs ou analytics.
- Não guardar senha de banco em AsyncStorage, SQLite ou arquivos JSON.
- Guardar apenas a chave no armazenamento seguro; conteúdo em massa fica no banco.
- Usar consultas parametrizadas para valores e descrições.
- Fazer migrações numeradas, transacionais e com recuperação verificada.
- Testar explicitamente que builds com SQLCipher não aceitam banco aberto sem chave.
- Não alegar criptografia efetiva enquanto o build nativo e a verificação em runtime não estiverem concluídos.

## Decisões técnicas em aberto

- Versão mínima do Android a suportar.
- Política de backup de Android e exclusão da chave/banco ao apagar todos os dados.
- Estratégia de desbloqueio local opcional (PIN/biometria) sem travar recuperação da chave.
- Formato e proteção de exportação.
- Política de migração e recuperação de banco danificado.
