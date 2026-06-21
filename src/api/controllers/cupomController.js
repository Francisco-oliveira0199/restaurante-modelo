import * as cupomService
from "../services/cupomService.js";

export async function criarCupom(
  req,
  res
) {

  try {

    const cupom =
      await cupomService.criarCupom(
        req.body
      );

    res.status(201).json(
      cupom
    );

  } catch (error) {

    console.error(error);

    res.status(500).json({
      erro:
        "Erro ao criar cupom"
    });

  }

}

export async function listarCupons(
  req,
  res
) {

  try {

    const cupons =
      await cupomService.listarCupons();

    res.json(cupons);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      erro:
        "Erro ao listar cupons"
    });

  }

}

export async function validarCupom(
  req,
  res
) {

  try {

    const {
      codigo,
      valorPedido
    } = req.body;

    const resultado =
      await cupomService.validarCupom(
        codigo,
        valorPedido
      );

    res.json(resultado);

  } catch (error) {

    res.status(400).json({
      erro: error.message
    });

  }

}

export async function atualizarCupom(
  req,
  res
) {

  try {

    const cupom =
      await cupomService.atualizarCupom(
        req.params.id,
        req.body
      );

    res.json(cupom);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      erro:
        "Erro ao atualizar cupom"
    });

  }

}

export async function removerCupom(
  req,
  res
) {

  try {

    await cupomService.removerCupom(
      req.params.id
    );

    res.json({
      sucesso: true
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      erro:
        "Erro ao remover cupom"
    });

  }

}