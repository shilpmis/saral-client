import { LeaveType } from "@/types/leave";
import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";

interface LeaveState {
    leave_type : LeaveType[],
}

const initialState : LeaveState = {
    leave_type : []
}


const leaveSlice = createSlice({
    name: 'leave',
    initialState,
    reducers: {
        setLeave: (state, action) => {
            state.leave_type = action.payload
        }
    }
})

export const selectLeaveTypeForSchool = (state : RootState) => state.leave.leave_type

export default leaveSlice.reducer