/**
 * Conecta Saúde - Lógica da Área do Profissional de Saúde (profissional.html)
 */

let currentDoctor = null;
let selectedAgendaDate = null;
let currentCalendarMonth = new Date().getMonth();
let currentCalendarYear = new Date().getFullYear();

document.addEventListener('DOMContentLoaded', async () => {
  // Verificação de autenticação de profissional
  currentDoctor = checkAuth('profissional');
  if (!currentDoctor) return;

  // Carrega dados da aplicação
  if (typeof initAppData === 'function') {
    await initAppData();
  }

  // Preenche informações do médico
  populateDoctorHeaderAndProfile();

  // Inicializa data da agenda com hoje ou uma data com consultas existentes
  initDefaultAgendaDate();

  // Inicializa componentes
  initDoctorNavigation();
  renderDoctorDashboard();
  renderMiniCalendar();
  renderAgendaView();
  renderConsultasRealizadas();
  renderDoctorPatients();
  setupDoctorProfileForms();

  // Sincronização entre abas
  setupCrossTabSync(() => {
    renderDoctorDashboard();
    renderAgendaView();
    renderConsultasRealizadas();
    renderDoctorPatients();
  });
});

/**
 * Preenche o perfil e cabeçalho do médico
 */
function populateDoctorHeaderAndProfile() {
  const nameDisplay = document.getElementById('doctorHeaderName');
  const roleDisplay = document.getElementById('doctorHeaderRole');
  const avatarImg = document.getElementById('doctorHeaderAvatar');

  const cardName = document.getElementById('doctorCardName');
  const cardRole = document.getElementById('doctorCardRole');
  const cardCrm = document.getElementById('doctorCardCrm');
  const cardAvatar = document.getElementById('doctorCardAvatar');
  const welcomeName = document.getElementById('doctorWelcomeName');

  if (nameDisplay) nameDisplay.textContent = currentDoctor.nome;
  if (roleDisplay) roleDisplay.textContent = currentDoctor.especialidade || 'Profissional';
  if (avatarImg && currentDoctor.avatar) avatarImg.src = currentDoctor.avatar;

  if (cardName) cardName.textContent = currentDoctor.nome;
  if (cardRole) cardRole.textContent = currentDoctor.especialidade || 'Especialista';
  if (cardCrm) cardCrm.textContent = currentDoctor.crm || 'CRM Ativo';
  if (cardAvatar && currentDoctor.avatar) cardAvatar.src = currentDoctor.avatar;
  if (welcomeName) welcomeName.textContent = currentDoctor.nome;

  // Atualiza data do banner
  const today = new Date();
  const dateFormatted = formatDateBR(today.toISOString().split('T')[0]);
  const bannerDateFull = document.getElementById('bannerDateFull');
  const bannerDateWeekday = document.getElementById('bannerDateWeekday');
  if (bannerDateFull) bannerDateFull.textContent = dateFormatted.completa;
  if (bannerDateWeekday) bannerDateWeekday.textContent = dateFormatted.diaSemana;
}

/**
 * Define a data inicial da agenda: se hoje tiver consultas, usa hoje; senão busca a próxima data ativa ou a data de mock 2026-05-24
 */
function initDefaultAgendaDate() {
  const doctorApps = getAppointmentsByDoctor(currentDoctor.id);
  const todayStr = new Date().toISOString().split('T')[0];

  const hasToday = doctorApps.some(a => a.data === todayStr && a.status !== 'Cancelado');
  if (hasToday) {
    selectedAgendaDate = todayStr;
  } else if (doctorApps.length > 0) {
    // Escolhe a data do primeiro agendamento ativo ou a mockada 2026-05-24
    const mockApp = doctorApps.find(a => a.data === '2026-05-24');
    selectedAgendaDate = mockApp ? '2026-05-24' : doctorApps[0].data;
  } else {
    selectedAgendaDate = todayStr;
  }

  const parts = selectedAgendaDate.split('-');
  currentCalendarYear = parseInt(parts[0], 10);
  currentCalendarMonth = parseInt(parts[1], 10) - 1;
}

/**
 * Navegação por abas na área profissional
 */
function initDoctorNavigation() {
  const navItems = document.querySelectorAll('.doctor-nav-item');
  const sections = document.querySelectorAll('.doctor-view-section');

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetView = item.getAttribute('data-view');
      switchDoctorView(targetView);
    });
  });

  // Botão Atender no topo
  const btnAtenderTop = document.getElementById('btnAtenderTop');
  if (btnAtenderTop) {
    btnAtenderTop.addEventListener('click', (e) => {
      e.preventDefault();
      openQuickAttendanceModal();
    });
  }

  // Fechamento de modais
  const closeAttendanceBtn = document.getElementById('closeAttendanceModalBtn');
  const attendanceModal = document.getElementById('attendanceModal');
  if (closeAttendanceBtn && attendanceModal) {
    closeAttendanceBtn.addEventListener('click', () => {
      attendanceModal.classList.remove('active');
    });
    attendanceModal.addEventListener('click', (e) => {
      if (e.target === attendanceModal) attendanceModal.classList.remove('active');
    });
  }
}

function switchDoctorView(viewName) {
  const navItems = document.querySelectorAll('.doctor-nav-item');
  const sections = document.querySelectorAll('.doctor-view-section');

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

  if (viewName === 'inicio') {
    renderDoctorDashboard();
  } else if (viewName === 'agenda') {
    renderMiniCalendar();
    renderAgendaView();
  } else if (viewName === 'consultas-realizadas') {
    renderConsultasRealizadas();
  } else if (viewName === 'pacientes') {
    renderDoctorPatients();
  } else if (viewName === 'perfil') {
    populateDoctorProfileData();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Renderiza Painel Inicial e Indicadores Dinâmicos (Wireframe 4)
 */
function renderDoctorDashboard() {
  const allDoctorApps = getAppointmentsByDoctor(currentDoctor.id);

  // Calcula consultas para a data de referência (hoje ou a data de agendamento principal)
  const targetDate = selectedAgendaDate || new Date().toISOString().split('T')[0];
  const appsForDay = allDoctorApps.filter(a => a.data === targetDate && a.status !== 'Cancelado');

  const consultasHoje = appsForDay.filter(a => a.tipo === 'Consulta');
  const retornosHoje = appsForDay.filter(a => a.tipo === 'Retorno' || a.status === 'Aguardando confirmação');

  // Próxima consulta do dia
  const proximas = appsForDay.filter(a => a.status === 'Confirmado' || a.status === 'Aguardando confirmação')
    .sort((a, b) => a.horario.localeCompare(b.horario));
  const proximoHorario = proximas.length > 0 ? proximas[0].horario : '--:--';

  // Próximo retorno
  const proximosRetornos = retornosHoje.filter(a => a.status === 'Confirmado' || a.status === 'Aguardando confirmação')
    .sort((a, b) => a.horario.localeCompare(b.horario));
  const proximoHorarioRetorno = proximosRetornos.length > 0 ? proximosRetornos[0].horario : '--:--';

  // Pacientes únicos atendidos ou com consultas marcadas
  const distinctPatients = new Set(allDoctorApps.map(a => a.pacienteId));

  // Atualiza cards estatísticos
  const statConsultasHoje = document.getElementById('statConsultasHoje');
  const statProximaConsulta = document.getElementById('statProximaConsulta');
  const statRetornosHoje = document.getElementById('statRetornosHoje');
  const statProximoRetorno = document.getElementById('statProximoRetorno');
  const statPacientesTotal = document.getElementById('statPacientesTotal');

  if (statConsultasHoje) statConsultasHoje.textContent = String(appsForDay.length).padStart(2, '0');
  if (statProximaConsulta) statProximaConsulta.textContent = `Próxima: ${proximoHorario}`;
  if (statRetornosHoje) statRetornosHoje.textContent = String(retornosHoje.length).padStart(2, '0');
  if (statProximoRetorno) statProximoRetorno.textContent = `Próximo: ${proximoHorarioRetorno}`;
  if (statPacientesTotal) statPacientesTotal.textContent = String(distinctPatients.size).padStart(2, '0');

  // Renderiza tabela de Próximos Atendimentos do Dia
  const tableBody = document.getElementById('doctorAppointmentsTableBody');
  if (!tableBody) return;

  if (appsForDay.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; color: #777; padding: 2rem;">
          Nenhum agendamento para a data selecionada (${formatDateBR(targetDate).formatada}).
        </td>
      </tr>
    `;
    return;
  }

  // Ordena por horário
  appsForDay.sort((a, b) => a.horario.localeCompare(b.horario));

  let html = '';
  appsForDay.forEach(app => {
    const isConfirmed = app.status === 'Confirmado' || app.status === 'Confirmada';
    const isCompleted = app.status === 'Concluído';
    const isPending = app.status === 'Aguardando confirmação';

    let statusStyle = 'color: #0d8a80; font-weight: 700;';
    if (isPending) statusStyle = 'color: #e66700; font-weight: 700;';
    if (app.status === 'Cancelado') statusStyle = 'color: #dc2626; font-weight: 600;';

    html += `
      <tr>
        <td><strong>${escapeHtml(app.horario)}</strong></td>
        <td><strong>${escapeHtml(app.pacienteNome)}</strong></td>
        <td>${escapeHtml(app.tipo || 'Consulta')}</td>
        <td style="max-width: 220px;">${escapeHtml(app.motivo || '-')}</td>
        <td style="${statusStyle}">${escapeHtml(app.status)}</td>
        <td>
          <div style="display: flex; gap: 0.4rem; flex-wrap: wrap;">
            ${isPending ? `
              <button class="btn btn-teal btn-xs" onclick="doctorUpdateStatus('${escapeHtml(app.id)}', 'Confirmado')">
                Confirmar
              </button>
            ` : ''}
            ${!isCompleted && app.status !== 'Cancelado' ? `
              <button class="btn btn-orange btn-xs" onclick="openAttendanceModal('${escapeHtml(app.id)}')">
                Atender
              </button>
            ` : ''}
            ${!isCompleted && app.status !== 'Cancelado' ? `
              <button class="btn btn-outline-danger btn-xs" onclick="doctorCancelAppointment('${escapeHtml(app.id)}')">
                Cancelar
              </button>
            ` : ''}
            ${isCompleted ? `
              <span style="font-size: 0.85rem; color: #0d8a80; font-weight: 600;">✓ Concluído</span>
            ` : ''}
          </div>
        </td>
      </tr>
    `;
  });

  tableBody.innerHTML = html;
}

/**
 * Renderiza o Mini-Calendário Interativo (Wireframe 6)
 */
function renderMiniCalendar() {
  const monthTitle = document.getElementById('calendarMonthTitle');
  const daysGrid = document.getElementById('calendarDaysGrid');
  if (!monthTitle || !daysGrid) return;

  const mesesExtenso = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  monthTitle.textContent = `${mesesExtenso[currentCalendarMonth]} ${currentCalendarYear}`;

  // Primeiro dia do mês e total de dias
  const firstDay = new Date(currentCalendarYear, currentCalendarMonth, 1).getDay();
  const totalDays = new Date(currentCalendarYear, currentCalendarMonth + 1, 0).getDate();

  // Consultas do médico neste mês para marcar pontinhos ou destaques
  const allDoctorApps = getAppointmentsByDoctor(currentDoctor.id);
  const occupiedDays = new Set();
  allDoctorApps.forEach(a => {
    if (a.status !== 'Cancelado') {
      const parts = a.data.split('-');
      if (parseInt(parts[0], 10) === currentCalendarYear && parseInt(parts[1], 10) - 1 === currentCalendarMonth) {
        occupiedDays.add(parseInt(parts[2], 10));
      }
    }
  });

  let html = '';

  // Espaços vazios antes do 1º dia
  for (let i = 0; i < firstDay; i++) {
    html += `<div class="cal-day-cell empty"></div>`;
  }

  // Dias do mês
  for (let d = 1; d <= totalDays; d++) {
    const dayStr = `${currentCalendarYear}-${String(currentCalendarMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const isSelected = selectedAgendaDate === dayStr;
    const hasAppointments = occupiedDays.has(d);

    let cellClass = 'cal-day-cell';
    if (isSelected) cellClass += ' selected';
    if (hasAppointments) cellClass += ' has-apps';

    html += `
      <div class="${cellClass}" onclick="selectCalendarDate('${dayStr}')">
        ${d}
      </div>
    `;
  }

  daysGrid.innerHTML = html;
}

function prevCalendarMonth() {
  currentCalendarMonth--;
  if (currentCalendarMonth < 0) {
    currentCalendarMonth = 11;
    currentCalendarYear--;
  }
  renderMiniCalendar();
}

function nextCalendarMonth() {
  currentCalendarMonth++;
  if (currentCalendarMonth > 11) {
    currentCalendarMonth = 0;
    currentCalendarYear++;
  }
  renderMiniCalendar();
}

function selectCalendarDate(dateStr) {
  selectedAgendaDate = dateStr;
  renderMiniCalendar();
  renderAgendaView();
  renderDoctorDashboard();
}

/**
 * Filtros rápidos da agenda (Hoje, Amanhã, Esta semana)
 */
function applyAgendaQuickFilter(filterType, element) {
  document.querySelectorAll('.filter-quick-item').forEach(el => el.classList.remove('active'));
  if (element) element.classList.add('active');

  const today = new Date();
  if (filterType === 'hoje') {
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    selectCalendarDate(`${yyyy}-${mm}-${dd}`);
  } else if (filterType === 'amanha') {
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    selectCalendarDate(`${yyyy}-${mm}-${dd}`);
  } else if (filterType === 'mock') {
    // Atalho para o dia do protótipo
    selectCalendarDate('2026-05-24');
  } else {
    renderAgendaView();
  }
}

/**
 * Renderiza a visão completa da Agenda (Wireframe 6)
 */
function renderAgendaView() {
  const container = document.getElementById('agendaScheduleListContainer');
  const dateHeader = document.getElementById('agendaSelectedDateHeader');
  if (!container) return;

  const targetDate = selectedAgendaDate || '2026-05-24';
  const dateInfo = formatDateBR(targetDate);

  if (dateHeader) {
    dateHeader.textContent = `${dateInfo.diaSemana}, ${dateInfo.completa}`;
  }

  // Lista padrão de slots da jornada do profissional
  const scheduleSlots = [
    '08:00', '09:00', '10:00', '11:30', '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  const allDoctorApps = getAppointmentsByDoctor(currentDoctor.id);
  const dayApps = allDoctorApps.filter(a => a.data === targetDate && a.status !== 'Cancelado');

  let html = '';
  scheduleSlots.forEach(slot => {
    const match = dayApps.find(a => a.horario === slot);

    if (match) {
      const isConfirmed = match.status === 'Confirmado' || match.status === 'Confirmada';
      const isPending = match.status === 'Aguardando confirmação';
      const isCompleted = match.status === 'Concluído';

      const statusClass = isConfirmed ? 'status-confirmed' : (isPending ? 'status-pending' : 'status-completed');
      const statusText = isConfirmed ? 'Confirmado' : (isPending ? 'Aguardando' : 'Concluído');

      html += `
        <div class="agenda-slot-row occupied">
          <div class="agenda-slot-time"><strong>${escapeHtml(match.horario)}</strong></div>
          <div class="agenda-slot-patient"><strong>${escapeHtml(match.pacienteNome)}</strong></div>
          <div class="agenda-slot-type">${escapeHtml(match.tipo || 'Consulta')}</div>
          <div class="agenda-slot-reason">${escapeHtml(match.motivo || '-')}</div>
          <div class="agenda-slot-status">
            <span class="pac-status-tag ${statusClass}">${escapeHtml(statusText)}</span>
          </div>
          <div class="agenda-slot-actions">
            ${isPending ? `
              <button class="btn btn-teal btn-xs" onclick="doctorUpdateStatus('${escapeHtml(match.id)}', 'Confirmado')">
                Confirmar
              </button>
            ` : ''}
            ${!isCompleted ? `
              <button class="btn btn-orange btn-xs" onclick="openAttendanceModal('${escapeHtml(match.id)}')">
                Atender
              </button>
            ` : ''}
            ${!isCompleted ? `
              <button class="btn btn-outline-danger btn-xs" onclick="doctorCancelAppointment('${escapeHtml(match.id)}')">
                Cancelar
              </button>
            ` : ''}
            ${isCompleted ? `
              <span style="font-size: 0.85rem; color: #0d8a80; font-weight: 600;">✓ Realizado</span>
            ` : ''}
          </div>
        </div>
      `;
    } else {
      // Horário livre
      html += `
        <div class="agenda-slot-row free">
          <div class="agenda-slot-time">${escapeHtml(slot)}</div>
          <div class="agenda-slot-patient" style="color: #888; font-style: italic;">Horário livre</div>
          <div class="agenda-slot-type" style="color: #bbb;">-</div>
          <div class="agenda-slot-reason" style="color: #bbb;">-</div>
          <div class="agenda-slot-status" style="color: #bbb;">-</div>
          <div class="agenda-slot-actions">
            <span style="font-size: 0.85rem; color: #888;">Disponível</span>
          </div>
        </div>
      `;
    }
  });

  container.innerHTML = html;
}

/**
 * Atualiza status da consulta pelo profissional
 */
function doctorUpdateStatus(appId, newStatus) {
  updateAppointmentStatus(appId, newStatus);
  renderDoctorDashboard();
  renderAgendaView();
  showToast(`Consulta ${newStatus.toLowerCase()} com sucesso!`, 'success');
}

/**
 * Cancelamento / Recusa de consulta
 */
function doctorCancelAppointment(appId) {
  if (confirm('Deseja realmente cancelar/recusar este agendamento?')) {
    cancelAppointment(appId, 'Cancelado pelo profissional');
    renderDoctorDashboard();
    renderAgendaView();
    showToast('Consulta cancelada.', 'info');
  }
}

/**
 * Abre modal de Atendimento Clínico para consulta específica
 */
function openAttendanceModal(appId) {
  const allApps = getStoredAppointments();
  const app = allApps.find(a => a.id === appId);
  if (!app) return;

  const modal = document.getElementById('attendanceModal');
  const patientInfoEl = document.getElementById('attendancePatientInfo');
  const appIdInput = document.getElementById('attendanceAppId');
  const notesInput = document.getElementById('attendanceNotes');
  const prescInput = document.getElementById('attendancePrescription');

  if (!modal || !patientInfoEl) return;

  appIdInput.value = app.id;
  if (notesInput) notesInput.value = '';
  if (prescInput) prescInput.value = '';

  const dateInfo = formatDateBR(app.data);
  patientInfoEl.innerHTML = `
    <div style="background: var(--primary-teal-bg); padding: 1rem; border-radius: 8px; margin-bottom: 1.2rem;">
      <h4 style="color: var(--primary-teal-dark);">${escapeHtml(app.pacienteNome)}</h4>
      <p style="color: #333; font-size: 0.95rem;">
        <strong>Data:</strong> ${escapeHtml(dateInfo.formatada)} às ${escapeHtml(app.horario)} | 
        <strong>Tipo:</strong> ${escapeHtml(app.tipo || 'Consulta')}
      </p>
      <p style="color: #555; font-size: 0.95rem; margin-top: 0.3rem;">
        <strong>Queixa Principal / Motivo:</strong> ${escapeHtml(app.motivo || 'Consulta de rotina')}
      </p>
    </div>
  `;

  modal.classList.add('active');
}

/**
 * Abre modal de Atendimento Rápido (para o próximo paciente do dia)
 */
function openQuickAttendanceModal() {
  const allDoctorApps = getAppointmentsByDoctor(currentDoctor.id);
  const targetDate = selectedAgendaDate || '2026-05-24';

  const pendingApps = allDoctorApps
    .filter(a => a.data === targetDate && a.status !== 'Concluído' && a.status !== 'Cancelado')
    .sort((a, b) => a.horario.localeCompare(b.horario));

  if (pendingApps.length > 0) {
    openAttendanceModal(pendingApps[0].id);
  } else {
    alert('Não há atendimentos pendentes para a data selecionada.');
  }
}

/**
 * Submissão do Atendimento Clínico (Concluir consulta e salvar prontuário)
 */
function handleAttendanceSubmit(e) {
  e.preventDefault();

  const appId = document.getElementById('attendanceAppId').value;
  const notes = document.getElementById('attendanceNotes').value.trim();
  const presc = document.getElementById('attendancePrescription').value.trim();

  if (!notes) {
    alert('Por favor, descreva o resumo do atendimento clínico.');
    return;
  }

  let finalSummary = notes;
  if (presc) {
    finalSummary += `\n\nPrescrição e Recomendações:\n${presc}`;
  }

  updateAppointmentStatus(appId, 'Concluído', finalSummary);

  document.getElementById('attendanceModal').classList.remove('active');
  renderDoctorDashboard();
  renderAgendaView();
  renderConsultasRealizadas();
  renderDoctorPatients();

  showToast('Atendimento concluído e prontuário registrado com sucesso!', 'success');
}

/**
 * Renderiza Consultas Realizadas
 */
function renderConsultasRealizadas() {
  const container = document.getElementById('doctorCompletedTableBody');
  if (!container) return;

  const allDoctorApps = getAppointmentsByDoctor(currentDoctor.id);
  const completed = allDoctorApps.filter(a => a.status === 'Concluído')
    .sort((a, b) => (b.data + b.horario).localeCompare(a.data + a.horario));

  if (completed.length === 0) {
    container.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; color: #777; padding: 2rem;">
          Nenhum atendimento concluído até o momento.
        </td>
      </tr>
    `;
    return;
  }

  let html = '';
  completed.forEach(app => {
    const dateInfo = formatDateBR(app.data);
    html += `
      <tr>
        <td><strong>${escapeHtml(dateInfo.formatada)}</strong><br><small style="color: #666;">${escapeHtml(app.horario)}</small></td>
        <td><strong>${escapeHtml(app.pacienteNome)}</strong></td>
        <td>${escapeHtml(app.motivo || 'Consulta')}</td>
        <td style="max-width: 320px; line-height: 1.5; font-size: 0.9rem;">
          ${escapeHtml(app.resumoAtendimento || 'Atendimento concluído.')}
        </td>
        <td><span class="pac-status-tag status-completed">Concluído</span></td>
      </tr>
    `;
  });

  container.innerHTML = html;
}

/**
 * Renderiza a carteira de pacientes do profissional
 */
function renderDoctorPatients() {
  const container = document.getElementById('doctorPatientsTableBody');
  if (!container) return;

  const allDoctorApps = getAppointmentsByDoctor(currentDoctor.id);
  const users = getStoredUsers();

  // Mapeia pacientes únicos
  const patientMap = new Map();

  allDoctorApps.forEach(app => {
    if (!patientMap.has(app.pacienteId)) {
      const u = users.find(user => String(user.id) === String(app.pacienteId));
      patientMap.set(app.pacienteId, {
        id: app.pacienteId,
        nome: app.pacienteNome,
        email: app.pacienteEmail || (u ? u.email : '-'),
        telefone: app.pacienteTelefone || (u ? u.telefone : '-'),
        consultas: []
      });
    }
    patientMap.get(app.pacienteId).consultas.push(app);
  });

  const patientList = Array.from(patientMap.values());

  if (patientList.length === 0) {
    container.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; color: #777; padding: 2rem;">
          Nenhum paciente cadastrado em sua carteira no momento.
        </td>
      </tr>
    `;
    return;
  }

  let html = '';
  patientList.forEach(p => {
    const totalApps = p.consultas.length;
    // Última consulta realizada
    const realizadas = p.consultas.filter(a => a.status === 'Concluído').sort((a, b) => (b.data).localeCompare(a.data));
    const ultAtendimento = realizadas.length > 0 ? formatDateBR(realizadas[0].data).formatada : 'Nenhum';

    // Próxima consulta futura
    const futuras = p.consultas.filter(a => a.status === 'Confirmado' || a.status === 'Aguardando confirmação').sort((a, b) => (a.data).localeCompare(b.data));
    const proxAtendimento = futuras.length > 0 ? `${formatDateBR(futuras[0].data).formatada} às ${futuras[0].horario}` : 'Nenhuma';

    html += `
      <tr>
        <td><strong>${escapeHtml(p.nome)}</strong></td>
        <td>${escapeHtml(p.email)}<br><small style="color: #666;">${escapeHtml(p.telefone)}</small></td>
        <td><span class="pac-status-tag status-confirmed">${totalApps} atendimento(s)</span></td>
        <td>${escapeHtml(ultAtendimento)}</td>
        <td>${escapeHtml(proxAtendimento)}</td>
      </tr>
    `;
  });

  container.innerHTML = html;
}

/**
 * Gestão de Perfil do Profissional
 */
function populateDoctorProfileData() {
  const nomeInput = document.getElementById('doctorProfileNome');
  const emailInput = document.getElementById('doctorProfileEmail');
  const crmInput = document.getElementById('doctorProfileCrm');
  const espInput = document.getElementById('doctorProfileEspecialidade');
  const bioInput = document.getElementById('doctorProfileBio');
  const telInput = document.getElementById('doctorProfileTelefone');
  const alertEl = document.getElementById('doctorProfileAlert');

  if (alertEl) alertEl.style.display = 'none';

  if (nomeInput) nomeInput.value = currentDoctor.nome || '';
  if (emailInput) emailInput.value = currentDoctor.email || '';
  if (crmInput) crmInput.value = currentDoctor.crm || '';
  if (espInput) espInput.value = currentDoctor.especialidade || '';
  if (bioInput) bioInput.value = currentDoctor.biografia || '';
  if (telInput) telInput.value = currentDoctor.telefone || '';
}

function setupDoctorProfileForms() {
  const profileForm = document.getElementById('doctorProfileForm');
  const passForm = document.getElementById('doctorPasswordForm');
  const attendanceForm = document.getElementById('attendanceForm');

  if (attendanceForm) {
    attendanceForm.addEventListener('submit', handleAttendanceSubmit);
  }

  if (profileForm) {
    profileForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nome = document.getElementById('doctorProfileNome').value.trim();
      const email = document.getElementById('doctorProfileEmail').value.trim().toLowerCase();
      const crm = document.getElementById('doctorProfileCrm').value.trim();
      const especialidade = document.getElementById('doctorProfileEspecialidade').value.trim();
      const biografia = document.getElementById('doctorProfileBio').value.trim();
      const telefone = document.getElementById('doctorProfileTelefone').value.trim();

      if (!nome || !email || !crm) {
        showAlert('doctorProfileAlert', 'Nome, e-mail e CRM são de preenchimento obrigatório.', 'danger');
        return;
      }

      currentDoctor.nome = nome;
      currentDoctor.email = email;
      currentDoctor.crm = crm;
      currentDoctor.especialidade = especialidade;
      currentDoctor.biografia = biografia;
      currentDoctor.telefone = telefone;

      updateUser(currentDoctor);
      populateDoctorHeaderAndProfile();
      showAlert('doctorProfileAlert', 'Perfil atualizado com sucesso!', 'success');
      showToast('Perfil profissional salvo com sucesso!', 'success');
    });
  }

  if (passForm) {
    passForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const currentPass = document.getElementById('doctorCurrentPass').value.trim();
      const newPass = document.getElementById('doctorNewPass').value.trim();
      const confirmNewPass = document.getElementById('doctorConfirmNewPass').value.trim();

      if (currentPass !== currentDoctor.senha) {
        showAlert('doctorPassAlert', 'A senha atual está incorreta.', 'danger');
        return;
      }

      if (newPass.length < 6) {
        showAlert('doctorPassAlert', 'A nova senha deve possuir pelo menos 6 caracteres.', 'danger');
        return;
      }

      if (newPass !== confirmNewPass) {
        showAlert('doctorPassAlert', 'As senhas informadas não coincidem.', 'danger');
        return;
      }

      currentDoctor.senha = newPass;
      updateUser(currentDoctor);
      passForm.reset();
      showAlert('doctorPassAlert', 'Senha alterada com sucesso!', 'success');
      showToast('Senha alterada com sucesso!', 'success');
    });
  }
}
