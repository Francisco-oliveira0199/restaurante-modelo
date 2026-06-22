import { pool } from "../database/db.js";

const STATUS_VALIDOS = [
  "PENDENTE",
  "AGUARDANDO_PAGAMENTO",
  "PAGO",
  "EM_PREPARO",
  "SAIU_PARA_ENTREGA",
  "ENTREGUE",
  "CANCELADO"
];

// Valida payload de entrada para criar pedido
function validarPayloadPedido(body) {
  const { cliente_nome, telefone, pagamento, total, itens } = body;

  const errors = [];

  if (!cliente_nome || typeof cliente_nome !== "string" || cliente_nome.trim().length === 0) {
    errors.push("cliente_nome é obrigatório e deve ser uma string não-vazia");
  }

  if (!telefone || typeof telefone !== "string" || telefone.trim().length === 0) {
    errors.push("telefone é obrigatório e deve ser uma string não-vazia");
  }

  if (!pagamento || typeof pagamento !== "string" || !["dinheiro", "pix", "cartao"].includes(pagamento.toLowerCase())) {
    errors.push("pagamento deve ser 'dinheiro', 'pix' ou 'cartao'");
  }

  if (!Number.isFinite(Number(total)) || Number(total) <= 0) {
    errors.push("total deve ser um número positivo");
  }

  if (!Array.isArray(itens) || itens.length === 0) {
    errors.push("itens deve ser um array não-vazio");
  } else {
    itens.forEach((item, idx) => {
      if (!item.produto_nome || typeof item.produto_nome !== "string") {
        errors.push(`itens[${idx}].produto_nome é obrigatório e deve ser string`);
      }
      if (!Number.isFinite(Number(item.quantidade)) || Number(item.quantidade) <= 0) {
        errors.push(`itens[${idx}].quantidade deve ser um número positivo`);
      }
      if (!Number.isFinite(Number(item.preco_unitario)) || Number(item.preco_unitario) < 0) {
        errors.push(`itens[${idx}].preco_unitario deve ser um número não-negativo`);
      }
      if (!Number.isFinite(Number(item.subtotal)) || Number(item.subtotal) < 0) {
        errors.push(`itens[${idx}].subtotal deve ser um número não-negativo`);
      }
    });
  }

  return errors;
}

export async function criarPedido(req, res) {

  const {
    endereco_id,
    cliente_nome,
    telefone,
    pagamento,
    total,
    itens,
    troco_para
  } = req.body;

  // Validar payload
  const validationErrors = validarPayloadPedido(req.body);
  if (validationErrors.length > 0) {
    return res.status(400).json({
      erro: "Payload inválido",
      detalhes: validationErrors
    });
  }

  let client;

  try {

    client = await pool.connect();

    await client.query("BEGIN");

    let statusInicial = "PENDENTE";

    if (
      pagamento === "pix" ||
      pagamento === "cartao"
    ) {
      statusInicial = "AGUARDANDO_PAGAMENTO";
    }

    const pedidoResult = await client.query(
      `
      INSERT INTO pedidos
      (
        usuario_id,
        endereco_id,
        cliente_nome,
        telefone,
        pagamento,
        total,
        status,
        troco_para
      )
      VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *
      `,
      [
        req.usuario.id,
        endereco_id || null,
        cliente_nome,
        telefone,
        pagamento,
        total,
        statusInicial,
        troco_para || null
      ]
    );

    const pedido = pedidoResult.rows[0];

    if (itens?.length) {

      for (const item of itens) {

        await client.query(
          `
          INSERT INTO pedido_itens
          (
            pedido_id,
            produto_nome,
            quantidade,
            preco_unitario,
            subtotal,
            observacoes
          )
          VALUES
          ($1,$2,$3,$4,$5,$6)
          `,
          [
            pedido.id,
            item.produto_nome,
            item.quantidade,
            item.preco_unitario,
            item.subtotal,
            item.observacoes || null
          ]
        );

      }

    }

    await client.query("COMMIT");

    res.status(201).json(pedido);

  } catch (error) {

    if (client) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackErr) {
        console.error("Erro ao fazer ROLLBACK:", rollbackErr);
      }
    }

    console.error("Erro ao criar pedido:", error);

    res.status(500).json({
      erro: "Erro ao criar pedido"
    });

  } finally {

    if (client) {
      try {
        client.release();
      } catch (releaseErr) {
        console.error("Erro ao liberar conexão do pool:", releaseErr);
      }
    }

  }

}

export async function listarPedidos(req, res) {

  try {

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const result = await pool.query(`
      SELECT *
      FROM pedidos
      ORDER BY criado_em DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    const countResult = await pool.query(`
      SELECT COUNT(*) as total
      FROM pedidos
    `);

    res.json({
      pedidos: result.rows,
      total: Number(countResult.rows[0].total),
      page,
      limit
    });

  } catch (error) {

    console.error("Erro ao listar pedidos:", error);

    res.status(500).json({
      erro: "Erro ao listar pedidos"
    });

  }

}

export async function buscarPedido(req, res) {

  try {

    const { id } = req.params;

    if (!id || Number.isNaN(Number(id))) {
      return res.status(400).json({
        erro: "ID de pedido inválido"
      });
    }

    const pedidoResult = await pool.query(
      `
      SELECT *
      FROM pedidos
      WHERE id = $1
      `,
      [id]
    );

    if (!pedidoResult.rows.length) {

      return res.status(404).json({
        erro: "Pedido não encontrado"
      });

    }

    const pedido = pedidoResult.rows[0];

    // Padronizar comparação de tipo: sempre maiúscula
    const userType = String(req.usuario.tipo || "").toUpperCase();

    if (
      userType !== "ADMIN" &&
      pedido.usuario_id !== req.usuario.id
    ) {

      return res.status(403).json({
        erro: "Acesso negado"
      });

    }

    const itens = await pool.query(
      `
      SELECT *
      FROM pedido_itens
      WHERE pedido_id = $1
      `,
      [id]
    );

    res.json({
      ...pedido,
      itens: itens.rows
    });

  } catch (error) {

    console.error("Erro ao buscar pedido:", error);

    res.status(500).json({
      erro: "Erro ao buscar pedido"
    });

  }

}

export async function atualizarStatus(req, res) {

  try {

    const { id } = req.params;

    const { status } = req.body;

    if (!id || Number.isNaN(Number(id))) {
      return res.status(400).json({
        erro: "ID de pedido inválido"
      });
    }

    if (!status || typeof status !== "string") {
      return res.status(400).json({
        erro: "Status é obrigatório e deve ser uma string"
      });
    }

    if (!STATUS_VALIDOS.includes(status)) {

      return res.status(400).json({
        erro: `Status inválido. Valores aceitos: ${STATUS_VALIDOS.join(", ")}`
      });

    }

    const result = await pool.query(
      `
      UPDATE pedidos
      SET status = $1
      WHERE id = $2
      RETURNING *
      `,
      [
        status,
        id
      ]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        erro: "Pedido não encontrado"
      });
    }

    res.json(result.rows[0]);

  } catch (error) {

    console.error("Erro ao atualizar status:", error);

    res.status(500).json({
      erro: "Erro ao atualizar status"
    });

  }

}