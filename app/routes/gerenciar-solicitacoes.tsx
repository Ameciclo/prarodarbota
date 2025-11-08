import { useState, useEffect } from "react";
import { useLoaderData, Form, Link } from "@remix-run/react";
import { UserCategory, type UserData } from "~/utils/types";
import { getTelegramUsersInfo } from "~/utils/users";
import telegramInit from "~/utils/telegramInit";
import { isAuth } from "~/utils/isAuthorized";
import { botaPraRodarLoader } from "~/handlers/loaders/bota-pra-rodar";
import { botaPraRodarAction } from "~/handlers/actions/bota-pra-rodar";

export const loader = botaPraRodarLoader;
export const action = botaPraRodarAction;

export default function GerenciarSolicitacoes() {
  const { bicicletas, emprestimos, solicitacoes, users } = useLoaderData<typeof loader>();
  const [user, setUser] = useState<UserData | null>(null);
  const [userPermissions, setUserPermissions] = useState<string[]>([UserCategory.ANY_USER]);
  const [filtroStatus, setFiltroStatus] = useState("todos");

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
      } else {
        setUser(userData);
      }
    } catch (error) {
      console.error('Erro ao inicializar Telegram:', error);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    if (user?.id && users[user.id]) {
      const userRole = users[user.id].role;
      setUserPermissions([userRole]);
    } else if (process.env.NODE_ENV === "development") {
      setUserPermissions([UserCategory.PROJECT_COORDINATORS]);
    }
  }, [user, users]);

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

  const solicitacoesFiltradas = solicitacoes.filter((solicitacao: any) => {
    if (filtroStatus === "todos") return true;
    return solicitacao.status === filtroStatus;
  });

  const emprestimosAtivos = emprestimos.filter((emp: any) => emp.status === "emprestado");

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-blue-600 mb-2">
          📋 Gerenciar Solicitações
        </h1>
        <p className="text-gray-600">Controle de empréstimos e devoluções</p>
      </div>

      {/* Navigation */}
      <div className="mb-6">
        <Link 
          to="/gestao" 
          className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          ← Voltar à Gestão
        </Link>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-6 rounded-lg shadow-lg">
          <div className="text-center">
            <div className="text-3xl mb-2">⏳</div>
            <div className="text-2xl font-bold">{solicitacoes.filter((s: any) => s.status === 'pendente').length}</div>
            <div className="text-sm opacity-90">Pendentes</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
          <div className="text-center">
            <div className="text-3xl mb-2">✅</div>
            <div className="text-2xl font-bold">{solicitacoes.filter((s: any) => s.status === 'aprovada').length}</div>
            <div className="text-sm opacity-90">Aprovadas</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-lg shadow-lg">
          <div className="text-center">
            <div className="text-3xl mb-2">❌</div>
            <div className="text-2xl font-bold">{solicitacoes.filter((s: any) => s.status === 'rejeitada').length}</div>
            <div className="text-sm opacity-90">Rejeitadas</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
          <div className="text-center">
            <div className="text-3xl mb-2">🚴</div>
            <div className="text-2xl font-bold">{emprestimosAtivos.length}</div>
            <div className="text-sm opacity-90">Emprestadas</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">🔍 Filtros</h3>
        <div className="flex gap-4">
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="todos">Todas as solicitações</option>
            <option value="pendente">Pendentes</option>
            <option value="aprovada">Aprovadas</option>
            <option value="rejeitada">Rejeitadas</option>
          </select>
        </div>
      </div>

      {/* Solicitações */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">📝 Solicitações de Empréstimo</h3>
        
        {solicitacoesFiltradas.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📭</div>
            <p className="text-gray-600">Nenhuma solicitação encontrada</p>
          </div>
        ) : (
          <div className="space-y-4">
            {solicitacoesFiltradas.map((solicitacao: any) => {
              const usuario = users[solicitacao.usuario_id];
              const bicicleta = bicicletas.find((b: any) => b.codigo === solicitacao.codigo_bicicleta);
              
              return (
                <div key={solicitacao.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          solicitacao.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                          solicitacao.status === 'aprovada' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {solicitacao.status === 'pendente' ? '⏳ Pendente' :
                           solicitacao.status === 'aprovada' ? '✅ Aprovada' :
                           '❌ Rejeitada'}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(solicitacao.data_solicitacao).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <h4 className="font-semibold text-gray-800">Usuário</h4>
                          <p className="text-sm text-gray-600">
                            {usuario?.name || `ID: ${solicitacao.usuario_id}`}
                          </p>
                          {usuario?.ameciclo_register?.telefone && (
                            <p className="text-xs text-gray-500">{usuario.ameciclo_register.telefone}</p>
                          )}
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-gray-800">Bicicleta</h4>
                          <p className="text-sm text-gray-600">
                            {bicicleta?.nome || solicitacao.codigo_bicicleta}
                          </p>
                          <p className="text-xs text-gray-500">Código: {solicitacao.codigo_bicicleta}</p>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-gray-800">Status</h4>
                          <p className="text-sm text-gray-600 capitalize">{solicitacao.status}</p>
                          {solicitacao.motivo_rejeicao && (
                            <p className="text-xs text-red-500">Motivo: {solicitacao.motivo_rejeicao}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {solicitacao.status === 'pendente' && (
                      <div className="flex gap-2 ml-4">
                        <Form method="post" className="inline">
                          <input type="hidden" name="actionType" value="aprovarSolicitacao" />
                          <input type="hidden" name="solicitacaoId" value={solicitacao.id} />
                          <input type="hidden" name="usuarioId" value={solicitacao.usuario_id} />
                          <input type="hidden" name="codigoBicicleta" value={solicitacao.codigo_bicicleta} />
                          <button
                            type="submit"
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                          >
                            ✅ Aprovar
                          </button>
                        </Form>
                        
                        <Form method="post" className="inline">
                          <input type="hidden" name="actionType" value="rejeitarSolicitacao" />
                          <input type="hidden" name="solicitacaoId" value={solicitacao.id} />
                          <input type="hidden" name="motivo" value="Rejeitada pela coordenação" />
                          <button
                            type="submit"
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                          >
                            ❌ Rejeitar
                          </button>
                        </Form>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Empréstimos Ativos */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">🚴 Empréstimos Ativos</h3>
        
        {emprestimosAtivos.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🏁</div>
            <p className="text-gray-600">Nenhum empréstimo ativo no momento</p>
          </div>
        ) : (
          <div className="space-y-4">
            {emprestimosAtivos.map((emprestimo: any) => {
              const usuario = users[emprestimo.usuario_id];
              const bicicleta = bicicletas.find((b: any) => b.codigo === emprestimo.codigo_bicicleta);
              const diasEmprestado = Math.floor((Date.now() - new Date(emprestimo.data_saida).getTime()) / (1000 * 60 * 60 * 24));
              
              return (
                <div key={emprestimo.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <h4 className="font-semibold text-gray-800">Usuário</h4>
                          <p className="text-sm text-gray-600">
                            {usuario?.name || `ID: ${emprestimo.usuario_id}`}
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-gray-800">Bicicleta</h4>
                          <p className="text-sm text-gray-600">
                            {bicicleta?.nome || emprestimo.codigo_bicicleta}
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-gray-800">Data Saída</h4>
                          <p className="text-sm text-gray-600">
                            {new Date(emprestimo.data_saida).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-gray-800">Dias</h4>
                          <p className={`text-sm font-medium ${
                            diasEmprestado > 7 ? 'text-red-600' : 
                            diasEmprestado > 5 ? 'text-yellow-600' : 'text-green-600'
                          }`}>
                            {diasEmprestado} dias
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      <Form method="post" className="inline">
                        <input type="hidden" name="actionType" value="finalizarEmprestimo" />
                        <input type="hidden" name="emprestimoId" value={emprestimo.id} />
                        <button
                          type="submit"
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          🏁 Finalizar
                        </button>
                      </Form>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}