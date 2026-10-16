const { Room, UserInRoom } = require('../database/models')

const createRoom = async (name, ownerId) => {
    const sala = await Room.create({ name, id_owner: ownerId })
    return sala
}

const joinRoom = async (accessCode, userId) => {
    const sala = await Room.findOne({ where: { access_code: accessCode } })
    if (!sala) {
        throw new Error('Sala nao encontrada')
    }

    const jaParticipa = await UserInRoom.findOne({ where: { id_user: userId } })
    if (jaParticipa) {
        throw new Error('Voce ja esta em uma sala ativa')
    }

    const participacao = await UserInRoom.create({
        id_user: userId,
        id_room: sala.id,
        status: true,
        user_code: ''
    })

    return { sala, participacao }
}

const leaveRoom = async (roomId, ownerId) => {
    const sala = await Room.findByPk(roomId)
    if (!sala) {
        throw new Error('Sala nao encontrada')
    }
    if (sala.id_owner !== ownerId) {
        throw new Error('Apenas o dono pode fechar a sala')
    }
    await sala.destroy()
    return { mensagem: 'Sala encerrada com sucesso' }
}

module.exports = { createRoom, joinRoom, leaveRoom }
