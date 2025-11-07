import { useState } from "react";
import { Link } from "@remix-run/react";
import type { Bicicleta } from "~/utils/types";

interface PaginacaoBicicletasProps {
  bicicletas: Bicicleta[];
  onSolicitar: (codigo: string) => void;
  userCanRequest: boolean;
  userId?: number;
  userCanManage?: boolean;
}

export function PaginacaoBicicletas({ bicicletas, onSolicitar, userCanRequest, userId, userCanManage }: PaginacaoBicicletasProps) {
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 12;
  
  const totalPaginas = Math.ceil(bicicletas.length / itensPorPagina);
  const indiceInicial = (paginaAtual - 1) * itensPorPagina;
  const bicicletasPagina = bicicletas.slice(indiceInicial, indiceInicial + itensPorPagina);

  const handleSolicitar = (codigo: string) => {
    if (!userId) {
      alert("Você precisa estar logado para solicitar uma bicicleta");
      return;
    }
    onSolicitar(codigo);
  };

  return (
    <div>
      <div className="mb-4 text-sm text-gray-600">
        Mostrando {bicicletasPagina.length} de {bicicletas.length} bicicletas
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {bicicletasPagina.map((bicicleta) => (
          <div key={bicicleta.codigo} className="bg-white rounded-lg shadow-md p-6 border">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-800 mb-2">{bicicleta.nome}</h3>
              <p className="text-gray-600 mb-1">
                <strong>Código:</strong> {bicicleta.codigo}
              </p>
              <p className="text-gray-600 mb-1">
                <strong>Tipo:</strong> {bicicleta.tipo}
              </p>

              {bicicleta.descricao && (
                <p className="text-gray-600 text-sm mt-2">{bicicleta.descricao}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              {bicicleta.disponivel ? (
                <div>
                  <div className="flex items-center mb-2">
                    <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                    <span className="text-green-600 font-semibold">Disponível</span>
                  </div>
                  {userCanRequest ? (
                    <Link
                      to={`/solicitar-emprestimo-bicicleta?codigo=${bicicleta.codigo}`}
                      className="w-full bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition-colors block text-center no-underline mb-2"
                    >
                      Solicitar Empréstimo
                    </Link>
                  ) : (
                    <div className="text-center mb-2">
                      <p className="text-sm text-gray-600 mb-2">
                        Para solicitar empréstimo, você precisa estar cadastrado
                      </p>
                      <Link
                        to="/registrar-usuario-biblioteca"
                        className="inline-block bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors text-sm"
                      >
                        Fazer Cadastro
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div className="flex items-center mb-2">
                    <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                    <span className="text-red-600 font-semibold">Emprestada</span>
                  </div>
                  <button
                    disabled
                    className="w-full bg-gray-300 text-gray-500 px-4 py-2 rounded-md cursor-not-allowed mb-2"
                  >
                    Indisponível
                  </button>
                </div>
              )}
              
              {userCanManage && (
                <Link
                  to={`/configurar-bicicleta/${bicicleta.codigo}`}
                  className="w-full bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors block text-center no-underline text-sm"
                >
                  ⚙️ Configurar
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {totalPaginas > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <button
            onClick={() => setPaginaAtual(Math.max(1, paginaAtual - 1))}
            disabled={paginaAtual === 1}
            className="px-3 py-2 rounded-md bg-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
          >
            Anterior
          </button>
          
          {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((pagina) => (
            <button
              key={pagina}
              onClick={() => setPaginaAtual(pagina)}
              className={`px-3 py-2 rounded-md ${
                pagina === paginaAtual
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {pagina}
            </button>
          ))}
          
          <button
            onClick={() => setPaginaAtual(Math.min(totalPaginas, paginaAtual + 1))}
            disabled={paginaAtual === totalPaginas}
            className="px-3 py-2 rounded-md bg-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
}