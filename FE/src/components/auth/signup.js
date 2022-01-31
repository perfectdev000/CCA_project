import React from "react";
import { connect } from "react-redux";
import PersonAddIcon from "@material-ui/icons/PersonAdd";
import ErrorState from "../components/errorstate";
import { callApi, removeSession } from "../../action";
import { history } from '../../store';
import { CLEAR_AUTH } from "../../constants/actionTypes";

const mapStateToProps = state => {
  return {
      auth: state.auth
  }
};

const mapDispatchToProps = dispatch => ({
    clearAuth: () => dispatch({type: CLEAR_AUTH})
});

class SignUp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            psw: "",
            repsw: "",
            email: '',
            error: {
              email: 'none',
              psw: "none",
              repsw: "none"
            },
            pswErr: "Password is required.",
            emailErr: 'Valid email address is required.'
        }
    }

    componentWillMount = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    setEmail = (e) => {
        if(e.target.value.length < 51){
            this.setState({email: e.target.value, emailErr: 'Valid email address is required.'});
            const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            var valid = re.test(String(e.target.value).toLowerCase());
            var error = this.state.error;
            if(e.target.value !== '' && valid){
                error.email = 'none';
                this.setState({error: error});
            } else {
                error.email = 'block';
                this.setState({error: error});
            }
        }
    }

    setPsw = (e) => {                
        this.setState({psw: e.target.value});
        var password = e.target.value;   
        var error = this.state.error;
        // Do not show anything when the length of password is zero.
        if (password.length === 0) {
            this.setState({pswErr: 'Password is required.'});
            error.psw = 'block';
            this.setState({error: error});
            return;
        } else {
            if (password.length < 8) {
                this.setState({pswErr: 'Password should have minimum 8 characters, 1 upper case,  1 lower case, 1 special character and 1 number.'});
                error.psw = 'block';
                this.setState({error: error});
            } else {
                // Create an array and push all possible values that you want in password
                var mached = [];
                mached.push("[$@$!%*#?&]"); // Special Charector
                mached.push("[A-Z]");      // Uppercase Alpabates
                mached.push("[0-9]");      // Numbers
                mached.push("[a-z]");     // Lowercase Alphabates

                // Check the conditions
                var ctr = 0;
                for (var i = 0; i < mached.length; i++) {
                    if (new RegExp(mached[i]).test(password)) {
                        ctr++;
                    }
                }
                // Display it
                switch (ctr) {
                    case 0:
                    case 1:
                    case 2:
                    case 3:
                        this.setState({pswErr: 'Password should have minimum 8 characters, 1 upper case,  1 lower case, 1 special character and 1 number.'});
                        error.psw = 'block';
                        this.setState({error: error});
                        break;
                    case 4:
                        error.psw = 'none';
                        this.setState({error: error});
                        break;
                    default:
                        return;
                }
            }            
            if(this.state.repsw !== ""){
                var val = this.state.repsw === e.target.value;
                error = this.state.error;
                if(val){
                    error.repsw = 'none';
                    this.setState({error: error});
                } else {
                    error.repsw = 'block';
                    this.setState({error: error});
                }
            }
        }
    }

    setRepsw = (e) => {
        var validate = this.state.psw === e.target.value;
        this.setState({repsw: e.target.value});
        var error = this.state.error;
        if(e.target.value !== '' && validate){
            error.repsw = 'none';
            this.setState({error: error});
        } else if(e.target.value === "" && this.state.psw === "") {
            error.repsw = 'none';
            this.setState({error: error});
        } else {
            error.repsw = 'block';
            this.setState({error: error});
        }
    }

    toLogin = () => {
        history.push("/login");
    }

    signUp = async () => {
        var state = this.state;
        var email = state.error.email === 'block' || state.email === '' ? 'block' : 'none';
        var psw = state.error.psw === 'block' || state.psw === '' ? 'block' : 'none';
        var repsw = state.error.repsw === 'block' || state.repsw === '' ? 'block' : 'none';

        if(psw === '') {
            this.setState({pswErr: 'Password is required'});
        }

        var error = {
            email: email,
            psw: psw,
            repsw: repsw
        };
        this.setState({error: {...error}}); 

        if(email==='none' && psw==='none' && repsw==='none'){
            //----- email repeat check
            var data = {
                email: this.state.email
            }    
            var res = await callApi("POST", "/user/emailCheck", null, data);
            if(res.result === 'OK'){
                //----- email isn't already in use, so register as a new account
                data = {
                    email: this.state.email,
                    password: this.state.psw
                }
                res = await callApi("POST", "/user/signup", null, data);
                console.log(res);
                if(res.Message === "User Created Successfully"){
                    removeSession();
                    this.props.clearAuth();
                    history.push("/login");
                } else {
                    alert("Sign Up Failed.");
                }
            } else {
                this.setState({authErr: 'This Email address is already in use.'});
                error = this.state.error;
                error.email = "block";
                this.setState({error: {...error}});
            }
        }
    }

    cancel = () => {
        this.props.clearAuth();
        this.setState({
            psw: "",
            repsw: "",
            error: {
              auth: "none",
              psw: "none",
              repsw: "none"
            },
            pswErr: "Password is required.",
            authErr: "Please link your Discord account."
        })
    }

    render() {
        return (
                <div className="row">
                    <div className="col-md-4"></div>
                    <div className="col-md-4">
                        <h1 className="w3-text-blue w3-center" style={{marginTop: 50}}>
                            <span><PersonAddIcon style={{fontSize: 45, marginRight: 20, marginTop: -8}}/></span>
                            SIGN UP
                        </h1>
                        <label className="w3-text-blue" style={{marginTop: "20px"}}><b>Email</b></label>
                        <input className="w3-input w3-border" name="email" type="text" value={this.state.email} onChange={this.setEmail}/> 
                        <ErrorState show={this.state.error.email} name={this.state.emailErr} />
                        <label className="w3-text-blue" style={{marginTop: "20px"}}><b>Password</b></label>
                        <input className="w3-input w3-border" name="psw" type="password" value={this.state.psw} onChange={this.setPsw}/> 
                        <ErrorState show={this.state.error.psw} name={this.state.pswErr} />
                        <label className="w3-text-blue" style={{marginTop: "20px"}}><b>Confirm Password</b></label>
                        <input className="w3-input w3-border" name="repsw" type="password" value={this.state.repsw} onChange={this.setRepsw}/>                            
                        <ErrorState show={this.state.error.repsw} name="Doesn't match with the password." />
                        <br/>
                        <a onClick={this.toLogin} className="w3-text-blue" style={{cursor: "pointer"}}> Already have got an account? </a>
                        <button className="w3-btn w3-black" style={{float: "right", marginLeft: 15}} onClick={this.cancel}>CANCEL</button>
                        <button className="w3-btn w3-blue" style={{float: "right"}} onClick={this.signUp}>SIGN UP</button>
                    </div>
                </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SignUp);
