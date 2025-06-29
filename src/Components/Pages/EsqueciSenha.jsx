import { useState } from "react";
import styles from "./forms.module.css";
import axiosClient from "../../utils/axios_client";
import { Link } from "react-router-dom";
import SubmitButton from "../Form/SubmitButton";
import logo from "../../assets/blackjack_logo.jpg";
import Logo from "../Layout/Logo";

export default function EsqueciSenha() {
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setMensagem("");
    try {
      await axiosClient.post("/forgot-password", { email });
      setMensagem(
        "Verifique seu email. Instruções para redefinir a senha foram enviadas pelo nosso email blackjacktcc@gmail.com."
      );
    } catch {
      setMensagem("Erro ao enviar e-mail. Tente novamente.");
    }
    setEnviando(false);
  };

  return (
    <div className={styles.loginContainer}>
      <main className={styles.main}>
        <div className={styles.container}>
          {/* <img src={logo} alt="Logo Blackjack" className={styles.logo} /> */}
          <Logo className={styles.logo} size={150} />
          <h1 className={styles.title}>Esqueci minha senha</h1>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>
                Email:
              </label>
              <input
                type="email"
                id="email"
                className={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <SubmitButton
              text={enviando ? "Enviando..." : "Enviar link de redefinição"}
              type="submit"
              disabled={enviando}
              className={styles.button}
            />
          </form>
          <h3 className={styles.prompt}>
            Voltar à página de{" "}
            <Link to="/login" className={styles.link}>
              Login
            </Link>
          </h3>
          {mensagem && <p className={styles.prompt}>{mensagem}</p>}
        </div>
      </main>
    </div>
  );
}
