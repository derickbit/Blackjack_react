import { useContext } from "react";
import { createContext } from "react";

export const UsersContext = createContext();

export const useUsersContext = () => {
  const context = useContext(UsersContext);
  if (!context) {
    throw new Error(
      "useUsersContext deve ser usado dentro de um UsersProvider"
    );
  }
  return context;
};
