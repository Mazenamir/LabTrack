import { useContext } from "react";
import { AuthContext } from "./AuthContextConstants";

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
};