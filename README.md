# Conecta Saúde — Sistema de Gestão e Atendimento Médico

O **Conecta Saúde** é uma aplicação web completa desenvolvida com tecnologias puras front-end (**HTML5, CSS3, JavaScript vanilla, JSON e localStorage**) com foco em experiência do usuário (UX/UI), acessibilidade, responsividade e integração direta entre pacientes e profissionais de saúde.

---

## 1. Visão Geral e Arquitetura

O sistema implementa o ciclo completo de um ecossistema de saúde digital:
- **Página Institucional Pública (`index.html`)**: Apresentação da plataforma, especialidades, benefícios e canais de atendimento.
- **Autenticação Segura e Demonstração de Recuperação (`login.html`, `cadastro.html`, `esqueci-senha.html`)**: Cadastro segregado por papéis (Paciente e Médico com CRM/Especialidade), validação matemática de CPF, bloqueio de credenciais duplicadas e recuperação local.
- **Área do Paciente (`paciente.html`)**: Painel de boas-vindas, agendamento de consultas com bloqueio automático de conflitos de horário, catálogo visual de especialidades médicas (Wireframe 5), histórico completo de consultas e exames laudados (Wireframe 7) e gestão de perfil.
- **Área do Profissional (`profissional.html`)**: Painel com indicadores diários calculados em tempo real (sem números estáticos fictícios), grade de horários da agenda com mini-calendário interativo (Wireframe 6), fluxo de atendimento clínico com prontuário e prescrição, carteira de pacientes e gestão de perfil.
- **Sincronização em Tempo Real**: Ambas as áreas compartilham a mesma fonte de dados no `localStorage` do navegador e respondem a eventos da API `storage`, refletindo alterações instantaneamente inclusive entre abas abertas simultaneamente.

---

## 2. Estrutura de Arquivos e Pastas

```text
conecta-saude/
│
├── index.html                  # Página inicial pública com apresentação e atalhos
├── cadastro.html               # Cadastro de pacientes e profissionais com validação de CPF
├── login.html                  # Autenticação com e-mail/CPF e botões de acesso rápido
├── esqueci-senha.html          # Recuperação demonstrativa de senha em duas etapas
├── paciente.html               # Área do paciente (Início, Profissionais, Agendar, Consultas, Perfil)
├── profissional.html           # Área do profissional (Início, Agenda com Calendário, Prontuário, Pacientes)
│
├── css/
│   ├── style.css               # Design System, variáveis CSS, componentes globais e modais
│   ├── responsivo.css          # Media queries para computadores, tablets e smartphones
│   ├── auth.css                # Estilização das telas de autenticação e recuperação
│   ├── paciente.css            # Estilos específicos do painel do paciente e agendamento
│   └── profissional.css        # Estilos específicos do painel médico e grade de horários
│
├── js/
│   ├── app.js                  # Utilitários globais (máscara CPF, validação CPF, sanitização XSS, alertas)
│   ├── storage.js              # Camada de persistência (localStorage, CRUD de usuários/consultas e sync)
│   ├── autenticacao.js         # Controle de rotas, permissões por papel e proteção contra acessos indevidos
│   ├── cadastro.js             # Validação e submissão do formulário de novos usuários
│   ├── login.js                # Validação de credenciais e redirecionamento correto
│   ├── esqueci-senha.js        # Lógica de validação de e-mail e redefinição de senha
│   ├── paciente.js             # Lógica das abas do paciente, agendamento interativo e histórico
│   └── profissional.js         # Lógica do painel médico, mini-calendário, agenda e atendimento clínico
│
├── json/
│   ├── usuarios.json           # Dados iniciais de pacientes e médicos cadastrados
│   ├── consultas.json          # Histórico inicial de consultas e agendamentos
│   └── configuracoes.json      # Configurações do sistema, especialidades e horários padrão
│
└── README.md                   # Documentação técnica completa
```

---

## 3. Contas de Demonstração

Para facilitar testes e demonstrações, o sistema conta com credenciais pré-configuradas:

### Pacientes
| Nome | E-mail | CPF | Senha |
|---|---|---|---|
| **João da Silva** | `joao@email.com` | `123.456.789-09` | `123456` |
| **Maria Souza** | `maria@email.com` | `529.982.247-25` | `123456` |
| **Daniel Boming** | `daniel@email.com` | `055.602.825-78` | `123456` |

### Profissionais de Saúde (Médicos)
| Nome | Especialidade | E-mail | CRM | Senha |
|---|---|---|---|---|
| **Dr. Pedro Candido** | Ortopedista | `pedro@conectasaude.com` | CRM/SP 123456 | `123456` |
| **Dra. Isabela Martins** | Cardiologista | `isabela@conectasaude.com` | CRM/SP 654321 | `123456` |
| **Dr. Carlos Mendes** | Pediatra | `carlos@conectasaude.com` | CRM/SP 789123 | `123456` |
| **Dra. Camila Rocha** | Oftalmologista | `camila@conectasaude.com` | CRM/SP 321654 | `123456` |
| **Dra. Amanda Costa** | Nutricionista | `amanda@conectasaude.com` | CRN/SP 159753 | `123456` |

> Na tela de **login.html**, há botões de preenchimento com 1 clique para acessar diretamente como João da Silva, Dr. Pedro Candido ou Dra. Isabela Martins.

---

## 4. Como Executar o Projeto

Como o projeto faz leitura assíncrona dos arquivos JSON via `fetch()`, é recomendado executá-lo a partir de um servidor web local simples:

### Opção 1: Extensão Live Server (VS Code)
1. Abra a pasta `conecta-saude` no Visual Studio Code.
2. Clique com o botão direito no arquivo `index.html` e selecione **"Open with Live Server"**.
3. O navegador será aberto automaticamente no endereço `http://127.0.0.1:5500/index.html`.

### Opção 2: Servidor HTTP do Python
Abra o terminal na pasta do projeto e execute:
```bash
python -m http.server 8000
```
Em seguida, acesse no navegador: `http://localhost:8000`.

### Opção 3: Protocolo Local (`file:///`)
Mesmo se os arquivos forem abertos diretamente com duplo-clique pelo navegador sem um servidor HTTP, a camada `storage.js` possui um mecanismo de **fallback embutido resiliente**, garantindo que os usuários e agendamentos sejam inicializados normalmente sem erros.

---

## 5. Roteiro de Testes Recomendado

### Teste 1: Cadastro e Validações Rigorosas
1. Acesse `cadastro.html`.
2. Tente avançar com campos vazios: o sistema exibirá alertas de obrigatoriedade.
3. Teste o CPF com dígitos repetidos (ex: `111.111.111-11`) ou inválido: o algoritmo matemático de verificação rejeitará o envio.
4. Selecione o tipo de conta **Profissional de Saúde**: observe que os campos de **Especialidade** e **CRM** surgem dinamicamente.
5. Cadastre um novo paciente com CPF válido. Ao concluir, você será redirecionado para `login.html`.

### Teste 2: Controle de Acesso e Sessão
1. Tente acessar `paciente.html` ou `profissional.html` diretamente pela barra de endereço sem estar autenticado: o sistema redireciona automaticamente para `login.html`.
2. Efetue login como paciente (`joao@email.com` / `123456`): você será direcionado para `paciente.html`.
3. Tente navegar manualmente para `profissional.html`: o sistema identifica o papel e impede o acesso indevido, mantendo o usuário na área de paciente.
4. Clique no ícone de perfil no canto superior direito e selecione **"Sair da Conta"**: a sessão local é encerrada.

### Teste 3: Agendamento e Prevenção de Conflitos
1. Faça login como **João da Silva**.
2. Clique no botão laranja **"Agendar"** no cabeçalho ou no botão de agendamento na aba **Profissionais**.
3. Escolha o profissional e uma data futura:
   - Observe que a grade de horários calcula em tempo real quais horários já estão ocupados (exibindo-os tachados/desabilitados com aviso).
   - Tente escolher um horário vago e confirme.
   - O agendamento surge imediatamente na lista de **Suas próximas consultas** com status *"Aguardando confirmação"*.

### Teste 4: Integração em Tempo Real com a Área Médica
1. Em uma aba ou janela do navegador, faça login como paciente (**João da Silva**).
2. Em outra aba (ou janela anônima), faça login como o médico escolhido (**Dr. Pedro Candido**).
3. Na área do médico (`profissional.html`), abra a aba **Agenda** ou veja a tabela da página inicial: o novo agendamento feito pelo paciente já estará visível!
4. O médico clica em **"Confirmar"**: o status muda para *"Confirmado"*.
5. O médico clica em **"Atender"**:
   - Um modal clínico se abre com os dados do paciente.
   - O médico digita o diagnóstico, conduta e prescrição e clica em **"Finalizar e Concluir Atendimento"**.
   - O status é atualizado para *"Concluído"*.
6. Volte à aba do paciente: o status da consulta foi alterado para *"Concluído"* e agora possui o botão **"Ver Laudo"**, exibindo integralmente as anotações feitas pelo médico!

---

## 6. Limitações da Versão Front-End (Aviso de Demonstração)

Esta aplicação foi desenvolvida exclusivamente com tecnologias do lado do cliente (front-end) e persistência via `localStorage`.

- **Não armazene dados médicos reais ou senhas de uso pessoal:** O `localStorage` armazena informações em texto legível no navegador do usuário e não possui camadas de criptografia de ponta a ponta, controle de permissão por tokens assinados em servidor ou conformidade com a LGPD/HIPAA para dados de saúde sensíveis.
- **Recuperação de Senha Demonstrativa:** O fluxo em `esqueci-senha.html` é uma simulação didática que localiza o cadastro localmente e permite redefinir a chave, sem envio de e-mails via servidores SMTP nem autenticação de dois fatores (2FA).
- **Escopo do Sistema:** Trata-se de uma aplicação de portfólio e demonstração técnica de arquitetura de software, interface responsiva, UX/UI e integração client-side robusta.
