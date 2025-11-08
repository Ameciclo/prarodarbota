import { json, type ActionFunctionArgs } from "@remix-run/node";
import { 
  finalizarEmprestimo, 
  aprovarSolicitacaoBicicleta, 
  rejeitarSolicitacaoBicicleta,
  getUsersFirebase 
} from "~/api/firebaseConnection.server";
import { getTelegramUsersInfo } from "~/utils/users";
import { UserCategory } from "~/utils/types";
import { isAuth } from "~/utils/isAuthorized";

export async function botaPraRodarAction({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const actionType = formData.get("actionType") as string;
  
  try {
    const users = await getUsersFirebase();
    const telegramUser = getTelegramUsersInfo();
    
    let userId = telegramUser?.id;
    let userPermissions = [UserCategory.ANY_USER];
    
    if (process.env.NODE_ENV === "development" && !userId) {
      userId = 123456789;
      userPermissions = [UserCategory.PROJECT_COORDINATORS];
    } else if (userId && users[userId]) {
      userPermissions = [users[userId].role];
    }

    if (!userId) {
      return json({ success: false, error: "Usuário não identificado" });
    }

    switch (actionType) {
      case "finalizarEmprestimo": {
        if (!isAuth(userPermissions, UserCategory.PROJECT_COORDINATORS)) {
          return json({ success: false, error: "Sem permissão para finalizar empréstimos" });
        }
        
        const emprestimoId = formData.get("emprestimoId") as string;
        await finalizarEmprestimo(emprestimoId);
        
        return json({ 
          success: true, 
          message: "Empréstimo finalizado com sucesso!" 
        });
      }
      
      case "aprovarSolicitacao": {
        if (!isAuth(userPermissions, UserCategory.PROJECT_COORDINATORS)) {
          return json({ success: false, error: "Sem permissão para aprovar solicitações" });
        }
        
        const solicitacaoId = formData.get("solicitacaoId") as string;
        const usuarioId = formData.get("usuarioId") as string;
        const codigoBicicleta = formData.get("codigoBicicleta") as string;
        
        await aprovarSolicitacaoBicicleta(solicitacaoId, parseInt(usuarioId), codigoBicicleta);
        
        return json({ 
          success: true, 
          message: "Solicitação aprovada com sucesso!" 
        });
      }
      
      case "rejeitarSolicitacao": {
        if (!isAuth(userPermissions, UserCategory.PROJECT_COORDINATORS)) {
          return json({ success: false, error: "Sem permissão para rejeitar solicitações" });
        }
        
        const solicitacaoId = formData.get("solicitacaoId") as string;
        const motivo = formData.get("motivo") as string;
        
        await rejeitarSolicitacaoBicicleta(solicitacaoId, motivo);
        
        return json({ 
          success: true, 
          message: "Solicitação rejeitada!" 
        });
      }
      
      default:
        return json({ success: false, error: "Ação não reconhecida" });
    }
  } catch (error) {
    console.error("Erro na ação:", error);
    return json({ 
      success: false, 
      error: "Erro interno do servidor" 
    });
  }
}