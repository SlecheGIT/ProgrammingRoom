const userService = require('../services/userService')

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body
        if (!name || !email || !password) {
            return res.status(400).json({ erro: 'Nome, email e senha sao obrigatorios' })
        }
        const usuario = await userService.createUser(name, email, password)
        return res.status(201).json(usuario)
    } 
    catch (error) {
        return res.status(500).json({ erro: error.message })
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email || !password) {
            return res.status(400).json({ erro: 'Email e senha sao obrigatorios' })
        }
        const usuario = await userService.loginUser(email, password)
        return res.status(200).json(usuario)
    } 
    catch (error) {
        return res.status(401).json({ erro: error.message })
    }
}

module.exports = { register, login }
