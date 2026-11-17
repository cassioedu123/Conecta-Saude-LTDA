/**
 * Conecta Saúde - Lógica de Login e Autenticação (login.html)
 */

document.addEventListener('DOMContentLoaded', () => {
  // Se já houver sessão ativa, redireciona para a área correspondente
  if (typeof redirectIfLoggedIn === 'function') {
    redirectIfLoggedIn();
  }

  const loginForm = document.getElementById('loginForm');
  const userInput = document.getElementById('userInput');
  const passwordInput = document.getElementById('passwordInput');

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const identifier = userInput.value.trim();
      const password = passwordInput.value.trim();

      if (!identifier || !password) {
        showAlert('loginAlert', 'Por favor, informe seu e-mail/CPF e sua senha.', 'danger');
        return;
      }

      // Busca usuário pelo e-mail ou CPF
      const foundUser = findUserByEmailOrCpf(identifier);

      if (!foundUser || foundUser.senha !== password) {
        showAlert('loginAlert', 'Credenciais inválidas. Verifique seu e-mail/CPF e senha.', 'danger');
        return;
      }

      // Cria a sessão local
      setCurrentUser(foundUser);

      showAlert('loginAlert', `Bem-vindo(a), ${foundUser.nome}! Redirecionando...`, 'success');

      setTimeout(() => {
        if (foundUser.tipo === 'profissional') {
          window.location.href = 'profissional.html';
        } else {
          window.location.href = 'paciente.html';
        }
      }, 1000);
    });
  }
});
