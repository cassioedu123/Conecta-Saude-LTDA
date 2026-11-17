/**
 * Conecta Saúde - Lógica da Área do Paciente (paciente.html)
 */

let currentPatient = null;
let selectedDoctorForBooking = null;

document.addEventListener('DOMContentLoaded', async () => {
  // Verificação rigorosa de autenticação
  currentPatient = checkAuth('paciente');
  if (!currentPatient) return;

  // Carrega os dados da aplicação
  if (typeof initAppData === 'function') {
    await initAppData();
  }

  // Preenche dados do paciente na interface
  populatePatientHeader();

  // Inicializa componentes
  initNavigationTabs();
  renderUpcomingAppointments();
  renderSpecialtiesGrid();
  renderDoctorsList();
  renderPatientConsultas();
  setupBookingForm();
  setupProfileForm();

  // Sincronização entre abas
  setupCrossTabSync(() => {
    renderUpcomingAppointments();
    renderPatientConsultas();
  });
});

/**
 * Preenche dados do paciente no cabeçalho e perfil
 */
function populatePatientHeader() {
  const patientNameEl = document.getElementById('patientNameDisplay');
  const patientWelcomeNameEl = document.getElementById('patientWelcomeName');
  const patientAvatarEl = document.getElementById('patientHeaderAvatar');

  if (patientNameEl) patientNameEl.textContent = currentPatient.nome;
  if (patientWelcomeNameEl) patientWelcomeNameEl.textContent = currentPatient.nome;
  if (patientAvatarEl && currentPatient.avatar) {
    patientAvatarEl.src = currentPatient.avatar;
  }
}

/**
 * Navegação por abas/seções na página
 */
function initNavigationTabs() {
  const navItems = document.querySelectorAll('.patient-nav-item');
  const sections = document.querySelectorAll('.patient-view-section');

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetView = item.getAttribute('data-view');
      switchView(targetView);
    });
  });

  // Botão Agendar no cabeçalho
  const openScheduleBtn = document.getElementById('openScheduleBtn');
  if (openScheduleBtn) {
    openScheduleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openScheduleModal();
    });
  }

  // Botão fechar modal agendamento
  const closeScheduleModalBtn = document.getElementById('closeScheduleModalBtn');
  const scheduleModal = document.getElementById('scheduleModal');
  if (closeScheduleModalBtn && scheduleModal) {
    closeScheduleModalBtn.addEventListener('click', () => {
      scheduleModal.classList.remove('active');
    });
    scheduleModal.addEventListener('click', (e) => {
      if (e.target === scheduleModal) {
        scheduleModal.classList.remove('active');
      }
    });
  }
}

function switchView(viewName) {
  const navItems = document.querySelectorAll('.patient-nav-item');
  const sections = document.querySelectorAll('.patient-view-section');

  navItems.forEach(item => {
    if (item.getAttribute('data-view') === viewName) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  sections.forEach(sec => {
    if (sec.id === `view-${viewName}`) {
      sec.style.display = 'block';
    } else {
      sec.style.display = 'none';
    }
  });

  // Ações de recarregamento específicas da view
  if (viewName === 'consultas') {
    renderPatientConsultas();
  } else if (viewName === 'inicio') {
    renderUpcomingAppointments();
  } else if (viewName === 'profissionais') {
    renderDoctorsList();
  } else if (viewName === 'perfil') {
    populateProfileData();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Renderiza as próximas consultas no Painel Inicial (Wireframe 3)
 */
function renderUpcomingAppointments() {
  const container = document.getElementById('patientUpcomingContainer');
  const countBadge = document.getElementById('patientUpcomingCount');
  if (!container) return;

  const allApps = getAppointmentsByPatient(currentPatient.id);
  // Filtra consultas ativas (Confirmado ou Aguardando)
  const activeApps = allApps.filter(a => a.status === 'Confirmado' || a.status === 'Aguardando confirmação');

  if (countBadge) {
    countBadge.textContent = activeApps.length;
  }

  if (activeApps.length === 0) {
    container.innerHTML = `
      <div class="empty-state-card">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--primary-teal)" stroke-width="1.5">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
        <p>Você não possui consultas agendadas no momento.</p>
        <button class="btn btn-orange btn-sm" onclick="openScheduleModal()">Agendar Consulta Agora</button>
      </div>
    `;
    return;
  }

  // Ordena por data e horário
  activeApps.sort((a, b) => (a.data + a.horario).localeCompare(b.data + b.horario));

  let html = '';
  activeApps.slice(0, 4).forEach(app => {
    const dateInfo = formatDateBR(app.data);
    const isConfirmed = app.status === 'Confirmado' || app.status === 'Confirmada';
    const statusClass = isConfirmed ? 'status-confirmed' : 'status-pending';
    const statusText = isConfirmed ? 'Confirmada' : 'Aguardando confirmação';

    html += `
      <div class="patient-appointment-card">
        <div class="pac-date-box">
          <span class="pac-day">${escapeHtml(dateInfo.dia)}</span>
          <span class="pac-month">${escapeHtml(dateInfo.mesAbrev)}</span>
          <span class="pac-time">${escapeHtml(app.horario)}</span>
        </div>
        <div class="pac-avatar-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="var(--primary-teal)">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
          </svg>
        </div>
        <div class="pac-details">
          <h4 class="pac-doc-name">${escapeHtml(app.medicoNome)}</h4>
          <p class="pac-doc-role">${escapeHtml(app.especialidade)}</p>
          <span class="pac-status-tag ${statusClass}">${escapeHtml(statusText)}</span>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

/**
 * Grid de Especialidades (Wireframe 5)
 */
function renderSpecialtiesGrid() {
  const gridContainer = document.getElementById('specialtiesGridContainer');
  if (!gridContainer) return;

  const specialties = [
    { nome: 'Cardiologista', plural: 'Cardiologistas', icon: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z' },
    { nome: 'Oftalmologista', plural: 'Oftamologistas', icon: 'M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z' },
    { nome: 'Pediatra', plural: 'Pediatras', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-3.5-9c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm7 0c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-3.5 5.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z' },
    { nome: 'Ortopedista', plural: 'Ortopedistas', icon: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z' },
    { nome: 'Ginecologista', plural: 'Ginecologistas', icon: 'M12 2a6 6 0 1 0 0 12 6 6 0 0 0 0-12zm-1 14v2H9v2h2v2h2v-2h2v-2h-2v-2h-2z' },
    { nome: 'Urologista', plural: 'Urologistas', icon: 'M14 2h6v6l-2.24-2.24-4.14 4.14a7 7 0 1 0 1.41 1.41l4.14-4.14L20 8V2h-6z' },
    { nome: 'Nutricionista', plural: 'Nutricionistas', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z' },
    { nome: 'Geriatra', plural: 'Geriatras', icon: 'M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7z' }
  ];

  let html = '';
  specialties.forEach(sp => {
    html += `
      <button class="specialty-pill-btn" onclick="filterDoctorsBySpecialty('${escapeHtml(sp.nome)}')">
        <svg class="specialty-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="${sp.icon}"/>
        </svg>
        <span>${escapeHtml(sp.plural)}</span>
      </button>
    `;
  });

  gridContainer.innerHTML = html;
}

/**
 * Renderiza listagem de médicos com opção de filtro por especialidade
 */
function renderDoctorsList(filterSpecialty = null) {
  const container = document.getElementById('doctorsListCardsContainer');
  const titleEl = document.getElementById('doctorsListTitle');
  if (!container) return;

  const users = getStoredUsers();
  let doctors = users.filter(u => u.tipo === 'profissional');

  if (filterSpecialty) {
    doctors = doctors.filter(d => d.especialidade && d.especialidade.toLowerCase() === filterSpecialty.toLowerCase());
    if (titleEl) titleEl.textContent = `Profissionais: ${filterSpecialty}`;
  } else {
    if (titleEl) titleEl.textContent = 'Todos os Profissionais Disponíveis';
  }

  if (doctors.length === 0) {
    container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #666; padding: 2rem;">Nenhum profissional encontrado para esta especialidade.</p>`;
    return;
  }

  let html = '';
  doctors.forEach(doc => {
    const avatar = doc.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80';
    html += `
      <div class="doctor-profile-card-item">
        <div class="dp-avatar-box">
          <img src="${escapeHtml(avatar)}" alt="${escapeHtml(doc.nome)}">
        </div>
        <div class="dp-content">
          <h4>${escapeHtml(doc.nome)}</h4>
          <span class="dp-specialty-badge">${escapeHtml(doc.especialidade || 'Clínico Geral')}</span>
          <p class="dp-crm">${escapeHtml(doc.crm || 'CRM Ativo')}</p>
          <p class="dp-bio">${escapeHtml(doc.biografia || 'Atendimento humanizado e focado na saúde integral do paciente.')}</p>
          <button class="btn btn-orange btn-sm" onclick="startBookingWithDoctor('${escapeHtml(doc.id)}')">
            Agendar Consulta
          </button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function filterDoctorsBySpecialty(specialty) {
  renderDoctorsList(specialty);
  const target = document.getElementById('doctorsListTitle');
  if (target) {
    target.scrollIntoView({ behavior: 'smooth' });
  }
}

/**
 * Inicia o agendamento pré-selecionando um médico específico
 */
function startBookingWithDoctor(doctorId) {
  openScheduleModal(doctorId);
}

/**
 * Abre o Modal de Agendamento (Wireframe 8)
 */
function openScheduleModal(preSelectedDoctorId = null) {
  const modal = document.getElementById('scheduleModal');
  if (!modal) return;

  const espSelect = document.getElementById('scheduleEspecialidade');
  const docSelect = document.getElementById('scheduleProfissional');
  const dateInput = document.getElementById('scheduleData');
  const slotsContainer = document.getElementById('availableSlotsContainer');
  const alertEl = document.getElementById('modalScheduleAlert');

  if (alertEl) alertEl.style.display = 'none';

  // Configura data mínima como hoje
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const minDate = `${yyyy}-${mm}-${dd}`;
  if (dateInput) {
    dateInput.min = minDate;
    if (!dateInput.value) {
      dateInput.value = minDate;
    }
  }

  // Preenche especialidades
  populateSpecialtiesSelect();

  if (preSelectedDoctorId) {
    const doc = findUserById(preSelectedDoctorId);
    if (doc) {
      if (espSelect) espSelect.value = doc.especialidade;
      populateDoctorsSelect(doc.especialidade, doc.id);
    }
  } else {
    populateDoctorsSelect();
  }

  updateAvailableSlots();
  modal.classList.add('active');
}

function populateSpecialtiesSelect() {
  const espSelect = document.getElementById('scheduleEspecialidade');
  if (!espSelect) return;

  const users = getStoredUsers();
  const doctors = users.filter(u => u.tipo === 'profissional');
  const specialties = Array.from(new Set(doctors.map(d => d.especialidade).filter(Boolean)));

  espSelect.innerHTML = '<option value="">Todas as especialidades</option>' +
    specialties.map(esp => `<option value="${escapeHtml(esp)}">${escapeHtml(esp)}</option>`).join('');
}

function populateDoctorsSelect(filterSpecialty = null, selectedDocId = null) {
  const docSelect = document.getElementById('scheduleProfissional');
  if (!docSelect) return;

  const users = getStoredUsers();
  let doctors = users.filter(u => u.tipo === 'profissional');

  if (filterSpecialty) {
    doctors = doctors.filter(d => d.especialidade && d.especialidade.toLowerCase() === filterSpecialty.toLowerCase());
  }

  docSelect.innerHTML = '<option value="" disabled selected>Selecione um profissional</option>' +
    doctors.map(d => {
      const isSelected = selectedDocId && String(d.id) === String(selectedDocId) ? 'selected' : '';
      return `<option value="${escapeHtml(d.id)}" data-esp="${escapeHtml(d.especialidade || '')}" ${isSelected}>${escapeHtml(d.nome)} (${escapeHtml(d.especialidade || 'Geral')})</option>`;
    }).join('');
}

/**
 * Configuração do fluxo de formulário de agendamento
 */
function setupBookingForm() {
  const espSelect = document.getElementById('scheduleEspecialidade');
  const docSelect = document.getElementById('scheduleProfissional');
  const dateInput = document.getElementById('scheduleData');
  const periodoSelect = document.getElementById('schedulePeriodo');
  const form = document.getElementById('bookingForm');

  if (espSelect) {
    espSelect.addEventListener('change', () => {
      populateDoctorsSelect(espSelect.value);
      updateAvailableSlots();
    });
  }

  if (docSelect) {
    docSelect.addEventListener('change', () => {
      updateAvailableSlots();
    });
  }

  if (dateInput) {
    dateInput.addEventListener('change', () => {
      updateAvailableSlots();
    });
  }

  if (periodoSelect) {
    periodoSelect.addEventListener('change', () => {
      updateAvailableSlots();
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const doctorId = docSelect ? docSelect.value : '';
      const dataVal = dateInput ? dateInput.value : '';
      const selectedSlotBtn = document.querySelector('.time-slot-btn.selected');
      const motivoVal = document.getElementById('scheduleMotivo') ? document.getElementById('scheduleMotivo').value.trim() : '';

      if (!doctorId) {
        showAlert('modalScheduleAlert', 'Por favor, selecione um profissional médico.', 'danger');
        return;
      }

      if (!dataVal) {
        showAlert('modalScheduleAlert', 'Selecione uma data para a consulta.', 'danger');
        return;
      }

      // Impede datas passadas
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const chosen = new Date(dataVal + 'T00:00:00');
      if (chosen < today) {
        showAlert('modalScheduleAlert', 'Não é permitido agendar em datas passadas.', 'danger');
        return;
      }

      if (!selectedSlotBtn) {
        showAlert('modalScheduleAlert', 'Por favor, clique e selecione um horário disponível.', 'danger');
        return;
      }

      const horarioVal = selectedSlotBtn.getAttribute('data-slot');

      // Validação de conflito: mesmo profissional no mesmo horário
      const allAppointments = getStoredAppointments();
      const conflictDoctor = allAppointments.find(a =>
        String(a.profissionalId) === String(doctorId) &&
        a.data === dataVal &&
        a.horario === horarioVal &&
        a.status !== 'Cancelado'
      );

      if (conflictDoctor) {
        showAlert('modalScheduleAlert', 'Este horário acabou de ser ocupado com este profissional. Por favor, escolha outro.', 'danger');
        updateAvailableSlots();
        return;
      }

      // Validação de conflito: o próprio paciente já tem consulta no mesmo horário
      const conflictPatient = allAppointments.find(a =>
        String(a.pacienteId) === String(currentPatient.id) &&
        a.data === dataVal &&
        a.horario === horarioVal &&
        a.status !== 'Cancelado'
      );

      if (conflictPatient) {
        showAlert('modalScheduleAlert', 'Você já possui outra consulta agendada exatamente neste mesmo dia e horário!', 'danger');
        return;
      }

      const doctor = findUserById(doctorId);
      const dateInfo = formatDateBR(dataVal);

      // Cria a nova consulta
      const newApp = createAppointment({
        pacienteId: currentPatient.id,
        pacienteNome: currentPatient.nome,
        pacienteEmail: currentPatient.email,
        pacienteTelefone: currentPatient.telefone || '',
        profissionalId: doctor.id,
        medicoNome: doctor.nome,
        especialidade: doctor.especialidade || 'Clínico Geral',
        data: dataVal,
        dataFormatada: dateInfo.resumo,
        horario: horarioVal,
        tipo: 'Consulta',
        motivo: motivoVal || 'Consulta de rotina / Avaliação clínica',
        status: 'Aguardando confirmação'
      });

      showAlert('modalScheduleAlert', 'Consulta agendada com sucesso! Aguarde a confirmação do profissional.', 'success');

      setTimeout(() => {
        document.getElementById('scheduleModal').classList.remove('active');
        form.reset();
        renderUpcomingAppointments();
        renderPatientConsultas();
        showToast('Consulta agendada com sucesso!', 'success');
      }, 1200);
    });
  }
}

/**
 * Calcula e atualiza os horários disponíveis dinamicamente
 */
function updateAvailableSlots() {
  const container = document.getElementById('availableSlotsContainer');
  const docSelect = document.getElementById('scheduleProfissional');
  const dateInput = document.getElementById('scheduleData');
  const periodoSelect = document.getElementById('schedulePeriodo');

  if (!container) return;

  const doctorId = docSelect ? docSelect.value : '';
  const dataVal = dateInput ? dateInput.value : '';
  const periodoVal = periodoSelect ? periodoSelect.value : 'todos';

  if (!doctorId || !dataVal) {
    container.innerHTML = `<p class="slots-hint">Selecione o profissional e a data para visualizar os horários disponíveis.</p>`;
    return;
  }

  // Base padrão de horários
  const allSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
  ];

  // Filtra por período
  let filteredSlots = allSlots;
  if (periodoVal === 'manha') {
    filteredSlots = allSlots.filter(s => parseInt(s.split(':')[0], 10) < 12);
  } else if (periodoVal === 'tarde') {
    filteredSlots = allSlots.filter(s => parseInt(s.split(':')[0], 10) >= 12);
  }

  // Busca agendamentos ocupados no dia para este profissional e paciente
  const appointments = getStoredAppointments();
  const doctorOccupied = new Set(
    appointments
      .filter(a => String(a.profissionalId) === String(doctorId) && a.data === dataVal && a.status !== 'Cancelado')
      .map(a => a.horario)
  );

  const patientOccupied = new Set(
    appointments
      .filter(a => String(a.pacienteId) === String(currentPatient.id) && a.data === dataVal && a.status !== 'Cancelado')
      .map(a => a.horario)
  );

  let html = '';
  filteredSlots.forEach(slot => {
    const isDocTaken = doctorOccupied.has(slot);
    const isPatientTaken = patientOccupied.has(slot);

    if (isDocTaken || isPatientTaken) {
      const reasonTitle = isPatientTaken ? 'Você já tem consulta neste horário' : 'Horário já ocupado';
      html += `
        <button type="button" class="time-slot-btn disabled" disabled title="${escapeHtml(reasonTitle)}">
          ${escapeHtml(slot)}
        </button>
      `;
    } else {
      html += `
        <button type="button" class="time-slot-btn" data-slot="${escapeHtml(slot)}" onclick="selectTimeSlot(this)">
          ${escapeHtml(slot)}
        </button>
      `;
    }
  });

  container.innerHTML = html;
}

function selectTimeSlot(btn) {
  document.querySelectorAll('.time-slot-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
}

/**
 * Renderiza Minhas Consultas & Histórico (Wireframe 7)
 */
function renderPatientConsultas(filterStatus = 'todas') {
  const container = document.getElementById('patientConsultasTableBody');
  if (!container) return;

  const allApps = getAppointmentsByPatient(currentPatient.id);

  let filtered = allApps;
  if (filterStatus === 'proximas') {
    filtered = allApps.filter(a => a.status === 'Confirmado' || a.status === 'Aguardando confirmação');
  } else if (filterStatus === 'realizadas') {
    filtered = allApps.filter(a => a.status === 'Concluído');
  } else if (filterStatus === 'canceladas') {
    filtered = allApps.filter(a => a.status === 'Cancelado');
  }

  // Ordena por data decrescente
  filtered.sort((a, b) => (b.data + b.horario).localeCompare(a.data + a.horario));

  if (filtered.length === 0) {
    container.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; color: #777; padding: 2rem;">
          Nenhuma consulta encontrada nesta categoria.
        </td>
      </tr>
    `;
    return;
  }

  let html = '';
  filtered.forEach(app => {
    const dateInfo = formatDateBR(app.data);
    const statusMap = {
      'Confirmado': { text: 'Confirmado', css: 'status-confirmed' },
      'Aguardando confirmação': { text: 'Aguardando', css: 'status-pending' },
      'Concluído': { text: 'Concluído', css: 'status-completed' },
      'Cancelado': { text: 'Cancelado', css: 'status-canceled' }
    };

    const statusObj = statusMap[app.status] || { text: app.status, css: 'status-pending' };
    const canCancel = app.status === 'Confirmado' || app.status === 'Aguardando confirmação';
    const hasSummary = Boolean(app.resumoAtendimento);

    html += `
      <tr>
        <td><strong>${escapeHtml(dateInfo.formatada)}</strong><br><small style="color: #666;">${escapeHtml(app.horario)}</small></td>
        <td><strong>${escapeHtml(app.medicoNome)}</strong></td>
        <td>${escapeHtml(app.especialidade)}</td>
        <td>${escapeHtml(app.tipo || 'Consulta')}</td>
        <td style="max-width: 200px;">${escapeHtml(app.motivo || '-')}</td>
        <td><span class="pac-status-tag ${statusObj.css}">${escapeHtml(statusObj.text)}</span></td>
        <td>
          <div style="display: flex; gap: 0.4rem; flex-wrap: wrap;">
            ${hasSummary ? `
              <button class="btn btn-outline-teal btn-xs" onclick="viewMedicalSummary('${escapeHtml(app.id)}')">
                Ver Laudo
              </button>
            ` : ''}
            ${canCancel ? `
              <button class="btn btn-outline-danger btn-xs" onclick="confirmCancelAppointment('${escapeHtml(app.id)}')">
                Cancelar
              </button>
            ` : ''}
          </div>
        </td>
      </tr>
    `;
  });

  container.innerHTML = html;
}

function filterConsultasTable(status, tabBtn) {
  document.querySelectorAll('.filter-tab-btn').forEach(btn => btn.classList.remove('active'));
  if (tabBtn) tabBtn.classList.add('active');
  renderPatientConsultas(status);
}

/**
 * Visualizar Resumo / Prontuário Médico da Consulta
 */
function viewMedicalSummary(appId) {
  const allApps = getStoredAppointments();
  const app = allApps.find(a => a.id === appId);
  if (!app) return;

  const modal = document.getElementById('summaryModal');
  const contentEl = document.getElementById('summaryModalContent');
  if (!modal || !contentEl) return;

  const dateInfo = formatDateBR(app.data);

  contentEl.innerHTML = `
    <div style="margin-bottom: 1rem;">
      <h4 style="color: var(--primary-teal-dark);">${escapeHtml(app.medicoNome)}</h4>
      <p style="color: #555;">${escapeHtml(app.especialidade)} — Atendimento em ${escapeHtml(dateInfo.completa)} às ${escapeHtml(app.horario)}</p>
    </div>
    <div style="background: #f8fafc; padding: 1.2rem; border-radius: 8px; border-left: 4px solid var(--primary-teal); margin-bottom: 1rem;">
      <h5 style="color: var(--primary-teal); margin-bottom: 0.5rem;">Motivo da Consulta</h5>
      <p style="color: #333;">${escapeHtml(app.motivo || 'Consulta de rotina')}</p>
    </div>
    <div style="background: #f8fafc; padding: 1.2rem; border-radius: 8px; border-left: 4px solid var(--accent-orange);">
      <h5 style="color: var(--accent-orange); margin-bottom: 0.5rem;">Resumo Clínico / Orientações</h5>
      <p style="color: #333; line-height: 1.6; white-space: pre-line;">${escapeHtml(app.resumoAtendimento || 'Nenhum resumo registrado.')}</p>
    </div>
  `;

  modal.classList.add('active');
}

function closeSummaryModal() {
  const modal = document.getElementById('summaryModal');
  if (modal) modal.classList.remove('active');
}

/**
 * Cancelamento de consulta pelo paciente com confirmação
 */
function confirmCancelAppointment(appId) {
  if (confirm('Tem certeza de que deseja cancelar esta consulta?')) {
    cancelAppointment(appId, 'Cancelado pelo paciente');
    renderUpcomingAppointments();
    renderPatientConsultas();
    showToast('Consulta cancelada com sucesso.', 'info');
  }
}

/**
 * Visualizar Resultado de Exame Simulado (Wireframe 7)
 */
function viewExamModal(examTitle, examDate) {
  alert(`Resultado do Exame: ${examTitle}\nData de Realização: ${examDate}\n\nStatus: Concluído e laudado.\nTodos os parâmetros encontram-se dentro da normalidade clínica esperada.`);
}

/**
 * Gestão de Perfil do Paciente
 */
function populateProfileData() {
  const nomeInput = document.getElementById('profileNome');
  const emailInput = document.getElementById('profileEmail');
  const cpfInput = document.getElementById('profileCpf');
  const telInput = document.getElementById('profileTelefone');
  const alertEl = document.getElementById('profileAlert');

  if (alertEl) alertEl.style.display = 'none';

  if (nomeInput) nomeInput.value = currentPatient.nome || '';
  if (emailInput) emailInput.value = currentPatient.email || '';
  if (cpfInput) cpfInput.value = currentPatient.cpf || '';
  if (telInput) telInput.value = currentPatient.telefone || '';
}

function setupProfileForm() {
  const form = document.getElementById('patientProfileForm');
  const passwordForm = document.getElementById('patientPasswordForm');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const nome = document.getElementById('profileNome').value.trim();
      const email = document.getElementById('profileEmail').value.trim().toLowerCase();
      const telefone = document.getElementById('profileTelefone').value.trim();

      if (!nome || !email) {
        showAlert('profileAlert', 'Nome e e-mail são obrigatórios.', 'danger');
        return;
      }

      // Verifica duplicidade de e-mail se alterou
      if (email !== currentPatient.email.toLowerCase()) {
        const existing = findUserByEmail(email);
        if (existing && String(existing.id) !== String(currentPatient.id)) {
          showAlert('profileAlert', 'Este e-mail já está em uso por outro usuário.', 'danger');
          return;
        }
      }

      currentPatient.nome = nome;
      currentPatient.email = email;
      currentPatient.telefone = telefone;

      updateUser(currentPatient);
      populatePatientHeader();
      showAlert('profileAlert', 'Perfil atualizado com sucesso!', 'success');
      showToast('Perfil salvo com sucesso!', 'success');
    });
  }

  if (passwordForm) {
    passwordForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const currentPass = document.getElementById('profileCurrentPass').value.trim();
      const newPass = document.getElementById('profileNewPass').value.trim();
      const confirmNewPass = document.getElementById('profileConfirmNewPass').value.trim();

      if (currentPass !== currentPatient.senha) {
        showAlert('profilePassAlert', 'A senha atual digitada está incorreta.', 'danger');
        return;
      }

      if (newPass.length < 6) {
        showAlert('profilePassAlert', 'A nova senha deve possuir pelo menos 6 caracteres.', 'danger');
        return;
      }

      if (newPass !== confirmNewPass) {
        showAlert('profilePassAlert', 'As senhas informadas não coincidem.', 'danger');
        return;
      }

      currentPatient.senha = newPass;
      updateUser(currentPatient);
      passwordForm.reset();
      showAlert('profilePassAlert', 'Senha alterada com sucesso!', 'success');
      showToast('Senha alterada com sucesso!', 'success');
    });
  }
}
