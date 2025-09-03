import { useContext } from "react";
import { createContext } from "react";

export const ForumContext = createContext();

export const useForumContext = () => {
  const context = useContext(ForumContext);
  if (!context) {
    throw new Error(
      "useForumContext deve ser usado dentro de um ForumProvider"
    );
  }
  return context;
};
