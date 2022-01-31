import React from 'react';
import { connect } from 'react-redux';
import PersonIcon from '@material-ui/icons/Person';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import { history } from '../../store';


const mapStateToProps = state => {
  return {
  }
};

const mapDispatchToProps = dispatch => ({
});

class LogIn extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }

    tologIn = () => {
        history.push("/login")
    }

    toSignUp = () => {
        history.push("/signup")
    }

    render() {
        return (
                <div className="row w3-center">
                    <h2 className="w3-text-blue" style={{marginTop: 100}}> Welcome to CCA League ! </h2>
                    <div className="col-md-4"></div>
                    <div className="col-md-4" style={{marginTop: 60}}>
                        <button className="w3-button w3-round w3-blue"  style={{fontSize: 18}} onClick={this.tologIn}>
                            <span style={{marginRight: 5}}><PersonIcon /></span>
                            LogIn
                        </button>
                        <button className="w3-button w3-round w3-blue" style={{marginLeft: 30, fontSize: 18}} onClick={this.toSignUp}>
                            <span style={{marginRight: 5}}><PersonAddIcon /></span>
                            SignUp
                        </button>
                    </div>
                </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(LogIn);
