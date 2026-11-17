/**
 * Conecta Saúde - Camada de Persistência e Armazenamento Local (localStorage)
 * Responsável pela integridade, sincronização e operações CRUD dos dados.
 */

const STORAGE_KEYS = {
  USERS: 'conecta_saude_usuarios',
  APPOINTMENTS: 'conecta_saude_consultas',
  SESSION: 'conecta_saude_sessao',
  CONFIG: 'conecta_saude_configuracoes'
};

// Dados padrão embutidos para garantir funcionamento imediato mesmo sob protocolo file://
const DEFAULT_USERS = [
  {
    id: "1",
    nome: "João da Silva",
    email: "joao@email.com",
    cpf: "123.456.789-09",
    senha: "123456",
    tipo: "paciente",
    telefone: "(11) 98765-4321",
    dataNascimento: "1988-06-15",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80"
  },
  {
    id: "2",
    nome: "Maria Souza",
    email: "maria@email.com",
    cpf: "529.982.247-25",
    senha: "123456",
    tipo: "paciente",
    telefone: "(11) 97654-3210",
    dataNascimento: "1992-03-22",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80"
  },
  {
    id: "5",
    nome: "Daniel Boming",
    email: "daniel@email.com",
    cpf: "055.602.825-78",
    senha: "123456",
    tipo: "paciente",
    telefone: "(11) 99123-4567",
    dataNascimento: "1985-11-10",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80"
  },
  {
    id: "6",
    nome: "Filipe Valentim",
    email: "filipe@email.com",
    cpf: "853.414.280-99",
    senha: "123456",
    tipo: "paciente",
    telefone: "(11) 98234-5678",
    dataNascimento: "1995-09-05",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80"
  },
  {
    id: "3",
    nome: "Dr. Pedro Candido",
    email: "pedro@conectasaude.com",
    cpf: "711.458.120-22",
    senha: "123456",
    tipo: "profissional",
    especialidade: "Ortopedista",
    crm: "CRM/SP 123456",
    telefone: "(11) 91234-5678",
    biografia: "Especialista em cirurgia ortopédica e traumatologia com mais de 12 anos de experiência clínica.",
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "4",
    nome: "Dra. Isabela Martins",
    email: "isabela@conectasaude.com",
    cpf: "269.141.250-70",
    senha: "123456",
    tipo: "profissional",
    especialidade: "Cardiologista",
    crm: "CRM/SP 654321",
    telefone: "(11) 92345-6789",
    biografia: "Cardiologista clínica com foco em prevenção cardiovascular, arritmias e check-ups completos.",
    avatar: "https://images.unsplash.com/photo-1594824813566-78a9c3757f46?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "7",
    nome: "Dr. Carlos Mendes",
    email: "carlos@conectasaude.com",
    cpf: "324.815.930-41",
    senha: "123456",
    tipo: "profissional",
    especialidade: "Pediatra",
    crm: "CRM/SP 789123",
    telefone: "(11) 93456-7890",
    biografia: "Cuidado humanizado e acompanhamento do crescimento infantil da infância à adolescência.",
    avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "8",
    nome: "Dra. Camila Rocha",
    email: "camila@conectasaude.com",
    cpf: "491.726.850-13",
    senha: "123456",
    tipo: "profissional",
    especialidade: "Oftalmologista",
    crm: "CRM/SP 321654",
    telefone: "(11) 94567-8901",
    biografia: "Saúde ocular completa, cirurgia refrativa e prevenção de doenças da visão.",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "9",
    nome: "Dra. Juliana Freitas",
    email: "juliana@conectasaude.com",
    cpf: "638.192.470-85",
    senha: "123456",
    tipo: "profissional",
    especialidade: "Ginecologista",
    crm: "CRM/SP 987321",
    telefone: "(11) 95678-9012",
    biografia: "Acompanhamento ginecológico preventivo, saúde feminina integrada e obstetrícia.",
    avatar: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "10",
    nome: "Dr. Roberto Almeida",
    email: "roberto@conectasaude.com",
    cpf: "175.943.820-60",
    senha: "123456",
    tipo: "profissional",
    especialidade: "Urologista",
    crm: "CRM/SP 456789",
    telefone: "(11) 96789-0123",
    biografia: "Urologia clínica, saúde do homem e diagnóstico precoce de patologias do trato urinário.",
    avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "11",
    nome: "Dra. Amanda Costa",
    email: "amanda@conectasaude.com",
    cpf: "824.519.370-94",
    senha: "123456",
    tipo: "profissional",
    especialidade: "Nutricionista",
    crm: "CRN/SP 159753",
    telefone: "(11) 97890-1234",
    biografia: "Nutrição clínica funcional, reeducação alimentar e planos individualizados de bem-estar.",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80"
  },
  {
    "id": "12",
    "nome": "Dr. Marcos Silveira",
    "email": "marcos@conectasaude.com",
    "cpf": "962.384.710-07",
    "senha": "123456",
    "tipo": "profissional",
    "especialidade": "Geriatra",
    "crm": "CRM/SP 852963",
    "telefone": "(11) 98901-2345",
    "biografia": "Atenção integral ao paciente idoso, preservação da autonomia física e mental.",
    avatar: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=400&q=80"
  }
];

const DEFAULT_APPOINTMENTS = [
  {
    id: "c1",
    pacienteId: "1",
    pacienteNome: "João da Silva",
    pacienteEmail: "joao@email.com",
    pacienteTelefone: "(11) 98765-4321",
    profissionalId: "3",
    medicoNome: "Dr. Pedro Candido",
    especialidade: "Ortopedista",
    data: "2026-05-24",
    dataFormatada: "24 Maio",
    horario: "08:00",
    tipo: "Consulta",
    motivo: "Dor no joelho",
    status: "Confirmado",
    resumoAtendimento: ""
  },
  {
    id: "c2",
    pacienteId: "5",
    pacienteNome: "Daniel Boming",
    pacienteEmail: "daniel@email.com",
    pacienteTelefone: "(11) 99123-4567",
    profissionalId: "3",
    medicoNome: "Dr. Pedro Candido",
    especialidade: "Ortopedista",
    data: "2026-05-24",
    dataFormatada: "24 Maio",
    horario: "09:00",
    tipo: "Consulta",
    motivo: "Luxação no ombro",
    status: "Confirmado",
    resumoAtendimento: ""
  },
  {
    id: "c3",
    pacienteId: "6",
    pacienteNome: "Filipe Valentim",
    pacienteEmail: "filipe@email.com",
    pacienteTelefone: "(11) 98234-5678",
    profissionalId: "3",
    medicoNome: "Dr. Pedro Candido",
    especialidade: "Ortopedista",
    data: "2026-05-24",
    dataFormatada: "24 Maio",
    horario: "11:30",
    tipo: "Retorno",
    motivo: "Fratura no punho",
    status: "Confirmado",
    resumoAtendimento: ""
  },
  {
    id: "c4",
    pacienteId: "1",
    pacienteNome: "João da Silva",
    pacienteEmail: "joao@email.com",
    pacienteTelefone: "(11) 98765-4321",
    profissionalId: "3",
    medicoNome: "Dr. Pedro Candido",
    especialidade: "Ortopedista",
    data: "2026-05-24",
    dataFormatada: "24 Maio",
    horario: "14:00",
    tipo: "Consulta",
    motivo: "Acompanhamento geral de coluna",
    status: "Aguardando confirmação",
    resumoAtendimento: ""
  },
  {
    id: "c5",
    pacienteId: "1",
    pacienteNome: "João da Silva",
    pacienteEmail: "joao@email.com",
    pacienteTelefone: "(11) 98765-4321",
    profissionalId: "4",
    medicoNome: "Dra. Isabela Martins",
    especialidade: "Cardiologista",
    data: "2026-05-24",
    dataFormatada: "24 Maio",
    horario: "16:00",
    tipo: "Consulta",
    motivo: "Exame e check-up de rotina cardiovascular",
    status: "Confirmado",
    resumoAtendimento: ""
  },
  {
    id: "c6",
    pacienteId: "1",
    pacienteNome: "João da Silva",
    pacienteEmail: "joao@email.com",
    pacienteTelefone: "(11) 98765-4321",
    profissionalId: "4",
    medicoNome: "Dra. Isabela Martins",
    especialidade: "Cardiologista",
    data: "2026-02-16",
    dataFormatada: "16 Fev",
    horario: "10:30",
    tipo: "Consulta",
    motivo: "Dor no peito e cansaço aos esforços",
    status: "Concluído",
    resumoAtendimento: "Paciente avaliado clinicamente. Realizado Eletrocardiograma de repouso com traçado regular. Solicitado ecocardiograma transtorácico. Prescrita reavaliação em 30 dias com controle de pressão arterial."
  },
  {
    id: "c7",
    pacienteId: "2",
    pacienteNome: "Maria Souza",
    pacienteEmail: "maria@email.com",
    pacienteTelefone: "(11) 97654-3210",
    profissionalId: "3",
    medicoNome: "Dr. Pedro Candido",
    especialidade: "Ortopedista",
    data: "2026-05-25",
    dataFormatada: "25 Maio",
    horario: "10:00",
    tipo: "Consulta",
    motivo: "Tendinite no ombro direito",
    status: "Confirmado",
    resumoAtendimento: ""
  },
  {
    id: "c8",
    pacienteId: "2",
    pacienteNome: "Maria Souza",
    pacienteEmail: "maria@email.com",
    pacienteTelefone: "(11) 97654-3210",
    profissionalId: "3",
    medicoNome: "Dr. Pedro Candido",
    especialidade: "Ortopedista",
    data: "2026-01-15",
    dataFormatada: "15 Jan",
    horario: "14:30",
    tipo: "Consulta",
    motivo: "Entorse de tornozelo",
    status: "Concluído",
    resumoAtendimento: "Avaliação de entorse grau I. Prescrito anti-inflamatório por 5 dias, repouso relativo e compressas frias. Alta ortopédica sem sequelas."
  }
];

/**
 * Inicializa os dados no localStorage caso ainda não existam.
 * Prioriza leitura dos arquivos JSON correspondentes, mantendo fallback resiliente.
 */
async function initAppData() {
  // Inicialização de Usuários
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    let usersData = null;
    try {
      const res = await fetch('json/usuarios.json');
      if (res.ok) {
        usersData = await res.json();
      }
    } catch (e) {
      console.info('Aviso: Utilizando base inicial de usuários do sistema.');
    }
    const finalUsers = (Array.isArray(usersData) && usersData.length > 0) ? usersData : DEFAULT_USERS;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(finalUsers));
  }

  // Inicialização de Consultas
  if (!localStorage.getItem(STORAGE_KEYS.APPOINTMENTS)) {
    let appointmentsData = null;
    try {
      const res = await fetch('json/consultas.json');
      if (res.ok) {
        appointmentsData = await res.json();
      }
    } catch (e) {
      console.info('Aviso: Utilizando base inicial de consultas do sistema.');
    }
    const finalAppointments = (Array.isArray(appointmentsData) && appointmentsData.length > 0) ? appointmentsData : DEFAULT_APPOINTMENTS;
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(finalAppointments));
  }
}

// -------------------------------------------------------------
// Operações com Usuários
// -------------------------------------------------------------

function getStoredUsers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!raw) return DEFAULT_USERS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_USERS;
  } catch (err) {
    console.error('Erro ao ler usuários do localStorage:', err);
    return DEFAULT_USERS;
  }
}

function saveStoredUsers(users) {
  try {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return true;
  } catch (err) {
    console.error('Erro ao salvar usuários no localStorage:', err);
    return false;
  }
}

function findUserById(id) {
  if (!id) return null;
  const users = getStoredUsers();
  return users.find(u => String(u.id) === String(id)) || null;
}

function findUserByEmail(email) {
  if (!email) return null;
  const cleanEmail = email.trim().toLowerCase();
  const users = getStoredUsers();
  return users.find(u => u.email && u.email.trim().toLowerCase() === cleanEmail) || null;
}

function findUserByCpf(cpf) {
  if (!cpf) return null;
  const clean = cpf.replace(/\D/g, '');
  const users = getStoredUsers();
  return users.find(u => u.cpf && u.cpf.replace(/\D/g, '') === clean) || null;
}

function findUserByEmailOrCpf(identifier) {
  if (!identifier) return null;
  const cleanInput = identifier.trim().toLowerCase();
  const cleanDigits = identifier.replace(/\D/g, '');
  const users = getStoredUsers();

  return users.find(u => {
    const uEmail = (u.email || '').toLowerCase();
    const uCpfDigits = (u.cpf || '').replace(/\D/g, '');
    return uEmail === cleanInput || (cleanDigits.length === 11 && uCpfDigits === cleanDigits);
  }) || null;
}

function createUser(userData) {
  const users = getStoredUsers();
  const newUser = {
    id: 'u_' + Date.now(),
    ...userData
  };
  users.push(newUser);
  saveStoredUsers(users);
  return newUser;
}

function updateUser(updatedUser) {
  if (!updatedUser || !updatedUser.id) return false;
  const users = getStoredUsers();
  const index = users.findIndex(u => String(u.id) === String(updatedUser.id));
  if (index === -1) return false;

  users[index] = { ...users[index], ...updatedUser };
  saveStoredUsers(users);

  // Se o usuário atualizado for o da sessão ativa, atualiza também a sessão
  const session = getCurrentUser();
  if (session && String(session.id) === String(updatedUser.id)) {
    setCurrentUser(users[index]);
  }
  return true;
}

// -------------------------------------------------------------
// Operações com Consultas
// -------------------------------------------------------------

function getStoredAppointments() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
    if (!raw) return DEFAULT_APPOINTMENTS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_APPOINTMENTS;
  } catch (err) {
    console.error('Erro ao ler consultas do localStorage:', err);
    return DEFAULT_APPOINTMENTS;
  }
}

function saveStoredAppointments(appointments) {
  try {
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
    return true;
  } catch (err) {
    console.error('Erro ao salvar consultas no localStorage:', err);
    return false;
  }
}

function getAppointmentsByPatient(patientId) {
  if (!patientId) return [];
  const all = getStoredAppointments();
  return all.filter(a => String(a.pacienteId) === String(patientId));
}

function getAppointmentsByDoctor(doctorId) {
  if (!doctorId) return [];
  const all = getStoredAppointments();
  return all.filter(a => String(a.profissionalId) === String(doctorId));
}

function createAppointment(data) {
  const all = getStoredAppointments();
  const newAppointment = {
    id: 'c_' + Date.now(),
    status: 'Aguardando confirmação',
    resumoAtendimento: '',
    ...data
  };
  all.push(newAppointment);
  saveStoredAppointments(all);
  return newAppointment;
}

function updateAppointment(updatedApp) {
  if (!updatedApp || !updatedApp.id) return false;
  const all = getStoredAppointments();
  const index = all.findIndex(a => a.id === updatedApp.id);
  if (index === -1) return false;

  all[index] = { ...all[index], ...updatedApp };
  saveStoredAppointments(all);
  return true;
}

function updateAppointmentStatus(appId, newStatus, resumoAtendimento = null) {
  if (!appId || !newStatus) return false;
  const all = getStoredAppointments();
  const index = all.findIndex(a => a.id === appId);
  if (index === -1) return false;

  all[index].status = newStatus;
  if (resumoAtendimento !== null) {
    all[index].resumoAtendimento = resumoAtendimento;
  }
  saveStoredAppointments(all);
  return true;
}

function cancelAppointment(appId, cancelReason = '') {
  if (!appId) return false;
  const all = getStoredAppointments();
  const index = all.findIndex(a => a.id === appId);
  if (index === -1) return false;

  all[index].status = 'Cancelado';
  if (cancelReason) {
    all[index].motivoCancelamento = cancelReason;
  }
  saveStoredAppointments(all);
  return true;
}

// -------------------------------------------------------------
// Sessão do Usuário
// -------------------------------------------------------------

function getCurrentUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function setCurrentUser(user) {
  if (!user) {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  } else {
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
  }
}

function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.SESSION);
}

// -------------------------------------------------------------
// Sincronização em Tempo Real entre Abas
// -------------------------------------------------------------

function setupCrossTabSync(callback) {
  window.addEventListener('storage', (event) => {
    if (
      event.key === STORAGE_KEYS.APPOINTMENTS ||
      event.key === STORAGE_KEYS.USERS ||
      event.key === STORAGE_KEYS.SESSION
    ) {
      if (typeof callback === 'function') {
        callback(event.key, event.newValue);
      }
    }
  });
}
