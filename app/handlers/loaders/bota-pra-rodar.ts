import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { 
  getBicicletas, 
  getEmprestimos, 
  getSolicitacoes, 
  getUsersFirebase 
} from "~/api/firebaseConnection.server";

export async function botaPraRodarLoader({ request }: LoaderFunctionArgs) {
  try {
    const [bicicletas, emprestimos, solicitacoes, users] = await Promise.all([
      getBicicletas(),
      getEmprestimos(),
      getSolicitacoes(),
      getUsersFirebase()
    ]);
    
    return json({
      bicicletas: bicicletas || [],
      emprestimos: emprestimos || [],
      solicitacoes: solicitacoes || [],
      users: users || {}
    });
  } catch (error) {
    console.error("Erro ao carregar dados:", error);
    return json({
      bicicletas: [],
      emprestimos: [],
      solicitacoes: [],
      users: {}
    });
  }
}