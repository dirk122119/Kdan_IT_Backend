const fastify = require("fastify")({logger:true})
const PORT =5000

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
        await fastify.listen(PORT,"127.0.0.1")
    } catch(error){
        fastify.log.error(error)
        process.exit(1)
    }
}

start()