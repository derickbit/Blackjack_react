import { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./forms.module.css";
import logo from "../../assets/blackjack_logo.jpg";
import axiosClient from "../../utils/axios_client";
import { useNavigate } from "react-router-dom";
import SubmitButton from "../Form/SubmitButton";
import Logo from "../Layout/Logo";

function Cadastro() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mensagemErro, setMensagemErro] = useState("");
  const [showPasswordRules, setShowPasswordRules] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Validação de email
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // Regras individuais para a senha
  const passwordRules = [
    {
      label: "Ao menos 6 caracteres",
      test: (pw) => pw.length >= 6,
    },
    {
      label: "Ao menos uma letra",
      test: (pw) => /[A-Za-z]/.test(pw),
    },
    {
      label: "Ao menos um número",
      test: (pw) => /\d/.test(pw),
    },
  ];

  // Validação de senha: mínimo 6 caracteres, pelo menos uma letra e um número
  function isValidPassword(password) {
    return passwordRules.every((rule) => rule.test(password));
  }

  const handleName = (event) => {
    setName(event.target.value);
  };

  const handleEmail = (event) => {
    setEmail(event.target.value);
  };

  const handlePassword = (event) => {
    setPassword(event.target.value);
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setMensagemErro("");
    setLoading(true);

    if (!name || !email || !password) {
      setMensagemErro("Preencha todos os campos.");
      setLoading(false);
      return;
    }

    if (!isValidEmail(email)) {
      setMensagemErro("Digite um email válido.");
      setLoading(false);
      return;
    }

    if (!isValidPassword(password)) {
      setMensagemErro(
        "A senha deve ter pelo menos 6 caracteres, incluindo letras e números."
      );
      setLoading(false);
      return;
    }

    const payload = {
      name,
      email,
      password,
    };

    try {
      const response = await axiosClient.post("/users", payload);
      if (response.status === 201) {
        localStorage.setItem("LAST_REGISTER_EMAIL", email);
        alert("Usuário criado com sucesso!");
        navigate("/aguarde-verificacao");
      }
    } catch (error) {
      console.error(error);

      if (error.response && error.response.status === 422) {
        const errors = error.response.data;
        let errorMessage = "Erro ao criar usuário:\n";
        Object.keys(errors).forEach((key) => {
          errorMessage += `${key}: ${errors[key].join(", ")}\n`;
        });
        setMensagemErro(errorMessage);
      } else {
        setMensagemErro("Erro ao criar usuário. Tente novamente.");
      }
    }
    setLoading(false);
  };

  return (
    <div className={styles.loginContainer}>
      <main className={styles.main}>
        <div className={styles.container}>
          {/* <img src={logo} alt="Logo Blackjack" className={styles.logo} /> */}
          <Logo className={styles.logo} size={150} />

          <h1 className={styles.title}>Cadastro</h1>
          {mensagemErro && <p className={styles.prompt}>{mensagemErro}</p>}
          <form className={styles.form} onSubmit={onSubmit} method="POST">
            <div className={styles.inputGroup}>
              <label htmlFor="nome" className={styles.label}>
                Nome:
              </label>
              <input
                type="text"
                name="nome"
                id="nome"
                value={name}
                onChange={handleName}
                required
                className={styles.input}
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>
                Email:
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={email}
                onChange={handleEmail}
                required
                className={styles.input}
              />
            </div>
            <div className={styles.inputGroup} style={{ position: "relative" }}>
              <label htmlFor="senha" className={styles.label}>
                Senha:
              </label>
              <input
                type="password"
                name="senha"
                id="senha"
                value={password}
                onChange={handlePassword}
                onFocus={() => setShowPasswordRules(true)}
                onBlur={() => setShowPasswordRules(false)}
                required
                className={styles.input}
                autoComplete="new-password"
              />
              {showPasswordRules && (
                <div className={styles.passwordPopover}>
                  <div className={styles.passwordPopoverTitle}>
                    A senha deve possuir:
                  </div>
                  <ul className={styles.passwordRules}>
                    {passwordRules.map((rule, idx) => (
                      <li
                        key={idx}
                        style={{
                          color: rule.test(password) ? "green" : "red",
                          listStyle: "none",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5em",
                          fontWeight: rule.test(password) ? "bold" : "normal",
                        }}
                      >
                        <span>{rule.test(password) ? "✔️" : "❌"}</span>
                        {rule.label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <SubmitButton
              text={loading ? "Cadastrando..." : "Cadastrar"}
              type="submit"
              disabled={loading}
              className={styles.button}
            />
          </form>

          <h3 className={styles.prompt}>
            Já possui cadastro?{" "}
            <Link to="/login" className={styles.link}>
              Login
            </Link>
          </h3>
        </div>
      </main>
    </div>
  );
}

export default Cadastro;
