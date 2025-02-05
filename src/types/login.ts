
interface LoginCredentials {
    email: string
    password: string
  }
  
  interface LoginResponse {
    user: {
      id: string
      username: string
      role: string
    }
    token: string
  }
  