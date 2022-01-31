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

class Courses extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            courses: [],
            selectedCourse: {
                _id: '',
                num: 0,
                name: '',
                videos: []
            },
            newCourse: '',
            newDescription: '',
            newFile: false,
            newFileTitle: ''
        }
    }

    componentDidMount = async () => {
        this.props.setCurLoc("courses");
        await this.getCourseListByQuery({});
    }

    coursesToState = (courses) => {
        for ( var i = 0; i < courses.length; i++){
            courses[i].num = i;
            for ( var j = 0; j < courses[i].videos.length; j++){
                courses[i].videos[j].num = j;
            }
        }
        this.setState({courses: courses});
    }

    getCourseListByQuery = async (query) => {
        const token = localStorage.getItem("type") + "_kackey_" + localStorage.getItem("token");
        var res = await callApi("POST", "/course/getCourseListByQuery", token, query);
        console.log(res);
        if (res.Message === "Successfully Get Courses") {
            setSession(res.token);
            this.coursesToState(res.data.courses);
        }
    }

    addNewCourse = async () => {
        if(this.state.newCourse !== "") {
            var data = {
                title: this.state.newCourse,
                description: this.state.newDescription,
                videos: []
            }
            const token = localStorage.getItem("type") + "_kackey_" + localStorage.getItem("token");
            var res = await callApi("POST", "/course/addCourse", token, data);
            console.log(res);
            if (res.Message === "Course Added Successfully") {
                setSession(res.token);
                this.coursesToState(res.data.courses);
            }
            this.setState({newCourse: ""});
        }
    }

    addNewVideo = async () => {
        const _id = this.state.selectedCourse._id;
        const file = $("#videoFile").prop("files")[0];
        const title = this.state.newFileTitle;
        if(_id !== "" && file && title !== ""){
            var res = await callApi('POST', '/file/upload', null, { file: file }, true);
            console.log(res);
            var data = {
                title: title,
                link: res.upload.upload.link,
                _id: this.state.selectedCourse._id
            }
            const token = localStorage.getItem("type") + "_kackey_" + localStorage.getItem("token");
            var res = await callApi("POST", "/course/addVideo", token, data);
            console.log(res);
            if (res.Message === "Video Added Successfully") {
                setSession(res.token);
                await this.getCourseListByQuery();
                for(var i = 0; i < this.state.courses.length; i++){
                    if(this.state.courses[i]._id === this.state.selectedCourse._id)
                        this.setState({selectedCourse: this.state.courses[i]});
                }

            }
            this.setState({newFileTitle: '', newDescription: ''});
        }
    }

    render() {
        return (
            <div className="row"  style={{padding: 60}}>
                <div className="user_dash_part" style={{overflowX:"auto"}}>
                    <h4 className="w3-center w3-text-blue"> Courses </h4>
                    <hr/>
                    <table className="w3-table-all w3-hoverable" style={{width: 500, margin: "auto auto"}}>
                        <tr>
                            <th>No</th>
                            <th> Course Name </th>
                            <th> Video Count </th>
                        </tr>
                        {
                            this.state.courses.map((course)=>{
                                return (
                                    <tr id={course._id} onClick={()=>this.setState({selectedCourse: course}, ()=>console.log(this.state.selectedCourse))} style={{cursor: "pointer"}}>
                                        <td> {course.num + 1} </td>
                                        <td> {course.title} </td>
                                        <td>{course.videos.length}</td>
                                    </tr>
                                );
                            })
                        }
                    </table>
                    <div className="row" style={{width: 500, margin: "auto"}}> 
                        <label className="w3-text-blue" style={{marginTop: "20px"}}><b>New Course Title</b></label>
                        <div className="col-md-8" style={{marginBottom: 10}}>
                            <input className="w3-input w3-border" name="name" type="text" value={this.state.newCourse} onChange={(e)=>{this.setState({newCourse: e.target.value})}}/> 
                        </div>
                        <div className="col-md-4">
                            <button className="w3-btn w3-border w3-border-blue w3-hover w3-hover-blue w3-round" style={{width: "100%"}} onClick={this.addNewCourse}>Add Course</button>
                        </div>                        
                        <label className="w3-text-blue"><b>New Course Description</b></label>
                        <div className="col-md-12">
                            <input className="w3-input w3-border" name="description" type="text" value={this.state.newDescription} onChange={(e)=>{this.setState({newDescription: e.target.value})}}/> 
                        </div>
                    </div>
                    <div style={{display: this.state.selectedCourse._id!==""?"":"none"}}>
                        <h5 className="w3-text-blue w3-center" style={{marginTop: "20px"}}>{this.state.selectedCourse.title}</h5>
                        <table className="w3-table-all" style={{width: 500, margin: "auto auto"}}>
                            <tr>
                                <th> No </th>
                                <th> Video </th>
                                <th> Video Link </th>
                            </tr>
                            {
                                this.state.selectedCourse.videos.map((video)=>{
                                    return (
                                        <tr id={video._id}>
                                            <td> {video.num + 1} </td>
                                            <td> {video.title} </td>
                                            <td>{video.link}</td>
                                        </tr>
                                    );
                                })
                            }
                        </table>
                        <div className="row" style={{width: 500, margin: "auto"}}>
                            <label className="w3-text-blue" style={{marginTop: "20px"}}><b>Add New Video</b></label>
                            <div className="col-md-6" style={{marginBottom: 10}}>
                                <input className="w3-input w3-border" id="videoFile" name="newFile" type="file" accept=".mp4"/> 
                            </div>
                            <div className="col-md-6">
                                <input className="w3-input w3-border" style={{height: 47}} name="newFileTitle" placeholder="Add Video Name" type="text" value={this.state.newFileTitle} onChange={(e)=>{this.setState({newFileTitle: e.target.value})}}/>
                            </div>
                            <button className="w3-btn w3-border w3-border-blue w3-hover w3-hover-blue w3-round" style={{width: "100%"}} onClick={this.addNewVideo}>Add Video</button> 
                        </div>                  
                    </div>
                </div>
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Courses);