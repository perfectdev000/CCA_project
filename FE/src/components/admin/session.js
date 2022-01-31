import React from 'react';
import { connect } from 'react-redux';
import { SET_CUR_LOC } from '../../constants/actionTypes';
import DateTimePicker from 'react-datetime-picker';
import { callApi, setSession } from '../../action';
import { history } from '../../store';
import { ContactPhone } from '@material-ui/icons';

const mapStateToProps = state => {
    return {
        location: state.location
    }
  };
  
const mapDispatchToProps = dispatch => ({
    setCurLoc: (data) => dispatch({type: SET_CUR_LOC, data})
});

class Session extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            sessions: [
                {
                    _id: 1,
                    num: 1,
                    user: "userA@gmail.com",
                    coach: "coachA@gmail.com",
                    date: new Date()
                },
                {
                    _id: 2,
                    num: 2,
                    user: "userB@gmail.com",
                    coach: "coachB@gmail.com",
                    date: new Date()
                },
                {
                    _id: 3,
                    num: 3,
                    user: "userC@gmail.com",
                    coach: "coachC@gmail.com",
                    date: new Date()
                },
            ],
            selectedSession: {
                _id: 0,
                num: 0,
                user: "",
                coach: "",
                date: new Date()
            },
            users: [
                {
                    _id: "userA",
                    email: "userA@gmail.com"
                },
                {
                    _id: "userB",
                    email: "userB@gmail.com"
                },
                {
                    _id: "userC",
                    email: "userC@gmail.com"
                },
            ],
            coaches: [                
                {
                    _id: "coachA",
                    email: "coachA@gmail.com"
                },                
                {
                    _id: "coachB",
                    email: "coachB@gmail.com"
                },                
                {
                    _id: "coachC",
                    email: "coachC@gmail.com"
                }
            ]
        }
    }

    componentDidMount = () => {
        this.props.setCurLoc("session");
    }

    showModal = (session) => {
        this.setState({selectedSession: {
            _id: session._id,
            num: session.num,
            user: session.user,
            coach: session.coach,
            date: session.date
        }});
        document.getElementById('modal').style.display='block';
    }

    setVal = (e) => {
        var session = this.state.selectedSession;
        session[e.target.name] = e.target.value;
        console.log(session);
        this.setState({selectedSession: session},()=>
        console.log(this.state.sessions));
    }

    setNewDateTime = (val) => {
        var session = this.state.selectedSession;
        session.date = val;
        this.setState({selectedSession: session});
    }

    updateSession = () => {
        console.log(this.state.selectedSession);
        // TODO : UPDATE SESSION DATA
        this.cancelUpdate();
    }

    cancelUpdate = () => {
        this.setState({
            selectedSession: {
                _id: 0,
                num: 0,
                user: "",
                coach: "",
                date: new Date()
            },
        });
        document.getElementById('modal').style.display='none';
    }

    render() {
        return (
            <div className="row"  style={{padding: 60}}>
                <div className="user_dash_part">
                    <h4 className="w3-center w3-text-blue"> Scheduled Sessions </h4>
                    <hr/>
                    <table className="w3-table-all w3-hoverable">
                        <tr>
                            <th>No</th>
                            <th> User </th>
                            <th> Coach </th>
                            <th> Date / Time </th>
                            <th> Action </th>
                        </tr>
                        {
                            this.state.sessions.map((session)=>{
                                var yy = session.date.getFullYear();
                                var mm = session.date.getMonth();
                                var dd = session.date.getDate();
                                var minutes = session.date.getMinutes();
                                var hour = session.date.getHours(); 
                                var date = yy + '/' + mm + '/' + dd + " " + hour + ":" + minutes;
                                return (
                                    <tr id={session._id} style={{cursor: "pointer"}}>
                                        <td> {session.num} </td>
                                        <td> {session.user} </td>
                                        <td>{session.coach}</td>
                                        <td>{date}</td>
                                        <td>
                                            <button className="w3-btn w3-blue" style={{display:this.state.selectedSession._id !== session._id ? "block" : "none"}} onClick={() => this.showModal(session)}> Modify📝</button>
                                            <button className="w3-btn w3-blue" style={{display:this.state.selectedSession._id === session._id ? "block" : "none"}} onClick={this.closeModal}> Cancel❌</button>
                                        </td>
                                    </tr>
                                );
                            })
                        }
                    </table>
                </div>
                <div id="modal" className="w3-modal">
                    <div className="w3-modal-content">
                        <div className="w3-container" style={{paddingBottom: 20}}>
                            <span onClick={this.cancelUpdate}
                            className="w3-button w3-display-topright">&times;</span>
                            <label className="w3-text-blue" style={{marginTop: "20px"}}><b>User</b></label>
                            <select className="w3-select" name="user" value={this.state.selectedSession.user} onChange={this.setVal}>
                                <option value="" disabled selected>Choose User</option>                                    
                                {
                                    this.state.users.map((user)=>{
                                        return (<option value={user.email}>{user.email}</option>);
                                    })
                                }
                            </select> 
                            <label className="w3-text-blue" style={{marginTop: "20px"}}><b>Coach</b></label>
                            <select className="w3-select" name="coach" value={this.state.selectedSession.coach} onChange={this.setVal}>
                                <option value="" disabled selected>Choose Coach</option>                                    
                                {
                                    this.state.coaches.map((coach)=>{
                                        return (<option value={coach.email}>{coach.email}</option>);
                                    })
                                }
                            </select> 
                            <label className="w3-text-blue" style={{marginTop: "20px"}}><b>Date and Time</b></label>
                            <br/>
                            <DateTimePicker
                                onChange={this.setNewDateTime}
                                value={this.state.selectedSession.date}
                            /> 
                            <br/><br/>
                            <button className="w3-btn w3-blue" onClick={this.updateSession} style={{marginRight: 20}}> Update </button>
                            <button className="w3-btn w3-black" onClick={this.cancelUpdate}> Cancel </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Session);