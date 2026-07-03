import app from "../backend/app.js";
import { connectDB } from "../backend/db/connect.js";

export default async function handler(req, res) {
  await connectDB();
  return app(req, res);
}
