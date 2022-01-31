import React from 'react';
import { connect } from 'react-redux';
import { SET_AUTH, SET_CUR_LOC } from '../../constants/actionTypes';
import { callApi, setSession, removeSession } from '../../action';
import { history } from '../../store';

const mapStateToProps = state => {
    return {
        auth: state.auth,
        location: state.location
    }
};
  
const mapDispatchToProps = dispatch => ({
    setCurLoc: (data) => dispatch({type: SET_CUR_LOC, data}),
    setAuth: (data) => dispatch({type: SET_AUTH, data})
});

class Dashboard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            sessions: []
        }
    }

    componentDidMount = () => {
        this.props.setCurLoc("");
        if(this.props.auth._id !== "")
            this.initSessions(this.props.auth);
    }

    componentWillReceiveProps = async (props) => {
        if(this.props.auth._id === "" && props.auth._id !== "") {
            this.initSessions(props.auth);
        }
    }

    initSessions = async (coach) => {
        var sessions = [];
        for ( let k = 0; k < coach.buyers.length; k++ ) {
            var buyer = coach.buyers[k];
            for(var l = 0 ; l < buyer.bookings.length; l++) {
                if( buyer.bookings[l].status !== "bought")
                    sessions.push ({
                        start: buyer.bookings[l].start,
                        end: buyer.bookings[l].end,
                        status: buyer.bookings[l].status,
                        coach: coach.email,
                        coachId: coach._id,
                        buyerId: buyer.buyerId,
                        bookingId: buyer.bookings[l]._id,
                        title: coach.displayName,
                        description: coach.description,
                        role: coach.role                                
                    });
            }
        }

        //--- get all the users info
        const token = "coach_kackey_" + localStorage.getItem("token");
        var res = await callApi("POST", "/user/getByQuery" , token, {type: "member"});
        console.log(res);
        if(res.status === 400) {
            alert(res.statusText);
        } else {
            setSession(res.token);
            sessions.sort(this.compare);
            for ( let i = 0; i < sessions.length; i++ ) {
                sessions[i].num = i;
                for(let j = 0; j < res.data.users.length; j++ ) {
                    if( sessions[i].buyerId == res.data.users[j]._id ) {
                        sessions[i].buyer = res.data.users[j].email;
                    }
                }
            }
            console.log(sessions);
            this.setState({sessions: sessions});
        }
    }

    compare = ( a, b ) => {
        if ( a.start < b.start ){
          return 1;
        }
        if ( a.start > b.start ){
          return -1;
        }
        return 0;
    }

    manageSession = async (coachId, buyerId, bookingId, actionType) => {
        var data = {
            coachId: coachId,
            buyerId: buyerId,
            bookingId: bookingId,
            actionType: actionType
        }
        const token = "coach_kackey_" + localStorage.getItem("token");
        var res = await callApi("POST", "/user/manageSession" , token, data);
        console.log(res);
        if(res.status === 400 || res.status == 404) {
            alert(res.statusText);
        } else {
            setSession(res.token);
            this.props.setAuth(res.coach);
            this.initSessions(res.coach);
        }
    }

    render() {
        return (
            <div className="row"  style={{padding: 60}}>
                <div className="user_dash_part w3-center" style={{position: "relative"}}>
                    <h4 className="w3-center w3-text-blue">Dashboard</h4>
                    <hr/>
                    <div className="user_table_container">
                        <table className="w3-table-all w3-hoverable">
                            <thead>
                                <tr className="w3-light-grey">
                                    <th>No</th>
                                    <th>Start</th>
                                    <th>End</th>
                                    <th>User</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            {
                                this.state.sessions.map((session) => {
                                    var start = session.start.substr(0,16).replace("T", " ").replace("-", "/");
                                    var end = session.end.substr(0,16).replace("T", " ").replace("-", "/");
                                    return (
                                        <tr key={session.num} title={session.description}>
                                            <td> { session.num + 1 } </td>
                                            <td> { start } </td>
                                            <td> { end } </td>
                                            <td> { session.buyer } </td>
                                            <td> { session.status === "booked" ? "pending" : session.status } </td>
                                            <td> 
                                                <div style={{display: session.status === "booked" ? "block" : "none"}}>
                                                    <button className="w3-btn w3-blue w3-small" onClick={()=>this.manageSession(session.coachId, session.buyerId, session.bookingId, "accept")}> Accept </button>
                                                    <button className="w3-btn w3-black w3-small" onClick={()=>this.manageSession(session.coachId, session.buyerId, session.bookingId, "decline")}> Decline </button>
                                                <button className="w3-btn w3-red w3-small" onClick={()=>this.manageSession(session.coachId, session.buyerId, session.bookingId, "close")}> Close </button>
                                                </div>
                                                <div style={{display: session.status === "booked" ? "none" : "block"}}>
                                                    <button className="w3-btn w3-black w3-small" onClick={()=>this.manageSession(session.coachId, session.buyerId, session.bookingId, "cancel")}> Cancel </button>
                                                <button className="w3-btn w3-red w3-small" onClick={()=>this.manageSession(session.coachId, session.buyerId, session.bookingId, "close")}> Close </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            }
                        </table>
                    </div>
                </div>
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);