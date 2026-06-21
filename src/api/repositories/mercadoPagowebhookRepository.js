import { pool } from "../database/db.js";

export async function buscarPagamentoMercadoPago(
  mpPaymentId
) {

  const result =
    await pool.query(
      `
      SELECT *
      FROM pagamentos
      WHERE mp_payment_id = $1
      `,
      [mpPaymentId]
    );

  return result.rows[0];

}

export async function atualizarPagamentoMercadoPago(
  mpPaymentId,
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
      [
        status,
        mpPaymentId
      ]
    );

  return result.rows[0];

}

export async function buscarPedidoDoPagamento(
  mpPaymentId
) {

  const result =
    await pool.query(
      `
      SELECT
        p.*
      FROM pedidos p

      INNER JOIN pagamentos pg
      ON pg.pedido_id = p.id

      WHERE pg.mp_payment_id = $1
      `,
      [mpPaymentId]
    );

  return result.rows[0];

}

export async function atualizarStatusPedido(
  pedidoId,
  status
) {

  const result =
    await pool.query(
      `
      UPDATE pedidos
      SET status = $1
      WHERE id = $2
      RETURNING *
      `,
      [
        status,
        pedidoId
      ]
    );

  return result.rows[0];

}

export async function registrarEventoWebhook(
  dados
) {

  const result =
    await pool.query(
      `
      INSERT INTO webhook_logs
      (
        evento,
        payload
      )
      VALUES
      ($1,$2)
      RETURNING *
      `,
      [
        dados.evento,
        JSON.stringify(
          dados.payload
        )
      ]
    );

  return result.rows[0];

}