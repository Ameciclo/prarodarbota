import { useState, useEffect } from "react";
import { Form, useActionData, useLoaderData, Link, useParams } from "@remix-run/react";
import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { UserCategory, UserData, type Bicicleta } from "~/utils/types";
import { getTelegramUsersInfo } from "~/utils/users";
import telegramInit from "~/utils/telegramInit";
import { isAuth } from "~/utils/isAuthorized";

export async function loader({ params }: LoaderFunctionArgs) {
  const { codigo } = params;
  
  if (process.env.NODE_ENV === "development") {
    // Mock data para desenvolvimento
    const bicicleta: Bicicleta = {
      codigo: codigo || "BPR001",
      nome: `Bicicleta ${codigo}`,
      tipo: "urbana",
      disponivel: true,
      descricao: "Bicicleta para uso urbano",
      imagem: ""
    };
    
    return json({ bicicleta });
  }
  
  // TODO: Implementar busca real da bicicleta no Firebase
  return json({ bicicleta: null });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const { codigo } = params;
  
  const configData = {
    codigo,
    nome: formData.get("nome") as string,
    tipo: formData.get("tipo") as string,
    cor: formData.get("cor") as string,
    descricao: formData.get("descricao") as string,
    disponivel: formData.get("disponivel") === "true",
    manutencao: formData.get("manutencao") === "true",
    observacoes: formData.get("observacoes") as string,
    localizacao: formData.get("localizacao") as string,
    ultimaManutencao: formData.get("ultimaManutencao") as string,
    proximaManutencao: formData.get("proximaManutencao") as string
  };
  
  if (process.env.NODE_ENV === "development") {
    console.log("[DEV] Salvando configuração da bicicleta:", configData);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return json({ 
      success: true, 
      message: `Configurações da bicicleta ${codigo} salvas com sucesso!` 
    });
  }
  
  // TODO: Implementar salvamento real no Firebase
  return json({ success: false, error: "Funcionalidade não implementada" });
}

export default function ConfigurarBicicleta() {
  const { bicicleta } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const { codigo } = useParams();
  const [user, setUser] = useState<UserData | null>(null);
  const [userPermissions, setUserPermissions] = useState<string[]>([UserCategory.ANY_USER]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    nome: bicicleta?.nome || "",
    tipo: bicicleta?.tipo || "",
    cor: "",
    descricao: bicicleta?.descricao || "",
    disponivel: bicicleta?.disponivel ?? true,
    manutencao: false,
    observacoes: "",
    localizacao: "",
    ultimaManutencao: "",
    proximaManutencao: ""
  });

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

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
  };

  useEffect(() => {
    if (actionData) {
      setIsSubmitting(false);
    }
  }, [actionData]);

  // Check permissions
  if (!isAuth(userPermissions, UserCategory.PROJECT_COORDINATORS) && process.env.NODE_ENV !== "development") {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-600 mb-4">🚫 Acesso Negado</h1>
          <p className="text-gray-600 mb-6">Você não tem permissão para configurar bicicletas.</p>
          <Link to="/bota-pra-rodar" className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors">
            Voltar às Bicicletas
          </Link>
        </div>
      </div>
    );
  }

  if (!bicicleta && process.env.NODE_ENV !== "development") {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-600 mb-4">❌ Bicicleta não encontrada</h1>
          <p className="text-gray-600 mb-6">A bicicleta com código "{codigo}" não foi encontrada.</p>
          <Link to="/bota-pra-rodar" className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors">
            Voltar às Bicicletas
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Navigation */}
      <div className="mb-6">
        <Link to="/bota-pra-rodar" className="text-teal-600 hover:text-teal-800 font-medium transition-colors">
          ← Voltar às Bicicletas
        </Link>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-teal-600 mb-2">
          ⚙️ Configurar Bicicleta
        </h1>
        <p className="text-gray-600">Código: <span className="font-semibold">{codigo}</span></p>
      </div>

      {/* Success/Error Messages */}
      {actionData?.success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-lg mb-6">
          <div className="flex items-center">
            <span className="text-2xl mr-3">✅</span>
            <div>
              <h3 className="font-semibold">Configurações salvas!</h3>
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
              <h3 className="font-semibold">Erro ao salvar</h3>
              <p>{actionData.error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Configuration Form */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <Form method="post" className="space-y-8" onSubmit={handleSubmit}>
          
          {/* Informações Básicas */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
              📋 Informações Básicas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Bicicleta
                </label>
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={(e) => handleInputChange("nome", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Ex: Bicicleta Verde"
                />
              </div>
              
              <div>
                <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo
                </label>
                <select
                  id="tipo"
                  name="tipo"
                  value={formData.tipo}
                  onChange={(e) => handleInputChange("tipo", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Ex: Verde, Azul, Vermelha"
                />
              </div>
              
              <div>
                <label htmlFor="localizacao" className="block text-sm font-medium text-gray-700 mb-2">
                  Localização Atual
                </label>
                <input
                  type="text"
                  id="localizacao"
                  name="localizacao"
                  value={formData.localizacao}
                  onChange={(e) => handleInputChange("localizacao", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Ex: Sede Ameciclo, Emprestada para João"
                />
              </div>
            </div>
          </div>

          {/* Status e Disponibilidade */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
              🔄 Status e Disponibilidade
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="disponivel"
                    name="disponivel"
                    checked={formData.disponivel}
                    onChange={(e) => handleInputChange("disponivel", e.target.checked)}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                  />
                  <label htmlFor="disponivel" className="ml-2 block text-sm text-gray-900">
                    ✅ Disponível para empréstimo
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="manutencao"
                    name="manutencao"
                    checked={formData.manutencao}
                    onChange={(e) => handleInputChange("manutencao", e.target.checked)}
                    className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                  />
                  <label htmlFor="manutencao" className="ml-2 block text-sm text-gray-900">
                    🔧 Em manutenção
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Manutenção */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
              🔧 Controle de Manutenção
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="ultimaManutencao" className="block text-sm font-medium text-gray-700 mb-2">
                  Última Manutenção
                </label>
                <input
                  type="date"
                  id="ultimaManutencao"
                  name="ultimaManutencao"
                  value={formData.ultimaManutencao}
                  onChange={(e) => handleInputChange("ultimaManutencao", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label htmlFor="proximaManutencao" className="block text-sm font-medium text-gray-700 mb-2">
                  Próxima Manutenção
                </label>
                <input
                  type="date"
                  id="proximaManutencao"
                  name="proximaManutencao"
                  value={formData.proximaManutencao}
                  onChange={(e) => handleInputChange("proximaManutencao", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Descrição e Observações */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
              📝 Descrição e Observações
            </h3>
            <div className="space-y-6">
              <div>
                <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  id="descricao"
                  name="descricao"
                  value={formData.descricao}
                  onChange={(e) => handleInputChange("descricao", e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Descrição geral da bicicleta..."
                />
              </div>
              
              <div>
                <label htmlFor="observacoes" className="block text-sm font-medium text-gray-700 mb-2">
                  Observações de Manutenção
                </label>
                <textarea
                  id="observacoes"
                  name="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => handleInputChange("observacoes", e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Observações sobre estado, problemas, reparos necessários..."
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-6 border-t">
            <Link
              to="/bota-pra-rodar"
              className="flex-1 bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors text-center"
            >
              Cancelar
            </Link>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors ${
                isSubmitting
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700"
              }`}
            >
              {isSubmitting ? "Salvando..." : "Salvar Configurações"}
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}