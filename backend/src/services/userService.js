const { User } = require('../database/models')
const bcrypt = require('bcryptjs')

const createUser = async (name, email, password) => {
    const exists = await User.findOne({ where: { email } })
    if (exists) throw new Error('E-mail ja cadastrado')

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const novoUsuario = await User.create({ name, email, password_hash: hashedPassword })
    return novoUsuario
}

const loginUser = async (email, password) => {
    const usuario = await User.findOne({ where: { email } })
    if (!usuario) throw new Error('Usuario nao encontrado')
    
    const isMatch = await bcrypt.compare(password, usuario.password_hash)
    if (!isMatch) {
        throw new Error('Senha invalida')
    }
    
    return usuario
}

module.exports = { createUser, loginUser }
