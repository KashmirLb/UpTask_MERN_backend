import express from 'express'
import { registrar, autenticar, confirmar, olvidePassword, comprobarToken, nuevoPassword, perfil } from '../controllers/usuariosController.js'
import checkAuth from '../middleware/checkAuth.js'
const router = express.Router()

//Autenticación, Registro y Confirmación de usuarios

router.post("/", registrar) //crear un usuario
router.post("/login", autenticar) //login 
router.get("/confirmar/:token", confirmar)
router.post("/olvide-password", olvidePassword)
router.get("/olvide-password/:token", comprobarToken)
router.post("/olvide-password/:token", nuevoPassword)

router.get("/perfil", checkAuth, perfil)

export default router