import {    
    SET_OLD_LOC,
    SET_CUR_LOC
        } from "../constants/actionTypes";

const defaultVal = {
    oldLoc: '',
    curLoc: ''
}

export default (state = defaultVal, action) => {
    switch (action.type) {
        case SET_OLD_LOC:
            return { 
                ...state, 
                oldLoc: action.data
            }
        case SET_CUR_LOC:
            return { 
                ...state, 
                curLoc: action.data
            }
        default:
            return state;
    }
};
