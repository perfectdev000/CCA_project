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
                <h4 onClick={()=>this.toWhere("/member")} className={this.props.location.curLoc===""?"user_sidenav_item user_sidenav_item_selected":"user_sidenav_item"}> Dashboard </h4>
                <h4 onClick={()=>this.toWhere("/member/session")} className={this.props.location.curLoc==="session"?"user_sidenav_item user_sidenav_item_selected":"user_sidenav_item"}> Sessions </h4>
                <h4 onClick={()=>this.toWhere("/member/cca")} className={this.props.location.curLoc==="cca"?"user_sidenav_item user_sidenav_item_selected":"user_sidenav_item"}> CCA League </h4>
                <h4 onClick={()=>this.toWhere("/member/courses")} className={this.props.location.curLoc==="courses"?"user_sidenav_item user_sidenav_item_selected":"user_sidenav_item"}> Courses </h4>
                <h4 onClick={()=>this.toWhere("/member/tour")} className={this.props.location.curLoc==="tour"?"user_sidenav_item user_sidenav_item_selected":"user_sidenav_item"}> Tournaments </h4>
                <h4 onClick={()=>this.toWhere("/member/account")} className={this.props.location.curLoc==="account"?"user_sidenav_item user_sidenav_item_selected":"user_sidenav_item"}> MyAccount </h4>
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Sidenav);