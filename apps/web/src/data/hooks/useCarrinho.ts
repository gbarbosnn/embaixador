import { useContext } from "react";
import { ContextoCarrinho } from "../context/ContextoCarrinho";

export const useCarrinho = () => useContext(ContextoCarrinho);
