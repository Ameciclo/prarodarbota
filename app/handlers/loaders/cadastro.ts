import { json } from "@remix-run/node";

export async function cadastroLoader() {
  // Loader simples para a página de cadastro
  // Pode ser expandido para verificar se o usuário já está cadastrado
  return json({
    success: true
  });
}