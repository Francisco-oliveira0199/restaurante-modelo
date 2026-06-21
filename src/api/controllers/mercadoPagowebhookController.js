import { pool } from "../database/db.js";

export async function receberWebhook(
req,
res
) {

try {

const body = req.body;

console.log(
  "Webhook Mercado Pago:",
  body
);

if (
  body.type !== "payment"
) {

  return res.sendStatus(200);

}

const paymentId =
  body.data.id;

const pagamentoResult =
  await pool.query(
    `
    SELECT *
    FROM pagamentos
    WHERE mp_payment_id = $1
    `,
    [paymentId]
  );

if (
  !pagamentoResult.rows.length
) {

  return res.sendStatus(200);

}

const pagamento =
  pagamentoResult.rows[0];

await pool.query(
  `
  UPDATE pagamentos
  SET status = 'approved'
  WHERE mp_payment_id = $1
  `,
  [paymentId]
);

await pool.query(
  `
  UPDATE pedidos
  SET status = 'PAGO'
  WHERE id = $1
  `,
  [pagamento.pedido_id]
);

await pool.query(
  `
  INSERT INTO pedido_historico
  (
    pedido_id,
    status,
    observacao
  )
  VALUES
  ($1,$2,$3)
  `,
  [
    pagamento.pedido_id,
    "PAGO",
    "Pagamento aprovado pelo Mercado Pago"
  ]
);

return res.sendStatus(200);

} catch (error) {

console.error(error);

return res.sendStatus(500);

}

}
