import { useState, useEffect } from "react";
import { useLoaderData, Link } from "@remix-run/react";
import { UserCategory, type Bicicleta, type EmprestimoBicicleta, type UserData } from "~/utils/types";
import { getTelegramUsersInfo } from "~/utils/users";
import telegramInit from "~/utils/telegramInit";
import { isAuth } from "~/utils/isAuthorized";
import { botaPraRodarLoader } from "~/handlers/loaders/bota-pra-rodar";
import { botaPraRodarAction } from "~/handlers/actions/bota-pra-rodar";
import { BotaPraRodarGestao } from "~/components/BotaPraRodarGestao";

export const loader = botaPraRodarLoader;
export const action = botaPraRodarAction;

export default function Gestao() {
  const { bicicletas, emprestimos, solicitacoes, users } = useLoaderData<typeof loader>();
  const [user, setUser] = useState<UserData | null>(null);
  const [userPermissions, setUserPermissions] = useState<string[]>([UserCategory.ANY_USER]);

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

  const bicicletasComDisponibilidade = bicicletas.map((bicicleta: Bicicleta) => {
    return {
      ...bicicleta,
      indisponivel: !bicicleta.disponivel
    };
  });

  // Check permissions
  if (!isAuth(userPermissions, UserCategory.PROJECT_COORDINATORS) && process.env.NODE_ENV !== "development") {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-600 mb-4">🚫 Acesso Negado</h1>
          <p className="text-gray-600 mb-6">Você não tem permissão para acessar a área de gestão.</p>
          <Link 
            to="/" 
            className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors"
          >
            Voltar ao Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-orange-600 mb-2">
          🔧 Gestão do Sistema
        </h1>
        <p className="text-gray-600">Painel administrativo do Bota pra Rodar</p>
      </div>

      {/* Navigation */}
      <div className="mb-6">
        <Link 
          to="/" 
          className="text-orange-600 hover:text-orange-800 font-medium transition-colors"
        >
          ← Voltar ao Dashboard
        </Link>
      </div>

      {/* Main Actions */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">🛠️ Ações Principais</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            to="/cadastrar-bicicleta"
            className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg hover:from-green-600 hover:to-green-700 transition-all no-underline"
          >
            <div className="text-center">
              <div className="text-3xl mb-2">➕</div>
              <h4 className="font-semibold text-lg mb-1">Cadastrar Bicicleta</h4>
              <p className="text-sm opacity-90">Adicionar nova bicicleta ao sistema</p>
            </div>
          </Link>
          
          <Link 
            to="/gerenciar-bicicletas"
            className="bg-gradient-to-r from-teal-500 to-teal-600 text-white p-6 rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all no-underline"
          >
            <div className="text-center">
              <div className="text-3xl mb-2">⚙️</div>
              <h4 className="font-semibold text-lg mb-1">Gerenciar Bicicletas</h4>
              <p className="text-sm opacity-90">Configurar cada bicicleta individualmente</p>
            </div>
          </Link>
          
          <Link 
            to="/gerenciar-solicitacoes"
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all no-underline"
          >
            <div className="text-center">
              <div className="text-3xl mb-2">📋</div>
              <h4 className="font-semibold text-lg mb-1">Gerenciar Solicitações</h4>
              <p className="text-sm opacity-90">Controlar empréstimos e devoluções</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Secondary Actions */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">📈 Relatórios e Dados</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            to="/estatisticas-bota-pra-rodar"
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all no-underline"
          >
            <div className="text-center">
              <div className="text-2xl mb-2">📊</div>
              <span className="font-semibold">Estatísticas</span>
            </div>
          </Link>
          
          <button className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white p-4 rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all">
            <div className="text-center">
              <div className="text-2xl mb-2">🔄</div>
              <span className="font-semibold">Sincronizar</span>
            </div>
          </button>
          
          <button className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-lg hover:from-red-600 hover:to-red-700 transition-all">
            <div className="text-center">
              <div className="text-2xl mb-2">📤</div>
              <span className="font-semibold">Exportar</span>
            </div>
          </button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
          <div className="text-center">
            <div className="text-3xl mb-2">✅</div>
            <div className="text-2xl font-bold">{bicicletasComDisponibilidade.filter(b => b.disponivel).length}</div>
            <div className="text-sm opacity-90">Disponíveis</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-lg shadow-lg">
          <div className="text-center">
            <div className="text-3xl mb-2">🔒</div>
            <div className="text-2xl font-bold">{bicicletasComDisponibilidade.filter(b => !b.disponivel).length}</div>
            <div className="text-sm opacity-90">Emprestadas</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
          <div className="text-center">
            <div className="text-3xl mb-2">🚴</div>
            <div className="text-2xl font-bold">{bicicletasComDisponibilidade.length}</div>
            <div className="text-sm opacity-90">Total</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-6 rounded-lg shadow-lg">
          <div className="text-center">
            <div className="text-3xl mb-2">⚠️</div>
            <div className="text-2xl font-bold">{solicitacoes.filter((s: any) => s.status === 'pendente').length}</div>
            <div className="text-sm opacity-90">Pendentes</div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">📈 Atividade Recente</h3>
        <div className="space-y-3">
          {emprestimos.slice(0, 5).map((emprestimo: any, index: number) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <span className="text-2xl mr-3">🚴</span>
                <div>
                  <p className="font-semibold">Bicicleta {emprestimo.codigo_bicicleta}</p>
                  <p className="text-sm text-gray-600">Usuário: {emprestimo.usuario_id}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  emprestimo.status === 'emprestado' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                }`}>
                  {emprestimo.status}
                </span>
                <p className="text-xs text-gray-500 mt-1">{emprestimo.data_saida}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">📊 Saúde do Sistema</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-green-800">Conectividade</h4>
                <p className="text-sm text-green-600">Sistema Online</p>
              </div>
              <div className="text-2xl text-green-600">🟢</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-blue-800">Banco de Dados</h4>
                <p className="text-sm text-blue-600">Funcionando</p>
              </div>
              <div className="text-2xl text-blue-600">💾</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-purple-800">API Status</h4>
                <p className="text-sm text-purple-600">Ativo</p>
              </div>
              <div className="text-2xl text-purple-600">⚙️</div>
            </div>
          </div>
        </div>
      </div>

      {/* User Management Quick Access */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">👥 Gestão de Usuários</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link 
            to="/users"
            className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white p-4 rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all no-underline"
          >
            <div className="text-center">
              <div className="text-2xl mb-2">🔧</div>
              <span className="font-semibold">Gerenciar Usuários</span>
              <p className="text-sm opacity-90 mt-1">Administrar permissões</p>
            </div>
          </Link>
          
          <Link 
            to="/cadastro"
            className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg hover:from-green-600 hover:to-green-700 transition-all no-underline"
          >
            <div className="text-center">
              <div className="text-2xl mb-2">📝</div>
              <span className="font-semibold">Cadastrar Usuário</span>
              <p className="text-sm opacity-90 mt-1">Novo cadastro</p>
            </div>
          </Link>
        </div>
      </div>


    </div>
  );
}