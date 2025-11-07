import { json } from "@remix-run/node";

export async function cadastrarBicicletaLoader() {
  return json({
    success: true
  });
}