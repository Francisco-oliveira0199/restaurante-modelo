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

export async function criarPedido(req, res) {

  const client = await pool.connect();

  try {

    await client.query("BEGIN");

    const {
      endereco_id,
      cliente_nome,
      telefone,
      pagamento,
      total,
      itens,
      troco_para
    } = req.body;

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
        endereco_id,
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

    await client.query("ROLLBACK");

    console.error(error);

    res.status(500).json({
      erro: "Erro ao criar pedido"
    });

  } finally {

    client.release();

  }

}

export async function listarPedidos(req, res) {

  try {

    const result = await pool.query(`
      SELECT *
      FROM pedidos
      ORDER BY criado_em DESC
    `);

    res.json(result.rows);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      erro: "Erro ao listar pedidos"
    });

  }

}

export async function buscarPedido(req, res) {

  try {

    const { id } = req.params;

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

    if (
      req.usuario.tipo !== "ADMIN" &&
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

    console.error(error);

    res.status(500).json({
      erro: "Erro ao buscar pedido"
    });

  }

}

export async function atualizarStatus(req, res) {

  try {

    const { id } = req.params;

    const { status } = req.body;

    if (!STATUS_VALIDOS.includes(status)) {

      return res.status(400).json({
        erro: "Status inválido"
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

    res.json(result.rows[0]);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      erro: "Erro ao atualizar status"
    });

  }

}