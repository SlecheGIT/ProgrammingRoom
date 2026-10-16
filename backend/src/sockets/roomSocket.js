const { activeRooms } = require('../store')

module.exports = (io) => {
    io.on('connection', (socket) => {

        socket.on('join_room', (data) => {
            const { roomId, userId, userName, role } = data

            if (role === 'teacher') {
                if (!activeRooms.has(roomId) || activeRooms.get(roomId) !== userId) {
                    return socket.emit('room_closed')
                }
            } else {
                if (!activeRooms.has(roomId)) {
                    return socket.emit('room_closed')
                }
            }

            socket.roomId = roomId
            socket.userId = userId
            socket.userName = userName
            socket.role = role
            socket.join(roomId)
            
            socket.emit('room_joined')
            
            const connectedSockets = io.sockets.adapter.rooms.get(roomId)
            const currentStudents = []
            if (connectedSockets) {
                for (const clientId of connectedSockets) {
                    const clientSocket = io.sockets.sockets.get(clientId)
                    if (clientSocket && clientSocket.role === 'student' && clientSocket.userId !== userId) {
                        currentStudents.push({ userId: clientSocket.userId, userName: clientSocket.userName })
                    }
                }
            }
            socket.emit('sync_students', currentStudents)
            
            if (role === 'teacher') {
                socket.to(roomId).emit('request_code_sync')
            } else if (role === 'student') {
                socket.to(roomId).emit('user_joined', { userId, userName })
            }
        })

        socket.on('code_change', (data) => {
            socket.to(data.roomId).emit('code_update', { userId: data.userId, code: data.code, language: data.language })
        })

        socket.on('student_status', (data) => {
            socket.to(data.roomId).emit('status_update', { userId: data.userId, status: data.status })
        })

        socket.on('teacher_code_change', (data) => {
            socket.to(data.roomId).emit('force_code_update', { userId: data.userId, code: data.code })
        })

        socket.on('teacher_cursor', (data) => {
            socket.to(data.roomId).emit('teacher_cursor_moved', { targetUserId: data.userId, position: data.position })
        })

        socket.on('broadcast_code', (data) => {
            socket.to(data.roomId).emit('blackboard_update', { code: data.code, language: data.language })
        })

        socket.on('disconnect', () => {
            if (socket.roomId && socket.userId) {
                if (socket.role === 'teacher' && activeRooms.get(socket.roomId) === socket.userId) {
                    setTimeout(() => {
                        const connectedSockets = io.sockets.adapter.rooms.get(socket.roomId)
                        let hasTeacher = false
                        if (connectedSockets) {
                            for (const clientId of connectedSockets) {
                                const clientSocket = io.sockets.sockets.get(clientId)
                                if (clientSocket && clientSocket.role === 'teacher') {
                                    hasTeacher = true
                                    break
                                }
                            }
                        }
                        if (!hasTeacher) {
                            activeRooms.delete(socket.roomId)
                            io.to(socket.roomId).emit('room_closed')
                        }
                    }, 5000)
                } else {
                    io.to(socket.roomId).emit('user_left', { userId: socket.userId })
                }
            }
        })

    })
}
