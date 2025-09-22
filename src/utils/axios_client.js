import axios from "axios";

const axiosClient = axios.create({
  baseURL: "https://blackjack2-tcc-6d5e11e9ec29.herokuapp.com/api", //produção
  //baseURL: "http://localhost:8000/api", // desenvolvimento local
});

// Interceptor para adicionar o token de autorização e tratar a resposta
axiosClient.interceptors.request.use((config) => {
  config.headers.Accept = "application/json";
  const token = localStorage.getItem("ACCESS_TOKEN");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosClient.interceptors.response.use(
  (response) => {
    return response; // Caso a resposta seja bem-sucedida, apenas retorna ela
  },
  (error) => {
    const { response } = error;

    // Verifica se o erro é um erro de autenticação (token expirado ou inválido)
    if (response?.status === 401) {
      // Remove o token e dados do usuário armazenados localmente
      localStorage.removeItem("ACCESS_TOKEN");
      localStorage.removeItem("CURRENT_USER");

      // Redireciona para a página de login (pode ser via navegação ou alteração da URL)
      window.location.href = "/"; // Ou use outro mecanismo de navegação de sua escolha
    }

    // Caso contrário, retorna o erro
    return Promise.reject(error);
  }
);

export default axiosClient;
