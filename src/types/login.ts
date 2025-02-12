
interface LoginCredentials {
  email: string
  password: string
}

interface LoginResponse {
  user: {
    id: number,
    schoolId: number,
    roleId: number,
    name: string,
    username: string,
    saralEmail: string,
    school: {
      id: number,
      name: string,
      email: string,
      username: string,
      contactNumber: number,
      subscriptionType: string,
      status: string,
      establishedYear: string,
      schoolType: string,
      address: string
    }
  },
  token: string
}
