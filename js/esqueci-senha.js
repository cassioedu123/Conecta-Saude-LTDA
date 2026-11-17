/**
 * Conecta Saúde - Recuperação Demonstrativa de Senha (esqueci-senha.html)
 */

document.addEventListener('DOMContentLoaded', () => {
  const step1Form = document.getElementById('recoverStep1');
  const step2Form = document.getElementById('recoverStep2');
  let targetUser = null;

  if (step1Form) {
    step1Form.addEventListener('submit', (e) => {
      e.preventDefault();

      const emailVal = document.getElementById('recoverEmail').value.trim().toLowerCase();
      if (!emailVal) {
        showAlert('recoverAlert', 'Por favor, informe seu e-mail cadastrado.', 'danger');
        return;
      }

      targetUser = findUserByEmail(emailVal);

      if (targetUser) {
        showAlert('recoverAlert', `E-mail identificado (${targetUser.nome}). Defina sua nova senha abaixo.`, 'success');
        step1Form.style.display = 'none';
        step2Form.style.display = 'block';
        const newPasswordInput = document.getElementById('newPassword');
        if (newPasswordInput) newPasswordInput.focus();
      } else {
        showAlert('recoverAlert', 'Nenhum usuário cadastrado foi localizado com este e-mail.', 'danger');
      }
    });
  }

  if (step2Form) {
    step2Form.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!targetUser) {
        showAlert('recoverAlert', 'Sessão de recuperação expirada. Reinicie o processo.', 'danger');
        step2Form.style.display = 'none';
        step1Form.style.display = 'block';
        return;
      }

      const newPass = document.getElementById('newPassword').value.trim();
      const confirmPass = document.getElementById('confirmNewPassword').value.trim();

      if (!newPass || !confirmPass) {
        showAlert('recoverAlert', 'Por favor, preencha todos os campos.', 'danger');
        return;
      }

      if (newPass.length < 6) {
        showAlert('recoverAlert', 'A nova senha deve possuir no mínimo 6 caracteres.', 'danger');
        return;
      }

      if (newPass !== confirmPass) {
        showAlert('recoverAlert', 'As senhas informadas não coincidem.', 'danger');
        return;
      }

      // Atualiza a senha no armazenamento local
      targetUser.senha = newPass;
      updateUser(targetUser);

      showAlert('recoverAlert', 'Senha atualizada com sucesso! Redirecionando para a tela de login...', 'success');

      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1800);
    });
  }
});
