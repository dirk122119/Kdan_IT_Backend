const fastify = require("fastify")({logger:true})
const PORT =5001
const HOST = "0.0.0.0"

fastify.register(require("fastify-swagger"),{
    exposeRoute:true,
    routePrefix:"/docs",
    swagger:{
        info:{title:"member-api"},
    },
})
fastify.register(require('./routers/members'))


const start = async()=>{
    try {
        await fastify.listen(PORT,HOST)
    } catch(error){
        fastify.log.error(error)
        process.exit(1)
    }
}

start()