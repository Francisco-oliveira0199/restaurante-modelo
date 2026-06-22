import { pool } from "../database/db.js";

function validarProduto(body) {
  const errors = [];

  if (!body.nome || typeof body.nome !== "string" || body.nome.trim().length === 0) {
    errors.push("nome é obrigatório e deve ser uma string não-vazia");
  }

  if (!body.categoria || typeof body.categoria !== "string" || body.categoria.trim().length === 0) {
    errors.push("categoria é obrigatória e deve ser uma string não-vazia");
  }

  if (!body.descricao || typeof body.descricao !== "string" || body.descricao.trim().length === 0) {
    errors.push("descricao é obrigatória e deve ser uma string não-vazia");
  }

  if (!Number.isFinite(Number(body.preco)) || Number(body.preco) <= 0) {
    errors.push("preco deve ser um número positivo");
  }

  if (body.imagem && typeof body.imagem !== "string") {
    errors.push("imagem deve ser uma string (URL ou caminho)");
  }

  return errors;
}

export async function listarProdutos(req, res) {

  try {

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const categoria = req.query.categoria ? String(req.query.categoria).trim() : null;
    const busca = req.query.busca ? String(req.query.busca).trim() : null;

    let query = `
      SELECT *
      FROM produtos
      WHERE ativo = TRUE
    `;
    const params = [];

    if (categoria) {
      query += ` AND LOWER(categoria) = LOWER($${params.length + 1})`;
      params.push(categoria);
    }

    if (busca) {
      query += ` AND (LOWER(nome) LIKE LOWER($${params.length + 1}) OR LOWER(descricao) LIKE LOWER($${params.length + 2}))`;
      params.push(`%${busca}%`);
      params.push(`%${busca}%`);
    }

    query += ` ORDER BY nome ASC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit);
    params.push(offset);

    const result = await pool.query(query, params);

    let countQuery = `
      SELECT COUNT(*) as total
      FROM produtos
      WHERE ativo = TRUE
    `;
    const countParams = [];

    if (categoria) {
      countQuery += ` AND LOWER(categoria) = LOWER($${countParams.length + 1})`;
      countParams.push(categoria);
    }

    if (busca) {
      countQuery += ` AND (LOWER(nome) LIKE LOWER($${countParams.length + 1}) OR LOWER(descricao) LIKE LOWER($${countParams.length + 2}))`;
      countParams.push(`%${busca}%`);
      countParams.push(`%${busca}%`);
    }

    const countResult = await pool.query(countQuery, countParams);

    res.json({
      produtos: result.rows,
      total: Number(countResult.rows[0].total),
      page,
      limit,
      filtros: {
        categoria: categoria || null,
        busca: busca || null
      }
    });

  } catch (error) {

    console.error("Erro ao listar produtos:", error);

    res.status(500).json({
      erro: "Erro ao listar produtos"
    });

  }

}

export async function listarPromocoes(req, res) {

  try {

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `
      SELECT *
      FROM produtos
      WHERE ativo = TRUE
      AND preco_promocional IS NOT NULL
      AND preco_promocional < preco
      ORDER BY (preco - preco_promocional) DESC
      LIMIT $1 OFFSET $2
      `,
      [limit, offset]
    );

    const countResult = await pool.query(
      `
      SELECT COUNT(*) as total
      FROM produtos
      WHERE ativo = TRUE
      AND preco_promocional IS NOT NULL
      AND preco_promocional < preco
      `
    );

    res.json({
      promocoes: result.rows,
      total: Number(countResult.rows[0].total),
      page,
      limit
    });

  } catch (error) {

    console.error("Erro ao listar promoções:", error);

    res.status(500).json({
      erro: "Erro ao listar promoções"
    });

  }

}

export async function buscarProduto(req, res) {

  try {

    const { id } = req.params;

    if (!id || Number.isNaN(Number(id))) {
      return res.status(400).json({
        erro: "ID de produto inválido"
      });
    }

    const result = await pool.query(
      `
      SELECT *
      FROM produtos
      WHERE id = $1
      `,
      [id]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        erro: "Produto não encontrado"
      });
    }

    res.json(result.rows[0]);

  } catch (error) {

    console.error("Erro ao buscar produto:", error);

    res.status(500).json({
      erro: "Erro ao buscar produto"
    });

  }

}

export async function criarProduto(req, res) {

  try {

    const {
      nome,
      categoria,
      descricao,
      preco,
      imagem,
      preco_promocional
    } = req.body;

    const validationErrors = validarProduto(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        erro: "Payload inválido",
        detalhes: validationErrors
      });
    }

    const nomeSanitizado = nome.trim();
    const categoriaSanitizada = categoria.trim();
    const descricaoSanitizada = descricao.trim();
    const precoNum = Number(preco);
    const precoPromocionalNum = preco_promocional ? Number(preco_promocional) : null;

    if (precoPromocionalNum && precoPromocionalNum >= precoNum) {
      return res.status(400).json({
        erro: "Preço promocional deve ser menor que preço normal"
      });
    }

    const result = await pool.query(
      `
      INSERT INTO produtos
      (
        nome,
        categoria,
        descricao,
        preco,
        preco_promocional,
        imagem,
        ativo
      )
      VALUES
      ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *
      `,
      [
        nomeSanitizado,
        categoriaSanitizada,
        descricaoSanitizada,
        precoNum,
        precoPromocionalNum,
        imagem || null,
        true
      ]
    );

    console.log(
      "Produto criado",
      { produtoId: result.rows[0].id, adminId: req.usuario.id, nome: nomeSanitizado }
    );

    res.status(201).json(result.rows[0]);

  } catch (error) {

    console.error("Erro ao criar produto:", error);

    res.status(500).json({
      erro: "Erro ao criar produto"
    });

  }

}

export async function atualizarProduto(req, res) {

  try {

    const { id } = req.params;

    if (!id || Number.isNaN(Number(id))) {
      return res.status(400).json({
        erro: "ID de produto inválido"
      });
    }

    const {
      nome,
      categoria,
      descricao,
      preco,
      imagem,
      ativo,
      preco_promocional
    } = req.body;

    const validationErrors = validarProduto({
      nome: nome || "",
      categoria: categoria || "",
      descricao: descricao || "",
      preco: preco || 0,
      imagem
    });
    if (validationErrors.length > 0) {
      return res.status(400).json({
        erro: "Payload inválido",
        detalhes: validationErrors
      });
    }

    const nomeSanitizado = nome.trim();
    const categoriaSanitizada = categoria.trim();
    const descricaoSanitizada = descricao.trim();
    const precoNum = Number(preco);
    const precoPromocionalNum = preco_promocional ? Number(preco_promocional) : null;
    const ativoFinal = typeof ativo === "boolean" ? ativo : true;

    if (precoPromocionalNum && precoPromocionalNum >= precoNum) {
      return res.status(400).json({
        erro: "Preço promocional deve ser menor que preço normal"
      });
    }

    const existsResult = await pool.query(
      `SELECT id FROM produtos WHERE id = $1`,
      [id]
    );

    if (!existsResult.rows.length) {
      return res.status(404).json({
        erro: "Produto não encontrado"
      });
    }

    const result = await pool.query(
      `
      UPDATE produtos
      SET
        nome = $1,
        categoria = $2,
        descricao = $3,
        preco = $4,
        preco_promocional = $5,
        imagem = $6,
        ativo = $7
      WHERE id = $8
      RETURNING *
      `,
      [
        nomeSanitizado,
        categoriaSanitizada,
        descricaoSanitizada,
        precoNum,
        precoPromocionalNum,
        imagem || null,
        ativoFinal,
        id
      ]
    );

    console.log(
      "Produto atualizado",
      { produtoId: id, adminId: req.usuario.id, nome: nomeSanitizado }
    );

    res.json(result.rows[0]);

  } catch (error) {

    console.error("Erro ao atualizar produto:", error);

    res.status(500).json({
      erro: "Erro ao atualizar produto"
    });

  }

}

export async function removerProduto(req, res) {

  try {

    const { id } = req.params;

    if (!id || Number.isNaN(Number(id))) {
      return res.status(400).json({
        erro: "ID de produto inválido"
      });
    }

    const existsResult = await pool.query(
      `SELECT id, ativo FROM produtos WHERE id = $1`,
      [id]
    );

    if (!existsResult.rows.length) {
      return res.status(404).json({
        erro: "Produto não encontrado"
      });
    }

    const produtoAtual = existsResult.rows[0];

    if (!produtoAtual.ativo) {
      return res.status(400).json({
        erro: "Produto já está desativado"
      });
    }

    const result = await pool.query(
      `
      UPDATE produtos
      SET ativo = FALSE
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );

    console.log(
      "Produto desativado",
      { produtoId: id, adminId: req.usuario.id }
    );

    res.json({
      sucesso: true,
      mensagem: "Produto desativado com sucesso",
      produto: result.rows[0]
    });

  } catch (error) {

    console.error("Erro ao remover produto:", error);

    res.status(500).json({
      erro: "Erro ao remover produto"
    });

  }

}

export async function listarPorCategoria(req, res) {

  try {

    const { categoria } = req.params;

    if (!categoria || typeof categoria !== "string" || categoria.trim().length === 0) {
      return res.status(400).json({
        erro: "Categoria inválida"
      });
    }

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `
      SELECT *
      FROM produtos
      WHERE LOWER(categoria) = LOWER($1)
      AND ativo = TRUE
      ORDER BY nome ASC
      LIMIT $2 OFFSET $3
      `,
      [categoria, limit, offset]
    );

    const countResult = await pool.query(
      `
      SELECT COUNT(*) as total
      FROM produtos
      WHERE LOWER(categoria) = LOWER($1)
      AND ativo = TRUE
      `,
      [categoria]
    );

    res.json({
      produtos: result.rows,
      categoria,
      total: Number(countResult.rows[0].total),
      page,
      limit
    });

  } catch (error) {

    console.error("Erro ao listar produtos por categoria:", error);

    res.status(500).json({
      erro: "Erro ao listar produtos"
    });

  }

}