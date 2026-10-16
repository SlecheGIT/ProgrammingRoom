import { io } from 'socket.io-client'

// conecta ao backend na porta padrao
const socket = io('http://localhost:3000', {
    autoConnect: false // a conexao sera feita apenas ao entrar na sala
})

export default socket