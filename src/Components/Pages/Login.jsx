import styles from "./forms.module.css";
// import logo from "../../assets/blackjack_logo.jpg";
import { Link } from "react-router-dom";
import axiosClient from "../../utils/axios_client";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../contexts/AuthProvider";
import { useRef, useState } from "react";
import SubmitButton from "../Form/SubmitButton";
import Logo from "../Layout/Logo";
import eyeSprite from "../../assets/eye-sprite.png";

function Login() {
  const { setToken, setUser } = useAuthContext();
  const emailRef = useRef();
  const passwordRef = useRef();
  const navigate = useNavigate();
  const [mensagemErro, setMensagemErro] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      email: emailRef.current.value,
      password: passwordRef.current.value,
    };

    try {
      const response = await axiosClient.post("/login", payload);
      if (response?.status !== 200) throw new Error(response.data);

      const { data } = response;
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("CURRENT_USER", JSON.stringify(data.user));

      alert("Usuário logado!");
      navigate("/");
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      // Tenta pegar a mensagem do backend, senão mostra mensagem padrão
      const msg =
        error?.response?.data?.message ||
        "Credenciais inválidas. Tente novamente!";
      setMensagemErro(msg);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <main className={styles.main}>
        <div className={styles.container}>
          {/* <img src={logo} alt="Logo Blackjack" className={styles.logo} /> */}
          <Logo className={styles.logo} size={150} />
          <h1 className={styles.title}>Login</h1>
          {mensagemErro && <p className={styles.prompt}>{mensagemErro}</p>}
          <form className={styles.form} method="post" onSubmit={onSubmit}>
            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>
                Email:
              </label>
              <input
                type="text"
                name="email"
                id="email"
                ref={emailRef}
                required
                className={styles.input}
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="senha" className={styles.label}>
                Senha:
              </label>
              <div className={styles.passwordWrapper}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="senha"
                  id="senha"
                  ref={passwordRef}
                  required
                  className={styles.input}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className={styles.passwordToggleBtn}
                  tabIndex={-1}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  <span className={styles.eyeSpriteWrapper}>
                    <img
                      src={eyeSprite}
                      alt={showPassword ? "Ocultar senha" : "Mostrar senha"}
                      className={
                        showPassword ? styles.eyeImgClosed : styles.eyeImgOpen
                      }
                    />
                  </span>
                </button>
              </div>
            </div>
            <SubmitButton
              text="Entrar"
              type="submit"
              className={styles.button}
            />
          </form>
          <h3 className={styles.prompt}>
            <Link to="/esqueci-senha" className={styles.link}>
              Esqueci minha senha
            </Link>
          </h3>
          <h3 className={styles.prompt}>
            Não possui login?{" "}
            <Link to="/cadastro" className={styles.link}>
              Cadastre-se aqui
            </Link>
          </h3>
        </div>
      </main>
    </div>
  );
}

export default Login;
