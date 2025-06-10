import { io, Socket } from 'socket.io-client'

class SocketService {
  private socket: Socket | null = null
  private wsUrl: string = ''

  async connect() {
    try {
      // Get WebSocket info from API
      const response = await fetch('/api/ws-info', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      })
      const { wsUrl, userId, token } = await response.json()
      
      this.wsUrl = wsUrl
      
      this.socket = io(wsUrl, {
        auth: {
          token,
          userId
        }
      })

      this.socket.on('connect', () => {
        console.log('Connected to WebSocket')
      })

      this.socket.on('disconnect', () => {
        console.log('Disconnected from WebSocket')
      })

      return this.socket
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error)
      throw error
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  getSocket() {
    return this.socket
  }

  emit(event: string, data: any) {
    if (this.socket) {
      this.socket.emit(event, data)
    }
  }

  on(event: string, callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on(event, callback)
    }
  }

  off(event: string, callback?: (data: any) => void) {
    if (this.socket) {
      this.socket.off(event, callback)
    }
  }
}

export const socketService = new SocketService()