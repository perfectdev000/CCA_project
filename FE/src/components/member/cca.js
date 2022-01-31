import React from 'react';
import { connect } from 'react-redux';
import { SET_CCA_ROLE, SET_CUR_LOC } from '../../constants/actionTypes';
import { callApi, setSession } from '../../action';
import { history } from '../../store';

const mapStateToProps = state => {
    return {
        location: state.location,
        auth: state.auth
    }
  };
  
const mapDispatchToProps = dispatch => ({
    setCurLoc: (data) => dispatch({type: SET_CUR_LOC, data}),
    setCCARole: (data) => dispatch({type: SET_CCA_ROLE, data})
});

class CCA extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentSeason: {
                _id: ""
            },
            teams: [],
            toplane: 1,
            jungle: 3,
            midlane: 0,
            adc: 5,
            support: 3
        }
    }

    componentDidMount = async () => {
        this.props.setCurLoc("cca");
        await this.getCurrentSeason();
        if(this.state.currentSeason._id !== ""){
            await this.getTeams();
            await this.getUsers();
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
            var teams = res.data;
            this.setState({teams: teams});
        }
    }

    getUsers = async () => {
        const token = localStorage.getItem("type") + "_kackey_" + localStorage.getItem("token");
        var res = await callApi("POST", "/user/getByQuery", token, {type: "member"});
        console.log(res);
        if(res.Message === "Successfully Get users") {
            var capacity = this.state.currentSeason.capacity;
            var toplane = capacity, jungle = capacity, midlane = capacity, adc = capacity, support = capacity;
            var members = res.data.users;
            for(var i = 0; i < members.length; i++) {
                if(members[i].season.role === "top")
                    toplane--;
                if(members[i].season.role === "jungle")
                    jungle--;
                if(members[i].season.role === "mid")
                    midlane--;
                if(members[i].season.role === "adc")
                    adc--;
                if(members[i].season.role === "support")
                    support--;
            }
            this.setState({
                toplane: toplane,
                jungle: jungle,
                midlane: midlane,
                adc: adc,
                support: support
            })
        }
    }

    buyRole = (role) => {
        this.props.setCCARole(role);
        history.push("/member/payment");
    }

    render() {
        return (
            <div className="row"  style={{padding: 60}}>
                <div className="user_dash_part" style={{display: this.props.auth.season.signedUp ? "none" : "block"}}>
                    <h4 className="w3-center w3-text-blue"> CCA League SignUps</h4>
                    <hr/>
                    <h4 className="w3-center"> "{this.state.currentSeason.title}" <span style={{marginLeft: 50}}>cost: $120</span> </h4>
                    <br/>
                    <table className="w3-table" style={{width: 500, margin: "auto auto"}}>
                        <tr>
                            <td style={{color: "#2196F3", fontSize: 20, paddingTop: 13}}> Toplane </td>
                            <td style={{fontSize: 20, paddingTop: 13}}> {this.state.toplane ? " x " + this.state.toplane : "Sold Out"} </td>
                            <td>
                                <button className="w3-btn w3-border w3-border-blue w3-hover w3-hover-blue w3-round"
                                disabled={this.state.toplane?false:true} onClick={()=>this.buyRole('top')}> Buy </button>
                            </td>
                        </tr>                        
                        <tr>
                            <td style={{color: "#2196F3", fontSize: 20, paddingTop: 13}}> Jungle </td>
                            <td style={{fontSize: 20, paddingTop: 13}}> {this.state.jungle ? " x " + this.state.jungle : "Sold Out"} </td>
                            <td>
                                <button className="w3-btn w3-border w3-border-blue w3-hover w3-hover-blue w3-round"
                                disabled={this.state.jungle?false:true} onClick={()=>this.buyRole('jungle')}> Buy </button>
                            </td>
                        </tr>
                        <tr>
                            <td style={{color: "#2196F3", fontSize: 20, paddingTop: 13}}> Midlane </td>
                            <td style={{fontSize: 20, paddingTop: 13}}> {this.state.midlane ? " x " + this.state.midlane : "Sold Out"} </td>
                            <td>
                                <button className="w3-btn w3-border w3-border-blue w3-hover w3-hover-blue w3-round"
                                disabled={this.state.midlane?false:true} onClick={()=>this.buyRole('mid')}> Buy </button>
                            </td>
                        </tr>
                        <tr>
                            <td style={{color: "#2196F3", fontSize: 20, paddingTop: 13}}> ADC </td>
                            <td style={{fontSize: 20, paddingTop: 13}}> {this.state.adc ? " x " + this.state.adc : "Sold Out"} </td>
                            <td>
                                <button className="w3-btn w3-border w3-border-blue w3-hover w3-hover-blue w3-round"
                                disabled={this.state.adc?false:true} onClick={()=>this.buyRole('adc')}> Buy </button>
                            </td>
                        </tr>
                        <tr>
                            <td style={{color: "#2196F3", fontSize: 20, paddingTop: 13}}> Support </td>
                            <td style={{fontSize: 20, paddingTop: 13}}> {this.state.support ? " x " + this.state.support : "Sold Out"} </td>
                            <td>
                                <button className="w3-btn w3-border w3-border-blue w3-hover w3-hover-blue w3-round"
                                disabled={this.state.support?false:true} onClick={()=>this.buyRole('support')}> Buy </button>
                            </td>
                        </tr>
                    </table>
                </div>
                <div className="user_dash_part" style={{display: this.props.auth.season.signedUp ? "block" : "none"}}>
                    <h4 className="w3-center w3-text-blue"> CCA League </h4>
                    <hr/>
                    <h4 className="w3-center"> "{this.state.currentSeason.title}" <span style={{marginLeft: 50}}>My Role : {this.props.auth.season.role}</span> </h4>
                </div>
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CCA);