import React from 'react';
import { connect } from 'react-redux';
import { SET_CUR_LOC } from '../../constants/actionTypes';
import { callApi, setSession } from '../../action';
import { history } from '../../store';
import $ from "jquery";

const mapStateToProps = state => {
    return {
        location: state.location,
        courses: state.courses
    }
  };
  
const mapDispatchToProps = dispatch => ({
    setCurLoc: (data) => dispatch({type: SET_CUR_LOC, data})
});

class CourseDetail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            title: "Demo Course A",
            videos: [
                {
                    _id: '',
                    num: 0,
                    title: "ABCs",
                    completed: true
                }
            ],
            completed: 0,
            selectedVideo: {},
            selectedSrc: ''
        }
        this.videoRef = React.createRef();
    }

    componentDidMount = async () => {
        const token = localStorage.getItem("type") + "_kackey_" + localStorage.getItem("token");
        var res = await callApi("POST", "/course/getCourseListByQuery", token, {_id: this.props.courses.selectedCourse});
        console.log(res);        
        if (res.Message === "Successfully Get Courses") {
            setSession(res.token);
            this.getCourse(res.data.courses[0]);
        }
    }

    getCourse = (course) => {
        var completed = 0;
        for ( var j = 0; j < course.videos.length; j++){
            course.videos[j].num = j;
            if(course.videos[j].completed)
                completed ++;
        }
        course.completed = completed;
        this.setState({
            title: course.title,
            videos: [... course.videos],
            completed: course.completed
        })
    }

    setAsCompleted = async () => {
        var videoId = this.state.selectedVideo._id;
        console.log(videoId);
        const token = localStorage.getItem("type") + "_kackey_" + localStorage.getItem("token");
        var res = await callApi("POST", "/course/setAsCompleted", token, {courseId: this.props.courses.selectedCourse, videoId: videoId});
        console.log(res)
        if (res.Message === "Successfully Set As Completed") {
            setSession(res.token);
            this.getCourse(res.data.courses[0]);
        }
    }

    playVideo = (video) => {
        this.setState({selectedVideo: video});
        const filename = video.link.split('/')[3];
        const src = process.env.REACT_APP_SERVER_URL + "/file/videoStreaming/" + filename;
        this.setState({selectedSrc: src}, ()=> {
            this.videoRef.current.load();
        });
    }

    render() {
        return (
            <div className="row"  style={{padding: 60}}>
                <div className="user_dash_part" style={{paddingTop: 10}}>
                    <a className="w3-text-blue" style={{cursor: 'pointer'}} onClick={()=>history.push("/user/courses")}> Back To Course List</a>
                    <h4 className="w3-center w3-text-blue"> {this.state.courseName} </h4>
                    <hr/>
                    <br/>
                    <div className="row">
                        <div className="col-md-8" style={{marginBottom: 15}}>
                            <div style={{width: "100%", minHeight: 310, backgroundColor: "grey"}}>
                                <video ref={this.videoRef} width="100%" height="auto" controls onEnded={this.setAsCompleted}>
                                    <source id="videoStreaming" src={this.state.selectedSrc} type="video/mp4"/>
                                    Your browser does not support the video tag
                                </video>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <table className="w3-table w3-bordered" style={{border: "1px solid grey"}}>
                                {
                                    this.state.videos.map((video) => {
                                        return (
                                            <tr key={video._id} style={{cursor: "pointer"}} title="Click to play the Video" onClick={()=>this.playVideo(video)}>
                                                <td>{video.num + 1}</td>
                                                <td className="w3-text-blue">{video.title}</td>
                                                <td>{video.completed?"✔":""}</td>
                                            </tr>
                                        );
                                    })
                                } 
                            </table>                          
                            <div className="user_course_completion_container" style={{width: "100%", marginTop: 15, marginLeft: 0}}>
                                <div className="user_course_completion_body" style={{width: this.state.videos.length ? (100 * this.state.completed / this.state.videos.length) + "%" : "0%"}}></div>
                            </div>
                            <label className="w3-text-blue" style={{marginTop: 5}}><b>{this.state.completed + " / " + this.state.videos.length + " watched."}</b></label>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CourseDetail);