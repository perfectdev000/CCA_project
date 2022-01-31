import auth from './reducers/auth_reducer';
import location from './reducers/location_reducer';
import courses from './reducers/courses_reducer';
import cca from "./reducers/cca_reducer";
import coach from "./reducers/coach_reducer";
import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

export default combineReducers({
  auth: auth,
  location: location,
  courses: courses,
  coach: coach,
  cca: cca,
  router: routerReducer
});
