import React from 'react';
import { connect } from 'react-redux';
import { SET_CUR_LOC, SET_SELECTED_COURSE } from '../../constants/actionTypes';
import { callApi, setSession } from '../../action';
import { history } from '../../store';

const mapStateToProps = state => {
    return {
        location: state.location
    }
  };
  
const mapDispatchToProps = dispatch => ({
    setCurLoc: (data) => dispatch({type: SET_CUR_LOC, data}),
    setSelectedCourse: (data) => dispatch({type: SET_SELECTED_COURSE, data})
});

class Membership extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            courses: []
        }
    }

    componentDidMount = async () => {
        this.props.setCurLoc("courses");
        await this.getCourseListByQuery({});
    }

    coursesToState = (courses) => {
        for ( var i = 0; i < courses.length; i++){
            courses[i].num = i;
            var completed = 0;
            for ( var j = 0; j < courses[i].videos.length; j++){
                courses[i].videos[j].num = j;
                if(courses[i].videos[j].completed)
                    completed ++;
            }
            courses[i].completed = completed;
        }
        console.log(courses);
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

    goToCourseDetail = (id) => {
        this.props.setSelectedCourse(id);
        history.push("/member/courseDetail");
    }

    render() {
        return (
            <div className="row"  style={{padding: 60}}>
                <div className="user_dash_part">
                    <h4 className="w3-center w3-text-blue"> Courses </h4>
                    <hr/>
                    {
                        this.state.courses.map((course) => {
                            return (
                                <div className="user_session_item" onClick={() => this.goToCourseDetail(course._id)}>
                                    <h4>{ course.title }</h4>
                                    <p>{ course.description }</p>
                                    <div className="user_course_completion_container">
                                        <div className="user_course_completion_body" style={{width: course.videos.length ? (100 * course.completed / course.videos.length) + "%": 0 + "%"}}></div>
                                    </div>
                                    <div style={{marginLeft: '30px', float: 'left'}}>
                                        {course.completed + " / " + course.videos.length} watched
                                    </div>
                                </div>
                            );

                        })
                    }
                </div>
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Membership);