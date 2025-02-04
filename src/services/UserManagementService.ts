import { User } from "@/types/user"
import ApiService from "./ApiService"

export const userManagementService = {
  getUsers: async (): Promise<User[]> => {
    const response = await ApiService.get("users");
    return response.data
  },

  addUser: async (user: Omit<User, "id">): Promise<User> => {
    const response = await ApiService.post("users", user)
    return response.data
  },

  updateUser: async (user: User): Promise<User> => {
    const response = await ApiService.put(`users/${user.id}`, user)
    return response.data
  },

  deleteUser: async (id: number): Promise<void> => {
    await ApiService.delete(`users/${id}`)
  },
}

