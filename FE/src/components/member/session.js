import React from 'react';
import { connect } from 'react-redux';
import { SET_CUR_LOC, SET_SELECTED_COACH } from '../../constants/actionTypes';
import { callApi, setSession } from '../../action';
import { history } from '../../store';

const mapStateToProps = state => {
    return {
        auth: state.auth,
        location: state.location
    }
  };
  
const mapDispatchToProps = dispatch => ({
    setCurLoc: (data) => dispatch({type: SET_CUR_LOC, data}),
    setSelectedCoach: (data) => dispatch({type: SET_SELECTED_COACH, data})
});

class Session extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            sessions: []
        }
    }

    componentDidMount = () => {
        this.props.setCurLoc("session");
        this.getAllCoaches();
    }

    componentWillReceiveProps = async (props) => {
        if(this.props.auth._id === "" && props.auth._id !== "") {
            this.getAllCoaches();
        }
    }

    getAllCoaches = async () => {
        const token = "member_kackey_" + localStorage.getItem("token");
        var res = await callApi("POST", "/user/getByQuery", token, {type: "coach"});
        console.log(res);
        if( res.status === 400) {
            alert(res.statusText);
        } else {
            setSession(res.token);
            this.initSessions(res.data.users);
        }
    }

    initSessions = (coaches) => {
        var sessions = [];
        for( let i = 0; i < coaches.length; i++ ) {
            var temp = {
                coachId: coaches[i]._id,
                coach: coaches[i].displayName===""?coaches[i].email:coaches[i].displayName,
                description: coaches[i].description,
                type: coaches[i].role,
                mySessions: 0,
                onSale: coaches[i].onSale
            }
            for ( var j = 0; j < coaches[i].buyers.length; j++ ){
                var buyers = coaches[i].buyers[j];
                if ( buyers.buyerId == this.props.auth._id) {
                    for ( var k = 0; k < buyers.bookings.length; k++ ){
                        var booking = buyers.bookings[k];
                        if( booking.status === "bought") {
                            temp.mySessions ++;
                        }
                    }
                }
            }
            sessions.push({... temp});
        }
        console.log(sessions);
        this.setState({
            sessions: sessions
        });
    }

    buyCoachTime = async (coachId) => {
        var data = {
            coachId: coachId,
            userId: this.props.auth._id
        };
        const token = "member_kackey_" + localStorage.getItem("token");
        var res = await callApi("POST", "/user/buyCoachTime", token, data);
        console.log(res);
        if( res.status === 400) {
            alert(res.statusText);
        } else {
            setSession(res.token);
            this.initSessions(res.data);
        }
    }

    booking = async (coachId) => {
        this.props.setSelectedCoach(coachId);
        history.push("/member/booking");
    }

    render() {
        return (
            <div className="row"  style={{padding: 60}}>
                <div className="user_dash_part">
                    <div className="user_session_part" style={{borderRight: "1px solid #2196F3"}}>                        
                        <h4 className="w3-center w3-text-blue"> My Session Inventory </h4>
                        <hr/>
                        {
                            this.state.sessions.map((session) => {
                                if(session.mySessions) {
                                    return (
                                        <div className="user_session_item">
                                            <p> {session.mySessions + " x " + session.coach} </p>
                                            <button className="w3-btn w3-border w3-border-blue w3-hover w3-hover-blue w3-round w3-right" onClick={()=>this.booking(session.coachId)}>Book Now</button>
                                        </div>
                                    );
                                }
                            })
                        }
                    </div>
                    <div className="user_session_part">
                        <h4 className="w3-center w3-text-blue"> Buy Sessions </h4>
                        <hr/>
                        {
                            this.state.sessions.map((session) => {
                                return (
                                    <div className="user_session_item">
                                        <b>coach :  {session.coach } <span style={{float: "right"}}>{"( " + session.type + " )"}</span> </b>
                                        <hr/>
                                        <p> {session.description } </p>
                                        <button className="w3-btn w3-border w3-border-blue w3-hover w3-hover-blue w3-round w3-right" onClick={()=>this.buyCoachTime(session.coachId)}>BUY</button>
                                    </div>
                                );
                            })
                        }
                    </div>
                </div>
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Session);