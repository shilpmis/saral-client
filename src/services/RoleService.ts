import ApiService from "./ApiService"

export interface Role {
  id: string
  role: string
  is_teaching_role: boolean
}

export const roleService = {
  getRoles: async (): Promise<Role[]> => {
    const response = await ApiService.get("staff/1");
    return response.data
  },

  addRole: async (role: Omit<Role, "id">): Promise<Role> => {
    const response = await ApiService.post("staff", role)
    return response.data
  },

  updateRole: async (role: Role): Promise<Role> => {
    const response = await ApiService.put(`staff/${role.id}`, role)
    return response.data
  },

  deleteRole: async (id: string): Promise<void> => {
    await ApiService.delete(`staff/${id}`)
  },
}

