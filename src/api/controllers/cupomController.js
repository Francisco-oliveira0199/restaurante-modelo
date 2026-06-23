import * as cupomService from "../services/cupomService.js";
import * as cupomRepository from "../repositories/cupomRepository.js";

function validarEntradaCupom(body, partial = false) {
  const errors = [];

  const has = (k) => Object.prototype.hasOwnProperty.call(body, k);

  if (!partial || has("codigo")) {
    if (!body.codigo || typeof body.codigo !== "string" || body.codigo.trim().length === 0) {
      errors.push("codigo é obrigatório e deve ser uma string não-vazia");
    }
  }

  if (!partial || has("tipo")) {
    if (!body.tipo || typeof body.tipo !== "string") {
      errors.push("tipo é obrigatório e deve ser 'PORCENTAGEM' ou 'VALOR' (ou 'FIXO')");
    } else {
      const tipoUp = String(body.tipo).toUpperCase();
      if (!["PORCENTAGEM", "VALOR", "FIXO"].includes(tipoUp)) {
        errors.push("tipo deve ser 'PORCENTAGEM' ou 'VALOR' (ou 'FIXO')");
      }
    }
  }

  if (!partial || has("desconto")) {
    if (!Number.isFinite(Number(body.desconto)) || Number(body.desconto) <= 0) {
      errors.push("desconto deve ser um número positivo");
    } else if (body.tipo && String(body.tipo).toUpperCase() === "PORCENTAGEM" && Number(body.desconto) > 100) {
      errors.push("desconto percentual não pode exceder 100");
    }
  }

  if (!partial || has("valor_minimo")) {
    if (body.valor_minimo != null && (!Number.isFinite(Number(body.valor_minimo)) || Number(body.valor_minimo) < 0)) {
      errors.push("valor_minimo deve ser um número não-negativo");
    }
  }

  if (!partial || has("validade")) {
    if (body.validade != null && body.validade !== "") {
      const dataValidade = new Date(body.validade);
      if (Number.isNaN(dataValidade.getTime())) {
        errors.push("validade deve ser uma data válida (ISO 8601)");
      }
    }
  }

  if (!partial || has("ativo")) {
    if (body.ativo != null && typeof body.ativo !== "boolean" && String(body.ativo) !== "0" && String(body.ativo) !== "1") {
      errors.push("ativo deve ser booleano (true/false)");
    }
  }

  return errors;
}

export async function listarCupons(req, res) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const todos = await cupomService.listarCupons();

    const total = Array.isArray(todos) ? todos.length : 0;
    const pagina = todos.slice(offset, offset + limit);

    return res.json({
      cupons: pagina,
      total,
      page,
      limit
    });
  } catch (error) {
    console.error("Erro ao listar cupons:", error);
    return res.status(500).json({ erro: "Erro ao listar cupons" });
  }
}

export async function buscarCupom(req, res) {
  try {
    const { id } = req.params;
    if (!id || Number.isNaN(Number(id))) {
      return res.status(400).json({ erro: "ID de cupom inválido" });
    }

    const cupom = await cupomRepository.buscarCupomPorId(Number(id));
    if (!cupom) {
      return res.status(404).json({ erro: "Cupom não encontrado" });
    }

    return res.json(cupom);
  } catch (error) {
    console.error("Erro ao buscar cupom:", error);
    return res.status(500).json({ erro: "Erro ao buscar cupom" });
  }
}

export async function criarCupom(req, res) {
  try {
    const { codigo, tipo, desconto, valor_minimo, validade, ativo } = req.body;

    const validationErrors = validarEntradaCupom({ codigo, tipo, desconto, valor_minimo, validade, ativo }, false);
    if (validationErrors.length > 0) {
      return res.status(400).json({ erro: "Payload inválido", detalhes: validationErrors });
    }

    const codigoSanitizado = String(codigo).trim().toUpperCase();
    let tipoSanitizado = String(tipo).toUpperCase();
    if (tipoSanitizado === "FIXO") tipoSanitizado = "VALOR"; 

    const descontoNum = Number(desconto);
    const valorMinimoNum = valor_minimo != null ? Number(valor_minimo) : null;
    const validadeIso = validade ? new Date(validade).toISOString() : null;
    const ativoBool = typeof ativo === "boolean" ? ativo : true;

    const existentePorCodigo = await cupomRepository.buscarCupomPorCodigo(codigoSanitizado);
    if (existentePorCodigo) {
      return res.status(409).json({ erro: "Cupom com este código já existe" });
    }

    const dados = {
      codigo: codigoSanitizado,
      tipo: tipoSanitizado,
      desconto: descontoNum,
      valor_minimo: valorMinimoNum,
      validade: validadeIso,
      ativo: ativoBool
    };

    const criado = await cupomService.criarCupom(dados);

    console.log("Cupom criado", { cupomId: criado.id, codigo: criado.codigo, adminId: req.usuario?.id });

    return res.status(201).json(criado);
  } catch (error) {
    console.error("Erro ao criar cupom:", error);
    return res.status(500).json({ erro: "Erro ao criar cupom" });
  }
}

export async function atualizarCupom(req, res) {
  try {
    const { id } = req.params;
    if (!id || Number.isNaN(Number(id))) {
      return res.status(400).json({ erro: "ID de cupom inválido" });
    }

    
    const existente = await cupomRepository.buscarCupomPorId(Number(id));
    if (!existente) {
      return res.status(404).json({ erro: "Cupom não encontrado" });
    }

    const payload = req.body || {};

    const validationErrors = validarEntradaCupom(payload, true);
    if (validationErrors.length > 0) {
      return res.status(400).json({ erro: "Payload inválido", detalhes: validationErrors });
    }

    const dadosParaAtualizar = {};

    if (payload.codigo != null) {
      const codigoSanitizado = String(payload.codigo).trim().toUpperCase();
      
      const duplicata = await cupomRepository.buscarCupomPorCodigo(codigoSanitizado);
      if (duplicata && String(duplicata.id) !== String(id)) {
        return res.status(409).json({ erro: "Cupom com este código já existe" });
      }
      dadosParaAtualizar.codigo = codigoSanitizado;
    }

    if (payload.tipo != null) {
      let tipoSanitizado = String(payload.tipo).toUpperCase();
      if (tipoSanitizado === "FIXO") tipoSanitizado = "VALOR";
      dadosParaAtualizar.tipo = tipoSanitizado;
    }

    if (payload.desconto != null) {
      dadosParaAtualizar.desconto = Number(payload.desconto);
    }

    if (payload.valor_minimo != null) {
      dadosParaAtualizar.valor_minimo = payload.valor_minimo === "" ? null : Number(payload.valor_minimo);
    }

    if (payload.validade != null) {
      dadosParaAtualizar.validade = payload.validade === "" ? null : new Date(payload.validade).toISOString();
    }

    if (payload.ativo != null) {
  
      if (typeof payload.ativo === "string") {
        const low = payload.ativo.trim();
        dadosParaAtualizar.ativo = low === "1" || low.toLowerCase() === "true";
      } else {
        dadosParaAtualizar.ativo = Boolean(payload.ativo);
      }
    }

    if (Object.keys(dadosParaAtualizar).length === 0) {
      return res.status(400).json({ erro: "Nenhum campo para atualizar" });
    }

    const atualizado = await cupomService.atualizarCupom(Number(id), {
      codigo: dadosParaAtualizar.codigo ?? existente.codigo,
      desconto: dadosParaAtualizar.desconto ?? existente.desconto,
      tipo: dadosParaAtualizar.tipo ?? existente.tipo,
      valor_minimo: Object.prototype.hasOwnProperty.call(dadosParaAtualizar, "valor_minimo") ? dadosParaAtualizar.valor_minimo : existente.valor_minimo,
      validade: Object.prototype.hasOwnProperty.call(dadosParaAtualizar, "validade") ? dadosParaAtualizar.validade : existente.validade,
      ativo: Object.prototype.hasOwnProperty.call(dadosParaAtualizar, "ativo") ? dadosParaAtualizar.ativo : existente.ativo
    });

    console.log("Cupom atualizado", { cupomId: id, codigo: atualizado.codigo, adminId: req.usuario?.id });

    return res.json(atualizado);
  } catch (error) {
    console.error("Erro ao atualizar cupom:", error);
    return res.status(500).json({ erro: "Erro ao atualizar cupom" });
  }
}

export async function removerCupom(req, res) {
  try {
    const { id } = req.params;
    if (!id || Number.isNaN(Number(id))) {
      return res.status(400).json({ erro: "ID de cupom inválido" });
    }

    const existente = await cupomRepository.buscarCupomPorId(Number(id));
    if (!existente) {
      return res.status(404).json({ erro: "Cupom não encontrado" });
    }

    if (!existente.ativo) {
      return res.status(400).json({ erro: "Cupom já está desativado" });
    }

    await cupomService.removerCupom(Number(id));

    console.log("Cupom desativado", { cupomId: id, codigo: existente.codigo, adminId: req.usuario?.id });

    return res.json({ sucesso: true, mensagem: "Cupom desativado com sucesso" });
  } catch (error) {
    console.error("Erro ao remover cupom:", error);
    return res.status(500).json({ erro: "Erro ao remover cupom" });
  }
}

export async function validarCupom(req, res) {
  try {
    const { codigo, valorPedido } = req.body;

    if (!codigo || typeof codigo !== "string" || codigo.trim().length === 0) {
      return res.status(400).json({ valido: false, erro: "Código de cupom é obrigatório" });
    }

    if (!Number.isFinite(Number(valorPedido)) || Number(valorPedido) <= 0) {
      return res.status(400).json({ valido: false, erro: "Valor do pedido deve ser um número positivo" });
    }

    try {
      const resultado = await cupomService.validarCupom(codigo.trim().toUpperCase(), Number(valorPedido));

      console.log("Cupom validado com sucesso", { codigo: codigo.toUpperCase(), valorPedido });

      return res.json({
        valido: true,
        cupom: resultado.cupom,
        desconto: resultado.desconto,
        totalFinal: resultado.totalFinal
      });
    } catch (err) {
      console.warn("Validação de cupom falhou", { codigo: codigo.toUpperCase(), erro: err?.message });
      return res.status(400).json({ valido: false, erro: err?.message || "Cupom inválido" });
    }
  } catch (error) {
    console.error("Erro ao validar cupom:", error);
    return res.status(500).json({ valido: false, erro: "Erro ao validar cupom" });
  }
}