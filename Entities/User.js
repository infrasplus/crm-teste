export const User = {
  async me() {
    // Simula um login bem-sucedido
    return Promise.resolve({ id: 'mock-user', name: 'Usuário Demo' });
  },

  async loginWithRedirect(redirectUrl) {
    // Simula redirecionamento de login
    console.log('Simulando login... redirecionando para:', redirectUrl);
    window.location.href = redirectUrl;
  }
};
