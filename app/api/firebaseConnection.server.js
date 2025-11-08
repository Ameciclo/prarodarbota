import db from "./firebaseAdmin.server.js";

// Usuários
export async function createFullUser(user) {
  try {
    const userRef = db.ref(`subscribers/${user.id}`);
    await userRef.set({
      ...user,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    throw error;
  }
}

export async function updateFullUser(user, newRole) {
  try {
    const userRef = db.ref(`subscribers/${user.id}`);
    await userRef.update({
      role: newRole,
      updated_at: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    throw error;
  }
}

export async function getUsersFirebase() {
  try {
    const snapshot = await db.ref("subscribers").once("value");
    return snapshot.val() || {};
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return {};
  }
}

export async function getUserById(userId) {
  try {
    const snapshot = await db.ref(`subscribers/${userId}`).once("value");
    return snapshot.val();
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    return null;
  }
}

// Bicicletas
export async function createBicicleta(bicicletaData) {
  try {
    const bicicletaRef = db.ref(`bicicletas/${bicicletaData.codigo}`);
    await bicicletaRef.set({
      ...bicicletaData,
      disponivel: true,
      emprestada: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error("Erro ao criar bicicleta:", error);
    throw error;
  }
}

export async function getBicicletas() {
  try {
    const snapshot = await db.ref("bicicletas").once("value");
    const data = snapshot.val() || {};
    return Object.keys(data).map(codigo => ({
      codigo,
      ...data[codigo]
    }));
  } catch (error) {
    console.error("Erro ao buscar bicicletas:", error);
    return [];
  }
}

export async function updateBicicletaStatus(codigo, disponivel, emprestada = false) {
  try {
    const bicicletaRef = db.ref(`bicicletas/${codigo}`);
    await bicicletaRef.update({
      disponivel,
      emprestada,
      updated_at: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error("Erro ao atualizar status da bicicleta:", error);
    throw error;
  }
}

// Empréstimos
export async function criarEmprestimo(userId, codigoBicicleta) {
  try {
    const emprestimoId = `${Date.now()}_${userId}_${codigoBicicleta}`;
    const emprestimoRef = db.ref(`emprestimos/${emprestimoId}`);
    
    await emprestimoRef.set({
      id: emprestimoId,
      usuario_id: userId,
      codigo_bicicleta: codigoBicicleta,
      data_saida: new Date().toISOString(),
      status: "emprestado",
      created_at: new Date().toISOString()
    });

    // Atualizar status da bicicleta
    await updateBicicletaStatus(codigoBicicleta, false, true);
    
    return emprestimoId;
  } catch (error) {
    console.error("Erro ao criar empréstimo:", error);
    throw error;
  }
}

export async function finalizarEmprestimo(emprestimoId) {
  try {
    const emprestimoRef = db.ref(`emprestimos/${emprestimoId}`);
    const snapshot = await emprestimoRef.once("value");
    const emprestimo = snapshot.val();
    
    if (!emprestimo) {
      throw new Error("Empréstimo não encontrado");
    }

    await emprestimoRef.update({
      data_devolucao: new Date().toISOString(),
      status: "devolvido",
      updated_at: new Date().toISOString()
    });

    // Liberar bicicleta
    await updateBicicletaStatus(emprestimo.codigo_bicicleta, true, false);
    
    return true;
  } catch (error) {
    console.error("Erro ao finalizar empréstimo:", error);
    throw error;
  }
}

export async function getEmprestimos() {
  try {
    const snapshot = await db.ref("emprestimos").once("value");
    const data = snapshot.val() || {};
    return Object.values(data);
  } catch (error) {
    console.error("Erro ao buscar empréstimos:", error);
    return [];
  }
}

export async function getEmprestimosByUser(userId) {
  try {
    const snapshot = await db.ref("emprestimos").orderByChild("usuario_id").equalTo(userId).once("value");
    const data = snapshot.val() || {};
    return Object.values(data);
  } catch (error) {
    console.error("Erro ao buscar empréstimos do usuário:", error);
    return [];
  }
}

// Solicitações
export async function solicitarEmprestimoBicicleta(userId, codigoBicicleta) {
  try {
    const solicitacaoId = `${Date.now()}_${userId}_${codigoBicicleta}`;
    const solicitacaoRef = db.ref(`solicitacoes/${solicitacaoId}`);
    
    await solicitacaoRef.set({
      id: solicitacaoId,
      usuario_id: userId,
      codigo_bicicleta: codigoBicicleta,
      data_solicitacao: new Date().toISOString(),
      status: "pendente",
      created_at: new Date().toISOString()
    });
    
    return solicitacaoId;
  } catch (error) {
    console.error("Erro ao criar solicitação:", error);
    throw error;
  }
}

export async function aprovarSolicitacaoBicicleta(solicitacaoId, userId, codigoBicicleta, autoApprove = false) {
  try {
    if (autoApprove) {
      // Criar empréstimo direto para coordenadores
      return await criarEmprestimo(userId, codigoBicicleta);
    }

    const solicitacaoRef = db.ref(`solicitacoes/${solicitacaoId}`);
    await solicitacaoRef.update({
      status: "aprovada",
      data_aprovacao: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    // Criar empréstimo
    const emprestimoId = await criarEmprestimo(userId, codigoBicicleta);
    
    return emprestimoId;
  } catch (error) {
    console.error("Erro ao aprovar solicitação:", error);
    throw error;
  }
}

export async function rejeitarSolicitacaoBicicleta(solicitacaoId, motivo = "") {
  try {
    const solicitacaoRef = db.ref(`solicitacoes/${solicitacaoId}`);
    await solicitacaoRef.update({
      status: "rejeitada",
      motivo_rejeicao: motivo,
      data_rejeicao: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    
    return true;
  } catch (error) {
    console.error("Erro ao rejeitar solicitação:", error);
    throw error;
  }
}

export async function getSolicitacoes() {
  try {
    const snapshot = await db.ref("solicitacoes").once("value");
    const data = snapshot.val() || {};
    return Object.values(data);
  } catch (error) {
    console.error("Erro ao buscar solicitações:", error);
    return [];
  }
}

export async function getSolicitacoesPendentes() {
  try {
    const snapshot = await db.ref("solicitacoes").orderByChild("status").equalTo("pendente").once("value");
    const data = snapshot.val() || {};
    return Object.values(data);
  } catch (error) {
    console.error("Erro ao buscar solicitações pendentes:", error);
    return [];
  }
}

// Cadastro de usuário com dados pessoais
export async function cadastrarUsuarioCompleto(userData) {
  try {
    const userRef = db.ref(`subscribers/${userData.userId}`);
    await userRef.set({
      id: userData.userId,
      name: `${userData.firstName} ${userData.lastName}`,
      role: "ANY_USER",
      telegram_user: {
        id: userData.userId,
        first_name: userData.firstName,
        last_name: userData.lastName
      },
      ameciclo_register: {
        email: userData.email,
        cpf: userData.cpf,
        telefone: userData.telefone,
        endereco: userData.endereco,
        bairro: userData.bairro,
        cidade: userData.cidade,
        cep: userData.cep,
        created_at: new Date().toISOString(),
        status: "ativo"
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    
    return true;
  } catch (error) {
    console.error("Erro ao cadastrar usuário completo:", error);
    throw error;
  }
}