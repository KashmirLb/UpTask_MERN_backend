import nodemailer from 'nodemailer'

export const emailRegistro = async (datos) => {

    const { nombre, email, token } = datos

    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      //Información del email

      const info = await transport.sendMail({
          from: '"UpTask - Administrador de Proyectos" <cuentas@uptask.com',
          to: email,
          subject: "UpTask - Confirma tu cuenta",
          text: "Comprueba tu cuenta en UpTask",
          html: `
                <p>Hola ${nombre}, </p>
                <p>Confirma tu cuenta en UpTask</p>
                <p>Tu cuenta ya está casi lista, solo debes activarla en el siguiente enlace:</p>
                <a href="${process.env.FRONTEND_URL}/confirmar/${token}">Activar Cuenta</a>
                <p> Si no creaste esta cuenta, puedes ignorar este mensaje</p>
          `
      })
}

export const emailOlvidePassword = async (datos) => {

    const { nombre, email, token } = datos

    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      //Información del email

      const info = await transport.sendMail({
        from: '"UpTask - Administrador de Proyectos" <cuentas@uptask.com',
        to: email,
        subject: "UpTask - Reestablece tu password",
        text: "Reestablece tu password para UpTask",
        html: `
              <p>Hola ${nombre}, </p>
              <p>Has solicitado reestablecer tu password</p>
              <p>Sigue el siguiente enlace para generar uno nuevo:</p>
              <a href="${process.env.FRONTEND_URL}/olvide-password/${token}">Reestablecer Password</a>
              <p> Si no solicitaste este e-mail, puedes ignorar este mensaje</p>
        `
      })
}