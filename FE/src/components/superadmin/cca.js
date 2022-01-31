import React from 'react';
import { connect } from 'react-redux';
import { SET_CUR_LOC } from '../../constants/actionTypes';
import $ from 'jquery';
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

class CCA extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // create new season
            newTitle: "",
            newCapacity: "",
            // new team
            newTeam: "",
            currentSeason: {
                _id: ""
            },
            teams: [],
            players: []
            
        }
    }

    componentDidMount = async () => {
        this.props.setCurLoc("cca");
        await this.getCurrentSeason();
        if(this.state.currentSeason._id !== ""){
            await this.getTeams();
            await this.getCCAPlayers();
        }
    }

    getCurrentSeason = async () => {
        const token = localStorage.getItem("type") + "_kackey_" + localStorage.getItem("token");
        var res = await callApi("POST", "/season/getCurrentSeason", token);
        console.log(res);
        if(res.Message === "Successfully get Current Season"){
            setSession(res.token);
            this.setState({currentSeason: res.season});
        }
    }

    getTeams = async () => {
        const token = localStorage.getItem("type") + "_kackey_" + localStorage.getItem("token");
        var res = await callApi("POST", "/leagueTeam/getTeamListByQuery", token, {seasonId: this.state.currentSeason._id});
        console.log(res);
        if(res.Message === "Successfully Get League Teams By Query"){
            setSession(res.token);
            this.setState({teams: res.data});
        }
    }

    getCCAPlayers = async () => {
        const token = localStorage.getItem("type") + "_kackey_" + localStorage.getItem("token");
        var res = await callApi("POST", "/user/getCCAPlayers", token, {seasonId: this.state.currentSeason._id});
        console.log(res);
        if(res.Message === "Successfully got the Players list"){
            setSession(res.token);
            this.setState({players: res.data});
        }
    }

    createLeague = async () => {
        const title = this.state.newTitle;
        var newCapacity = this.state.newCapacity;
        var data = {
            title: title,
            capacity: newCapacity
        }
        if(title !== "" && newCapacity > 1) {
            const token = localStorage.getItem("type") + "_kackey_" + localStorage.getItem("token");
            var res = await callApi("POST", "/season/createNewSeason", token, data);
            console.log(res);
            if(res.Message === "Successfully Created New Season"){
                setSession(res.token);
                this.setState({currentSeason: res.data});
            }
        }
    }

    addNewTeam = async () => {
        var name = this.state.newTeam;
        if(name !== "") {
            var data = {
                seasonId: this.state.currentSeason._id,
                name: name
            }
            const token = localStorage.getItem("type") + "_kackey_" + localStorage.getItem("token");
            var res = await callApi("POST", "/leagueTeam/createTeam", token, data);
            console.log(res);
            if(res.status === 400) {
                alert(res.statusText);
            } else if (res.Message === "Successfully Created League Team") {
                setSession(res.token);
                this.setState({teams: res.data});
            }
            this.setState({newTeam: ""});
        }
    }

    removeTeam = async (teamId) => {
        var data = {
            teamId: teamId
        }
        const token = localStorage.getItem("type") + "_kackey_" + localStorage.getItem("token");
        var res = await callApi("POST", "/leagueTeam/deleteTeam", token, data);
        console.log(res);
        if(res.status === 400) {
            alert(res.statusText);
        } else if (res.Message === "Successfully Delete League Team") {
            setSession(res.token);
            this.setState({teams: res.data});
        }
        this.setState({newTeam: ""});
    }

    setTeam = async (e, _id, oldTeam, role) => {
        var id = e.target.id;
        var data = {
            newTeam: e.target.value,
            userId: _id,
            oldTeam: oldTeam,
            role: role
        }; console.log(data);
        const token = localStorage.getItem("type") + "_kackey_" + localStorage.getItem("token");
        var res = await callApi("POST", "/leagueTeam/addMemberToTeam", token, data);
        console.log(res);
        if(res.status === 400) {
            alert(res.statusText);
            $("#" + id).val(oldTeam);
        } else if (res.Message === "Successfully Add the member") {
            alert(res.Message);
            await this.getCCAPlayers();
        }
    }

    render() {
        return (
            <div className="row"  style={{padding: 60}}>
                <div className="user_dash_part" style={{overflowX:"auto"}}>
                    <h4 className="w3-center w3-text-blue"> CCA League </h4>
                    <hr/>
                    <div style={{display: this.state.currentSeason._id == "" ? "block" : "none"}}>
                        <label className="w3-text-blue" style={{marginTop: "20px"}}><b>Title</b></label>
                        <input className="w3-input" type="text" placeholder="new Season" value={this.state.newTitle} onChange={(e)=>this.setState({newTitle: e.target.value})}/>
                        <label className="w3-text-blue" style={{marginTop: "20px"}}><b>Available Team Number</b></label>
                        <input className="w3-input" type="number" placeholder="Numbers Of Teams" value={this.state.newCapacity} onChange={(e)=>this.setState({newCapacity: e.target.value})}/>
                        <button className="w3-btn w3-blue" onClick={this.createLeague} style={{marginTop: 20}}>Create New CCA League</button>
                    </div>
                    <div style={{display: this.state.currentSeason._id == "" ? "none" : "block"}}>
                        <h4 className="w3-center"> {this.state.currentSeason.title} </h4>
                        <button className="w3-btn w3-red w3-right" style={{marginLeft: 15}} onClick={this.deleteSeason}>Delete Season</button>
                        <button className="w3-btn w3-yellow w3-right" onClick={this.finishSeason}>Finish Season</button>
                        <label className="w3-text-blue" style={{marginTop: "20px"}}><b>Added Teams</b></label>
                        <table className="w3-table-all w3-hoverable">
                            <tr>
                                <th> Team </th>
                                <th> Action </th>
                            </tr>
                            {
                                this.state.teams.map((team) => {
                                    return (
                                        <tr>
                                            <td> {team.name} </td>
                                            <td> <button className="w3-btn w3-blue" onClick={()=> this.removeTeam(team._id)}>Remove</button> </td>
                                        </tr>
                                    )
                                })
                            }
                        </table>
                        <label className="w3-text-blue" style={{marginTop: "20px"}}><b>Add New Team</b></label>
                        <div className="row">
                            <div className="col-md-8">
                                <input className="w3-input w3-border" type="text" style={{marginBottom: 10}} value={this.state.newTeam} onChange={(e)=>this.setState({newTeam: e.target.value})}/>            
                            </div>
                            <div className="col-md-4">
                                <button className="w3-btn w3-blue" onClick={this.addNewTeam}>Add New Team</button>            
                            </div>
                        </div>
                        <label className="w3-text-blue" style={{marginTop: "20px"}}><b>Player team assignment</b></label>
                        <table className="w3-table-all w3-hoverable">
                            <tr>
                                <th> email </th>
                                <th> discord </th>
                                <th> team </th>
                                <th> role </th>
                            </tr>
                            {
                                this.state.players.map((player) => {
                                    return (
                                        <tr>
                                            <td> {player.email} </td>
                                            <td> {player.username !== "" ? player.username + "#" + player.discriminator : "undefined"} </td>
                                            <td>
                                                <select className="w3-select" id={player._id} name="user" value={player.season.teamId} onChange={(e) => this.setTeam(e, player._id, player.season.teamId, player.season.role)}>
                                                    <option value="" selected>Choose Team</option>                                    
                                                    {
                                                        this.state.teams.map((team)=>{
                                                            return (<option value={team._id}>{team.name}</option>);
                                                        })
                                                    }
                                                </select> 
                                            </td>
                                            <td> {player.season.role} </td>
                                        </tr>
                                    )
                                })
                            }
                        </table> 
                    </div>
                </div>
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CCA);