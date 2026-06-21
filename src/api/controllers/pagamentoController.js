import { pool } from "../database/db.js";
import { criarPix } from "../services/mercadoPagoService.js";

export async function gerarPix(
req,
res
) {

try {

const { pedidoId } =
  req.body;

const pedidoResult =
  await pool.query(
    `
    SELECT
      p.*,
      u.nome,
      u.email
    FROM pedidos p
    JOIN usuarios u
      ON u.id = p.usuario_id
    WHERE p.id = $1
    `,
    [pedidoId]
  );

if (
  !pedidoResult.rows.length
) {

  return res.status(404).json({
    erro:
      "Pedido não encontrado"
  });

}

const pedido =
  pedidoResult.rows[0];

const pix =
  await criarPix(pedido);

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
  `,
  [
    pedido.id,
    pix.id,
    "PIX",
    pix.status,
    pedido.total
  ]
);

await pool.query(
  `
  UPDATE pedidos
  SET status =
  'AGUARDANDO_PAGAMENTO'
  WHERE id = $1
  `,
  [pedido.id]
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
    pedido.id,
    "AGUARDANDO_PAGAMENTO",
    "PIX gerado"
  ]
);

res.json(pix);

} catch (error) {

console.error(error);

res.status(500).json({
  erro:
    "Erro ao gerar PIX"
});

}

}

export async function listarPagamentos(
req,
res
) {

try {

const result =
  await pool.query(
    `
    SELECT *
    FROM pagamentos
    ORDER BY id DESC
    `
  );

res.json(
  result.rows
);

} catch (error) {

console.error(error);

res.status(500).json({
  erro:
    "Erro ao listar pagamentos"
});

}

}
