import React from 'react';
import { connect } from 'react-redux';
import PersonIcon from '@material-ui/icons/Person';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import { history } from '../../store';
import { CLEAR_AUTH } from '../../constants/actionTypes';
import { setSession, removeSession } from '../../action';


const mapStateToProps = state => {
  return {
      auth: state.auth,
      location: state.location
  }
};

const mapDispatchToProps = dispatch => ({
    clearAuth: () => dispatch({type: CLEAR_AUTH})
});

class Header extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }

    componentWillReceiveProps = (props) => {
        var type = props.auth.type;
        var location = props.location.curLoc;
        if(type !== "")
            history.push('/' + type + "/" + location);
    }

    goHome = () => {
        var type = window.localStorage.getItem("type");
        if(type !== 'undefined')
            history.push('/' + type);
        else
            history.push('/');
    }

    logOut = () => {
        removeSession();
        this.props.clearAuth();
        history.push('/login');
    }

    render() {
        return (
                <div className="row w3-blue">
                    <div className="header_logo" onClick={this.goHome}>                    
                        <h2> &nbsp; CCA League </h2>
                    </div>
                    <div className="header_detail" style={{display: this.props.auth.loggedIn?"block":"none"}}>
                        <ExitToAppIcon onClick={this.logOut} style={{float: "right", fontSize: 25, marginTop: 3}}/>
                        <span style={{float: "right", fontSize: 20, marginRight: 20}}>
                            {this.props.auth.email}{ this.props.auth.username!==""?(" / " + this.props.auth.username + "#" + this.props.auth.discriminator):"" }
                        </span>
                        <span style={{float: "right", marginRight: 5, marginTop: 3}} fontSize="large"><PersonIcon /></span>
                        <span style={{float: "right", marginRight: 20, fontSize: 20}}>{this.props.auth.type}</span>
                    </div>
                </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Header);
