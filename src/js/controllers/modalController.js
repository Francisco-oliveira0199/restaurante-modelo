// src/api/controllers/modalController.js
// Controller server-side para funcionalidades relacionadas a "modal".
// No frontend esse módulo abre modais e interage com o DOM — aqui oferecemos
// apenas helpers e endpoints úteis ao backend (cálculo de preço a partir de
// uma configuração enviada pelo cliente, validação e montagem de objetos de item).

import { formatarPreco } from "../../api/utils/helpers.js";

/**
 * Calcula o preço unitário com base em uma configuração enviada pelo cliente.
 * A configuração é um objeto que pode conter:
 * - precoBase: number
 * - extras: array of { price?: number, quantidade?: number }
 * - priceInputs: array of numbers (valores adicionais vindos de inputs)
 * - outras propriedades numéricas opcionais
 *
 * Retorna um number (preço calculado).
 */
export function calcularPrecoUnitario(precoBase = 0, config = {}) {
  let preco = Number(precoBase) || 0;

  try {
    if (Array.isArray(config.extras)) {
      for (const ex of config.extras) {
        const p = Number((ex && (ex.price ?? ex.preco)) || 0);
        const q = Number((ex && (ex.quantidade ?? ex.qtd)) || 1);
        if (!Number.isNaN(p) && !Number.isNaN(q)) preco += p * q;
      }
    }

    if (Array.isArray(config.priceInputs)) {
      for (const v of config.priceInputs) {
        const n = Number(v || 0);
        if (!Number.isNaN(n)) preco += n;
      }
    }

    // Permitimos propriedades numéricas arbitrárias (ex.: additional)
    if (config.additional && typeof config.additional === "object") {
      Object.values(config.additional).forEach((val) => {
        const n = Number(val || 0);
        if (!Number.isNaN(n)) preco += n;
      });
    }
  } catch (err) {
    // Não falhar: retornamos o cálculo parcial
    console.warn("calcularPrecoUnitario: erro ao processar config:", err && err.message);
  }

  return preco;
}

/**
 * Monta um objeto de item a partir da configuração enviada pelo cliente (payload do modal)
 * Ex.: {
 *   nome: "Pizza Margherita",
 *   quantidade: 2,
 *   precoBase: 45,
 *   sabor1: "margherita",
 *   extras: [{ name: 'bacon', price: 5 }],
 *   priceInputs: [2.5]
 * }
 *
 * Retorna um item normalizado: { nome, quantidade, precoUnitario, total, config }
 */
export function montarItemDoModal(payload = {}) {
  const nome = String(payload.nome || payload.titulo || "");
  const quantidade = Math.max(1, Number(payload.quantidade || payload.qty || 1));
  const precoBase = Number(payload.precoBase ?? payload.preco ?? 0) || 0;

  const itemConfig = {
    sabor1: payload.sabor1 ?? payload.sabor ?? null,
    sabor2: payload.sabor2 ?? null,
    meioMeio: !!payload.meioMeio,
    borda: payload.borda ?? null,
    bebida: payload.bebida ?? null,
    ponto: payload.ponto ?? null,
    massa: payload.massa ?? null,
    extras: Array.isArray(payload.extras) ? payload.extras : (payload.extras ? [payload.extras] : []),
    observacoes: payload.observacoes ?? payload.obs ?? ""
  };

  const precoUnitario = calcularPrecoUnitario(precoBase, {
    extras: itemConfig.extras,
    priceInputs: payload.priceInputs || payload.inputs || []
  });

  const total = precoUnitario * quantidade;

  return {
    nome,
    quantidade,
    precoUnitario,
    total,
    config: itemConfig
  };
}

/**
 * Valida um payload de configuração básico. Não é validação completa —
 * serve para filtrar entradas inválidas antes de processar/calcular.
 */
export function validarPayloadModal(payload = {}) {
  if (!payload) return { valid: false, reason: "Payload ausente" };
  if (!payload.nome && !payload.titulo) return { valid: false, reason: "Nome do item ausente" };
  if (payload.quantidade && (Number.isNaN(Number(payload.quantidade)) || Number(payload.quantidade) < 1)) {
    return { valid: false, reason: "Quantidade inválida" };
  }
  return { valid: true };
}

/**
 * Express handler: calcula preço unitário e total a partir de um body JSON.
 * Body esperado: { precoBase, quantidade, extras, priceInputs, ... }
 */
export async function calcularPrecoHandler(req, res) {
  try {
    const payload = req.body || {};

    const valid = validarPayloadModal(payload);
    if (!valid.valid) return res.status(400).json({ erro: valid.reason });

    const item = montarItemDoModal(payload);

    return res.json({ ok: true, item, precoFormatado: formatarPreco(item.total) });
  } catch (err) {
    console.error("calcularPrecoHandler erro:", err && err.stack ? err.stack : err);
    return res.status(500).json({ erro: "Erro ao calcular preço" });
  }
}

/**
 * Express handler: monta o item e (opcional) retorna para o cliente.
 * Body: { itemPayload } ou diretamente o payload do item no body.
 */
export async function montarItemHandler(req, res) {
  try {
    const payload = req.body?.item || req.body || {};

    const valid = validarPayloadModal(payload);
    if (!valid.valid) return res.status(400).json({ erro: valid.reason });

    const item = montarItemDoModal(payload);

    return res.json({ ok: true, item });
  } catch (err) {
    console.error("montarItemHandler erro:", err && err.stack ? err.stack : err);
    return res.status(500).json({ erro: "Erro ao montar item" });
  }
}

export default {
  calcularPrecoUnitario,
  montarItemDoModal,
  validarPayloadModal,
  calcularPrecoHandler,
  montarItemHandler
};