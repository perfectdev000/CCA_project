import React from 'react';
import { connect } from 'react-redux';
import { SET_CUR_LOC } from '../../constants/actionTypes';
import { callApi, removeSession, setSession } from '../../action';
import { history } from '../../store';
import $ from 'jquery';

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
            admins: [],
            coaches: [],
            members: [],
            users: [],
            results: [],
            keyword: "",
            searchBy: "email"
        }
    }

    componentDidMount = () => {
        this.props.setCurLoc("");
    }

    componentWillReceiveProps = async (props) => {
        if(this.props.auth._id === "" && props.auth._id !== "") {
            await this.superadminInitAdminTable();
            await this.superadminInitCoachTable();
            await this.superadminInitMemberTable();
            await this.superadminInitUserTable(); 
            await this.searchUser();
        }
    }

    searchUser = async () => {
        if(this.state.keyword !== "") {
            const token = "superadmin_kackey_" + localStorage.getItem("token");
            var res = await callApi("POST", "/user/getByQuery", token, {[this.state.searchBy]: this.state.keyword});
            console.log(res);
            setSession(res.token);
            var users = res.data.users;
            for(var i = 0; i < users.length; i++)
                users[i].num = i;
            this.setState({results: [...users]});
        }
    }

    //-------------- USER MANAGEMENT --------------

    superadminInitAdminTable = async () => {
        const token = "superadmin_kackey_" + localStorage.getItem("token");
        var res = await callApi("POST", "/user/getAllAdmins", token, {type: "admin"});
        console.log(res);
        setSession(res.token);
        var users = res.data.users;
        for(var i = 0; i < users.length; i++)
            users[i].num = i;
        this.setState({admins: [...users]});
    }

    superadminInitCoachTable = async () => {
        const token = "superadmin_kackey_" + localStorage.getItem("token");
        var res = await callApi("POST", "/user/getByQuery", token, {type: "coach"});
        console.log(res);
        setSession(res.token);
        var users = res.data.users;
        for(var i = 0; i < users.length; i++)
            users[i].num = i;
        this.setState({coaches: [...users]});
    }

    superadminInitMemberTable = async () => {
        const token = "superadmin_kackey_" + localStorage.getItem("token");
        var res = await callApi("POST", "/user/getByQuery", token, {type: "member"});
        console.log(res);
        setSession(res.token, null);
        var users = res.data.users;
        for(var i = 0; i < users.length; i++)
            users[i].num = i;
        this.setState({members: [...users]});
    }

    superadminInitUserTable = async () => {
        const token = "superadmin_kackey_" + localStorage.getItem("token");
        var res = await callApi("POST", "/user/getByQuery", token, {type: "user"});
        console.log(res);
        setSession(res.token);
        var users = res.data.users;
        for(var i = 0; i < users.length; i++){
            users[i].num = i;
        }
        this.setState({users: [...users]});
    }

    superadminChangeUserType = async (e, oldType) => {
        const _id = $(e.target).parent().parent().attr('id');
        const type = $(e.target).val();
        $(e.target).val(oldType);
        const token = "superadmin_kackey_" + localStorage.getItem("token");
        var res = await callApi("POST", "/user/superadminChangeUserType/" + _id, token, {type: type});
        console.log(res);
        setSession(res.token);
        if(res.Message === "User Updated Successfully"){
            await this.superadminUserTableUpdates(oldType);
            await this.superadminUserTableUpdates(type);
            await this.searchUser();
        } else {
            alert("Authentication Failed.");
        }
    }

    changeTournamentAvailable = async (e) => {
        const _id = $(e.target).parent().parent().attr('id');
        const available = $(e.target).val() === "false" ? true : false;
        const token = "superadmin_kackey_" + localStorage.getItem("token");
        var res = await callApi("POST", "/user/setAvailableForTourById/" + _id, token, {available: available});
        console.log(res);
        setSession(res.token);
        if(res.Message === "User Updated Successfully"){
            await this.superadminInitUserTable();
        } else {
          alert(res.Message);
        }
    }

    superadminUserTableUpdates = async (type) => {
        switch (type) {
            case "admin":
                await this.superadminInitAdminTable();
                break;
            case "coach":
                await this.superadminInitCoachTable();
                break;
            case "member":
                await this.superadminInitMemberTable();
                break;
            case "user":
                await this.superadminInitUserTable();
                break;
            default:
                break;
        }
    }

    deleteOneById = async (_id, type) => {
        if(window.confirm ('Do you really want to delete this item? ')) {
            const token = "superadmin_kackey_" + localStorage.getItem("token");
            var res = await callApi("GET", "/user/deleteUserById/" + _id, token);
            console.log(res);
            setSession(res.token);
            if(res.Message === "User Deleted Successfully"){
                await this.superadminUserTableUpdates(type);
            }
        }
    }

    formatDB = async () => {
        const token = "superadmin_kackey_" + localStorage.getItem("token");
        var res = await callApi("POST", "/user/formatDB/", token);
        console.log(res);
        setSession(res.token);
        if(res.Message === "SUCCESS"){
            removeSession();
            history.push("/");
        }
    }

    render() {
        return (
            <div className="row"  style={{padding: 60}}>
                <div className="user_dash_part" style={{overflowX:"auto"}}>
                    <h4 className="w3-center w3-text-blue"> Dashboard </h4>
                    <hr/>
                    <h5 className="w3-text-blue w3-center" style={{marginTop: "20px"}}>Admins</h5>
                    <table className="w3-table-all w3-hoverable">
                        <thead>
                            <tr className="w3-light-grey">
                                <th>No</th>
                                <th>email</th>
                                <th>discord</th>
                                <th>type</th>
                                <th>delete</th>
                            </tr>
                        </thead>
                        <tbody>
                        {
                            this.state.admins.map( (admin) => {
                                return (
                                    <tr id={admin._id} key={admin._id}> 
                                        <td> {admin.num + 1} </td>
                                        <td> {admin.email} </td>
                                        <td> {admin.username !=="" ? (admin.username + "#" + admin.discriminator) : "undefined"} </td>
                                        <td> 
                                            <select className='w3-select' id={"admin_" + admin.num} onChange={(e) => this.superadminChangeUserType (e, "admin")}>
                                                <option value='admin'>admin</option>
                                                <option value='coach'>coach</option>
                                                <option value='member'>member</option>
                                                <option value='user'>user</option>
                                            </select>
                                        </td>
                                        <td style={{cursor: "pointer"}} onClick={() => this.deleteOneById(admin._id, "admin")}> X </td>
                                    </tr>
                                );
                            })
                        }
                        </tbody>                    
                    </table>
                    <br/>
                    <h5 className="w3-text-blue w3-center" style={{marginTop: "20px"}}>Coaches</h5>
                    <table className="w3-table-all w3-hoverable">
                        <thead>
                            <tr className="w3-light-grey">
                                <th>No</th>
                                <th>email</th>
                                <th>discord</th>
                                <th>type</th>
                                <th> Delete </th>
                            </tr>
                        </thead>
                        <tbody>
                        {
                            this.state.coaches.map( (coach) => {
                                return (
                                    <tr id={coach._id} key={coach._id}> 
                                        <td> {coach.num + 1} </td>
                                        <td> {coach.email} </td>
                                        <td> {coach.username !=="" ? (coach.username + "#" + coach.discriminator) : "undefined"} </td>
                                        <td> 
                                            <select className='w3-select' id={"coachType_" + coach.num} onChange={(e) => this.superadminChangeUserType (e, "coach")}>
                                                <option value='coach'>coach</option>
                                                <option value='admin'>admin</option>
                                                <option value='member'>member</option>
                                                <option value='user'>user</option>
                                            </select>
                                        </td>
                                        <td style={{cursor: "pointer"}} onClick={() => this.deleteOneById(coach._id, "coach")}> X </td>
                                    </tr>
                                );
                            })
                        }
                        </tbody>                    
                    </table>
                    <br/>
                    <h5 className="w3-text-blue w3-center" style={{marginTop: "20px"}}>Members</h5>
                    <table className="w3-table-all w3-hoverable">
                        <thead>
                            <tr className="w3-light-grey">
                                <th>No</th>
                                <th>email</th>
                                <th>discord</th>
                                <th>type</th>
                                {/* <th>tournament</th>  */}
                                <th>Delete</th>
                            </tr>
                        </thead>
                        <tbody>
                        {
                            this.state.members.map( (member) => {
                                return (
                                    <tr key={member._id} id={member._id}> 
                                        <td> {member.num + 1} </td>
                                        <td> {member.email} </td>
                                        <td> {member.username !=="" ? (member.username + "#" + member.discriminator) : "undefined"} </td>
                                        <td> 
                                            <select className='w3-select' id={"memberType_" + member.num} onChange={(e) => this.superadminChangeUserType (e, "member")}>
                                                <option value='member'>member</option>
                                                <option value='admin'>admin</option>
                                                <option value='coach'>coach</option>
                                                <option value='user'>user</option>
                                            </select>
                                        </td> 
                                        {/* <td>
                                            <input className="w3-check" type="checkbox" checked={ member.tournament.available } 
                                            value={ member.tournament.available } onClick={(e) => this.changeTournamentAvailable(e)}/>
                                        </td>  */}
                                        <td style={{cursor: "pointer"}} onClick={() => this.deleteOneById(member._id, 'member')}> X </td>
                                    </tr>
                                );
                            })
                        }
                        </tbody>                    
                    </table>
                    <br/>
                    <h5 className="w3-text-blue w3-center" style={{marginTop: "20px"}}>Users</h5>
                    <table className="w3-table-all w3-hoverable">
                        <thead>
                            <tr className="w3-light-grey">
                                <th>No</th>
                                <th>email</th>
                                <th>discord</th>
                                <th>type</th>
                                {/* <th>tournament</th>  */}
                                <th>Delete</th>
                            </tr>
                        </thead>
                        <tbody>
                        {
                            this.state.users.map( (user) => {
                                return (
                                    <tr id={user._id} key={user._id}> 
                                        <td> {user.num + 1} </td>
                                        <td> {user.email} </td>
                                        <td> {user.username !=="" ? (user.username + "#" + user.discriminator) : "undefined"} </td>
                                        <td> 
                                            <select className='w3-select' id={"userType_" + user.num} onChange={(e) => this.superadminChangeUserType (e, "user")}>
                                                <option value='user'>user</option>
                                                <option value='admin'>admin</option>
                                                <option value='coach'>coach</option>
                                                <option value='member'>member</option>
                                            </select>
                                        </td> 
                                        {/* <td>
                                            <input className="w3-check" type="checkbox" checked={user.tournament.available}
                                            value={ user.tournament.available} onChange={(e) => this.changeTournamentAvailable(e)}/>
                                        </td>  */}
                                        <td style={{cursor: "pointer"}} onClick={() => this.deleteOneById(user._id, "user")}> X </td>
                                    </tr>
                                );
                            })
                        }
                        </tbody>                    
                    </table>
                    <br/>
                    <div className="row" style={{width: 500, margin: "auto"}}>
                        <label className="w3-text-blue" style={{marginTop: "20px"}}><b>Search Users</b></label>
                        <div className="col-md-8" style={{marginBottom: 10}}>
                            <input className="w3-input w3-border" name="keyword" type="text" value={this.state.keyword} onChange={(e)=>this.setState({keyword: e.target.value})}/> 
                        </div>
                        <div className="col-md-4">
                            <select className="w3-select w3-border" name="option" value={this.state.searchBy} onChange={(e)=>this.setState({searchBy: e.target.value})}>
                                <option value="email">By Email</option>
                                <option value="discord">By Discord</option>
                            </select> 
                        </div>
                        <button className="w3-btn w3-border w3-border-blue w3-hover w3-hover-blue w3-round" style={{marginTop: 20}} onClick={this.searchUser}>Search</button>
                    </div>
                    <h5 className="w3-text-blue w3-center" style={{marginTop: "20px"}}>Search Results</h5>
                    <table className="w3-table-all" style={{width: 500, margin: "auto auto"}}>
                    <tr>
                        <th> Num </th>
                        <th> Email </th>
                        <th> Discord </th>
                        <th>Role</th>
                        <th>Delete</th>
                    </tr>
                        {
                            this.state.results.map( (result) => {
                                return (
                                    <tr id={result._id} key={result._id}> 
                                        <td> {result.num + 1} </td>
                                        <td> {result.email} </td>
                                        <td> {result.username !=="" ? (result.username + "#" + result.discriminator) : "undefined"} </td>
                                        <td> 
                                            <select className='w3-select' value={result.type} onChange={(e) => this.superadminChangeUserType (e, result.type)}>
                                                <option value='coach'>coach</option>
                                                <option value='admin'>admin</option>
                                                <option value='member'>member</option>
                                                <option value='user'>user</option>
                                            </select>
                                        </td>
                                        <td style={{cursor: "pointer"}} onClick={() => this.deleteOneById(result._id, "coach")}> X </td>
                                    </tr>
                                );
                            })
                        }
                    </table>
                    <a className="w3-text-blue" onClick={this.formatDB}> Format DB </a>
                </div>
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);