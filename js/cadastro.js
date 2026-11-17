/**
 * Conecta Saúde - Lógica da Página de Cadastro (cadastro.html)
 */

document.addEventListener('DOMContentLoaded', () => {
  // Redireciona caso já esteja autenticado
  if (typeof redirectIfLoggedIn === 'function') {
    redirectIfLoggedIn();
  }

  const cadastroForm = document.getElementById('cadastroForm');
  const cpfInput = document.getElementById('cpf');
  const tipoSelect = document.getElementById('tipo');
  const professionalFields = document.getElementById('professionalFields');
  const especialidadeSelect = document.getElementById('especialidade');
  const crmInput = document.getElementById('crm');

  // Máscara dinâmica de CPF
  if (cpfInput) {
    cpfInput.addEventListener('input', (e) => {
      e.target.value = maskCPF(e.target.value);
    });
  }

  // Alternância dinâmica de campos para profissional de saúde
  if (tipoSelect && professionalFields) {
    tipoSelect.addEventListener('change', () => {
      if (tipoSelect.value === 'profissional') {
        professionalFields.style.display = 'block';
        if (especialidadeSelect) especialidadeSelect.required = true;
        if (crmInput) crmInput.required = true;
      } else {
        professionalFields.style.display = 'none';
        if (especialidadeSelect) {
          especialidadeSelect.required = false;
          especialidadeSelect.value = '';
        }
        if (crmInput) {
          crmInput.required = false;
          crmInput.value = '';
        }
      }
    });
  }

  // Submissão do formulário
  if (cadastroForm) {
    cadastroForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nome = document.getElementById('nome').value.trim();
      const email = document.getElementById('email').value.trim().toLowerCase();
      const cpf = document.getElementById('cpf').value.trim();
      const senha = document.getElementById('senha').value.trim();
      const confirmSenha = document.getElementById('confirmSenha').value.trim();
      const tipo = tipoSelect.value;

      // Validação de campos obrigatórios
      if (!nome || !email || !cpf || !senha || !confirmSenha || !tipo) {
        showAlert('cadastroAlert', 'Por favor, preencha todos os campos obrigatórios.', 'danger');
        return;
      }

      // Validação de formato de e-mail
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showAlert('cadastroAlert', 'Insira um endereço de e-mail válido.', 'danger');
        return;
      }

      // Validação de CPF com dígitos verificadores
      if (!validateCPF(cpf)) {
        showAlert('cadastroAlert', 'CPF inválido. Certifique-se de digitar um CPF com 11 dígitos válidos.', 'danger');
        return;
      }

      // Validação de senha
      if (senha.length < 6) {
        showAlert('cadastroAlert', 'A senha deve possuir no mínimo 6 caracteres.', 'danger');
        return;
      }

      if (senha !== confirmSenha) {
        showAlert('cadastroAlert', 'As senhas digitadas não coincidem.', 'danger');
        return;
      }

      // Validações adicionais para profissional
      let especialidade = '';
      let crm = '';
      if (tipo === 'profissional') {
        especialidade = especialidadeSelect ? especialidadeSelect.value : '';
        crm = crmInput ? crmInput.value.trim() : '';

        if (!especialidade || !crm) {
          showAlert('cadastroAlert', 'Para profissionais de saúde, informe a especialidade e o CRM/Registro.', 'danger');
          return;
        }
      }

      // Verificação de duplicidade de e-mail e CPF
      if (findUserByEmail(email)) {
        showAlert('cadastroAlert', 'Já existe um cadastro registrado com este e-mail.', 'danger');
        return;
      }

      if (findUserByCpf(cpf)) {
        showAlert('cadastroAlert', 'Já existe um cadastro registrado com este CPF.', 'danger');
        return;
      }

      // Construção do novo registro de usuário
      const newUser = {
        nome,
        email,
        cpf,
        senha,
        tipo,
        avatar: tipo === 'profissional'
          ? 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80'
          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'
      };

      if (tipo === 'profissional') {
        newUser.especialidade = especialidade;
        newUser.crm = crm;
        newUser.biografia = `Profissional de saúde especializado em ${especialidade}.`;
      }

      // Salva no localStorage
      createUser(newUser);

      showAlert('cadastroAlert', 'Cadastro realizado com sucesso! Redirecionando para o login...', 'success');

      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1500);
    });
  }
});
