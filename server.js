const fastify = require("fastify")({logger:true})
const fastifyCors = require('fastify-cors');

const PORT =5000
const HOST = "0.0.0.0"

fastify.register(require("fastify-swagger"),{
    exposeRoute:true,
    routePrefix:"/docs",
    swagger:{
        info:{title:"打卡系統API"},
    },
})
fastify.register(fastifyCors,{
    origin: ['*'],
    methods: ['GET', 'POST', 'PUT'],
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