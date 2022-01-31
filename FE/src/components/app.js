import React from "react";
import { connect } from "react-redux";
import { Route, Redirect, Switch } from "react-router-dom";
import Header from "./components/header";
import Auth from "./auth/auth";
import Login from "./auth/login";
import Signup from "./auth/signup";
import Home from "./components/home";
import User from "./user";
import Member from "./member";
import Coach from "./coach";
import Admin from "./admin";
import Superadmin from "./superadmin";

const AuthenticatedRoute = (props) =>{
    const token = localStorage.getItem("token");
    if(token){
        return <Route {...props} component={props.component}/>
    }
    return <Redirect to={{ pathname: "/login"}} />  
}
  
const UnAuthenticatedRoute = (props) =>{
    const token = localStorage.getItem("token");
    if(!token){  
        return <Route {...props} component={props.component}/>
    }
    return <Route {...props} component={props.component}/>
    // const type = localStorage.getItem("type");
    // return <Redirect to={{ pathname: "/" + type}}/>
}

const mapStateToProps = state => {
  return {
  }};

const mapDispatchToProps = dispatch => ({
});

class App extends React.Component {

  render() {
    return (
      <div>
        <Header/>
        <Switch>
            <AuthenticatedRoute path="/user" component={User} />
            <AuthenticatedRoute path="/member" component={Member} />
            <AuthenticatedRoute path="/coach" component={Coach} />
            <AuthenticatedRoute path="/admin" component={Admin} />
            <AuthenticatedRoute path="/superadmin" component={Superadmin} />
            <UnAuthenticatedRoute path="/auth/:email/:id/:username/:discriminator/:avatar" component={Auth}/>
            <UnAuthenticatedRoute path="/signup" component={Signup} />
            <UnAuthenticatedRoute path="/login" component={Login} />
            <UnAuthenticatedRoute path="/" component={Home} />
        </Switch>          
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
