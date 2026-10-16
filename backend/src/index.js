const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./database/models'); 

const app = express();

app.use(cors()); 
app.use(express.json()); 

const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

const roomRoutes = require('./routes/roomRoutes')
app.use('/api/rooms', roomRoutes)

app.get('/teste', (req, res) => {
    res.json({ mensagem: 'O Servidor Express esta vivo e respirando!' })
})

const http = require('http')
const { Server } = require('socket.io')

const PORT = process.env.PORT || 3000

const server = http.createServer(app)
const io = new Server(server, {
    cors: { origin: '*' }
})

require('./sockets/roomSocket')(io)

db.sequelize.authenticate()
    .then(() => {
        console.log('Conexao com o Banco de Dados (Sequelize) estabelecida com sucesso!')
        
        server.listen(PORT, () => {
            console.log(`Servidor rodando na porta ${PORT}`)
        })
    })
    .catch((erro) => {
        console.error('Falha catastrofica ao conectar com o banco:', erro)
    })