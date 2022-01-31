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
    setCurLoc: (data) => dispatch({type: SET_CUR_LOC, data})
});

class Dashboard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            coaches: [
                {
                    num: 1,
                    date: "12/06 11:20",
                    coach: "Coach A"
                },
                {
                    num: 2,
                    date: "12/07 14:20",
                    coach: "Coach B"
                },
                {
                    num: 3,
                    date: "12/08 13:30",
                    coach: "Coach C"
                },
                {
                    num: 4,
                    date: "12/09 17:10",
                    coach: "Coach D"
                },
                {
                    num: 5,
                    date: "12/11 10:40",
                    coach: "Coach A"
                },
                {
                    num: 6,
                    date: "12/12 10:40",
                    coach: "Coach B"
                },
                {
                    num: 7,
                    date: "12/13 10:40",
                    coach: "Coach C"
                },
                {
                    num: 8,
                    date: "12/14 10:40",
                    coach: "Coach D"
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
    }

    componentWillReceiveProps = async (props) => {
        if(this.props.auth._id === "" && props.auth._id !== "") {
        }
    }

    render() {
        return (
            <div className="row" style={{width: "100%", marginLeft: 0}}>
                <div className="col-lg-6" style={{padding: 30}}>
                    <div className="user_dash_part">
                        <h4 className="w3-center w3-text-blue"> Upcoming Coach Sessions </h4>
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
                                    this.state.coaches.map((coach) => {
                                        return (
                                            <tr key={coach.num}>
                                                <td> { coach.num } </td>
                                                <td> { coach.date } </td>
                                                <td> { coach.coach } </td>
                                            </tr>
                                        );
                                    })
                                }
                            </table>
                        </div>
                    </div>
                </div>
                <div className="col-lg-6" style={{padding: 30}}>
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
                <div className="col-lg-6" style={{padding: 30}}>
                    <div className="user_dash_part">                       
                        <h4 className="w3-center w3-text-blue"> My Courses </h4>
                        <hr/>
                    </div>
                </div>
                <div className="col-lg-6" style={{padding: 30}}>
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