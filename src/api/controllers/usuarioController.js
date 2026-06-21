import { pool } from "../database/db.js";

export async function perfil(req, res) {

  try {

    const result = await pool.query(
      `
      SELECT
        id,
        nome,
        email,
        tipo,
        criado_em
      FROM usuarios
      WHERE id = $1
      `,
      [req.usuario.id]
    );

    res.json(result.rows[0]);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      erro: "Erro ao carregar perfil"
    });

  }

}

export async function meusPedidos(req, res) {

  try {

    const result = await pool.query(
      `
      SELECT *
      FROM pedidos
      WHERE usuario_id = $1
      ORDER BY criado_em DESC
      `,
      [req.usuario.id]
    );

    res.json(result.rows);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      erro: "Erro ao carregar pedidos"
    });

  }

}

export async function cancelarPedido(req, res) {

  try {

    const { id } = req.params;

    const pedidoResult = await pool.query(
      `
      SELECT *
      FROM pedidos
      WHERE id = $1
      AND usuario_id = $2
      `,
      [
        id,
        req.usuario.id
      ]
    );

    if (!pedidoResult.rows.length) {

      return res.status(404).json({
        erro: "Pedido não encontrado"
      });

    }

    const pedido = pedidoResult.rows[0];

    const podeCancelar = [
      "PENDENTE",
      "AGUARDANDO_PAGAMENTO"
    ];

    if (
      !podeCancelar.includes(
        pedido.status
      )
    ) {

      return res.status(400).json({
        erro:
          "Pedido não pode mais ser cancelado"
      });

    }

    const cancelado = await pool.query(
      `
      UPDATE pedidos
      SET status = 'CANCELADO'
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );

    res.json({
      sucesso: true,
      pedido: cancelado.rows[0]
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      erro:
        "Erro ao cancelar pedido"
    });

  }

}