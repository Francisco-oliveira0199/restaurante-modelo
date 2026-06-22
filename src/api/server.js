import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import compression from "compression";

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

app.use(helmet());
app.use(compression());

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: Number(process.env.RATE_LIMIT_MAX) || 100, 
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

const originsEnv = process.env.FRONTEND_ORIGINS || process.env.FRONTEND_ORIGIN || "";
let corsOptions;
if (!originsEnv || originsEnv === "*") {
  
  corsOptions = {};
} else {
  const origins = originsEnv.split(",").map(s => s.trim()).filter(Boolean);
  corsOptions = {
    origin: function (origin, callback) {
      
      if (!origin) return callback(null, true);
      if (origins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed for origin: " + origin));
      }
    }
  };
}
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
    status: "online",
    env: process.env.NODE_ENV || "development"
  });
});

app.use((req, res, next) => {
  res.status(404).json({ erro: "Rota não encontrada" });
});

app.use((err, req, res, next) => {
  console.error(err && err.stack ? err.stack : err);
  
  if (err && err.message && err.message.indexOf("CORS") !== -1) {
    return res.status(403).json({ erro: err.message });
  }
  res.status(err?.status || 500).json({
    erro: err?.message || "Erro interno do servidor"
  });
});

if (!process.env.DATABASE_URL) {
  console.warn("Atenção: DATABASE_URL não definida. Verifique seu .env");
}
if (!process.env.JWT_SECRET) {
  console.warn("Atenção: JWT_SECRET não definida. Tokens JWT não serão seguros.");
}

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

function shutdown(signal) {
  console.log(`Recebido ${signal}. Finalizando servidor...`);
  server.close(() => {
    console.log("Servidor finalizado.");
    process.exit(0);
  });

  setTimeout(() => {
    console.error("Forçando encerramento após timeout");
    process.exit(1);
  }, 10000);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  shutdown("uncaughtException");
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});