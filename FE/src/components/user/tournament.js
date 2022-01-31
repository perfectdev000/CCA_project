import React from 'react';
import { connect } from 'react-redux';
import { SET_CUR_LOC } from '../../constants/actionTypes';
import { callApi, setSession } from '../../action';
import { history } from '../../store';

const mapStateToProps = state => {
    return {
        location: state.location
    }
  };
  
const mapDispatchToProps = dispatch => ({
    setCurLoc: (data) => dispatch({type: SET_CUR_LOC, data})
});

class Tournament extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }

    componentDidMount = () => {
        this.props.setCurLoc("tour");
    }

    render() {
        return (
            <div className="row"  style={{padding: 60}}>
                <div className="user_dash_part">
                    <h4 className="w3-center w3-text-blue"> Tournaments </h4>
                    <hr/>
                </div>
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Tournament);