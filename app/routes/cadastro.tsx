import { useState, useEffect } from "react";
import { Form, useActionData, Link } from "@remix-run/react";
import { json, type ActionFunctionArgs } from "@remix-run/node";
import { UserCategory, UserData } from "~/utils/types";
import { getTelegramUsersInfo } from "~/utils/users";
import telegramInit from "~/utils/telegramInit";
import { formatCPF, formatPhone } from "~/utils/format";
import { validateCPF } from "~/utils/idNumber";
import db from "~/api/firebaseAdmin.server.js";
import { cadastroLoader } from "~/handlers/loaders/cadastro";

export const loader = cadastroLoader;

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const actionType = formData.get("actionType") as string;
  
  if (actionType === "registerUser") {
    const userId = formData.get("userId") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const cpf = formData.get("cpf") as string;
    const telefone = formData.get("telefone") as string;
    const endereco = formData.get("endereco") as string;
    const bairro = formData.get("bairro") as string;
    const cidade = formData.get("cidade") as string;
    const cep = formData.get("cep") as string;
    
    // Simular em desenvolvimento
    if (process.env.NODE_ENV === "development") {
      console.log("[DEV] Simulando cadastro de usuário:", {
        userId,
        firstName,
        lastName,
        email,
        cpf,
        telefone,
        endereco,
        bairro,
        cidade,
        cep
      });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return json({ 
        success: true, 
        message: "[DEV] Usuário cadastrado com sucesso! (simulado)" 
      });
    }
    
    try {
      const userData = {
        id: userId,
        name: `${firstName} ${lastName}`,
        role: UserCategory.ANY_USER,
        telegram_user: {
          id: userId,
          first_name: firstName,
          last_name: lastName
        },
        ameciclo_register: {
          email,
          cpf,
          telefone,
          endereco,
          bairro,
          cidade,
          cep,
          created_at: new Date().toISOString(),
          status: "ativo"
        }
      };
      
      const userRef = db.ref(`subscribers/${userId}`);
      await userRef.set(userData);
      
      return json({ 
        success: true, 
        message: "Usuário cadastrado com sucesso!" 
      });
    } catch (error) {
      console.error("Erro ao cadastrar usuário:", error);
      return json({ 
        success: false, 
        error: "Erro ao cadastrar usuário. Tente novamente." 
      });
    }
  }
  
  return json({ success: false, error: "Ação inválida" });
}

export default function Cadastro() {
  const actionData = useActionData<typeof action>();
  const [user, setUser] = useState<UserData | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    cpf: "",
    telefone: "",
    endereco: "",
    bairro: "",
    cidade: "Recife",
    cep: ""
  });
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
      setFormData(prev => ({
        ...prev,
        firstName: "João",
        lastName: "Silva"
      }));
    } else if (telegramUser) {
      setUser(telegramUser);
      setFormData(prev => ({
        ...prev,
        firstName: telegramUser.first_name || "",
        lastName: telegramUser.last_name || ""
      }));
    }
  }, []);

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value;
    
    if (field === "cpf") {
      formattedValue = formatCPF(value);
    } else if (field === "telefone") {
      formattedValue = formatPhone(value);
    } else if (field === "cep") {
      formattedValue = value.replace(/\D/g, "").replace(/(\d{5})(\d{3})/, "$1-$2");
    }
    
    setFormData(prev => ({ ...prev, [field]: formattedValue }));
  };

  const isCPFValid = formData.cpf ? validateCPF(formData.cpf) : false;
  const isFormValid = formData.firstName && formData.lastName && formData.email && 
                     formData.cpf && isCPFValid && formData.telefone;

  const handleSubmit = () => {
    setIsSubmitting(true);
  };

  useEffect(() => {
    if (actionData) {
      setIsSubmitting(false);
    }
  }, [actionData]);

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-teal-600 mb-2">
          📝 Cadastro de Usuário
        </h1>
        <p className="text-gray-600">Complete seu cadastro no sistema Bota pra Rodar</p>
      </div>

      {/* Success/Error Messages */}
      {actionData?.success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-lg mb-6">
          <div className="flex items-center">
            <span className="text-2xl mr-3">✅</span>
            <div>
              <h3 className="font-semibold">Cadastro realizado!</h3>
              <p>{actionData.message}</p>
            </div>
          </div>
          <div className="mt-4">
            <Link 
              to="/" 
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Ir para Dashboard
            </Link>
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

      {/* Development Notice */}
      {process.env.NODE_ENV === "development" && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-6 py-4 rounded-lg mb-6">
          <div className="flex items-center">
            <span className="text-2xl mr-3">🔧</span>
            <div>
              <h3 className="font-semibold">Modo Desenvolvimento</h3>
              <p>Os dados serão simulados para teste</p>
            </div>
          </div>
        </div>
      )}

      {/* Registration Form */}
      {!actionData?.success && (
        <div className="bg-white rounded-lg shadow-lg p-8">
          <Form method="post" className="space-y-6" onSubmit={handleSubmit}>
            <input type="hidden" name="actionType" value="registerUser" />
            <input type="hidden" name="userId" value={user?.id?.toString() || ""} />

            {/* Personal Information */}
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">👤 Informações Pessoais</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    Nome *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Seu nome"
                  />
                </div>
                
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Sobrenome *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Seu sobrenome"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">📞 Contato</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="seu@email.com"
                  />
                </div>
                
                <div>
                  <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone *
                  </label>
                  <input
                    type="text"
                    id="telefone"
                    name="telefone"
                    value={formData.telefone}
                    onChange={(e) => handleInputChange("telefone", e.target.value)}
                    required
                    maxLength={15}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="(81) 99999-9999"
                  />
                </div>
              </div>
            </div>

            {/* Document */}
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">📄 Documento</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 mb-2">
                    CPF *
                  </label>
                  <input
                    type="text"
                    id="cpf"
                    name="cpf"
                    value={formData.cpf}
                    onChange={(e) => handleInputChange("cpf", e.target.value)}
                    required
                    maxLength={14}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${
                      formData.cpf && !isCPFValid
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-300 focus:ring-teal-500"
                    }`}
                    placeholder="000.000.000-00"
                  />
                  {formData.cpf && !isCPFValid && (
                    <span className="text-red-500 text-sm mt-1">CPF inválido</span>
                  )}
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">🏠 Endereço (Opcional)</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="endereco" className="block text-sm font-medium text-gray-700 mb-2">
                    Endereço
                  </label>
                  <input
                    type="text"
                    id="endereco"
                    name="endereco"
                    value={formData.endereco}
                    onChange={(e) => handleInputChange("endereco", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Rua, número, complemento"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="bairro" className="block text-sm font-medium text-gray-700 mb-2">
                      Bairro
                    </label>
                    <input
                      type="text"
                      id="bairro"
                      name="bairro"
                      value={formData.bairro}
                      onChange={(e) => handleInputChange("bairro", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Seu bairro"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="cidade" className="block text-sm font-medium text-gray-700 mb-2">
                      Cidade
                    </label>
                    <input
                      type="text"
                      id="cidade"
                      name="cidade"
                      value={formData.cidade}
                      onChange={(e) => handleInputChange("cidade", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Sua cidade"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="cep" className="block text-sm font-medium text-gray-700 mb-2">
                      CEP
                    </label>
                    <input
                      type="text"
                      id="cep"
                      name="cep"
                      value={formData.cep}
                      onChange={(e) => handleInputChange("cep", e.target.value)}
                      maxLength={9}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="00000-000"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-6">
              <Link
                to="/"
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
                    : "bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700"
                }`}
              >
                {isSubmitting ? "Cadastrando..." : "Finalizar Cadastro"}
              </button>
            </div>
          </Form>
        </div>
      )}

      {/* Back to Dashboard */}
      <div className="text-center mt-8">
        <Link 
          to="/" 
          className="text-teal-600 hover:text-teal-800 font-medium"
        >
          ← Voltar ao Dashboard
        </Link>
      </div>
    </div>
  );
}