import {    
    SET_AUTH,
    CLEAR_AUTH
        } from "../constants/actionTypes";

const defaultVal = {
    email: '',
    id: '',
    username: '',
    discriminator: '',
    avatar: '',
    type: '',
    loggedIn: false,
    _id: '',
    tournament: {},
    season: {},
    subscription: {},
    transactionHistory: [],

    //----- for the coaches
    displayName: "",
    description: "",
    role: "",
    buyers: [],
    coachTimes: {},
}

export default (state = defaultVal, action) => {
    switch (action.type) {
        case SET_AUTH:
            return { 
                ...state, 
                email: action.data.email,
                id: action.data.id,
                username: action.data.username,
                discriminator: action.data.discriminator,
                avatar: action.data.avatar,
                type: action.data.type,
                loggedIn: true,
                _id: action.data._id,                
                tournament: action.data.tournament,
                season: action.data.season,
                subscription: action.data.subscription,
                displayName: action.data.displayName,
                description: action.data.description,
                role: action.data.role,
                buyers: action.data.buyers,
                coachTimes: action.data.coachTimes,
                transactionHistory: action.data.transactionHistory,
            }
        case CLEAR_AUTH:
            return {
                ...state, 
                email: '',
                id: '',
                username: '',
                discriminator: '',
                avatar: '',
                type: '',
                loggedIn: false,
                _id: '',
            }
        default:
            return state;
    }
};
