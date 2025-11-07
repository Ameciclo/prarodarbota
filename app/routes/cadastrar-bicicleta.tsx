import { useState, useEffect } from "react";
import { Form, useActionData, Link } from "@remix-run/react";
import { json, type ActionFunctionArgs } from "@remix-run/node";
import { UserCategory, UserData } from "~/utils/types";
import { getTelegramUsersInfo } from "~/utils/users";
import telegramInit from "~/utils/telegramInit";
import { isAuth } from "~/utils/isAuthorized";
import { cadastrarBicicletaLoader } from "~/handlers/loaders/cadastrar-bicicleta";
import { cadastrarBicicletaAction } from "~/handlers/actions/cadastrar-bicicleta";

export const loader = cadastrarBicicletaLoader;
export const action = cadastrarBicicletaAction;

/*export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const actionType = formData.get("actionType") as string;
  
  if (actionType === "cadastrarBicicleta") {
    const codigo = formData.get("codigo") as string;
    const nome = formData.get("nome") as string;
    const tipo = formData.get("tipo") as string;
    const cor = formData.get("cor") as string;
    const observacoes = formData.get("observacoes") as string;
    
    if (process.env.NODE_ENV === "development") {
      console.log("[DEV] Simulando cadastro de bicicleta:", {
        codigo, nome, tipo, cor, observacoes
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
        disponivel: true,
        emprestada: false,
        created_at: new Date().toISOString(),
        status: "ativa"
      };
      
      const bicicletaRef = db.ref(`bicicletas/${codigo}`);
      await bicicletaRef.set(bicicletaData);
      
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
}*/

export default function CadastrarBicicleta() {
  const actionData = useActionData<typeof action>();
  const [user, setUser] = useState<UserData | null>(null);
  const [userPermissions, setUserPermissions] = useState<string[]>([UserCategory.ANY_USER]);
  const [formData, setFormData] = useState({
    codigo: "",
    nome: "",
    tipo: "",
    cor: "",
    observacoes: "",
    foto: ""
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    telegramInit();
    const telegramUser = getTelegramUsersInfo();
    
    if (process.env.NODE_ENV === "development" && !telegramUser) {
      setUser({
        id: 123456789,
        first_name: "João",
        last_name: "Silva",
        username: "joaosilva"
      } as UserData);
      setUserPermissions([UserCategory.PROJECT_COORDINATORS]);
    } else if (telegramUser) {
      setUser(telegramUser);
    }
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setPreviewImage(result);
        setFormData(prev => ({ ...prev, foto: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const isFormValid = formData.codigo && formData.nome && formData.tipo;

  const handleSubmit = () => {
    setIsSubmitting(true);
  };

  useEffect(() => {
    if (actionData) {
      setIsSubmitting(false);
      if (actionData.success) {
        setFormData({
          codigo: "",
          nome: "",
          tipo: "",
          cor: "",
          observacoes: "",
          foto: ""
        });
        setPreviewImage(null);
      }
    }
  }, [actionData]);

  // Check permissions
  if (!isAuth(userPermissions, UserCategory.PROJECT_COORDINATORS) && process.env.NODE_ENV !== "development") {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-600 mb-4">🚫 Acesso Negado</h1>
          <p className="text-gray-600 mb-6">Você não tem permissão para cadastrar bicicletas.</p>
          <Link to="/" className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors">
            Voltar ao Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Navigation */}
      <div className="mb-6">
        <Link to="/gestao" className="text-green-600 hover:text-green-800 font-medium transition-colors">
          ← Voltar à Gestão
        </Link>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-green-600 mb-2">
          ➕ Cadastrar Bicicleta
        </h1>
        <p className="text-gray-600">Adicionar nova bicicleta ao sistema</p>
      </div>

      {/* Success/Error Messages */}
      {actionData?.success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-lg mb-6">
          <div className="flex items-center">
            <span className="text-2xl mr-3">✅</span>
            <div>
              <h3 className="font-semibold">Bicicleta cadastrada!</h3>
              <p>{actionData.message}</p>
            </div>
          </div>
        </div>
      )}

      {actionData?.error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-lg mb-6">
          <div className="flex items-center">
            <span className="text-2xl mr-3">❌</span>
            <div>
              <h3 className="font-semibold">Erro no cadastro</h3>
              <p>{actionData.error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <Form method="post" className="space-y-6" onSubmit={handleSubmit}>
          <input type="hidden" name="actionType" value="cadastrarBicicleta" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="codigo" className="block text-sm font-medium text-gray-700 mb-2">
                Código da Bicicleta *
              </label>
              <input
                type="text"
                id="codigo"
                name="codigo"
                value={formData.codigo}
                onChange={(e) => handleInputChange("codigo", e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Ex: BPR001"
              />
            </div>
            
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Bicicleta *
              </label>
              <input
                type="text"
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={(e) => handleInputChange("nome", e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Ex: Bicicleta Verde"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-2">
                Tipo *
              </label>
              <select
                id="tipo"
                name="tipo"
                value={formData.tipo}
                onChange={(e) => handleInputChange("tipo", e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Selecione o tipo</option>
                <option value="urbana">Urbana</option>
                <option value="mountain">Mountain Bike</option>
                <option value="speed">Speed</option>
                <option value="hibrida">Híbrida</option>
                <option value="eletrica">Elétrica</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="cor" className="block text-sm font-medium text-gray-700 mb-2">
                Cor
              </label>
              <input
                type="text"
                id="cor"
                name="cor"
                value={formData.cor}
                onChange={(e) => handleInputChange("cor", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Ex: Verde, Azul, Vermelha"
              />
            </div>
          </div>

          <div>
            <label htmlFor="observacoes" className="block text-sm font-medium text-gray-700 mb-2">
              Observações
            </label>
            <textarea
              id="observacoes"
              name="observacoes"
              value={formData.observacoes}
              onChange={(e) => handleInputChange("observacoes", e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Informações adicionais sobre a bicicleta..."
            />
          </div>

          {/* Photo Upload */}
          <div>
            <label htmlFor="foto" className="block text-sm font-medium text-gray-700 mb-2">
              📷 Foto da Bicicleta
            </label>
            <div className="space-y-4">
              <input
                type="file"
                id="foto"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <input type="hidden" name="foto" value={formData.foto} />
              
              {previewImage && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Pré-visualização:</p>
                  <div className="relative inline-block">
                    <img 
                      src={previewImage} 
                      alt="Pré-visualização da bicicleta" 
                      className="w-48 h-48 object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewImage(null);
                        setFormData(prev => ({ ...prev, foto: "" }));
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <Link
              to="/gestao"
              className="flex-1 bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors text-center"
            >
              Cancelar
            </Link>
            
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors ${
                !isFormValid || isSubmitting
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
              }`}
            >
              {isSubmitting ? "Cadastrando..." : "Cadastrar Bicicleta"}
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}