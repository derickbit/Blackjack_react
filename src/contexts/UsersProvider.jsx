import { useState, useEffect } from "react";
import axiosClient from "../utils/axios_client";
import { useAuthContext } from "./AuthProvider";
import { UsersContext } from "./UsersContext";
import PropTypes from "prop-types";

export default function UsersProvider({ children }) {
  const { user, token, setUser: setAuthUser } = useAuthContext();
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (user) {
      setCurrentUser(user);
    }
  }, [user]);

  // Buscar lista de usuários (para menções e outras funcionalidades)
  const fetchUsers = async (searchQuery = "") => {
    try {
      const params = searchQuery
        ? `?search=${encodeURIComponent(searchQuery)}`
        : "";
      const response = await axiosClient.get(`/users${params}`);
      const userData = response.data.data || response.data || [];
      setUsers(userData);
      return userData;
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      setUsers([]);
      return [];
    }
  };

  const updateUser = async (formData) => {
    if (!token) {
      throw new Error("Usuário não autenticado.");
    }

    // Usa o ID do formData ou do currentUser
    const userId = formData.id || currentUser?.id;

    if (!userId) {
      throw new Error("ID do usuário não encontrado.");
    }

    try {
      const response = await axiosClient.put(`/users/${userId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        const updatedUserData = response.data.data || response.data;

        // ⚠️ IMPORTANTE: Preserva o ID se o backend não retornar
        if (!updatedUserData.id && userId) {
          updatedUserData.id = userId;
          console.warn(
            "⚠️ Backend não retornou o ID do usuário. ID preservado:",
            userId
          );
        }

        // Atualiza o estado local do UsersProvider
        setCurrentUser(updatedUserData);

        // Atualiza o estado global do AuthProvider (para refletir na navbar)
        setAuthUser(updatedUserData);

        // Atualiza o localStorage
        localStorage.setItem("CURRENT_USER", JSON.stringify(updatedUserData));

        return updatedUserData;
      } else {
        throw new Error("Falha ao atualizar o perfil.");
      }
    } catch (error) {
      console.error("❌ Erro ao atualizar o perfil:", error);
      throw error;
    }
  };

  const deleteUser = async () => {
    if (!currentUser || !token) {
      throw new Error("Usuário não autenticado.");
    }

    try {
      const response = await axiosClient.delete(`/users/${currentUser.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setCurrentUser(null); // Limpa o estado do usuário
        return true;
      } else {
        throw new Error("Falha ao excluir a conta.");
      }
    } catch (error) {
      console.error("Erro ao excluir a conta:", error);
      throw error;
    }
  };

  return (
    <UsersContext.Provider
      value={{
        currentUser,
        users,
        updateUser,
        deleteUser,
        fetchUsers,
      }}
    >
      {children}
    </UsersContext.Provider>
  );
}

UsersProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
