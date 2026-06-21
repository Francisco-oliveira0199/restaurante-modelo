import passport from "passport";

import { Strategy as GoogleStrategy }
from "passport-google-oauth20";

import { pool }
from "../database/db.js";

import { gerarToken }
from "../services/authService.js";

passport.use(

  new GoogleStrategy(

    {
      clientID:
        process.env.GOOGLE_CLIENT_ID,

      clientSecret:
        process.env.GOOGLE_CLIENT_SECRET,

      callbackURL:
        process.env.GOOGLE_CALLBACK_URL

    },

    async (
      accessToken,
      refreshToken,
      profile,
      done
    ) => {

      try {

        const email =
          profile.emails?.[0]?.value;

        const googleId =
          profile.id;

        const nome =
          profile.displayName;

        const usuarioExistente =
          await pool.query(
            `
            SELECT *
            FROM usuarios
            WHERE email = $1
            `,
            [email]
          );

        let usuario;

        if (
          usuarioExistente.rows.length > 0
        ) {

          usuario =
            usuarioExistente.rows[0];

          if (
            !usuario.google_id
          ) {

            const atualizado =
              await pool.query(
                `
                UPDATE usuarios
                SET google_id = $1
                WHERE id = $2
                RETURNING *
                `,
                [
                  googleId,
                  usuario.id
                ]
              );

            usuario =
              atualizado.rows[0];

          }

        }

        else {

          const novoUsuario =
            await pool.query(
              `
              INSERT INTO usuarios
              (
                nome,
                email,
                google_id,
                tipo
              )
              VALUES
              (
                $1,
                $2,
                $3,
                'CLIENTE'
              )
              RETURNING *
              `,
              [
                nome,
                email,
                googleId
              ]
            );

          usuario =
            novoUsuario.rows[0];

        }

        const token =
          gerarToken(usuario);

        done(
          null,
          {
            ...usuario,
            token
          }
        );

      }

      catch (error) {

        console.error(
          "Erro Google Auth:",
          error
        );

        done(error, null);

      }

    }

  )

);

export default passport;