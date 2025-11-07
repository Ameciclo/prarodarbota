import { useState, useEffect } from "react";
import { useLoaderData, Form, useSubmit, Link } from "@remix-run/react";
import { UserCategory, type Bicicleta, type EmprestimoBicicleta, type UserData } from "~/utils/types";
import { getTelegramUsersInfo } from "~/utils/users";
import telegramInit from "~/utils/telegramInit";
import { isAuth } from "~/utils/isAuthorized";
import { botaPraRodarLoader } from "~/handlers/loaders/bota-pra-rodar";
import { botaPraRodarAction } from "~/handlers/actions/bota-pra-rodar";
import { BotaPraRodarGestao } from "~/components/BotaPraRodarGestao";
import { PaginacaoBicicletas } from "~/components/PaginacaoBicicletas";

export const loader = botaPraRodarLoader;
export const action = botaPraRodarAction;

export default function BotaPraRodar() {
  const { bicicletas, emprestimos, solicitacoes, users } = useLoaderData<typeof loader>();
  const [user, setUser] = useState<UserData | null>(null);
  const [busca, setBusca] = useState("");
  const [userPermissions, setUserPermissions] = useState<string[]>([UserCategory.ANY_USER]);
  const [filtroDisponibilidade, setFiltroDisponibilidade] = useState("todos");
  const [filtroTipo, setFiltroTipo] = useState("");

  const submit = useSubmit();

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
      setUserPermissions([UserCategory.ANY_USER]);
    }
  }, [user, users]);

  const bicicletasComDisponibilidade = bicicletas.map((bicicleta: Bicicleta) => {
    return {
      ...bicicleta,
      indisponivel: !bicicleta.disponivel
    };
  });

  // Aplicar filtros
  const bicicletasFiltradas = bicicletasComDisponibilidade.filter((bicicleta: any) => {
    // Filtro por disponibilidade
    if (filtroDisponibilidade === "disponiveis" && !bicicleta.disponivel) return false;
    if (filtroDisponibilidade === "indisponiveis" && bicicleta.disponivel) return false;
    
    // Filtro por tipo
    if (filtroTipo && bicicleta.tipo !== filtroTipo) return false;
    
    return true;
  });

  // Obter opções únicas para os filtros
  const tiposUnicos = [...new Set(bicicletasComDisponibilidade.map((b: any) => b.tipo).filter(Boolean))].sort();

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-teal-600 mb-2">
          🚴♀️ Gerenciar Bicicletas
        </h1>
        <p className="text-gray-600">Sistema de Empréstimo e Controle</p>
      </div>
      
      {/* Navigation */}
      <div className="mb-6">
        <Link 
          to="/" 
          className="text-teal-600 hover:text-teal-800 font-medium transition-colors"
        >
          ← Voltar ao Dashboard
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">🔍 Buscar e Filtrar Bicicletas</h3>
            
            <Form method="get" className="mb-4">
              <div className="flex gap-3">
                <input
                  type="text"
                  name="busca"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar por nome ou código..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-6 py-3 rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all font-semibold"
                >
                  Buscar
                </button>
                {busca && (
                  <button
                    type="button"
                    onClick={() => setBusca("")}
                    className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 py-3 rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all"
                  >
                    Limpar
                  </button>
                )}
              </div>
            </Form>
            
            {/* Filtros */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-700 mb-3">🎛️ Filtros</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Disponibilidade</label>
                  <select
                    value={filtroDisponibilidade}
                    onChange={(e) => setFiltroDisponibilidade(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="todos">🚴 Todas as bicicletas</option>
                    <option value="disponiveis">✅ Disponíveis</option>
                    <option value="indisponiveis">🔒 Emprestadas</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                  <select
                    value={filtroTipo}
                    onChange={(e) => setFiltroTipo(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="">🏷️ Todos os tipos</option>
                    {tiposUnicos.map(tipo => (
                      <option key={tipo} value={tipo}>{tipo}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {(filtroDisponibilidade !== "todos" || filtroTipo) && (
                <button
                  onClick={() => {
                    setFiltroDisponibilidade("todos");
                    setFiltroTipo("");
                  }}
                  className="mt-3 text-sm text-teal-600 hover:text-teal-800 font-semibold hover:underline transition-colors"
                >
                  🗑️ Limpar todos os filtros
                </button>
              )}
            </div>
          </div>



          {/* Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg shadow-lg">
              <div className="text-center">
                <div className="text-2xl mb-1">✅</div>
                <div className="text-lg font-bold">{bicicletasFiltradas.filter(b => b.disponivel).length}</div>
                <div className="text-sm opacity-90">Disponíveis</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-lg shadow-lg">
              <div className="text-center">
                <div className="text-2xl mb-1">🔒</div>
                <div className="text-lg font-bold">{bicicletasFiltradas.filter(b => !b.disponivel).length}</div>
                <div className="text-sm opacity-90">Emprestadas</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg shadow-lg">
              <div className="text-center">
                <div className="text-2xl mb-1">🚴</div>
                <div className="text-lg font-bold">{bicicletasFiltradas.length}</div>
                <div className="text-sm opacity-90">Total</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-4 rounded-lg shadow-lg">
              <div className="text-center">
                <div className="text-2xl mb-1">⚠️</div>
                <div className="text-lg font-bold">0</div>
                <div className="text-sm opacity-90">Manutenção</div>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                🚴 Lista de Bicicletas
              </h3>
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">
                  Mostrando {bicicletasFiltradas.length} de {bicicletasComDisponibilidade.length} bicicletas
                </div>
                {isAuth(userPermissions, UserCategory.PROJECT_COORDINATORS) && (
                  <button className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors text-sm">
                    📊 Exportar Lista
                  </button>
                )}
              </div>
            </div>
            
        <PaginacaoBicicletas 
          bicicletas={bicicletasFiltradas}
          onSolicitar={() => {}}
          userCanRequest={!!user && (process.env.NODE_ENV === "development" || isAuth(userPermissions, UserCategory.AMECICLISTAS))}
          userId={user?.id}
          userCanManage={!!user && (process.env.NODE_ENV === "development" || isAuth(userPermissions, UserCategory.PROJECT_COORDINATORS))}
        />
      </div>
    </div>
  );
}