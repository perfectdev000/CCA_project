import React from 'react';
import { connect } from 'react-redux';
import Sidenav from './sidenav';
import { Route, Switch } from "react-router-dom";
import Dashboard from './dashboard'; 
import Membership from './membership'; 
import Tournament from './tournament'; 
import Account from './account'; 
import { SET_AUTH } from '../../constants/actionTypes';
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

    componentDidMount = async () => {        
        var data = {
            _id: localStorage.getItem('_id')
        }
        var token =  "user_kackey_" + localStorage.getItem('token');
        var res = await callApi("GET", "/user/getItself/", token, data);
        console.log(res);
        if(res.Message === "User Fetched Successfully"){
            setSession(res.token);
            this.props.setAuth( res.data );
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
                        <Route path="/user/membership" component={Membership}/>
                        <Route path="/user/tour" component={Tournament}/>
                        <Route path="/user/account" component={Account}/>
                        <Route path="/user/" component={Dashboard}/>
                    </Switch>
                </div>
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(User);
