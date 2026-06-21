import {
MercadoPagoConfig,
Payment
}
from "mercadopago";

import dotenv from "dotenv";

dotenv.config();

const client =
new MercadoPagoConfig({
accessToken:
process.env.MP_ACCESS_TOKEN
});

const payment =
new Payment(client);

export async function criarPix(
pedido
) {

try {

const response =
  await payment.create({

    body: {

      transaction_amount:
        Number(pedido.total),

      description:
        `Pedido #${pedido.id}`,

      payment_method_id:
        "pix",

      payer: {

        email:
          pedido.email,

        first_name:
          pedido.nome

      }

    }

  });

return {

  id:
    response.id,

  status:
    response.status,

  qrCode:
    response.point_of_interaction
      ?.transaction_data
      ?.qr_code,

  qrCodeBase64:
    response.point_of_interaction
      ?.transaction_data
      ?.qr_code_base64

};

} catch (error) {

console.error(
  "Erro ao criar PIX:",
  error
);

throw error;

}

}

export async function consultarPagamento(
paymentId
) {

try {

const response =
  await payment.get({
    id: paymentId
  });

return response;

} catch (error) {

console.error(
  "Erro ao consultar pagamento:",
  error
);

throw error;

}

}
