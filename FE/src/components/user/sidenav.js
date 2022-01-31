import React from 'react';
import { connect } from 'react-redux';
import { SET_CUR_LOC } from '../../constants/actionTypes';
import { callApi, setSession } from '../../action';
import { history } from '../../store';


const mapStateToProps = state => {
  return {
      auth: state.auth,
      location: state.location
  }
};

const mapDispatchToProps = dispatch => ({
});

class Sidenav extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }

    toWhere = (to) => {
        history.push(to);
    }

    render() {
        return (
            <div className="user_sidenav">
                <h4 onClick={()=>this.toWhere("/user")} className={this.props.location.curLoc===""?"user_sidenav_item user_sidenav_item_selected":"user_sidenav_item"}> Dashboard </h4>
                <h4 onClick={()=>this.toWhere("/user/membership")} className={this.props.location.curLoc==="membership"?"user_sidenav_item user_sidenav_item_selected":"user_sidenav_item"}> Membership </h4>
                <h4 onClick={()=>this.toWhere("/user/tour")} className={this.props.location.curLoc==="tour"?"user_sidenav_item user_sidenav_item_selected":"user_sidenav_item"}> Tournaments </h4>
                <h4 onClick={()=>this.toWhere("/user/account")} className={this.props.location.curLoc==="account"?"user_sidenav_item user_sidenav_item_selected":"user_sidenav_item"}> MyAccount </h4>
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Sidenav);