import { SET_CCA_ROLE } from "../constants/actionTypes";


const defaultVal = {
    selectedRole: ""
}

export default (state = defaultVal, action) => {
    switch (action.type) {
        case SET_CCA_ROLE:
            return { 
                ...state, 
                selectedRole: action.data
            }
        default:
            return state;
    }
};
