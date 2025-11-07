import { useLoaderData, Link } from "@remix-run/react";
import { UserCategory, UserData } from "~/utils/types";
import { useEffect, useState } from "react";
import { getTelegramUsersInfo } from "~/utils/users";
import telegramInit from "~/utils/telegramInit";
import { isAuth } from "~/utils/isAuthorized";

import { loader } from "~/handlers/loaders/_index";
export { loader };

// Função para calcular distância aproximada baseada nos dados de sessão
function calculateDistance(session: any) {
  if (!session.scans || session.scans.length < 2) return 0;
  
  // Estimação baseada na duração da sessão e velocidade média de bicicleta (15 km/h)
  const durationMs = session.end - session.start;
  const durationHours = durationMs / (1000 * 60 * 60);
  const avgSpeed = session.mode === 'intensivo' ? 18 : session.mode === 'economico' ? 12 : 8; // km/h
  
  return durationHours * avgSpeed;
}

// Mock data das bicicletas (simulando dados do Firebase)
const mockBikesData = {
  "teste2": {
    sessions: {
      "20251103_134416_339": {
        end: 801150,
        start: 14966,
        mode: "economico",
        totalScans: 9
      }
    }
  },
  "teste3": {
    sessions: {
      "20251102_155736_626": {
        end: 135203,
        start: 19806,
        mode: "intensivo",
        totalScans: 7
      }
    }
  },
  "teste4": {
    sessions: {
      "20251102_160519_129": {
        end: 139413,
        start: 119395,
        mode: "mega_economico",
        totalScans: 3
      }
    }
  }
};

export default function Dashboard() {
  const [user, setUser] = useState<UserData | null>({} as UserData);
  const { usersInfo, currentUserCategories } = useLoaderData<typeof loader>();
  const [userPermissions, setUserPermissions] = useState(currentUserCategories);

  useEffect(() => {
    telegramInit();
    setUser(() => getTelegramUsersInfo());
  }, []);

  useEffect(() => {
    if (user?.id && usersInfo[user.id]) {
      setUserPermissions([usersInfo[user.id].role as UserCategory]);
    }
  }, [user]);

  // Calcular estatísticas das bicicletas
  const bikeStats = Object.entries(mockBikesData).map(([bikeId, data]) => {
    const sessions = Object.values(data.sessions);
    const totalDistance = sessions.reduce((acc, session) => acc + calculateDistance(session), 0);
    const totalSessions = sessions.length;
    
    return {
      id: bikeId,
      totalDistance: Math.round(totalDistance * 100) / 100,
      totalSessions,
      lastSession: sessions[sessions.length - 1]
    };
  });

  const totalKm = bikeStats.reduce((acc, bike) => acc + bike.totalDistance, 0);
  const totalSessions = bikeStats.reduce((acc, bike) => acc + bike.totalSessions, 0);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-teal-600 mb-2">
          🚴♀️ Bota pra Rodar
        </h1>
        <p className="text-gray-600">Dashboard do Sistema</p>
        {process.env.NODE_ENV === "development" && (
          <p className="text-xs text-orange-500 mt-2">
            Ambiente de DESENVOLVIMENTO - Permissões: {userPermissions}
          </p>
        )}
        {process.env.NODE_ENV === "production" && user?.first_name && (
          <p className="text-gray-500 mt-2">Olá, {user.first_name}!</p>
        )}
      </div>

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
          <div className="text-center">
            <div className="text-3xl mb-2">📍</div>
            <h3 className="text-lg font-semibold mb-1">Total Percorrido</h3>
            <p className="text-2xl font-bold">{Math.round(totalKm * 100) / 100} km</p>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
          <div className="text-center">
            <div className="text-3xl mb-2">📊</div>
            <h3 className="text-lg font-semibold mb-1">Sessões Ativas</h3>
            <p className="text-2xl font-bold">{totalSessions}</p>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
          <div className="text-center">
            <div className="text-3xl mb-2">🚴</div>
            <h3 className="text-lg font-semibold mb-1">Bicicletas Ativas</h3>
            <p className="text-2xl font-bold">{bikeStats.length}</p>
          </div>
        </div>
      </div>

      {/* Ranking de Bicicletas por KM */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">🏆 Ranking por Quilometragem</h3>
        <div className="space-y-3">
          {bikeStats
            .sort((a, b) => b.totalDistance - a.totalDistance)
            .map((bike, index) => (
              <div key={bike.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🚴'}
                  </span>
                  <div>
                    <h4 className="font-semibold text-gray-800">Bicicleta {bike.id}</h4>
                    <p className="text-sm text-gray-600">{bike.totalSessions} sessões</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-teal-600">{bike.totalDistance} km</p>
                  <p className="text-xs text-gray-500">Modo: {bike.lastSession?.mode}</p>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Cards de Acesso Rápido */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Link 
          to="/bota-pra-rodar" 
          className="bg-teal-500 hover:bg-teal-600 text-white p-6 rounded-lg shadow-lg transition-colors no-underline"
        >
          <div className="text-center">
            <div className="text-4xl mb-2">🚴♀️</div>
            <h2 className="text-xl font-semibold mb-1">Ver Bicicletas</h2>
            <p className="text-teal-100">Visualizar e solicitar empréstimos</p>
          </div>
        </Link>

        {isAuth(userPermissions, UserCategory.PROJECT_COORDINATORS) && (
          <Link 
            to="/gestao" 
            className="bg-orange-500 hover:bg-orange-600 text-white p-6 rounded-lg shadow-lg transition-colors no-underline"
          >
            <div className="text-center">
              <div className="text-4xl mb-2">🔧</div>
              <h2 className="text-xl font-semibold mb-1">Gestão</h2>
              <p className="text-orange-100">Administrar sistema e bicicletas</p>
            </div>
          </Link>
        )}

        {isAuth(userPermissions, UserCategory.AMECICLISTAS) && (
          <Link 
            to="/estatisticas-bota-pra-rodar" 
            className="bg-blue-500 hover:bg-blue-600 text-white p-6 rounded-lg shadow-lg transition-colors no-underline"
          >
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <h2 className="text-xl font-semibold mb-1">Estatísticas</h2>
              <p className="text-blue-100">Relatórios e métricas detalhadas</p>
            </div>
          </Link>
        )}
      </div>

      {/* Seção de Configurações */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">⚙️ Configurações</h3>
        <div className="space-y-3">
          <Link 
            to="/cadastro" 
            className="block bg-white hover:bg-gray-50 p-4 rounded-lg shadow-sm border transition-colors no-underline"
          >
            <div className="flex items-center">
              <span className="text-2xl mr-3">📝</span>
              <div>
                <h4 className="font-medium text-gray-800">Cadastro de Usuário</h4>
                <p className="text-sm text-gray-600">Cadastrar novo usuário no sistema</p>
              </div>
            </div>
          </Link>
          
          <Link 
            to="/user" 
            className="block bg-white hover:bg-gray-50 p-4 rounded-lg shadow-sm border transition-colors no-underline"
          >
            <div className="flex items-center">
              <span className="text-2xl mr-3">👤</span>
              <div>
                <h4 className="font-medium text-gray-800">Suas Informações</h4>
                <p className="text-sm text-gray-600">Gerenciar perfil e dados pessoais</p>
              </div>
            </div>
          </Link>

          {isAuth(userPermissions, UserCategory.AMECICLO_COORDINATORS) && (
            <Link 
              to="/users" 
              className="block bg-white hover:bg-gray-50 p-4 rounded-lg shadow-sm border transition-colors no-underline"
            >
              <div className="flex items-center">
                <span className="text-2xl mr-3">🔧</span>
                <div>
                  <h4 className="font-medium text-gray-800">Gerenciar Usuários</h4>
                  <p className="text-sm text-gray-600">Administrar permissões e usuários</p>
                </div>
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
