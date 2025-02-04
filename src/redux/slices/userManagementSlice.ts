import { userManagementService } from "@/services/UserManagementService"
import { User, UserApiResponse } from "@/types/user"
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

interface UserManagementState {
  users: User[]
  status: "idle" | "loading" | "succeeded" | "failed"
  error: string | null
}

const initialState: UserManagementState = {
  users: [],
  status: "idle",
  error: null,
}

export const fetchUsers = createAsyncThunk<User[], void>(
  "userManagement/fetchUsers",
  async (): Promise<User[]> => {  // Explicitly return `User[]`
    const response = await userManagementService.getUsers() as unknown as  UserApiResponse;
    return response.data;  // ✅ Return only `data` array
  }
);



export const addUser = createAsyncThunk("userManagement/addUser", async (user: Omit<User, "id">) => {
  return await userManagementService.addUser(user)
})

export const updateUser = createAsyncThunk("userManagement/updateUser", async (user: User) => {
  return await userManagementService.updateUser(user)
})

export const deleteUser = createAsyncThunk("userManagement/deleteUser", async (id: number) => {
  await userManagementService.deleteUser(id)
  return id
})

const userManagementSlice = createSlice({
  name: "userManagement",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.status = "loading"
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.users = action.payload;
      })
      
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.error.message || null
      })
      .addCase(addUser.fulfilled, (state, action) => {
        state.users.push(action.payload)
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.users.findIndex((user) => user.id === action.payload.id)
        if (index !== -1) {
          state.users[index] = action.payload
        }
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((user) => user.id !== action.payload)
      })
  },
})

export default userManagementSlice.reducer

