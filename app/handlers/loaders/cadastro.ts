import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { getUsersFirebase } from "~/api/firebaseConnection.server";

export async function cadastroLoader({ request }: LoaderFunctionArgs) {
  try {
    const users = await getUsersFirebase();
    
    return json({
      users: users || {}
    });
  } catch (error) {
    console.error("Erro ao carregar dados:", error);
    return json({
      users: {}
    });
  }
}