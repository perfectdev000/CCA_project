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
            sessions: [
                {
                    num: 1,
                    start: "2021/12/06 11:00",
                    end: "2021/12/06 12:00",
                    coachTimeId: "aaa",
                    coach: "Coach A",
                    title: "",
                    role: "",
                    description: ""
                }
            ],
            leagues: [
                {
                    num: 1,
                    date: "12:12 13:40",
                    teamA: "Final Legend",
                    teamB: "Wild Fox"
                },
                {
                    num: 2,
                    date: "12:13 16:40",
                    teamA: "Night Wolfs",
                    teamB: "Snow Storm"
                },
            ],
            tournaments: [
                {
                    num: 1,
                    date: "12:12 13:40",
                    teamA: "Final Legend",
                    teamB: "Wild Fox"
                },
                {
                    num: 2,
                    date: "12:13 16:40",
                    teamA: "Night Wolfs",
                    teamB: "Snow Storm"
                },
            ]
        }
    }

    componentDidMount = () => {
        this.props.setCurLoc("");
        if( this.props.auth._id !== "" )
            this.getAllsessions();
    }

    componentWillReceiveProps = async (props) => {
        if(this.props.auth._id === "" && props.auth._id !== "") {
            this.getAllsessions();
        }
    }
    
    getAllsessions = async () => {
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
            var coach = coaches[i];
            for ( let k = 0; k < coach.buyers.length; k++ ) {
                var buyer = coach.buyers[k];
                if( this.props.auth._id === buyer.buyerId) {
                    for(var l = 0 ; l < buyer.bookings.length; l++) {
                        if( buyer.bookings[l].status !== "bought"  )
                            sessions.push ({
                                start: buyer.bookings[l].start,
                                end: buyer.bookings[l].end,
                                status: buyer.bookings[l].status,
                                coach: coach.email,
                                coachId: coach._id,
                                buyerId: buyer._id,
                                bookingId: buyer.bookings[l]._id,
                                title: coach.displayName,
                                description: coach.description,
                                role: coach.role                                
                            });
                    }
                }
            }
        }
        for(var i = 0; i < sessions.length; i++) {
            sessions[i].num = i+1;
        }
        console.log(sessions);
        this.setState({sessions: sessions});
    }

    render() {
        return (
            <div className="row" style={{width: "100%", marginLeft: 0}}>
                <div className="col-12" style={{padding: 30}}>
                    <div className="user_dash_part">
                        <h4 className="w3-center w3-text-blue"> Upcoming Coach Sessions </h4>
                        <hr/>
                        <div className="user_table_container">
                            <table className="w3-table-all w3-hoverable">
                                <thead>
                                    <tr className="w3-light-grey">
                                        <th>No</th>
                                        <th>Start</th>
                                        <th>End</th>
                                        <th>Coach</th>
                                        <th>Role</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                {
                                    this.state.sessions.map((session) => {
                                        var start = session.start.substr(0,16).replace("T", " ").replace("-", "/");
                                        var end = session.end.substr(0,16).replace("T", " ").replace("-", "/");
                                        return (
                                            <tr key={session.num} title={session.description}>
                                                <td> { session.num } </td>
                                                <td> { start } </td>
                                                <td> { end } </td>
                                                <td> { session.coach } </td>
                                                <td> { session.role } </td>
                                                <td> { session.status } </td>
                                            </tr>
                                        );
                                    })
                                }
                            </table>
                        </div>
                    </div>
                </div>
                <div className="col-12" style={{padding: 30}}>
                    <div className="user_dash_part">                        
                        <h4 className="w3-center w3-text-blue"> Upcoming CCA League Games </h4>
                        <hr/>
                        <div className="user_table_container">
                            <table className="w3-table-all w3-hoverable">
                                <thead>
                                    <tr className="w3-light-grey">
                                        <th>No</th>
                                        <th>Date/Time</th>
                                        <th>Coach</th>
                                    </tr>
                                </thead>
                                {
                                    this.state.leagues.map((league) => {
                                        return (
                                            <tr>
                                                <td> { league.num } </td>
                                                <td> { league.date } </td>
                                                <td> {'"' +  league.teamA + '" vs "' + league.teamB + '"' } </td>
                                            </tr>
                                        );
                                    })
                                }
                            </table>
                        </div>
                    </div>
                </div>
                <div className="col-12" style={{padding: 30}}>
                    <div className="user_dash_part">                       
                        <h4 className="w3-center w3-text-blue"> My Courses </h4>
                        <hr/>
                    </div>
                </div>
                <div className="col-12" style={{padding: 30}}>
                    <div className="user_dash_part">                       
                        <h4 className="w3-center w3-text-blue"> Upcoming Tournament Games </h4>
                        <hr/>
                        <div className="user_table_container">
                            <table className="w3-table-all w3-hoverable">
                                <thead>
                                    <tr className="w3-light-grey">
                                        <th>No</th>
                                        <th>Date/Time</th>
                                        <th>Coach</th>
                                    </tr>
                                </thead>
                                {
                                    this.state.tournaments.map((touranment) => {
                                        return (
                                            <tr>
                                                <td> { touranment.num } </td>
                                                <td> { touranment.date } </td>
                                                <td> {'"' +  touranment.teamA + '" vs "' + touranment.teamB + '"' } </td>
                                            </tr>
                                        );
                                    })
                                }
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);