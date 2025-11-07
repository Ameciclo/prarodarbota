import { json, type ActionFunctionArgs } from "@remix-run/node";
import { cadastrarBicicleta } from "~/api/firebaseConnection.server";

export async function cadastrarBicicletaAction({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const actionType = formData.get("actionType") as string;
  
  if (actionType === "cadastrarBicicleta") {
    const codigo = formData.get("codigo") as string;
    const nome = formData.get("nome") as string;
    const tipo = formData.get("tipo") as string;
    const cor = formData.get("cor") as string;
    const observacoes = formData.get("observacoes") as string;
    const foto = formData.get("foto") as string;
    
    if (process.env.NODE_ENV === "development") {
      console.log("[DEV] Simulando cadastro de bicicleta:", {
        codigo, nome, tipo, cor, observacoes, foto: foto ? "[IMAGEM]" : "sem foto"
      });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return json({ 
        success: true, 
        message: "[DEV] Bicicleta cadastrada com sucesso! (simulado)" 
      });
    }
    
    try {
      const bicicletaData = {
        codigo,
        nome,
        tipo,
        cor,
        observacoes,
        foto: foto || null,
        disponivel: true,
        emprestada: false,
        created_at: new Date().toISOString(),
        status: "ativa"
      };
      
      await cadastrarBicicleta(bicicletaData);
      
      return json({ 
        success: true, 
        message: "Bicicleta cadastrada com sucesso!" 
      });
    } catch (error) {
      console.error("Erro ao cadastrar bicicleta:", error);
      return json({ 
        success: false, 
        error: "Erro ao cadastrar bicicleta. Tente novamente." 
      });
    }
  }
  
  return json({ success: false, error: "Ação inválida" });
}