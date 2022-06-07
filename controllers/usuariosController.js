import Usuario from '../models/Usuario.js'
import generarId from '../helpers/generarId.js'
import generarJWT from '../helpers/generarJWT.js'
import { emailRegistro, emailOlvidePassword } from '../helpers/emails.js'

const registrar = async (req, res) => {

    // Evitar registros duplicados

    const { email } = req.body

    const existeUsuario = await Usuario.findOne({email})
    
    if(existeUsuario) {
        const error = new Error('Usuario ya está registrado')
        return res.status(400).json({msg: error.message})
    }

    try {
        const usuario = new Usuario(req.body)
        usuario.token = generarId();
        await usuario.save()

        // Enviar email de confirmación
        emailRegistro({
            email: usuario.email,
            nombre: usuario.nombre,
            token: usuario.token
        })

        res.json({msg: "Usuario creado correctamente. \nComprueba tu correo para activar tu cuenta."})

    } catch (error) {
        console.log(error)
    }
}

const autenticar =  async (req, res) => {

    const { email, password } = req.body

    //Comprobar si existe
    const usuario = await Usuario.findOne({email})

    if(!usuario){
        const error = new Error("El usuario no existe")
        return res.status(400).json({msg: error.message})
    }

    //Comprobar si está confirmado

    if(!usuario.confirmado){
        const error = new Error("Tu cuenta no ha sido confirmada")
        return res.status(400).json({msg: error.message})
    }
    //Comprobar password

    if( await usuario.comprobarPassword(password)){
        res.json({
            _id: usuario._id,
            nombre: usuario.nombre,
            email: usuario.email,
            token: generarJWT(usuario._id)
        })
    }
    else{
        const error = new Error("Password incorrecto")
        return res.status(400).json({msg: error.message})
    }
}

const confirmar = async (req, res) => {

    const { token } = req.params
    const usuarioConfirmar = await Usuario.findOne({ token })

    if(!usuarioConfirmar){
        const error = new Error("Token no valido")
        return res.status(400).json({msg: error.message})
    }
    
    try {
        usuarioConfirmar.confirmado = true
        usuarioConfirmar.token = ''
        await usuarioConfirmar.save();
        res.json({msg: "Usuario confirmado correctamente"})

    } catch (error) {
        console.log(error)
    }
}

const olvidePassword = async (req, res) => {

    const { email } = req.body

    const existeUsuario = await Usuario.findOne({email})
    
    if(!existeUsuario) {
        const error = new Error('Usuario no existe')
        return res.status(400).json({msg: error.message})
    }

    try {
        existeUsuario.token = generarId()
        await existeUsuario.save()

        emailOlvidePassword({
            email: existeUsuario.email,
            nombre: existeUsuario.nombre,
            token: existeUsuario.token
        })

        res.json({"msg": "Hemos enviado un e-mail con instrucciones"})
    } catch (error) {
        console.log(error)
    }
}

const comprobarToken = async (req, res) => {

    const { token } = req.params
    
    const tokenValido = await Usuario.findOne({ token })

    if(!tokenValido){
        const error = new Error("Token no válido")
        return res.status(400).json({msg: error.message})
    }
    else{
        res.json({"msg": "Token es valido"})
    }
}

const nuevoPassword = async (req, res) => {

    const { token } = req.params;
    const { password } = req.body;

    const usuario = await Usuario.findOne({ token })

    if(usuario){
        usuario.password = password
        usuario.token = ''
        
        try {
            await usuario.save()
            res.json({ msg: "Password modificado correctamente"})
        } catch (error) {
            console.log(error)
        }
    }
    else{
        const error = new Error("Token no válido")
        return res.status(400).json({msg: error.message})
    }
}

const perfil = async (req, res) => {
     const { usuario } = req
     res.json(usuario)
}

export {
    registrar, 
    autenticar,
    confirmar,
    olvidePassword,
    comprobarToken,
    nuevoPassword,
    perfil
}