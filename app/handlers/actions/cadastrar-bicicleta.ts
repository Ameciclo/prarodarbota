import { json, type ActionFunctionArgs } from "@remix-run/node";
import { createBicicleta } from "~/api/firebaseConnection.server";

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
    
    try {
      const bicicletaData = {
        codigo,
        nome,
        tipo,
        cor,
        observacoes,
        foto: foto || null,
        categoria: tipo
      };
      
      await createBicicleta(bicicletaData);
      
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