import { pool } from "../database/db.js";

export async function perfil(req, res) {

  try {

    if (!req.usuario || !req.usuario.id) {
      return res.status(401).json({
        erro: "Usuário não autenticado"
      });
    }

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

    if (!result.rows.length) {
      console.warn(
        "Perfil solicitado mas usuário não encontrado",
        { usuarioId: req.usuario.id }
      );
      return res.status(404).json({
        erro: "Usuário não encontrado"
      });
    }

    res.json(result.rows[0]);

  } catch (error) {

    console.error("Erro ao carregar perfil:", error);

    res.status(500).json({
      erro: "Erro ao carregar perfil"
    });

  }

}

export async function meusPedidos(req, res) {

  try {

    if (!req.usuario || !req.usuario.id) {
      return res.status(401).json({
        erro: "Usuário não autenticado"
      });
    }

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20)); 
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `
      SELECT *
      FROM pedidos
      WHERE usuario_id = $1
      ORDER BY criado_em DESC
      LIMIT $2 OFFSET $3
      `,
      [req.usuario.id, limit, offset]
    );

    const countResult = await pool.query(
      `
      SELECT COUNT(*) as total
      FROM pedidos
      WHERE usuario_id = $1
      `,
      [req.usuario.id]
    );

    res.json({
      pedidos: result.rows,
      total: Number(countResult.rows[0].total),
      page,
      limit
    });

  } catch (error) {

    console.error("Erro ao listar pedidos do usuário:", error);

    res.status(500).json({
      erro: "Erro ao carregar pedidos"
    });

  }

}

export async function cancelarPedido(req, res) {

  try {

    if (!req.usuario || !req.usuario.id) {
      return res.status(401).json({
        erro: "Usuário não autenticado"
      });
    }

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
      AND usuario_id = $2
      `,
      [
        id,
        req.usuario.id
      ]
    );

    if (!pedidoResult.rows.length) {
      console.warn(
        "Tentativa de cancelar pedido não encontrado",
        { usuarioId: req.usuario.id, pedidoId: id }
      );
      return res.status(404).json({
        erro: "Pedido não encontrado"
      });
    }

    const pedido = pedidoResult.rows[0];

    const statusCanceleivel = [
      "PENDENTE",
      "AGUARDANDO_PAGAMENTO"
    ];

    if (
      !statusCanceleivel.includes(pedido.status)
    ) {
      console.warn(
        "Tentativa de cancelar pedido em status não cancelável",
        { usuarioId: req.usuario.id, pedidoId: id, status: pedido.status }
      );
      return res.status(400).json({
        erro: `Pedido não pode ser cancelado (status atual: ${pedido.status})`
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

    console.log(
      "Pedido cancelado pelo usuário",
      { usuarioId: req.usuario.id, pedidoId: id, statusAnterior: pedido.status }
    );

    res.json({
      sucesso: true,
      mensagem: "Pedido cancelado com sucesso",
      pedido: cancelado.rows[0]
    });

  } catch (error) {

    console.error("Erro ao cancelar pedido:", error);

    res.status(500).json({
      erro: "Erro ao cancelar pedido"
    });

  }

}

export async function pedidoDetalhes(req, res) {

  try {

    if (!req.usuario || !req.usuario.id) {
      return res.status(401).json({
        erro: "Usuário não autenticado"
      });
    }

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

    const userType = String(req.usuario.tipo || "").toUpperCase();
    if (
      userType !== "ADMIN" &&
      pedido.usuario_id !== req.usuario.id
    ) {
      console.warn(
        "Tentativa de acessar pedido de outro usuário",
        { usuarioId: req.usuario.id, pedidoId: id, donoPedido: pedido.usuario_id }
      );
      return res.status(403).json({
        erro: "Acesso negado"
      });
    }

    const itensResult = await pool.query(
      `
      SELECT *
      FROM pedido_itens
      WHERE pedido_id = $1
      `,
      [id]
    );

    res.json({
      ...pedido,
      itens: itensResult.rows
    });

  } catch (error) {

    console.error("Erro ao buscar detalhes do pedido:", error);

    res.status(500).json({
      erro: "Erro ao buscar pedido"
    });

  }

}

export async function atualizarPerfil(req, res) {

  try {

    if (!req.usuario || !req.usuario.id) {
      return res.status(401).json({
        erro: "Usuário não autenticado"
      });
    }

    const { nome } = req.body;

    if (!nome || typeof nome !== "string" || nome.trim().length === 0) {
      return res.status(400).json({
        erro: "Nome é obrigatório e deve ser uma string não-vazia"
      });
    }

    const nomeSanitizado = nome.trim();

    const result = await pool.query(
      `
      UPDATE usuarios
      SET nome = $1
      WHERE id = $2
      RETURNING id, nome, email, tipo, criado_em
      `,
      [
        nomeSanitizado,
        req.usuario.id
      ]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        erro: "Usuário não encontrado"
      });
    }

    console.log(
      "Perfil atualizado",
      { usuarioId: req.usuario.id }
    );

    res.json({
      mensagem: "Perfil atualizado com sucesso",
      usuario: result.rows[0]
    });

  } catch (error) {

    console.error("Erro ao atualizar perfil:", error);

    res.status(500).json({
      erro: "Erro ao atualizar perfil"
    });

  }

}