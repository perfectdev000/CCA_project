import { SET_SELECTED_COACH } from "../constants/actionTypes";


const defaultVal = {
    selectedCoach: ""
}

export default (state = defaultVal, action) => {
    switch (action.type) {
        case SET_SELECTED_COACH:
            return { 
                ...state, 
                selectedCoach: action.data
            }
        default:
            return state;
    }
};
