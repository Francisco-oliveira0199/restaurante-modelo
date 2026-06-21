import { pool } from "../database/db.js";

export async function criarPagamento(
  pagamento
) {

  const result =
    await pool.query(
      `
      INSERT INTO pagamentos
      (
        pedido_id,
        mp_payment_id,
        metodo,
        status,
        valor
      )
      VALUES
      ($1,$2,$3,$4,$5)
      RETURNING *
      `,
      [
        pagamento.pedido_id,
        pagamento.mp_payment_id,
        pagamento.metodo,
        pagamento.status,
        pagamento.valor
      ]
    );

  return result.rows[0];

}

export async function buscarPagamentoPorMpId(
  mpId
) {

  const result =
    await pool.query(
      `
      SELECT *
      FROM pagamentos
      WHERE mp_payment_id = $1
      `,
      [mpId]
    );

  return result.rows[0];

}

export async function atualizarStatusPagamento(
  mpId,
  status
) {

  const result =
    await pool.query(
      `
      UPDATE pagamentos
      SET status = $1
      WHERE mp_payment_id = $2
      RETURNING *
      `,
      [status, mpId]
    );

  return result.rows[0];

}