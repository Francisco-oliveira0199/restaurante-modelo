import { pool } from "../database/db.js";

import bcrypt from "bcrypt";

import jwt from "jsonwebtoken";

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

    const usuarioExistente =
      await pool.query(
        `
        SELECT id
        FROM usuarios
        WHERE email = $1
        `,
        [email]
      );

    if (
      usuarioExistente.rows.length
    ) {

      return res.status(400).json({
        erro: "E-mail já cadastrado"
      });

    }

    const senhaHash =
      await bcrypt.hash(
        senha,
        10
      );

    const result =
      await pool.query(
        `
        INSERT INTO usuarios
        (
          nome,
          email,
          senha
        )
        VALUES
        ($1,$2,$3)
        RETURNING
        id,
        nome,
        email,
        tipo
        `,
        [
          nome,
          email,
          senhaHash
        ]
      );

    res.status(201).json({
      mensagem:
        "Conta criada com sucesso",
      usuario:
        result.rows[0]
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      erro: "Erro ao registrar"
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

    const result =
      await pool.query(
        `
        SELECT *
        FROM usuarios
        WHERE email = $1
        `,
        [email]
      );

    const usuario =
      result.rows[0];

    if (!usuario) {

      return res.status(401).json({
        erro: "Usuário não encontrado"
      });

    }

    const senhaValida =
      await bcrypt.compare(
        senha,
        usuario.senha
      );

    if (!senhaValida) {

      return res.status(401).json({
        erro: "Senha inválida"
      });

    }

    const token =
      jwt.sign(
        {
          id: usuario.id,
          tipo: usuario.tipo
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d"
        }
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

    console.error(error);

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

    const result =
      await pool.query(
        `
        SELECT
          id,
          nome,
          email,
          tipo
        FROM usuarios
        WHERE id = $1
        `,
        [req.usuario.id]
      );

    res.json(
      result.rows[0]
    );

  } catch (error) {

    console.error(error);

    res.status(500).json({
      erro: "Erro ao buscar usuário"
    });

  }

}
