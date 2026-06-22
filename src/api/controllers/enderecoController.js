import { pool } from "../database/db.js";

function validarCEP(cep) {
  if (!cep) return false;
  const cepRegex = /^\d{5}-\d{3}$/;
  return cepRegex.test(String(cep).trim());
}

function validarEndereco(body) {
  const errors = [];

  if (!body.rua || typeof body.rua !== "string" || body.rua.trim().length === 0) {
    errors.push("rua é obrigatória e deve ser uma string não-vazia");
  }

  if (!body.numero || typeof body.numero !== "string" || body.numero.trim().length === 0) {
    errors.push("numero é obrigatório e deve ser uma string não-vazia");
  }

  if (!body.bairro || typeof body.bairro !== "string" || body.bairro.trim().length === 0) {
    errors.push("bairro é obrigatório e deve ser uma string não-vazia");
  }

  if (!body.cidade || typeof body.cidade !== "string" || body.cidade.trim().length === 0) {
    errors.push("cidade é obrigatória e deve ser uma string não-vazia");
  }

  if (!body.estado || typeof body.estado !== "string" || body.estado.trim().length === 0) {
    errors.push("estado é obrigatório e deve ser uma string não-vazia");
  }

  if (!body.cep || !validarCEP(body.cep)) {
    errors.push("cep é obrigatório e deve estar no formato XXXXX-XXX");
  }

  return errors;
}

export async function listarEnderecos(req, res) {

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
      FROM enderecos
      WHERE usuario_id = $1
      ORDER BY padrao DESC, criado_em DESC
      LIMIT $2 OFFSET $3
      `,
      [req.usuario.id, limit, offset]
    );

    const countResult = await pool.query(
      `
      SELECT COUNT(*) as total
      FROM enderecos
      WHERE usuario_id = $1
      `,
      [req.usuario.id]
    );

    res.json({
      enderecos: result.rows,
      total: Number(countResult.rows[0].total),
      page,
      limit
    });

  } catch (error) {

    console.error("Erro ao listar endereços:", error);

    res.status(500).json({
      erro: "Erro ao listar endereços"
    });

  }

}

export async function buscarEndereco(req, res) {

  try {

    if (!req.usuario || !req.usuario.id) {
      return res.status(401).json({
        erro: "Usuário não autenticado"
      });
    }

    const { id } = req.params;

    if (!id || Number.isNaN(Number(id))) {
      return res.status(400).json({
        erro: "ID de endereço inválido"
      });
    }

    const result = await pool.query(
      `
      SELECT *
      FROM enderecos
      WHERE id = $1
      AND usuario_id = $2
      `,
      [id, req.usuario.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        erro: "Endereço não encontrado"
      });
    }

    res.json(result.rows[0]);

  } catch (error) {

    console.error("Erro ao buscar endereço:", error);

    res.status(500).json({
      erro: "Erro ao buscar endereço"
    });

  }

}

export async function criarEndereco(req, res) {

  try {

    if (!req.usuario || !req.usuario.id) {
      return res.status(401).json({
        erro: "Usuário não autenticado"
      });
    }

    const {
      rua,
      numero,
      bairro,
      cidade,
      estado,
      cep,
      complemento,
      padrao
    } = req.body;

    const validationErrors = validarEndereco(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        erro: "Payload inválido",
        detalhes: validationErrors
      });
    }

    const ruaSanitizada = rua.trim();
    const numeroSanitizado = numero.trim();
    const bairroSanitizado = bairro.trim();
    const cidadeSanitizada = cidade.trim();
    const estadoSanitizado = estado.trim().toUpperCase();
    const cepSanitizado = cep.trim();
    const complementoSanitizado = complemento ? complemento.trim() : null;
    const padraoBool = typeof padrao === "boolean" ? padrao : false;

    if (padraoBool) {
      await pool.query(
        `
        UPDATE enderecos
        SET padrao = FALSE
        WHERE usuario_id = $1
        `,
        [req.usuario.id]
      );
    }

    const result = await pool.query(
      `
      INSERT INTO enderecos
      (
        usuario_id,
        rua,
        numero,
        bairro,
        cidade,
        estado,
        cep,
        complemento,
        padrao
      )
      VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *
      `,
      [
        req.usuario.id,
        ruaSanitizada,
        numeroSanitizado,
        bairroSanitizado,
        cidadeSanitizada,
        estadoSanitizado,
        cepSanitizado,
        complementoSanitizado,
        padraoBool
      ]
    );

    console.log(
      "Endereço criado",
      { usuarioId: req.usuario.id, enderecoId: result.rows[0].id, cidade: cidadeSanitizada }
    );

    res.status(201).json(result.rows[0]);

  } catch (error) {

    console.error("Erro ao criar endereço:", error);

    res.status(500).json({
      erro: "Erro ao criar endereço"
    });

  }

}

export async function atualizarEndereco(req, res) {

  try {

    if (!req.usuario || !req.usuario.id) {
      return res.status(401).json({
        erro: "Usuário não autenticado"
      });
    }

    const { id } = req.params;

    if (!id || Number.isNaN(Number(id))) {
      return res.status(400).json({
        erro: "ID de endereço inválido"
      });
    }

    const {
      rua,
      numero,
      bairro,
      cidade,
      estado,
      cep,
      complemento,
      padrao
    } = req.body;

    const validationErrors = validarEndereco({
      rua: rua || "",
      numero: numero || "",
      bairro: bairro || "",
      cidade: cidade || "",
      estado: estado || "",
      cep: cep || ""
    });
    if (validationErrors.length > 0) {
      return res.status(400).json({
        erro: "Payload inválido",
        detalhes: validationErrors
      });
    }

    const existsResult = await pool.query(
      `
      SELECT id FROM enderecos
      WHERE id = $1 AND usuario_id = $2
      `,
      [id, req.usuario.id]
    );

    if (!existsResult.rows.length) {
      console.warn(
        "Tentativa de atualizar endereço de outro usuário",
        { usuarioId: req.usuario.id, enderecoId: id }
      );
      return res.status(404).json({
        erro: "Endereço não encontrado"
      });
    }

    const ruaSanitizada = rua.trim();
    const numeroSanitizado = numero.trim();
    const bairroSanitizado = bairro.trim();
    const cidadeSanitizada = cidade.trim();
    const estadoSanitizado = estado.trim().toUpperCase();
    const cepSanitizado = cep.trim();
    const complementoSanitizado = complemento ? complemento.trim() : null;
    const padraoBool = typeof padrao === "boolean" ? padrao : false;

    if (padraoBool) {
      await pool.query(
        `
        UPDATE enderecos
        SET padrao = FALSE
        WHERE usuario_id = $1 AND id != $2
        `,
        [req.usuario.id, id]
      );
    }

    const result = await pool.query(
      `
      UPDATE enderecos
      SET
        rua = $1,
        numero = $2,
        bairro = $3,
        cidade = $4,
        estado = $5,
        cep = $6,
        complemento = $7,
        padrao = $8
      WHERE id = $9 AND usuario_id = $10
      RETURNING *
      `,
      [
        ruaSanitizada,
        numeroSanitizado,
        bairroSanitizado,
        cidadeSanitizada,
        estadoSanitizado,
        cepSanitizado,
        complementoSanitizado,
        padraoBool,
        id,
        req.usuario.id
      ]
    );

    console.log(
      "Endereço atualizado",
      { usuarioId: req.usuario.id, enderecoId: id }
    );

    res.json(result.rows[0]);

  } catch (error) {

    console.error("Erro ao atualizar endereço:", error);

    res.status(500).json({
      erro: "Erro ao atualizar endereço"
    });

  }

}

export async function excluirEndereco(req, res) {

  try {

    if (!req.usuario || !req.usuario.id) {
      return res.status(401).json({
        erro: "Usuário não autenticado"
      });
    }

    const { id } = req.params;

    if (!id || Number.isNaN(Number(id))) {
      return res.status(400).json({
        erro: "ID de endereço inválido"
      });
    }

    const existsResult = await pool.query(
      `
      SELECT id, padrao FROM enderecos
      WHERE id = $1 AND usuario_id = $2
      `,
      [id, req.usuario.id]
    );

    if (!existsResult.rows.length) {
      console.warn(
        "Tentativa de excluir endereço de outro usuário",
        { usuarioId: req.usuario.id, enderecoId: id }
      );
      return res.status(404).json({
        erro: "Endereço não encontrado"
      });
    }

    const endereco = existsResult.rows[0];

    await pool.query(
      `
      DELETE FROM enderecos
      WHERE id = $1
      `,
      [id]
    );

    if (endereco.padrao) {
      const proximoEndereco = await pool.query(
        `
        SELECT id FROM enderecos
        WHERE usuario_id = $1
        ORDER BY criado_em DESC
        LIMIT 1
        `,
        [req.usuario.id]
      );

      if (proximoEndereco.rows.length) {
        await pool.query(
          `
          UPDATE enderecos
          SET padrao = TRUE
          WHERE id = $1
          `,
          [proximoEndereco.rows[0].id]
        );
      }
    }

    console.log(
      "Endereço excluído",
      { usuarioId: req.usuario.id, enderecoId: id }
    );

    res.json({
      sucesso: true,
      mensagem: "Endereço excluído com sucesso"
    });

  } catch (error) {

    console.error("Erro ao excluir endereço:", error);

    res.status(500).json({
      erro: "Erro ao excluir endereço"
    });

  }

}

export async function marcarComoPadrao(req, res) {

  try {

    if (!req.usuario || !req.usuario.id) {
      return res.status(401).json({
        erro: "Usuário não autenticado"
      });
    }

    const { id } = req.params;

    if (!id || Number.isNaN(Number(id))) {
      return res.status(400).json({
        erro: "ID de endereço inválido"
      });
    }

    const existsResult = await pool.query(
      `
      SELECT id FROM enderecos
      WHERE id = $1 AND usuario_id = $2
      `,
      [id, req.usuario.id]
    );

    if (!existsResult.rows.length) {
      return res.status(404).json({
        erro: "Endereço não encontrado"
      });
    }

    await pool.query(
      `
      UPDATE enderecos
      SET padrao = FALSE
      WHERE usuario_id = $1
      `,
      [req.usuario.id]
    );

    const result = await pool.query(
      `
      UPDATE enderecos
      SET padrao = TRUE
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );

    console.log(
      "Endereço marcado como padrão",
      { usuarioId: req.usuario.id, enderecoId: id }
    );

    res.json({
      sucesso: true,
      mensagem: "Endereço marcado como padrão",
      endereco: result.rows[0]
    });

  } catch (error) {

    console.error("Erro ao marcar endereço como padrão:", error);

    res.status(500).json({
      erro: "Erro ao marcar endereço como padrão"
    });

  }

}