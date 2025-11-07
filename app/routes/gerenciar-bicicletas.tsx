import { useState, useEffect } from "react";
import { useLoaderData, Link } from "@remix-run/react";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { UserCategory, UserData, type Bicicleta } from "~/utils/types";
import { getTelegramUsersInfo } from "~/utils/users";
import telegramInit from "~/utils/telegramInit";
import { isAuth } from "~/utils/isAuthorized";

export async function loader({ request }: LoaderFunctionArgs) {
  if (process.env.NODE_ENV === "development") {
    // Mock data para desenvolvimento
    const bicicletas: Bicicleta[] = [
      {
        codigo: "BPR001",
        nome: "Bicicleta Verde",
        tipo: "urbana",
        disponivel: true,
        descricao: "Bicicleta urbana verde para uso geral"
      },
      {
        codigo: "BPR002", 
        nome: "Mountain Bike Azul",
        tipo: "mountain",
        disponivel: false,
        descricao: "Mountain bike para trilhas"
      },
      {
        codigo: "BPR003",
        nome: "Speed Vermelha",
        tipo: "speed", 
        disponivel: true,
        descricao: "Bicicleta speed para alta velocidade"
      },
      {
        codigo: "BPR004",
        nome: "Híbrida Preta",
        tipo: "hibrida",
        disponivel: true,
        descricao: "Bicicleta híbrida versátil"
      }
    ];
    
    return json({ bicicletas });
  }
  
  // TODO: Implementar busca real das bicicletas no Firebase
  return json({ bicicletas: [] });
}

export default function GerenciarBicicletas() {
  const { bicicletas } = useLoaderData<typeof loader>();
  const [user, setUser] = useState<UserData | null>(null);
  const [userPermissions, setUserPermissions] = useState<string[]>([UserCategory.ANY_USER]);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todas");

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

  // Check permissions
  if (!isAuth(userPermissions, UserCategory.PROJECT_COORDINATORS) && process.env.NODE_ENV !== "development") {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-600 mb-4">🚫 Acesso Negado</h1>
          <p className="text-gray-600 mb-6">Você não tem permissão para gerenciar bicicletas.</p>
          <Link to="/bota-pra-rodar" className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors">
            Voltar às Bicicletas
          </Link>
        </div>
      </div>
    );
  }

  // Filtrar bicicletas
  const bicicletasFiltradas = bicicletas.filter((bicicleta) => {
    const matchBusca = bicicleta.nome.toLowerCase().includes(busca.toLowerCase()) ||
                      bicicleta.codigo.toLowerCase().includes(busca.toLowerCase());
    
    const matchStatus = filtroStatus === "todas" ||
                       (filtroStatus === "disponiveis" && bicicleta.disponivel) ||
                       (filtroStatus === "emprestadas" && !bicicleta.disponivel);
    
    return matchBusca && matchStatus;
  });

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Navigation */}
      <div className="mb-6">
        <Link to="/gestao" className="text-teal-600 hover:text-teal-800 font-medium transition-colors">
          ← Voltar à Gestão
        </Link>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-teal-600 mb-2">
          ⚙️ Gerenciar Bicicletas
        </h1>
        <p className="text-gray-600">Configuração individual de cada bicicleta</p>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800">🔍 Buscar e Filtrar</h3>
          <Link
            to="/cadastrar-bicicleta"
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
          >
            ➕ Nova Bicicleta
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Nome ou código da bicicleta..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="todas">🚴 Todas</option>
              <option value="disponiveis">✅ Disponíveis</option>
              <option value="emprestadas">🔒 Emprestadas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg shadow-lg">
          <div className="text-center">
            <div className="text-2xl mb-1">🚴</div>
            <div className="text-lg font-bold">{bicicletas.length}</div>
            <div className="text-sm opacity-90">Total</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg shadow-lg">
          <div className="text-center">
            <div className="text-2xl mb-1">✅</div>
            <div className="text-lg font-bold">{bicicletas.filter(b => b.disponivel).length}</div>
            <div className="text-sm opacity-90">Disponíveis</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-lg shadow-lg">
          <div className="text-center">
            <div className="text-2xl mb-1">🔒</div>
            <div className="text-lg font-bold">{bicicletas.filter(b => !b.disponivel).length}</div>
            <div className="text-sm opacity-90">Emprestadas</div>
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

      {/* Bikes List */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800">
            🚴 Lista de Bicicletas ({bicicletasFiltradas.length})
          </h3>
        </div>

        {bicicletasFiltradas.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Nenhuma bicicleta encontrada</h3>
            <p className="text-gray-500">Tente ajustar os filtros de busca</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bicicletasFiltradas.map((bicicleta) => (
              <div key={bicicleta.codigo} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-bold text-gray-800">{bicicleta.nome}</h4>
                    <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      bicicleta.disponivel 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {bicicleta.disponivel ? '✅ Disponível' : '🔒 Emprestada'}
                    </div>
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><strong>Código:</strong> {bicicleta.codigo}</p>
                    <p><strong>Tipo:</strong> {bicicleta.tipo}</p>
                    {bicicleta.descricao && (
                      <p><strong>Descrição:</strong> {bicicleta.descricao}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Link
                    to={`/configurar-bicicleta/${bicicleta.codigo}`}
                    className="w-full bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors block text-center font-semibold"
                  >
                    ⚙️ Configurar
                  </Link>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to={`/bicicleta/${bicicleta.codigo}/historico`}
                      className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors block text-center text-sm"
                    >
                      📊 Histórico
                    </Link>
                    
                    <Link
                      to={`/bicicleta/${bicicleta.codigo}/manutencao`}
                      className="bg-orange-500 text-white px-3 py-2 rounded-lg hover:bg-orange-600 transition-colors block text-center text-sm"
                    >
                      🔧 Manutenção
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}