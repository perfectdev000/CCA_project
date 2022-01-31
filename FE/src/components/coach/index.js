import React from 'react';
import { connect } from 'react-redux';
import Sidenav from './sidenav';
import { Route, Switch } from "react-router-dom";
import Dashboard from './dashboard'; 
// import Membership from './membership'; 
import Session from './session'; 
// import CCA from './cca'; 
// import Courses from './courses'; 
// import Payment from './payment';
// import CourseDetail from './courseDetail';
// import Tournament from '../user/tournament'; 
import Account from '../user/account'; 
import { callApi, setSession, removeSession } from '../../action';
import { history } from '../../store';
import { SET_AUTH } from '../../constants/actionTypes';


const mapStateToProps = state => {
  return {
      auth: state.auth
  }
};

const mapDispatchToProps = dispatch => ({
    setAuth: (data) => dispatch({type: SET_AUTH, data})
});

class Member extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }

    componentDidMount = async () => {        
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
                        {/* <Route path="/coach/payment" component={Payment}/>
                        <Route path="/coach/courses" component={Courses}/>
                        <Route path="/coach/courseDetail" component={CourseDetail}/> */}
                        <Route path="/coach/session" component={Session}/>
                        {/* <Route path="/coach/cca" component={CCA}/>
                        <Route path="/coach/tour" component={Tournament}/> */}
                        <Route path="/coach/account" component={Account}/>
                        <Route path="/coach/" component={Dashboard}/> 
                    </Switch>
                </div>
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Member);
