import admin from "firebase-admin";
import { readFileSync } from "fs";
import { join } from "path";

if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(
      readFileSync(join(process.cwd(), "botaprarodar-routes-firebase-adminsdk-fbsvc-8f59076dd1.json"), "utf8")
    );
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: "https://botaprarodar-routes-default-rtdb.firebaseio.com/"
    });
  } catch (error) {
    console.error("Erro ao inicializar Firebase:", error);
    throw error;
  }
}

const db = admin.database();
export default db;