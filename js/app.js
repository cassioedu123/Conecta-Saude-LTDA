/**
 * Conecta Saúde - Utilitários Globais e Interface
 */

// Inicialização imediata dos dados caso ainda não tenham sido carregados
document.addEventListener('DOMContentLoaded', async () => {
  if (typeof initAppData === 'function') {
    await initAppData();
  }
  setupHeaderInteractions();
});

/**
 * Escapa strings para evitar injeções de HTML / XSS
 */
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Aplica máscara de formatação de CPF: 000.000.000-00
 */
function maskCPF(value) {
  if (!value) return '';
  return value
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

/**
 * Validação rigorosa dos dígitos verificadores do CPF
 */
function validateCPF(cpf) {
  if (!cpf) return false;
  const cleanCPF = String(cpf).replace(/\D/g, '');

  if (cleanCPF.length !== 11) return false;
  // Rejeita sequências de dígitos idênticos (ex: 111.111.111-11)
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

  // 1º Dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i), 10) * (10 - i);
  }
  let rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(cleanCPF.charAt(9), 10)) return false;

  // 2º Dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i), 10) * (11 - i);
  }
  rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(cleanCPF.charAt(10), 10)) return false;

  return true;
}

/**
 * Formata datas ISO (YYYY-MM-DD) para múltiplos formatos legíveis
 */
function formatDateBR(dateStr) {
  if (!dateStr) return { formatada: '-', dia: '', mesAbrev: '', mesExtenso: '', ano: '', diaSemana: '' };
  
  const parts = dateStr.split('-');
  if (parts.length < 3) return { formatada: dateStr, dia: '', mesAbrev: '', mesExtenso: '', ano: '', diaSemana: '' };
  
  const ano = parseInt(parts[0], 10);
  const mesIndex = parseInt(parts[1], 10) - 1;
  const dia = parseInt(parts[2], 10);

  const mesesAbrev = ['Jan', 'Fev', 'Mar', 'Abr', 'Maio', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const mesesExtenso = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  const diasSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

  // Criar data local precisa sem distorção de fuso
  const d = new Date(ano, mesIndex, dia);
  const diaSemana = diasSemana[d.getDay()];

  return {
    dia: String(dia).padStart(2, '0'),
    mesAbrev: mesesAbrev[mesIndex],
    mesExtenso: mesesExtenso[mesIndex],
    ano: ano,
    diaSemana: diaSemana,
    formatada: `${String(dia).padStart(2, '0')}/${String(mesIndex + 1).padStart(2, '0')}/${ano}`,
    resumo: `${dia} ${mesesAbrev[mesIndex]}`,
    completa: `${dia} de ${mesesExtenso[mesIndex]} de ${ano}`
  };
}

/**
 * Exibe alertas em caixas dedicadas com auto-fechamento
 */
function showAlert(elementId, message, type = 'danger') {
  const alertEl = document.getElementById(elementId);
  if (!alertEl) return;

  alertEl.className = `alert-message alert-${type}`;
  alertEl.textContent = message;
  alertEl.style.display = 'block';

  // Rola até o alerta se necessário
  alertEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  clearTimeout(alertEl._timeout);
  alertEl._timeout = setTimeout(() => {
    alertEl.style.display = 'none';
  }, 5000);
}

/**
 * Notificação flutuante tipo Toast
 */
function showToast(message, type = 'success') {
  let toastContainer = document.getElementById('toastContainer');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toastContainer';
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = `toast-item toast-${type}`;
  toast.textContent = message;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('show');
  }, 10);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentElement) toast.parentElement.removeChild(toast);
    }, 300);
  }, 4000);
}

/**
 * Configura menu móvel e dropdown de perfil do cabeçalho
 */
function setupHeaderInteractions() {
  const toggleBtn = document.querySelector('.mobile-menu-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (toggleBtn && navLinks) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      navLinks.classList.toggle('active');
    });

    // Fecha o menu mobile ao clicar fora
    document.addEventListener('click', (e) => {
      if (!navLinks.contains(e.target) && !toggleBtn.contains(e.target)) {
        navLinks.classList.remove('active');
      }
    });
  }

  // Dropdown do usuário no cabeçalho
  const profileWrapper = document.querySelector('.user-profile-wrapper');
  if (profileWrapper) {
    const profileBtn = profileWrapper.querySelector('.user-profile-icon');
    const dropdown = profileWrapper.querySelector('.user-dropdown-menu');
    
    if (profileBtn && dropdown) {
      profileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('active');
      });

      document.addEventListener('click', () => {
        dropdown.classList.remove('active');
      });
    }
  }
}
