import Proyecto from '../models/Proyecto.js'
import Usuario from '../models/Usuario.js'
import Tarea from '../models/Tarea.js'

const obtenerProyectos = async (req, res) => {

    const proyectos  = await Proyecto.find({
        $or : [
            {'colaboradores' : { $in: req.usuario} },
            {'creador' : { $in: req.usuario} }
        ]
    })
    .select("-tareas")

    res.json(proyectos)
}

const crearProyecto = async (req, res) => {
    const proyecto = new Proyecto(req.body)
    proyecto.creador = req.usuario._id

    try{
        const proyectoAlmacenado = await proyecto.save()
        res.json(proyectoAlmacenado)
    }
    catch(error){
        console.log(error)
    }
}

const obtenerProyecto = async (req, res) => {

   const { id } = req.params;
   
   try{
       const proyecto = await Proyecto.findById(id).populate({ path: "tareas", populate: {path: "completado", select: "nombre"}}).populate('colaboradores', 'nombre email')
       
       if(!proyecto){
            const error = new Error("No encontrado")
            return res.status(404).json({msg: error.message})
       }

       if(proyecto.creador.toString() !== req.usuario._id.toString() && !proyecto.colaboradores.some( colaborador => colaborador._id.toString() === req.usuario._id.toString())){
            const error = new Error("No tiene acceso al proyecto")
            return res.status(403).json({msg: error.message})
       }

       res.json(proyecto)

   }catch(r){
        const error = new Error("ID incorrecto obteniendo")
        return res.status(401).json({msg: error.message})
   }
}

const editarProyecto = async (req, res) => {

    const { id } = req.params;
   
   try{
       const proyecto = await Proyecto.findById(id)
       
       if(!proyecto){
            const error = new Error("No encontrado")
            return res.status(404).json({msg: error.message})
       }

       if(proyecto.creador.toString() !== req.usuario._id.toString()){

            const error = new Error("No tiene acceso al proyecto")
            return res.status(403).json({msg: error.message})
       }
       
       proyecto.nombre = req.body.nombre || proyecto.nombre
       proyecto.descripcion = req.body.descripcion || proyecto.descripcion
       proyecto.fechaEntrega = req.body.fechaEntrega || proyecto.fechaEntrega
       proyecto.cliente = req.body.cliente || proyecto.cliente

       const proyectoAlmacenado = await proyecto.save()
       res.json(proyectoAlmacenado)

   }catch(r){
        const error = new Error("ID incorrecto editando")
        return res.status(401).json({msg: error.message})
   }
}

const eliminarProyecto = async (req, res) => {

    const { id } = req.params;
   
    try{
        const proyecto = await Proyecto.findById(id)
        
        if(!proyecto){
             const error = new Error("No encontrado")
             return res.status(404).json({msg: error.message})
        }
 
        if(proyecto.creador.toString() !== req.usuario._id.toString()){
 
             const error = new Error("No tiene acceso al proyecto")
             return res.status(403).json({msg: error.message})
        }

        await proyecto.deleteOne()
        res.json({ msg: "Proyecto eliminado"})
 
    }catch(r){
         const error = new Error("ID incorrecto eliminando")
         return res.status(401).json({msg: error.message})
    }
}

const buscarColaborador = async (req, res) => {

    const { email } = req.body

    const usuario = await Usuario.findOne({email}).select("-confirmado -createdAt -password -token -updatedAt -__v")

    if(!usuario){
        const error = new Error("Usuario no encontrado")
        return res.status(404).json({msg: error.message})
    }

    res.json(usuario)
}

const agregarColaborador = async (req, res) => {
    
    const proyecto = await Proyecto.findById(req.params.id)

    if(!proyecto){
        const error = new Error("Proyecto No Encontrado")
        return res.status(404).json({msg : error.message})
    }

    if(proyecto.creador.toString() !== req.usuario._id.toString()){
        const error = new Error("Acción no válida")
        return res.status(404).json({msg : error.message})
    }

    const { email } = req.body

    const usuario = await Usuario.findOne({email}).select("-confirmado -createdAt -password -token -updatedAt -__v")

    if(!usuario){
        const error = new Error("Usuario no encontrado")
        return res.status(404).json({msg: error.message})
    }

    // Comprobar que el colaborador no es el creador del proyecto
    if(proyecto.creador.toString() === usuario._id.toString() ){
        const error = new Error("El creador no puede ser colaborador")
        return res.status(404).json({msg: error.message})
    }

    // Comprobar que no sea ya parte del proyecto
    if(proyecto.colaboradores.includes(usuario._id)){
        const error = new Error("Este usuario ya pertenece al proyecto")
        return res.status(404).json({msg: error.message})
    }

    // Todo OK para agregar

    proyecto.colaboradores.push(usuario._id)
    await proyecto.save()

    res.json({msg: "Colaborador agregado correctamente"})
}

const eliminarColaborador = async (req, res) => {

    const proyecto = await Proyecto.findById(req.params.id)

    if(!proyecto){
        const error = new Error("Proyecto No Encontrado")
        return res.status(404).json({msg : error.message})
    }

    if(proyecto.creador.toString() !== req.usuario._id.toString()){
        const error = new Error("Acción no válida")
        return res.status(404).json({msg : error.message})
    }

    //eliminando colaborador
    proyecto.colaboradores.pull(req.body.id)
    await proyecto.save()
    res.json({msg: "Colaborador eliminado correctamente"})

}

export {
    obtenerProyectos,
    crearProyecto,
    obtenerProyecto, 
    editarProyecto,
    eliminarProyecto,
    buscarColaborador,
    agregarColaborador,
    eliminarColaborador
}
