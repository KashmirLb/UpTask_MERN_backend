import express from 'express'
import dotenv from 'dotenv';
import cors from 'cors'
import conectarDB from './config/db.js';
import usuarioRoutes from './routes/usuarioRoutes.js'
import proyectoRoutes from './routes/proyectoRoutes.js'
import tareaRoutes from './routes/tareaRoutes.js'

const app = express();

app.use(express.json())

dotenv.config()

conectarDB();

// Configurar Cors

const whitelist = [
    process.env.FRONTEND_URL
]

const corsOptions = {
    origin: function(origin, callback){
        if(whitelist.includes(origin)){

            //Tiene permisos para consultar API
            callback(null, true)

        }
        else{

            callback( new Error("Error de CORS"))
        }
    }
}

app.use(cors(corsOptions))
// Routing

app.use("/api/usuarios", usuarioRoutes)
app.use("/api/proyectos", proyectoRoutes)
app.use("/api/tareas", tareaRoutes)

const PORT = process.env.PORT || 4000

const servidor = app.listen(PORT, () => {
    console.log(`Servidor ejecutandose en port ${PORT}`)
})

//Socket.io

import { Server } from 'socket.io'

const io = new Server(servidor, {
    pingTimeout: 60000,
    cors: {
        origin: process.env.FRONTEND_URL
    }
});

io.on('connection', (socket) => {
   

    //Definir los eventos de socket io

    socket.on("abrir proyecto", proyecto => {
        socket.join(proyecto);   
     
   });

   socket.on('nueva tarea', tarea =>{
       const proyectoTarget = tarea.proyecto;
       socket.in(proyectoTarget).emit('tarea agregada', tarea);
   });

   socket.on('eliminar tarea', tarea=>{
       const proyectoTarget = tarea.proyecto;
       socket.in(proyectoTarget).emit('tarea eliminada', tarea);
   });

   socket.on('actualizar tarea', tarea=>{
       const proyectoTarget = tarea.proyecto._id

       socket.to(proyectoTarget).emit('tarea actualizada', tarea)
   });
})
