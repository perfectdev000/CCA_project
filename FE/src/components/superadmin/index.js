import React from 'react';
import { connect } from 'react-redux';
import Sidenav from './sidenav';
import { Route, Switch } from "react-router-dom";
import { SET_AUTH } from '../../constants/actionTypes';
import Dashboard from './dashboard'; 
// import Membership from './membership'; 
import Session from './session'; 
import CCA from './cca'; 
import Courses from './courses'; 
// import CourseDetail from './courseDetail';
// import Tournament from './tournament'; 
// import Account from './account'; 
import { callApi, setSession, removeSession } from '../../action';
import { history } from '../../store';


const mapStateToProps = state => {
  return {
      auth: state.auth
  }
};

const mapDispatchToProps = dispatch => ({
    setAuth: (data) => dispatch({type: SET_AUTH, data})
});

class User extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }

    
    componentWillMount = async () => {
        var data = {
            _id: localStorage.getItem('_id')
        }
        var token =  "user_kackey_" + localStorage.getItem('token');
        var res = await callApi("GET", "/user/getItself/", token, data);
        console.log(res);
        if(res.Message === "User Fetched Successfully"){
            setSession(res.token);
            this.props.setAuth(res.data);
        } else {
            removeSession();
            history.push("/login");
        }
    }

    render() {
        return (
            <div>
                <Sidenav />
                <div className="user_side_container">
                    <Switch>
                        {/* <Route path="/superadmin/membership" component={Membership}/> */}
                        {/* <Route path="/superadmin/courseDetail" component={CourseDetail}/> */}
                        <Route path="/superadmin/courses" component={Courses}/>
                        <Route path="/superadmin/session" component={Session}/>
                        <Route path="/superadmin/cca" component={CCA}/>
                        {/* <Route path="/superadmin/tour" component={Tournament}/> */}
                        {/* <Route path="/superadmin/account" component={Account}/> */}
                        <Route path="/superadmin/" component={Dashboard}/>
                    </Switch>
                </div>
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(User);
