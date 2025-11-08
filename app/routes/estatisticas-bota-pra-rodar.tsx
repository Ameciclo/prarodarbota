import { useState, useEffect } from "react";
import { useLoaderData, Link } from "@remix-run/react";
import { UserCategory, type UserData } from "~/utils/types";
import { getTelegramUsersInfo } from "~/utils/users";
import telegramInit from "~/utils/telegramInit";
import { isAuth } from "~/utils/isAuthorized";
import { botaPraRodarLoader } from "~/handlers/loaders/bota-pra-rodar";

export const loader = botaPraRodarLoader;

export default function EstatisticasBotaPraRodar() {
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
      setUserPermissions([UserCategory.AMECICLISTAS]);
    }
  }, [user, users]);

  // Check permissions
  if (!isAuth(userPermissions, UserCategory.AMECICLISTAS) && process.env.NODE_ENV !== "development") {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-600 mb-4">🚫 Acesso Negado</h1>
          <p className="text-gray-600 mb-6">Você não tem permissão para ver as estatísticas.</p>
          <Link to="/" className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors">
            Voltar ao Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Calcular estatísticas
  const totalBicicletas = bicicletas.length;
  const bicicletasDisponiveis = bicicletas.filter((b: any) => b.disponivel).length;
  const bicicletasEmprestadas = bicicletas.filter((b: any) => !b.disponivel).length;
  
  const totalEmprestimos = emprestimos.length;
  const emprestimosAtivos = emprestimos.filter((e: any) => e.status === "emprestado").length;
  const emprestimosFinalizados = emprestimos.filter((e: any) => e.status === "devolvido").length;
  
  const totalSolicitacoes = solicitacoes.length;
  const solicitacoesPendentes = solicitacoes.filter((s: any) => s.status === "pendente").length;
  const solicitacoesAprovadas = solicitacoes.filter((s: any) => s.status === "aprovada").length;
  const solicitacoesRejeitadas = solicitacoes.filter((s: any) => s.status === "rejeitada").length;

  // Estatísticas por tipo de bicicleta
  const tiposBicicletas = bicicletas.reduce((acc: any, bicicleta: any) => {
    const tipo = bicicleta.tipo || "Não informado";
    acc[tipo] = (acc[tipo] || 0) + 1;
    return acc;
  }, {});

  // Usuários mais ativos
  const usuariosAtivos = emprestimos.reduce((acc: any, emprestimo: any) => {
    const userId = emprestimo.usuario_id;
    acc[userId] = (acc[userId] || 0) + 1;
    return acc;
  }, {});

  const topUsuarios = Object.entries(usuariosAtivos)
    .sort(([,a]: any, [,b]: any) => b - a)
    .slice(0, 5)
    .map(([userId, count]: any) => ({
      userId,
      count,
      name: users[userId]?.name || `Usuário ${userId}`
    }));

  // Empréstimos por mês (últimos 6 meses)
  const emprestimosRecentes = emprestimos.filter((e: any) => {
    const dataEmprestimo = new Date(e.data_saida);
    const seisMesesAtras = new Date();
    seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6);
    return dataEmprestimo >= seisMesesAtras;
  });

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-purple-600 mb-2">
          📊 Estatísticas Bota pra Rodar
        </h1>
        <p className="text-gray-600">Relatórios e métricas do sistema</p>
      </div>

      {/* Navigation */}
      <div className="mb-6">
        <Link 
          to="/" 
          className="text-purple-600 hover:text-purple-800 font-medium transition-colors"
        >
          ← Voltar ao Dashboard
        </Link>
      </div>

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
          <div className="text-center">
            <div className="text-3xl mb-2">🚴</div>
            <div className="text-2xl font-bold">{totalBicicletas}</div>
            <div className="text-sm opacity-90">Total de Bicicletas</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
          <div className="text-center">
            <div className="text-3xl mb-2">✅</div>
            <div className="text-2xl font-bold">{bicicletasDisponiveis}</div>
            <div className="text-sm opacity-90">Disponíveis</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-lg shadow-lg">
          <div className="text-center">
            <div className="text-3xl mb-2">🔒</div>
            <div className="text-2xl font-bold">{bicicletasEmprestadas}</div>
            <div className="text-sm opacity-90">Emprestadas</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
          <div className="text-center">
            <div className="text-3xl mb-2">📈</div>
            <div className="text-2xl font-bold">{totalEmprestimos}</div>
            <div className="text-sm opacity-90">Total Empréstimos</div>
          </div>
        </div>
      </div>

      {/* Estatísticas de Empréstimos */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">📋 Status dos Empréstimos</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="text-2xl text-yellow-600 mb-2">⏳</div>
            <div className="text-xl font-bold text-yellow-800">{emprestimosAtivos}</div>
            <div className="text-sm text-yellow-600">Ativos</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-2xl text-green-600 mb-2">✅</div>
            <div className="text-xl font-bold text-green-800">{emprestimosFinalizados}</div>
            <div className="text-sm text-green-600">Finalizados</div>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-2xl text-blue-600 mb-2">📊</div>
            <div className="text-xl font-bold text-blue-800">
              {emprestimosFinalizados > 0 ? Math.round((emprestimosFinalizados / totalEmprestimos) * 100) : 0}%
            </div>
            <div className="text-sm text-blue-600">Taxa de Devolução</div>
          </div>
        </div>
      </div>

      {/* Estatísticas de Solicitações */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">📝 Status das Solicitações</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-2xl text-gray-600 mb-2">📋</div>
            <div className="text-xl font-bold text-gray-800">{totalSolicitacoes}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          
          <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="text-2xl text-yellow-600 mb-2">⏳</div>
            <div className="text-xl font-bold text-yellow-800">{solicitacoesPendentes}</div>
            <div className="text-sm text-yellow-600">Pendentes</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-2xl text-green-600 mb-2">✅</div>
            <div className="text-xl font-bold text-green-800">{solicitacoesAprovadas}</div>
            <div className="text-sm text-green-600">Aprovadas</div>
          </div>
          
          <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="text-2xl text-red-600 mb-2">❌</div>
            <div className="text-xl font-bold text-red-800">{solicitacoesRejeitadas}</div>
            <div className="text-sm text-red-600">Rejeitadas</div>
          </div>
        </div>
      </div>

      {/* Tipos de Bicicletas */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">🚲 Distribuição por Tipo</h3>
        <div className="space-y-3">
          {Object.entries(tiposBicicletas).map(([tipo, quantidade]: any) => (
            <div key={tipo} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-800 capitalize">{tipo}</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${(quantidade / totalBicicletas) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-bold text-gray-600 w-8">{quantidade}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Usuários */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">🏆 Usuários Mais Ativos</h3>
        {topUsuarios.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📭</div>
            <p className="text-gray-600">Nenhum empréstimo registrado ainda</p>
          </div>
        ) : (
          <div className="space-y-3">
            {topUsuarios.map((usuario: any, index: number) => (
              <div key={usuario.userId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '👤'}
                  </span>
                  <div>
                    <p className="font-semibold text-gray-800">{usuario.name}</p>
                    <p className="text-sm text-gray-600">ID: {usuario.userId}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-purple-600">{usuario.count}</p>
                  <p className="text-xs text-gray-500">empréstimos</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resumo Temporal */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">📅 Atividade Recente</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-2xl text-blue-600 mb-2">📈</div>
            <div className="text-xl font-bold text-blue-800">{emprestimosRecentes.length}</div>
            <div className="text-sm text-blue-600">Empréstimos (últimos 6 meses)</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-2xl text-green-600 mb-2">⚡</div>
            <div className="text-xl font-bold text-green-800">
              {emprestimosRecentes.length > 0 ? Math.round(emprestimosRecentes.length / 6) : 0}
            </div>
            <div className="text-sm text-green-600">Média por mês</div>
          </div>
        </div>
      </div>
    </div>
  );
}