import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useUsersContext } from "../../contexts/UsersContext";
import styles from "./UserProfileDropdown.module.css";
import SubmitButton from "../Form/SubmitButton";
import eyeSprite from "../../assets/eye-sprite.png";
import { useToast } from "../../utils/useToast";
import { useNavigate } from "react-router-dom";

function UserProfileDropdown({ onClose }) {
  const { currentUser, updateUser, deleteUser } = useUsersContext();
  const navigate = useNavigate();

  const [editMode, setEditMode] = useState(null); // 'name' ou 'password'
  const [name, setName] = useState("");
  const [senhaConfirmacao, setSenhaConfirmacao] = useState(""); // Senha para confirmar mudança de nome
  const [senhaAtual, setSenhaAtual] = useState(""); // Senha atual para trocar senha
  const [senha, setSenha] = useState("");
  const [confirmSenha, setConfirmSenha] = useState("");
  const [mensagemErro, setMensagemErro] = useState("");
  const [showPasswordRules, setShowPasswordRules] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showConfirmationPassword, setShowConfirmationPassword] =
    useState(false);
  const { showSuccess, showError } = useToast();

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
    }
  }, [currentUser]);

  const handleName = (event) => setName(event.target.value);
  const handleSenhaConfirmacao = (event) =>
    setSenhaConfirmacao(event.target.value);
  const handleSenhaAtual = (event) => setSenhaAtual(event.target.value);
  const handleSenha = (event) => setSenha(event.target.value);
  const handleConfirmSenha = (event) => setConfirmSenha(event.target.value);

  const onSubmitName = async (event) => {
    event.preventDefault();
    setMensagemErro("");
    setLoading(true);

    if (!currentUser || !currentUser.id) {
      setMensagemErro("Erro: usuário não identificado. Faça login novamente.");
      setLoading(false);
      return;
    }

    if (!name.trim()) {
      setMensagemErro("O nome não pode estar vazio.");
      setLoading(false);
      return;
    }

    if (!senhaConfirmacao) {
      setMensagemErro("Digite sua senha atual para confirmar a alteração.");
      setLoading(false);
      return;
    }

    // Envia nome, email e senha atual para validação
    const payload = {
      id: currentUser.id, // Adiciona o ID explicitamente
      name: name.trim(),
      email: currentUser.email,
      password: senhaConfirmacao,
    };

    try {
      await updateUser(payload);
      showSuccess("Nome atualizado com sucesso!", 3000);
      setSenhaConfirmacao(""); // Limpa a senha
      setEditMode(null);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        "Erro ao atualizar nome. Verifique sua senha e tente novamente.";
      setMensagemErro(errorMsg);
      showError(errorMsg, 5000);
    }
    setLoading(false);
  };

  const onSubmitPassword = async (event) => {
    event.preventDefault();
    setMensagemErro("");
    setLoading(true);

    if (!currentUser || !currentUser.id) {
      setMensagemErro("Erro: usuário não identificado. Faça login novamente.");
      setLoading(false);
      return;
    }

    if (!senhaAtual || !senha || !confirmSenha) {
      setMensagemErro("Preencha todos os campos.");
      setLoading(false);
      return;
    }

    if (senha === senhaAtual) {
      setMensagemErro("A nova senha não pode ser igual à senha atual.");
      setLoading(false);
      return;
    }

    if (senha !== confirmSenha) {
      setMensagemErro("As senhas não coincidem.");
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

    // Envia senha atual para validação e nova senha
    const payload = {
      id: currentUser.id, // Adiciona o ID explicitamente
      name: currentUser.name,
      email: currentUser.email,
      current_password: senhaAtual, // Senha atual para validação
      password: senha, // Nova senha
    };

    try {
      await updateUser(payload);
      showSuccess("Senha atualizada com sucesso!", 3000);
      setSenhaAtual("");
      setSenha("");
      setConfirmSenha("");
      setEditMode(null);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        "Erro ao atualizar senha. Verifique sua senha atual e tente novamente.";
      setMensagemErro(errorMsg);
      showError(errorMsg, 5000);
    }
    setLoading(false);
  };

  const onDelete = async (event) => {
    event.preventDefault();
    if (window.confirm("Tem certeza que deseja excluir sua conta?")) {
      try {
        await deleteUser();
        showSuccess("Conta excluída com sucesso!", 3000);
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } catch {
        const errorMsg = "Erro ao excluir conta. Tente novamente.";
        setMensagemErro(errorMsg);
        showError(errorMsg, 5000);
      }
    }
  };

  const cancelEdit = () => {
    setEditMode(null);
    setMensagemErro("");
    setSenhaConfirmacao("");
    setSenhaAtual("");
    setSenha("");
    setConfirmSenha("");
    if (currentUser) {
      setName(currentUser.name || "");
    }
  };

  return (
    <div className={styles.dropdown}>
      <div className={styles.dropdownHeader}>
        <h3 className={styles.dropdownTitle}>Editar Perfil</h3>
        <button className={styles.closeBtn} onClick={onClose}>
          ✕
        </button>
      </div>

      <div className={styles.dropdownContent}>
        {mensagemErro && <p className={styles.errorMessage}>{mensagemErro}</p>}

        {/* Menu principal */}
        {!editMode && (
          <div className={styles.menuOptions}>
            <button
              className={styles.optionButton}
              onClick={() => setEditMode("name")}
            >
              <svg
                className={styles.optionIcon}
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle
                  cx="12"
                  cy="7"
                  r="4"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
              Editar Nome
            </button>

            <button
              className={styles.optionButton}
              onClick={() => setEditMode("password")}
            >
              <svg
                className={styles.optionIcon}
                viewBox="0 0 24 24"
                fill="none"
              >
                <rect
                  x="3"
                  y="11"
                  width="18"
                  height="11"
                  rx="2"
                  ry="2"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M7 11V7a5 5 0 0 1 10 0v4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Editar Senha
            </button>

            <form
              className={styles.form}
              onSubmit={onDelete}
              style={{ marginTop: "1rem" }}
            >
              <SubmitButton
                text="Excluir conta"
                type="submit"
                className={styles.button}
              />
            </form>
          </div>
        )}

        {editMode === "name" && (
          <form className={styles.form} onSubmit={onSubmitName}>
            <div className={styles.inputGroup}>
              <label htmlFor="nome" className={styles.label}>
                Novo Nome:
              </label>
              <input
                type="text"
                name="nome"
                id="nome"
                value={name}
                onChange={handleName}
                required
                className={styles.input}
                autoComplete="name"
                autoFocus
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="senhaConfirmacao" className={styles.label}>
                Confirme sua Senha:
              </label>
              <div className={styles.passwordWrapper}>
                <input
                  type={showConfirmationPassword ? "text" : "password"}
                  name="senhaConfirmacao"
                  id="senhaConfirmacao"
                  value={senhaConfirmacao}
                  onChange={handleSenhaConfirmacao}
                  required
                  className={styles.input}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmationPassword((prev) => !prev)}
                  className={styles.passwordToggleBtn}
                  tabIndex={-1}
                  aria-label={
                    showConfirmationPassword ? "Ocultar senha" : "Mostrar senha"
                  }
                >
                  <span className={styles.eyeSpriteWrapper}>
                    <img
                      src={eyeSprite}
                      alt={
                        showConfirmationPassword
                          ? "Ocultar senha"
                          : "Mostrar senha"
                      }
                      className={
                        showConfirmationPassword
                          ? styles.eyeImgClosed
                          : styles.eyeImgOpen
                      }
                    />
                  </span>
                </button>
              </div>
              <p className={styles.helperText}>
                Para sua segurança, precisamos confirmar sua identidade.
              </p>
            </div>

            <div className={styles.buttonGroup}>
              <SubmitButton
                text={loading ? "Salvando..." : "Salvar Alterações"}
                type="submit"
                disabled={loading}
                className={styles.button}
              />
              <button
                type="button"
                onClick={cancelEdit}
                className={styles.cancelButton}
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {editMode === "password" && (
          <form className={styles.form} onSubmit={onSubmitPassword}>
            <div className={styles.inputGroup}>
              <label htmlFor="senhaAtual" className={styles.label}>
                Senha Atual:
              </label>
              <div className={styles.passwordWrapper}>
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  name="senhaAtual"
                  id="senhaAtual"
                  value={senhaAtual}
                  onChange={handleSenhaAtual}
                  required
                  className={styles.input}
                  autoComplete="current-password"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword((prev) => !prev)}
                  className={styles.passwordToggleBtn}
                  tabIndex={-1}
                  aria-label={
                    showCurrentPassword ? "Ocultar senha" : "Mostrar senha"
                  }
                >
                  <span className={styles.eyeSpriteWrapper}>
                    <img
                      src={eyeSprite}
                      alt={
                        showCurrentPassword ? "Ocultar senha" : "Mostrar senha"
                      }
                      className={
                        showCurrentPassword
                          ? styles.eyeImgClosed
                          : styles.eyeImgOpen
                      }
                    />
                  </span>
                </button>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="senha" className={styles.label}>
                Nova Senha:
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

            <div className={styles.inputGroup}>
              <label htmlFor="confirmSenha" className={styles.label}>
                Confirmar Nova Senha:
              </label>
              <div className={styles.passwordWrapper}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmSenha"
                  id="confirmSenha"
                  value={confirmSenha}
                  onChange={handleConfirmSenha}
                  required
                  className={styles.input}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className={styles.passwordToggleBtn}
                  tabIndex={-1}
                  aria-label={
                    showConfirmPassword ? "Ocultar senha" : "Mostrar senha"
                  }
                >
                  <span className={styles.eyeSpriteWrapper}>
                    <img
                      src={eyeSprite}
                      alt={
                        showConfirmPassword ? "Ocultar senha" : "Mostrar senha"
                      }
                      className={
                        showConfirmPassword
                          ? styles.eyeImgClosed
                          : styles.eyeImgOpen
                      }
                    />
                  </span>
                </button>
              </div>
            </div>

            <div className={styles.buttonGroup}>
              <SubmitButton
                text={loading ? "Salvando..." : "Salvar Alterações"}
                type="submit"
                disabled={loading}
                className={styles.button}
              />
              <button
                type="button"
                onClick={cancelEdit}
                className={styles.cancelButton}
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

UserProfileDropdown.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default UserProfileDropdown;
