import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./forms.module.css";
import logo from "../../assets/blackjack_logo.jpg";
import { useUsersContext } from "../../contexts/UsersProvider";
import SubmitButton from "../Form/SubmitButton";
import eyeSprite from "../../assets/eye-sprite.png";

function EditarPerfil() {
  const { currentUser, updateUser, deleteUser } = useUsersContext();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mensagemErro, setMensagemErro] = useState("");
  const [showPasswordRules, setShowPasswordRules] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

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

  function isValidPassword(password) {
    return passwordRules.every((rule) => rule.test(password));
  }

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || "");
      setEmail(currentUser.email || "");
      setSenha(currentUser.senha || ""); // Preenche o campo senha com a senha atual, se disponível
    }
  }, [currentUser]);

  const handleName = (event) => setName(event.target.value);
  const handleEmail = (event) => setEmail(event.target.value);
  const handleSenha = (event) => setSenha(event.target.value);

  const onSubmit = async (event) => {
    event.preventDefault();
    setMensagemErro("");
    setLoading(true);

    if (!name || !email || !senha) {
      setMensagemErro("Preencha todos os campos.");
      setLoading(false);
      return;
    }

    if (!isValidEmail(email)) {
      setMensagemErro("Digite um email válido.");
      setLoading(false);
      return;
    }

    if (!isValidPassword(senha)) {
      setMensagemErro(
        "A senha deve ter pelo menos 6 caracteres, incluindo letras e números."
      );
      setLoading(false);
      return;
    }

    const payload = {
      name,
      email,
      password: senha,
    };

    try {
      await updateUser(payload);
      alert("Perfil atualizado com sucesso!");
      setSenha("");
    } catch (error) {
      setMensagemErro("Erro ao atualizar perfil. Tente novamente.");
    }
    setLoading(false);
  };

  const onDelete = async (event) => {
    event.preventDefault();
    if (window.confirm("Tem certeza que deseja excluir sua conta?")) {
      try {
        await deleteUser();
        alert("Conta excluída com sucesso!");
        navigate("/login");
      } catch (error) {
        setMensagemErro("Erro ao excluir conta. Tente novamente.");
      }
    }
  };

  return (
    <div className={`${styles.loginContainer} ${styles.centerBelowNavbar}`}>
      <main className={styles.main}>
        <div className={styles.container}>
          <h1 className={styles.title}>Editar Perfil</h1>
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
              <div className={styles.passwordWrapper}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="senha"
                  id="senha"
                  value={senha}
                  onChange={handleSenha}
                  onFocus={() => setShowPasswordRules(true)}
                  onBlur={() => setShowPasswordRules(false)}
                  required
                  className={styles.input}
                  autoComplete="new-password"
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
                          color: rule.test(senha) ? "green" : "red",
                          listStyle: "none",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5em",
                          fontWeight: rule.test(senha) ? "bold" : "normal",
                        }}
                      >
                        <span>{rule.test(senha) ? "✔️" : "❌"}</span>
                        {rule.label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <SubmitButton
              text={loading ? "Salvando..." : "Salvar Alterações"}
              type="submit"
              disabled={loading}
              className={styles.button}
            />
          </form>
          <form
            className={styles.form}
            onSubmit={onDelete}
            style={{ marginTop: "1.5rem" }}
          >
            <SubmitButton
              text="Excluir conta"
              type="submit"
              className={styles.button}
            />
          </form>
        </div>
      </main>
    </div>
  );
}

export default EditarPerfil;
