import * as cupomRepository from "../repositories/cupomRepository.js";

export async function criarCupom(
  dados
) {

  return await cupomRepository.criarCupom(
    dados
  );

}

export async function listarCupons() {

  return await cupomRepository.listarCupons();

}

export async function validarCupom(
  codigo,
  valorPedido
) {

  const cupom =
    await cupomRepository
      .buscarCupomPorCodigo(
        codigo
      );

  if (!cupom) {

    throw new Error(
      "Cupom não encontrado"
    );

  }

  if (!cupom.ativo) {

    throw new Error(
      "Cupom desativado"
    );

  }

  if (
    cupom.validade &&
    new Date(cupom.validade)
    <
    new Date()
  ) {

    throw new Error(
      "Cupom expirado"
    );

  }

  if (
    cupom.valor_minimo &&
    Number(valorPedido)
    <
    Number(cupom.valor_minimo)
  ) {

    throw new Error(
      `Pedido mínimo de R$ ${cupom.valor_minimo}`
    );

  }

  let desconto = 0;

  if (
    cupom.tipo === "PORCENTAGEM"
  ) {

    desconto =
      Number(valorPedido)
      *
      (
        Number(cupom.desconto)
        / 100
      );

  } else {

    desconto =
      Number(cupom.desconto);

  }

  return {

    cupom,

    desconto,

    totalFinal:
      Number(valorPedido)
      - desconto

  };

}

export async function atualizarCupom(
  id,
  dados
) {

  return await cupomRepository.atualizarCupom(
    id,
    dados
  );

}

export async function removerCupom(
  id
) {

  await cupomRepository.desativarCupom(
    id
  );

}