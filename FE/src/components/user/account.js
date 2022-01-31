import React from 'react';
import { connect } from 'react-redux';
import { callApi, setSession } from '../../action';
import { SET_CUR_LOC, SET_AUTH } from '../../constants/actionTypes';
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

class Account extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            displayName: "",
            description: "",
            role: ""
        }
    }

    componentDidMount = () => {
        this.props.setCurLoc("account");
        if(this.props.auth._id !== "")
            this.setState({
                displayName: this.props.auth.displayName,
                description: this.props.auth.description,
                role: this.props.auth.role
            })
    }
    
    componentWillReceiveProps = async (props) => {
        if(this.props.auth._id === "" && props.auth._id !== "") {
            this.setState({
                displayName: props.auth.displayName,
                description: props.auth.description,
                role: props.auth.role
            })
        }
    }

    toDiscord = () => {
        window.localStorage.setItem("login", "false");
        window.location.href = process.env.REACT_APP_SERVER_URL + "/api/discord/login";
    }

    saveDetail = async () => {
        var data;
        if(this.props.auth.type == "coach") {
            if(this.state.displayName !== "" && this.state.description !== "" && this.state.role !== "")
                data = {
                    displayName: this.state.displayName, 
                    description: this.state.description,
                    role: this.state.role
                }
            else {
                alert("Please fill all the field correctly.")
            }
        } else {
            if(this.state.displayName !== "" && this.state.displayName !== this.props.auth.displayName) {
                data = {
                    displayName: this.state.displayName
                }
            } else {
                alert("Please enter the Display Name");
            }
        }

        var canContinue = false;
        if(this.state.displayName !== this.props.auth.displayName) {
            const token = this.props.auth.type + "_kackey_" + localStorage.getItem("token");
            var res = await callApi("POST", "/user/countByQuery", token, {displayName: this.state.displayName});
            console.log(res);
            if( res.status === 400) {
                alert(res.statusText);
            } else {
                setSession(res.token);
                console.log(res.data.new);
                if(res.data.new === 0) 
                    canContinue = true
                else 
                    alert("The Same Display Name is used. Please use another name.");                
            }
        } 
        if(canContinue) {
            console.log(data);
            const token = this.props.auth.type + "_kackey_" + localStorage.getItem("token");
            var res = await callApi("POST", "/user/updateUserById/" + this.props.auth._id, token, data);
            console.log(res);
            if( res.status === 400) {
                alert(res.statusText);
            } else {
                setSession(res.token);
                
            }
        }
    }

    render() {
        return (
            <div className="row"  style={{padding: 60}}>
                <div className="user_dash_part">
                    <h4 className="w3-center w3-text-blue"> My Account </h4>
                    <hr/>
                    <label className="w3-text-blue" style={{marginTop: "20px"}}><b>Display Name</b></label>
                    <input className="w3-input w3-border" name="psw" type="text" value={this.state.displayName} onChange={(e)=>this.setState({displayName: e.target.value})}/>
                    <div style={{display: this.props.auth.type === "coach"? "block": "none"}}>
                        <label className="w3-text-blue" style={{marginTop: "20px"}}><b>Description</b></label>
                        <input className="w3-input w3-border" name="psw" type="text" value={this.state.description} onChange={(e)=>this.setState({description: e.target.value})}/> 
                        <label className="w3-text-blue" style={{marginTop: "20px"}}><b>Role</b></label>
                        <select className="w3-select" name="option" value={this.state.role} onChange={(e)=>this.setState({role: e.target.value})}>
                            <option value="" disabled selected>Choose your option</option>
                            <option value="top">Toplane</option>
                            <option value="jungle">Jungle</option>
                            <option value="mid">Midlane</option>
                            <option value="adc">ADC</option>
                            <option value="support">Support</option>
                        </select> 
                    </div>     
                    <button className="w3-btn w3-blue" onClick={this.saveDetail} style={{marginTop: 20}}> SAVE </button>   
                    <br/>
                    <label className="w3-text-blue" style={{marginTop: "20px"}}><b>Email</b></label>
                    <input className="w3-input w3-border" name="psw" type="text" disabled={true} value={this.props.auth.email} onChange={this.setDisplayName}/>
                    <label className="w3-text-blue" style={{marginTop: "20px", display: this.props.auth.id===""?"none":"block"}}>
                        <b>Discord Status</b>
                        <span className="w3-text-black" style={{marginLeft: 20}}>connected</span>
                    </label>
                    <button className="w3-btn w3-border w3-border-blue w3-hover w3-hover-blue w3-round" style={{display: this.props.auth.id!==""?"none":"block", marginTop: 20}} onClick={this.toDiscord}> Link Discord </button>
                    <label className="w3-text-blue" style={{marginTop: "20px"}}><b>Transaction History</b></label>
                    <table className="w3-table-all w3-hoverable">
                        <thead>
                            <tr className="w3-light-grey">
                                <th>No</th>
                                <th>Date/Time</th>
                                <th>Product</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        {
                            this.props.auth.transactionHistory.map((history) => {
                                return (
                                    <tr key={history.num}>
                                        <td> { history.num } </td>
                                        <td> { history.date } </td>
                                        <td> { history.product } </td>
                                        <td> {"$" + history.amount } </td>
                                    </tr>
                                );
                            })
                        }
                    </table>
                </div>
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Account);