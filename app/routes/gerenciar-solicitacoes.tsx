import { useState, useEffect } from "react";
import { useLoaderData, Form, Link, useActionData } from "@remix-run/react";
import { UserCategory, type Bicicleta, type EmprestimoBicicleta, type UserData } from "~/utils/types";
import { getTelegramUsersInfo } from "~/utils/users";
import telegramInit from "~/utils/telegramInit";
import { isAuth } from "~/utils/isAuthorized";
import { botaPraRodarLoader } from "~/handlers/loaders/bota-pra-rodar";
import { gerenciarSolicitacoesAction } from "~/handlers/actions/gerenciar-solicitacoes";

export const loader = botaPraRodarLoader;
export const action = gerenciarSolicitacoesAction;

export default function GerenciarSolicitacoes() {
  const { bicicletas, emprestimos, solicitacoes, users } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [user, setUser] = useState<UserData | null>(null);
  const [userPermissions, setUserPermissions] = useState<string[]>([UserCategory.ANY_USER]);
  const [activeTab, setActiveTab] = useState<"pendentes" | "emprestadas" | "saida" | "devolucao">("pendentes");

  useEffect(() => {
    try {
      telegramInit();
      const userData = getTelegramUsersInfo();
      
      if (process.env.NODE_ENV === "development" && !userData) {
        setUser({
          id: 123456789,
          first_name: "João",
          last_name: "Silva",
          username: "joaosilva"
        } as UserData);
        setUserPermissions([UserCategory.PROJECT_COORDINATORS]);
      } else {
        setUser(userData);
      }
    } catch (error) {
      console.error('Erro ao inicializar Telegram:', error);
      setUser(null);
    }
  }, []);

  // Check permissions
  if (!isAuth(userPermissions, UserCategory.PROJECT_COORDINATORS) && process.env.NODE_ENV !== "development") {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-600 mb-4">🚫 Acesso Negado</h1>
          <p className="text-gray-600 mb-6">Você não tem permissão para gerenciar solicitações.</p>
          <Link to="/" className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors">
            Voltar ao Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const solicitacoesPendentes = solicitacoes.filter((s: any) => s.status === 'pendente');
  const emprestimosAtivos = emprestimos.filter((emp: EmprestimoBicicleta) => emp.status === 'emprestado');

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Navigation */}
      <div className="mb-6">
        <Link to="/gestao" className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
          ← Voltar à Gestão
        </Link>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-blue-600 mb-2">
          📋 Gerenciar Solicitações
        </h1>
        <p className="text-gray-600">Controle de empréstimos e devoluções</p>
      </div>

      {/* Success/Error Messages */}
      {actionData?.success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-lg mb-6">
          <div className="flex items-center">
            <span className="text-2xl mr-3">✅</span>
            <div>
              <h3 className="font-semibold">Sucesso!</h3>
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
              <h3 className="font-semibold">Erro</h3>
              <p>{actionData.error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-lg mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab("pendentes")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "pendentes"
                  ? "border-yellow-500 text-yellow-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              ⏳ Pendentes ({solicitacoesPendentes.length})
            </button>
            
            <button
              onClick={() => setActiveTab("emprestadas")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "emprestadas"
                  ? "border-red-500 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              🔒 Emprestadas ({emprestimosAtivos.length})
            </button>
            
            <button
              onClick={() => setActiveTab("saida")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "saida"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              📤 Registrar Saída
            </button>
            
            <button
              onClick={() => setActiveTab("devolucao")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "devolucao"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              📥 Registrar Devolução
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Solicitações Pendentes */}
          {activeTab === "pendentes" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Solicitações Aguardando Aprovação</h3>
              {solicitacoesPendentes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">✅</div>
                  <p>Nenhuma solicitação pendente</p>
                </div>
              ) : (
                solicitacoesPendentes.map((solicitacao: any) => (
                  <div key={solicitacao.id} className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">Bicicleta: {solicitacao.codigo_bicicleta}</h4>
                        <p className="text-sm text-gray-600">Usuário: {solicitacao.usuario_id}</p>
                        <p className="text-sm text-gray-600">Data: {solicitacao.data_solicitacao}</p>
                      </div>
                      <div className="flex gap-2">
                        <Form method="post" className="inline">
                          <input type="hidden" name="actionType" value="aprovarSolicitacao" />
                          <input type="hidden" name="solicitacaoId" value={solicitacao.id} />
                          <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors">
                            ✅ Aprovar
                          </button>
                        </Form>
                        <Form method="post" className="inline">
                          <input type="hidden" name="actionType" value="rejeitarSolicitacao" />
                          <input type="hidden" name="solicitacaoId" value={solicitacao.id} />
                          <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors">
                            ❌ Rejeitar
                          </button>
                        </Form>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Bicicletas Emprestadas */}
          {activeTab === "emprestadas" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Bicicletas Atualmente Emprestadas</h3>
              {emprestimosAtivos.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">🚴</div>
                  <p>Todas as bicicletas estão disponíveis</p>
                </div>
              ) : (
                emprestimosAtivos.map((emprestimo: any) => (
                  <div key={emprestimo.id} className="bg-red-50 border border-red-200 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">Bicicleta: {emprestimo.codigo_bicicleta}</h4>
                        <p className="text-sm text-gray-600">Usuário: {emprestimo.usuario_id}</p>
                        <p className="text-sm text-gray-600">Saída: {emprestimo.data_saida}</p>
                      </div>
                      <Form method="post" className="inline">
                        <input type="hidden" name="actionType" value="registrarDevolucao" />
                        <input type="hidden" name="emprestimoId" value={emprestimo.id} />
                        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                          📥 Registrar Devolução
                        </button>
                      </Form>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Registrar Saída */}
          {activeTab === "saida" && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Registrar Nova Saída</h3>
              <Form method="post" className="space-y-4">
                <input type="hidden" name="actionType" value="registrarSaida" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Código da Bicicleta
                    </label>
                    <select
                      name="codigoBicicleta"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Selecione uma bicicleta</option>
                      {bicicletas.filter((b: Bicicleta) => b.disponivel).map((bicicleta: Bicicleta) => (
                        <option key={bicicleta.codigo} value={bicicleta.codigo}>
                          {bicicleta.codigo} - {bicicleta.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ID do Usuário
                    </label>
                    <input
                      type="text"
                      name="usuarioId"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="ID do usuário"
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                >
                  📤 Registrar Saída
                </button>
              </Form>
            </div>
          )}

          {/* Registrar Devolução */}
          {activeTab === "devolucao" && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Registrar Devolução</h3>
              <Form method="post" className="space-y-4">
                <input type="hidden" name="actionType" value="registrarDevolucao" />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selecionar Empréstimo
                  </label>
                  <select
                    name="emprestimoId"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione um empréstimo</option>
                    {emprestimosAtivos.map((emprestimo: any) => (
                      <option key={emprestimo.id} value={emprestimo.id}>
                        {emprestimo.codigo_bicicleta} - Usuário: {emprestimo.usuario_id} - Saída: {emprestimo.data_saida}
                      </option>
                    ))}
                  </select>
                </div>
                
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  📥 Registrar Devolução
                </button>
              </Form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}