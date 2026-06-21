import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import pedidoRoutes from "./routes/pedidoRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import pagamentoRoutes from "./routes/pagamentoRoutes.js";

import enderecoRoutes from "./routes/enderecoRoutes.js";
import pedidoItemRoutes from "./routes/pedidoItemRoutes.js";
import webhookRoutes from "./routes/webhookRoutes.js";
import produtoRoutes from "./routes/produtoRoutes.js";
import cupomRoutes from "./routes/cupomRoutes.js";


dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);

app.use("/usuario", usuarioRoutes);

app.use("/pedido", pedidoRoutes);

app.use("/dashboard", dashboardRoutes);

app.use("/pagamento", pagamentoRoutes);

app.use("/endereco", enderecoRoutes);

app.use("/pedido-item", pedidoItemRoutes);

app.use("/webhook", webhookRoutes);

app.use("/produto", produtoRoutes);

app.use("/cupom", cupomRoutes);

app.get("/", (req, res) => {

  res.json({
    nome: "Delivery Online",
    status: "online"
  });

});

app.use((err, req, res, next) => {

  console.error(err);

  res.status(500).json({
    erro: "Erro interno do servidor"
  });

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log(
    `Servidor rodando na porta ${PORT}`
  );

});