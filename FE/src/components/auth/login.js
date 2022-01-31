import React from 'react';
import { connect } from 'react-redux';
import PersonIcon from "@material-ui/icons/Person";
import ErrorState from "../components/errorstate";
import { callApi, setSession } from '../../action';
import { history } from '../../store';


const mapStateToProps = state => {
  return {
      auth: state.auth
  }
};

const mapDispatchToProps = dispatch => ({
});

class LogIn extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            password: '',
            error: {
              email: 'none',
              password: 'none'
            },
            passwordErr: 'Password is required.',
            emailErr: 'Email address is required.'
        }
    }

    componentWillMount = async () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        var auth = this.props.auth;
        if(auth.email !== "" && auth.id !== "" && auth.discriminator !=="") {
            var data = {
                email: auth.email,
                id: auth.id,
                discriminator: auth.discriminator
            }
            var res = await callApi("POST", "/user/loginWithDiscord", null, data);
            console.log(res);
            if(res.Message === "Logged in Successfully with Discord") {
                setSession(res.token, res.data._id, res.data.type);
                history.push("/" + res.data.type);
            } else {
                alert(res.statusText);
            }
        }
    }    

    setEmail = (e) => {
        this.setState({ email: e.target.value, emailErr: 'Valid email address is required.' });
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        var valid = re.test(String(e.target.value).toLowerCase());
        if (e.target.value !== '' && valid) {
            var error = this.state.error;
            error.email = 'none';
            this.setState({ error: error });
        } else if (e.target.value === '') {
            error = this.state.error;
            error.email = 'none';
            this.setState({ error: error });
        } else {
            error = this.state.error;
            error.email = 'block';
            this.setState({ error: error });
        }
    }

    setPassword = (e) => {
        this.setState({ password: e.target.value });
        var error = this.state.error;
        error.password = 'none';
        this.setState({ error: error });
    }

      
    logIn = async () => {
        var state = this.state;
        var emailError = state.error.email === 'block' || state.email === '' ? 'block' : 'none';
        var passwordError = state.error.password === 'block' || state.password === '' ? 'block' : 'none';

        var error = {
            email: emailError,
            password: passwordError
        };
        this.setState({ error: { ...error } });

        if (emailError === 'none' && passwordError === 'none') {
            var data = {
                email: this.state.email,
                password: this.state.password
            }
            var res = await callApi("POST", "/user/login", null, data);
            console.log(res);
            if(res.Message === "Logged in Successfully") {
                setSession(res.token, res.data._id, res.data.type);
                console.log(res);
                history.push("/" + res.data.type);
            } else if (res.statusText === "Password Error" ){
                error = {
                    email: "none",
                    password: "block"
                };
                this.setState({ error: { ...error }, passwordErr: "Incorrect Password." });
            } else if (res.statusText === "User not found"){
                error = {
                    email: "block",
                    password: "none"
                };
                this.setState({ error: { ...error }, emailErr: "Unregistered Email." });
            }
        }
    }

    loginWithDiscord = () => {
        window.localStorage.setItem("login", "true");
        window.location.href = process.env.REACT_APP_SERVER_URL + "/api/discord/login";
    }

    toSignUp = () => {
        window.localStorage.setItem("signUp", "false");
        this.props.history.push('/signUp');
    }

    render() {
        return (
                <div className="row">
                    <div className="col-md-4"></div>
                    <div className="col-md-4">
                        <h1 className="w3-text-blue w3-center" style={{marginTop: 50}}>
                            <span><PersonIcon style={{fontSize: 45, marginRight: 20, marginTop: -8}}/></span>
                            LOGIN
                        </h1>
                        <label className="w3-text-blue" style={{marginTop: "20px"}}><b>Email</b></label>
                        <input className="w3-input w3-border" name="psw" type="text" value={this.state.email} onChange={this.setEmail}/> 
                        <ErrorState show={this.state.error.email} name={this.state.emailErr} />
                        <label className="w3-text-blue" style={{marginTop: "20px"}}><b>Password</b></label>
                        <input className="w3-input w3-border" name="psw" type="password" value={this.state.psw} onChange={this.setPassword}/> 
                        <ErrorState show={this.state.error.password} name={this.state.passwordErr} />
                        <br/>
                        <button onClick={this.loginWithDiscord} className="w3-btn w3-white w3-round w3-border w3-border-blue w3-text-blue w3-hover w3-hover-blue" style={{width: "100%"}} ><b> Login With Discord </b></button>
                        <br/><br/><br/>
                        <a onClick={this.toSignUp} className="w3-text-blue" style={{cursor: "pointer"}}> Haven't got an account yet? </a>
                        <button className="w3-btn w3-blue" style={{float: "right", marginLeft: 15}} onClick={this.logIn}>LOGIN</button>
                    </div>
                </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(LogIn);
