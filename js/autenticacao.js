/**
 * Conecta Saúde - Controle de Autenticação, Sessão e Rotas
 */

/**
 * Verifica se há sessão ativa e se o tipo do usuário confere com o esperado pela página.
 * @param {'paciente'|'profissional'} expectedRole 
 * @returns {Object|null} Usuário autenticado
 */
function checkAuth(expectedRole) {
  const user = getCurrentUser();

  if (!user) {
    // Redireciona para o login se não houver sessão ativa
    window.location.replace('login.html');
    return null;
  }

  if (expectedRole && user.tipo !== expectedRole) {
    // Impede acesso cruzado entre áreas
    if (user.tipo === 'profissional') {
      window.location.replace('profissional.html');
    } else {
      window.location.replace('paciente.html');
    }
    return null;
  }

  return user;
}

/**
 * Se o usuário já estiver logado ao tentar acessar login/cadastro,
 * redireciona automaticamente para sua área correspondente.
 */
function redirectIfLoggedIn() {
  const user = getCurrentUser();
  if (user) {
    if (user.tipo === 'profissional') {
      window.location.replace('profissional.html');
    } else {
      window.location.replace('paciente.html');
    }
  }
}

/**
 * Encerra a sessão do usuário e redireciona para o login.
 */
function logout() {
  clearSession();
  window.location.replace('login.html');
}
