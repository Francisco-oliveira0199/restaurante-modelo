import { pool } from "../database/db.js";

export async function listarPedidos(req, res) {

  const result = await pool.query(`
    SELECT *
    FROM pedidos
    ORDER BY id DESC
  `);

  res.json(result.rows);

}