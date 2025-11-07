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
  const [mostrarGestao, setMostrarGestao] = useState(false);
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
      
      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link 
          to="/" 
          className="bg-gradient-to-r from-gray-500 to-gray-600 text-white p-4 rounded-lg shadow-lg hover:from-gray-600 hover:to-gray-700 transition-all no-underline"
        >
          <div className="text-center">
            <div className="text-2xl mb-1">⬅️</div>
            <span className="font-semibold">Dashboard</span>
          </div>
        </Link>
        
        <Link 
          to="/estatisticas-bota-pra-rodar" 
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all no-underline"
        >
          <div className="text-center">
            <div className="text-2xl mb-1">📊</div>
            <span className="font-semibold">Estatísticas</span>
          </div>
        </Link>
        
        {user && (process.env.NODE_ENV === "development" || isAuth(userPermissions, UserCategory.PROJECT_COORDINATORS)) && (
          <button
            onClick={() => setMostrarGestao(!mostrarGestao)}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-lg shadow-lg hover:from-orange-600 hover:to-orange-700 transition-all"
          >
            <div className="text-center">
              <div className="text-2xl mb-1">🔧</div>
              <span className="font-semibold">{mostrarGestao ? "Ver Bicicletas" : "Gestão"}</span>
            </div>
          </button>
        )}
      </div>

      {!mostrarGestao ? (
        <>
          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">🔍 Buscar e Filtrar</h3>
            
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

          {/* Bike Statistics */}
          {isAuth(userPermissions, UserCategory.AMECICLISTAS) && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">📊 Estatísticas por Bicicleta</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    id: "teste2",
                    nome: "Bicicleta Teste 2",
                    sessions: 1,
                    totalKm: 2.6,
                    lastMode: "econômico",
                    battery: 79.65,
                    status: "conectada"
                  },
                  {
                    id: "teste3", 
                    nome: "Bicicleta Teste 3",
                    sessions: 1,
                    totalKm: 3.8,
                    lastMode: "intensivo",
                    battery: 88.23,
                    status: "conectada"
                  },
                  {
                    id: "teste4",
                    nome: "Bicicleta Teste 4", 
                    sessions: 1,
                    totalKm: 0.4,
                    lastMode: "mega econômico",
                    battery: 89.43,
                    status: "conectada"
                  }
                ].map((bike) => (
                  <div key={bike.id} className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-800">{bike.nome}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        bike.status === 'conectada' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {bike.status === 'conectada' ? '🟢 Online' : '🔴 Offline'}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">📍 Distância:</span>
                        <span className="font-semibold text-teal-600">{bike.totalKm} km</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">🔄 Sessões:</span>
                        <span className="font-semibold">{bike.sessions}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">⚡ Modo:</span>
                        <span className="font-semibold capitalize">{bike.lastMode}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">🔋 Bateria:</span>
                        <span className={`font-semibold ${
                          bike.battery > 80 ? 'text-green-600' : 
                          bike.battery > 50 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {bike.battery.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="text-xs text-gray-500">
                        ID: {bike.id}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Sessions */}
          {isAuth(userPermissions, UserCategory.AMECICLISTAS) && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">📈 Sessões Recentes</h3>
              <div className="space-y-4">
                {[
                  {
                    bikeId: "teste2",
                    bikeName: "Bicicleta Teste 2",
                    sessionId: "20251103_134416_339",
                    date: "03/11/2025",
                    duration: "13h 6m",
                    mode: "econômico",
                    distance: "2.6 km",
                    scans: 9,
                    batteryStart: 79.4,
                    batteryEnd: 81.5
                  },
                  {
                    bikeId: "teste3",
                    bikeName: "Bicicleta Teste 3", 
                    sessionId: "20251102_155736_626",
                    date: "02/11/2025",
                    duration: "1h 55m",
                    mode: "intensivo",
                    distance: "3.8 km",
                    scans: 7,
                    batteryStart: 94.5,
                    batteryEnd: 94.7
                  },
                  {
                    bikeId: "teste4",
                    bikeName: "Bicicleta Teste 4",
                    sessionId: "20251102_160519_129", 
                    date: "02/11/2025",
                    duration: "20m",
                    mode: "mega econômico",
                    distance: "0.4 km",
                    scans: 3,
                    batteryStart: 84.7,
                    batteryEnd: 85.3
                  }
                ].map((session) => (
                  <div key={session.sessionId} className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-800">{session.bikeName}</h4>
                        <p className="text-sm text-gray-600">{session.date} • {session.duration}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          session.mode === 'intensivo' ? 'bg-red-100 text-red-800' :
                          session.mode === 'econômico' ? 'bg-green-100 text-green-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {session.mode}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-gray-600">📍 Distância</div>
                        <div className="font-semibold text-teal-600">{session.distance}</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-gray-600">📶 Scans</div>
                        <div className="font-semibold">{session.scans}</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-gray-600">🔋 Início</div>
                        <div className="font-semibold text-green-600">{session.batteryStart}%</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-gray-600">🔋 Final</div>
                        <div className="font-semibold text-blue-600">{session.batteryEnd}%</div>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <div className="text-xs text-gray-500">
                        Session ID: {session.sessionId}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Results Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                🚴 Bicicletas ({bicicletasFiltradas.length})
              </h3>
              <div className="text-sm text-gray-600">
                {bicicletasFiltradas.filter(b => b.disponivel).length} disponíveis • {bicicletasFiltradas.filter(b => !b.disponivel).length} emprestadas
              </div>
            </div>
            
            <PaginacaoBicicletas 
              bicicletas={bicicletasFiltradas}
              onSolicitar={() => {}}
              userCanRequest={!!user && (process.env.NODE_ENV === "development" || isAuth(userPermissions, UserCategory.AMECICLISTAS))}
              userId={user?.id}
            />
          </div>
        </>
      ) : (
        <BotaPraRodarGestao 
          emprestimos={emprestimos.filter((emp: EmprestimoBicicleta) => emp.status === 'emprestado')}
          solicitacoes={solicitacoes}
          bicicletas={bicicletasComDisponibilidade}
          users={users}
        />
      )}
    </div>
  );
}