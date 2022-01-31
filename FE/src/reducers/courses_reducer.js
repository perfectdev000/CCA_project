import { SET_SELECTED_COURSE } from "../constants/actionTypes";


const defaultVal = {
    selectedCourse: ""
}

export default (state = defaultVal, action) => {
    switch (action.type) {
        case SET_SELECTED_COURSE:
            return { 
                ...state, 
                selectedCourse: action.data
            }
        default:
            return state;
    }
};
