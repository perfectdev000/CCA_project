import React from 'react';
import { connect } from 'react-redux';
import { history } from '../../store';
import { SET_AUTH } from '../../constants/actionTypes';
import { callApi, removeSession, setSession } from '../../action';


const mapStateToProps = state => {
  return {
  }
};

const mapDispatchToProps = dispatch => ({
    setAuth: (data) => dispatch({ type: SET_AUTH, data })
});

class Auth extends React.Component {
    componentDidMount = async () => {
        const login = window.localStorage.getItem("login");
        console.log(login);
        if(login === "false"){
            const _id = localStorage.getItem('_id');
            var data = {
                _id: _id,
                email: this.props.match.params.email,
                id: this.props.match.params.id,
                discriminator: this.props.match.params.discriminator,
                username: this.props.match.params.username,
                avatar: this.props.match.params.avatar,
            }
            console.log(data);
            var token =  "user_kackey_" + localStorage.getItem('token');
            var res = await callApi("POST", "/user/linkDiscord/", token, data);
            console.log(res);
            if(res.status === 400) {
                alert(res.statusText);
                history.push("/" + localStorage.getItem("type") + "/account");
            } else {
                alert(res.Message);            
                setSession(res.user.token, null, res.user.type);
                this.props.setAuth({
                    email: res.user.email,
                    id: res.user.id,
                    username: res.user.username,
                    discriminator: res.user.discriminator,
                    avatar: res.user.avatar,
                    type: res.user.type,
                    loggedIn: true,
                    _id: res.user._id
                });
                history.push("/" + res.user.type + "/account");
            }
        } else {      
            this.props.setAuth(this.props.match.params);      
            history.push("/login");
        }

    }

    render() {
        return ( <div></div> );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Auth);
