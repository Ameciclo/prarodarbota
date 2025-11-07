import { json, type ActionFunctionArgs } from "@remix-run/node";
import { 
  aprovarSolicitacaoBicicleta, 
  rejeitarSolicitacaoBicicleta, 
  registrarDevolucaoBicicleta,
  solicitarEmprestimoBicicleta 
} from "~/api/firebaseConnection.server";

export async function gerenciarSolicitacoesAction({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const actionType = formData.get("actionType") as string;
  
  if (process.env.NODE_ENV === "development") {
    console.log("[DEV] Simulando ação:", actionType);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return json({ 
      success: true, 
      message: `[DEV] ${actionType} executado com sucesso! (simulado)` 
    });
  }
  
  try {
    switch (actionType) {
      case "aprovarSolicitacao":
        const solicitacaoId = formData.get("solicitacaoId") as string;
        await aprovarSolicitacaoBicicleta(solicitacaoId, "", "", true);
        return json({ success: true, message: "Solicitação aprovada com sucesso!" });
        
      case "rejeitarSolicitacao":
        const rejeitarId = formData.get("solicitacaoId") as string;
        await rejeitarSolicitacaoBicicleta(rejeitarId);
        return json({ success: true, message: "Solicitação rejeitada." });
        
      case "registrarSaida":
        const codigoBicicleta = formData.get("codigoBicicleta") as string;
        const usuarioId = formData.get("usuarioId") as string;
        await solicitarEmprestimoBicicleta(usuarioId, codigoBicicleta);
        await aprovarSolicitacaoBicicleta("", usuarioId, codigoBicicleta, true);
        return json({ success: true, message: "Saída registrada com sucesso!" });
        
      case "registrarDevolucao":
        const emprestimoId = formData.get("emprestimoId") as string;
        await registrarDevolucaoBicicleta(emprestimoId);
        return json({ success: true, message: "Devolução registrada com sucesso!" });
        
      default:
        return json({ success: false, error: "Ação inválida" });
    }
  } catch (error) {
    console.error("Erro na ação:", error);
    return json({ 
      success: false, 
      error: "Erro ao executar ação. Tente novamente." 
    });
  }
}