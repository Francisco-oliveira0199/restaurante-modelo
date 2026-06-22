import { pool } from "../database/db.js";
import * as authService from "../services/authService.js";

function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export async function registrar(
  req,
  res
) {

  try {

    const {
      nome,
      email,
      senha
    } = req.body;

    if (!nome || typeof nome !== "string" || nome.trim().length === 0) {
      return res.status(400).json({
        erro: "Nome é obrigatório e deve ser uma string não-vazia"
      });
    }

    if (!email || typeof email !== "string" || !validarEmail(email)) {
      return res.status(400).json({
        erro: "Email é obrigatório e deve ser um email válido"
      });
    }

    if (!senha || typeof senha !== "string" || senha.length < 6) {
      return res.status(400).json({
        erro: "Senha é obrigatória e deve ter no mínimo 6 caracteres"
      });
    }

    const nomeSanitizado = nome.trim();
    const emailSanitizado = email.toLowerCase().trim();

    const usuarioExistente =
      await pool.query(
        `
        SELECT id
        FROM usuarios
        WHERE LOWER(email) = $1
        `,
        [emailSanitizado]
      );

    if (
      usuarioExistente.rows.length
    ) {

      return res.status(409).json({
        erro: "Email já cadastrado"
      });

    }

    const senhaHash =
      await authService.gerarHash(
        senha
      );

    const result =
      await pool.query(
        `
        INSERT INTO usuarios
        (
          nome,
          email,
          senha,
          tipo
        )
        VALUES
        ($1,$2,$3,$4)
        RETURNING
        id,
        nome,
        email,
        tipo,
        criado_em
        `,
        [
          nomeSanitizado,
          emailSanitizado,
          senhaHash,
          "CLIENTE"
        ]
      );

    const usuario = result.rows[0];

    console.log(
      "Novo usuário registrado",
      { usuarioId: usuario.id, email: usuario.email }
    );

    res.status(201).json({
      mensagem:
        "Conta criada com sucesso",
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo
      }
    });

  } catch (error) {

    console.error("Erro ao registrar:", error);

    res.status(500).json({
      erro: "Erro ao registrar usuário"
    });

  }

}

export async function login(
  req,
  res
) {

  try {

    const {
      email,
      senha
    } = req.body;

    if (!email || typeof email !== "string" || !validarEmail(email)) {
      return res.status(400).json({
        erro: "Email é obrigatório e deve ser um email válido"
      });
    }

    if (!senha || typeof senha !== "string" || senha.length === 0) {
      return res.status(400).json({
        erro: "Senha é obrigatória"
      });
    }

    const emailSanitizado = email.toLowerCase().trim();

    const result =
      await pool.query(
        `
        SELECT *
        FROM usuarios
        WHERE LOWER(email) = $1
        `,
        [emailSanitizado]
      );

    const usuario =
      result.rows[0];

    if (!usuario) {

      console.warn(
        "Tentativa de login com email não encontrado",
        { email: emailSanitizado, ip: req.ip }
      );

      return res.status(401).json({
        erro: "Email ou senha inválidos"
      });

    }

    const senhaValida =
      await authService.validarSenha(
        senha,
        usuario.senha
      );

    if (!senhaValida) {

      console.warn(
        "Tentativa de login com senha incorreta",
        { usuarioId: usuario.id, email: usuario.email, ip: req.ip }
      );

      return res.status(401).json({
        erro: "Email ou senha inválidos"
      });

    }

    const token =
      authService.gerarToken({
        id: usuario.id,
        email: usuario.email,
        tipo: usuario.tipo
      });

    console.log(
      "Login bem-sucedido",
      { usuarioId: usuario.id, email: usuario.email, ip: req.ip }
    );

    res.json({

      token,

      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo
      }

    });

  } catch (error) {

    console.error("Erro ao realizar login:", error);

    res.status(500).json({
      erro: "Erro ao realizar login"
    });

  }

}

export async function me(
  req,
  res
) {

  try {

    if (!req.usuario || !req.usuario.id) {
      return res.status(401).json({
        erro: "Usuário não autenticado"
      });
    }

    const result =
      await pool.query(
        `
        SELECT
          id,
          nome,
          email,
          tipo,
          criado_em
        FROM usuarios
        WHERE id = $1
        `,
        [req.usuario.id]
      );

    if (!result.rows.length) {
      return res.status(404).json({
        erro: "Usuário não encontrado"
      });
    }

    res.json(
      result.rows[0]
    );

  } catch (error) {

    console.error("Erro ao buscar usuário:", error);

    res.status(500).json({
      erro: "Erro ao buscar usuário"
    });

  }

}