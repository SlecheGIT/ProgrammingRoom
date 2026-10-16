const roomService = require('../services/roomService')

const create = async (req, res) => {
    try {
        const { name, userId } = req.body
        if (!name || !userId) {
            return res.status(400).json({ erro: 'Os campos name e userId sao obrigatorios' })
        }
        const sala = await roomService.createRoom(name, userId)
        return res.status(201).json(sala)
    } catch (error) {
        return res.status(500).json({ erro: error.message })
    }
}

const join = async (req, res) => {
    try {
        const { accessCode, userId } = req.body
        if (!accessCode || !userId) {
            return res.status(400).json({ erro: 'Os campos accessCode e userId sao obrigatorios' })
        }
        const resultado = await roomService.joinRoom(accessCode, userId)
        return res.status(200).json(resultado)
    } catch (error) {
        return res.status(400).json({ erro: error.message })
    }
}

const leave = async (req, res) => {
    try {
        const { id } = req.params
        const { userId } = req.body
        if (!userId) {
            return res.status(400).json({ erro: 'O campo userId eh obrigatorio' })
        }
        const resultado = await roomService.leaveRoom(id, userId)
        return res.status(200).json(resultado)
    } catch (error) {
        return res.status(400).json({ erro: error.message })
    }
}

module.exports = { create, join, leave }
