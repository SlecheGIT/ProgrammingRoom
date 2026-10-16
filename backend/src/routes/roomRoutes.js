const express = require('express')
const router = express.Router()
const roomController = require('../controllers/roomController')
const { activeRooms } = require('../store')

router.post('/', roomController.create)
router.post('/join', roomController.join)
router.delete('/:id', roomController.leave)

router.post('/generate', (req, res) => {
    const { userId } = req.body
    if (!userId) return res.status(400).json({ error: 'userId ausente' })
    const newCode = Math.random().toString(36).substring(2, 8).toUpperCase()
    activeRooms.set(newCode, userId)
    return res.json({ roomId: newCode })
})

router.get('/validate/:id', (req, res) => {
    if (activeRooms.has(req.params.id)) {
        return res.json({ valid: true })
    }
    return res.status(404).json({ error: 'Sala invalida ou inativa' })
})

module.exports = router
