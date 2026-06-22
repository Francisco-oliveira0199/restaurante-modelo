import { pool } from "../database/db.js";
import * as cupomService from "../services/cupomService.js";

function validarCupom(body) {
  const errors = [];

  if (!body.codigo || typeof body.codigo !== "string" || body.codigo.trim().length === 0) {
    errors.push("codigo é obrigatório e deve ser uma string não-vazia");
  }

  if (!body.tipo || !["PORCENTAGEM", "FIXO"].includes(String(body.tipo).toUpperCase())) {
    errors.push("tipo deve ser 'PORCENTAGEM' ou 'FIXO'");
  }

  if (!Number.isFinite(Number(body.desconto)) || Number(body.desconto) <= 0) {
    errors.push("desconto deve ser um número positivo");
  }

  if (body.tipo && String(body.tipo).toUpperCase() === "PORCENTAGEM") {
    if (Number(body.desconto) > 100) {
      errors.push("desconto percentual não pode exceder 100");
    }
  }

  if (body.valor_minimo && (!Number.isFinite(Number(body.valor_minimo)) || Number(body.valor_minimo) < 0)) {
    errors.push("valor_minimo deve ser um número não-negativo");
  }

  if (body.validade) {
    const dataValidade = new Date(body.validade);
    if (Number.isNaN(dataValidade.getTime())) {
      errors.push("validade deve ser uma data válida (ISO 8601)");
    }
  }

  return errors;
}

export async function listarCupons(req, res) {

  try {

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `
      SELECT *
      FROM cupons
      ORDER BY criado_em DESC
      LIMIT $1 OFFSET $2
      `,
      [limit, offset]
    );

    const countResult = await pool.query(
      `
      SELECT COUNT(*) as total
      FROM cupons
      `
    );

    res.json({
      cupons: result.rows,
      total: Number(countResult.rows[0].total),
      page,
      limit
    });

  } catch (error) {

    console.error("Erro ao listar cupons:", error);

    res.status(500).json({
      erro: "Erro ao listar cupons"
    });

  }

}

export async function buscarCupom(req, res) {

  try {

    const { id } = req.params;

    if (!id || Number.isNaN(Number(id))) {
      return res.status(400).json({
        erro: "ID de cupom inválido"
      });
    }

    const result = await pool.query(
      `
      SELECT *
      FROM cupons
      WHERE id = $1
      `,
      [id]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        erro: "Cupom não encontrado"
      });
    }

    res.json(result.rows[0]);

  } catch (error) {

    console.error("Erro ao buscar cupom:", error);

    res.status(500).json({
      erro: "Erro ao buscar cupom"
    });

  }

}

export async function criarCupom(req, res) {

  try {

    const {
      codigo,
      tipo,
      desconto,
      valor_minimo,
      validade,
      ativo
    } = req.body;

    const validationErrors = validarCupom(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        erro: "Payload inválido",
        detalhes: validationErrors
      });
    }

    const codigoSanitizado = codigo.trim().toUpperCase();
    const tipoSanitizado = String(tipo).toUpperCase();
    const descontoNum = Number(desconto);
    const valorMinimoNum = valor_minimo ? Number(valor_minimo) : null;
    const validadeSanitizada = validade ? new Date(validade).toISOString() : null;
    const ativoBool = typeof ativo === "boolean" ? ativo : true;

    const existsResult = await pool.query(
      `
      SELECT id FROM cupons
      WHERE UPPER(codigo) = $1
      `,
      [codigoSanitizado]
    );

    if (existsResult.rows.length) {
      return res.status(409).json({
        erro: "Cupom com este código já existe"
      });
    }

    const result = await pool.query(
      `
      INSERT INTO cupons
      (
        codigo,
        tipo,
        desconto,
        valor_minimo,
        validade,
        ativo
      )
      VALUES
      ($1,$2,$3,$4,$5,$6)
      RETURNING *
      `,
      [
        codigoSanitizado,
        tipoSanitizado,
        descontoNum,
        valorMinimoNum,
        validadeSanitizada,
        ativoBool
      ]
    );

    console.log(
      "Cupom criado",
      { cupomId: result.rows[0].id, codigo: codigoSanitizado, adminId: req.usuario.id }
    );

    res.status(201).json(result.rows[0]);

  } catch (error) {

    console.error("Erro ao criar cupom:", error);

    res.status(500).json({
      erro: "Erro ao criar cupom"
    });

  }

}

export async function atualizarCupom(req, res) {

  try {

    const { id } = req.params;

    if (!id || Number.isNaN(Number(id))) {
      return res.status(400).json({
        erro: "ID de cupom inválido"
      });
    }

    const {
      codigo,
      tipo,
      desconto,
      valor_minimo,
      validade,
      ativo
    } = req.body;

    const validationErrors = validarCupom({
      codigo: codigo || "",
      tipo: tipo || "",
      desconto: desconto || 0,
      valor_minimo,
      validade
    });
    if (validationErrors.length > 0) {
      return res.status(400).json({
        erro: "Payload inválido",
        detalhes: validationErrors
      });
    }

    const existsResult = await pool.query(
      `
      SELECT id FROM cupons
      WHERE id = $1
      `,
      [id]
    );

    if (!existsResult.rows.length) {
      return res.status(404).json({
        erro: "Cupom não encontrado"
      });
    }

    const codigoSanitizado = codigo.trim().toUpperCase();
    const tipoSanitizado = String(tipo).toUpperCase();
    const descontoNum = Number(desconto);
    const valorMinimoNum = valor_minimo ? Number(valor_minimo) : null;
    const validadeSanitizada = validade ? new Date(validade).toISOString() : null;
    const ativoBool = typeof ativo === "boolean" ? ativo : true;

    if (codigo) {
      const duplicataResult = await pool.query(
        `
        SELECT id FROM cupons
        WHERE UPPER(codigo) = $1 AND id != $2
        `,
        [codigoSanitizado, id]
      );

      if (duplicataResult.rows.length) {
        return res.status(409).json({
          erro: "Cupom com este código já existe"
        });
      }
    }

    const result = await pool.query(
      `
      UPDATE cupons
      SET
        codigo = $1,
        tipo = $2,
        desconto = $3,
        valor_minimo = $4,
        validade = $5,
        ativo = $6
      WHERE id = $7
      RETURNING *
      `,
      [
        codigoSanitizado,
        tipoSanitizado,
        descontoNum,
        valorMinimoNum,
        validadeSanitizada,
        ativoBool,
        id
      ]
    );

    console.log(
      "Cupom atualizado",
      { cupomId: id, codigo: codigoSanitizado, adminId: req.usuario.id }
    );

    res.json(result.rows[0]);

  } catch (error) {

    console.error("Erro ao atualizar cupom:", error);

    res.status(500).json({
      erro: "Erro ao atualizar cupom"
    });

  }

}

export async function removerCupom(req, res) {

  try {

    const { id } = req.params;

    if (!id || Number.isNaN(Number(id))) {
      return res.status(400).json({
        erro: "ID de cupom inválido"
      });
    }

    const existsResult = await pool.query(
      `
      SELECT id, codigo, ativo FROM cupons
      WHERE id = $1
      `,
      [id]
    );

    if (!existsResult.rows.length) {
      return res.status(404).json({
        erro: "Cupom não encontrado"
      });
    }

    const cupom = existsResult.rows[0];

    if (!cupom.ativo) {
      return res.status(400).json({
        erro: "Cupom já está desativado"
      });
    }

    const result = await pool.query(
      `
      UPDATE cupons
      SET ativo = FALSE
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );

    console.log(
      "Cupom desativado",
      { cupomId: id, codigo: cupom.codigo, adminId: req.usuario.id }
    );

    res.json({
      sucesso: true,
      mensagem: "Cupom desativado com sucesso",
      cupom: result.rows[0]
    });

  } catch (error) {

    console.error("Erro ao remover cupom:", error);

    res.status(500).json({
      erro: "Erro ao remover cupom"
    });

  }

}

export async function validarCupom(req, res) {

  try {

    const { codigo, valorPedido } = req.body;

    if (!codigo || typeof codigo !== "string" || codigo.trim().length === 0) {
      return res.status(400).json({
        valido: false,
        erro: "Código de cupom é obrigatório"
      });
    }

    if (!Number.isFinite(Number(valorPedido)) || Number(valorPedido) <= 0) {
      return res.status(400).json({
        valido: false,
        erro: "Valor do pedido deve ser um número positivo"
      });
    }

    try {
      const resultado = await cupomService.validarCupom(
        codigo.trim().toUpperCase(),
        Number(valorPedido)
      );

      console.log(
        "Cupom validado com sucesso",
        { codigo: codigo.toUpperCase(), valorPedido }
      );

      res.json({
        valido: true,
        cupom: resultado.cupom,
        desconto: resultado.desconto,
        totalFinal: resultado.totalFinal
      });

    } catch (erro) {

      console.warn(
        "Validação de cupom falhou",
        { codigo: codigo.toUpperCase(), erro: erro.message }
      );

      res.status(400).json({
        valido: false,
        erro: erro.message
      });

    }

  } catch (error) {

    console.error("Erro ao validar cupom:", error);

    res.status(500).json({
      valido: false,
      erro: "Erro ao validar cupom"
    });

  }

}