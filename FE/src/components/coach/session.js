import React from 'react';
import { connect } from 'react-redux';
import { SET_CUR_LOC } from '../../constants/actionTypes';
import { callApi, setSession } from '../../action';
import { history } from '../../store';
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css';
moment.locale('en-GB');
const localizer = momentLocalizer(moment)
const mapStateToProps = state => {
    return {
        location: state.location,
        auth: state.auth
    }
  };
  
const mapDispatchToProps = dispatch => ({
    setCurLoc: (data) => dispatch({type: SET_CUR_LOC, data})
});

class Session extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            events: [
                {
                    displayName: 'test',
                    title: "8:00 ~ 9:00",
                    description: 'loren ipsm nundselveheid sehdxo ...',
                    start: new Date('2021-12-27T21:45:00.000Z'),
                    end: new Date('2021-12-27T21:45:00.000Z')
                }
            ],
            calendarOpacity: 1,
            // Add Event Modal
            addModalShow: "none",
            newEvent: {
                date: "",
                startTime: 0,
                endTime: 1,
                repeat: false,
                every: 1,
                repeatType: "day",
                iteration: 2
            },
            // Event Detail Modal
            eventDetailModalShow: "true",
            selectedEvent: {
                _id: "",
                start: new Date(),
                end: new Date(),
                date: "",
                startTime: 0,
                endTime: 1,
                repeat: false,
                every: 1,
                repeatType: "day",
                iteration: 2
            },
            cancelThis: false,
            cancelAll: false
        }
    }

    componentDidMount = () => {
        this.props.setCurLoc("session");
        if(this.props.auth._id !== "")
            this.initEvents(this.props.auth);
    }

    componentWillReceiveProps = async (props) => {
        if(this.props.auth._id === "" && props.auth._id !== "") {
            this.initEvents(props.auth);
        }
    }

    // make events
    initEvents = (coach) => { console.log(this.props.auth);
        var coachTimes = coach.coachTimes;
        var events = [];
        for(var i = 0; i < coachTimes.length; i++) {
            var coachTime = coachTimes[i];
            // check if it's repeat session
            if(coachTime.repeat) {
                var every = coachTime.every;
                var repeatType = coachTime.repeatType;
                var iteration = coachTime.iteration;
                for (let j = 0; j < iteration; j++) {
                    var temp = coachTime;
                    console.log(temp);
                    var start = new Date (coachTime.date);
                    var end = new Date (coachTime.date);

                    switch (repeatType) {
                        case "day":
                            var offset = j * every;
                            start.setDate(start.getDate() + offset);
                            start.setHours (coachTime.startTime);
                            end.setDate(end.getDate() + offset);
                            end.setHours (coachTime.endTime);
                            break;
                        case "week":
                            var offset = 7 * every * j;
                            start.setDate(start.getDate() + offset);
                            start.setHours (coachTime.startTime);
                            end.setDate(end.getDate() + offset );
                            end.setHours (coachTime.endTime);
                            break;
                        case "month":
                            var offset = every * j;
                            start.setMonth(start.getMonth() + offset);
                            start.setHours (coachTime.startTime);
                            end.setMonth(end.getMonth() + offset);
                            end.setHours (coachTime.endTime);
                            break;
                    }                        

                    //check if the start date belongs to the exception list
                    var exceptions = coachTime.exceptions;
                    var except = false;
                    for (var k = 0; k < exceptions.length; k++) {
                        if(new Date(exceptions[k]).toString() === start.toString())
                            except = true;
                    }
                    if(!except) {
                        temp.start = start;
                        temp.end = end;
                        temp.title = temp.startTime + ":00 ~ " + temp.endTime + ":00";
                        temp.displayName = coach.displayName;
                        temp.description = coach.description;
                        temp.role = coach.role;
                        events.push({... temp});
                    }
                }
            } else {
                temp = coachTime;
                start = new Date (coachTime.date);
                start.setHours(coachTime.startTime);
                end = new Date (coachTime.date);
                end.setHours(coachTime.endTime);
                temp.start = start;
                temp.end = end;
                temp.title = temp.startTime + ":00 ~ " + temp.endTime + ":00";
                temp.displayName = coach.displayName;
                temp.description = coach.description;
                temp.role = coach.role;
                events.push(temp);
            }
        }
        console.log(events);
        this.setState({events: [... events]});
    }

    // calandar event

    onSelectSlot = slot => {
        console.log(slot);
        if(slot.action === "click") {

        }
    };

    onSelectEvent = e => {
        console.log(e);
        this.setState({
            selectedEvent: e,
            cancelThis: false,
            cancelAll: false          
        })
        this.showEventDetailModal();
    }

    formatDate = (date) => {
        var month = '' + (date.getMonth() + 1),
        day = '' + date.getDate(),
        year = date.getFullYear();

        if (month.length < 2) 
            month = '0' + month;
        if (day.length < 2) 
            day = '0' + day;
        return year + "-" + month + "-" + day;
    }

    //----- Modal Event
    showAddEventModal = (date) => {
        date = this.formatDate(date);
        var newEvent = this.state.newEvent;
        newEvent.date = date;
        this.setState({
            newEvent: newEvent,
            calendarOpacity: 0.5, 
            addModalShow: "block"
        });
    }

    setNewEventVal = (e, type) => {
        var newEvent = this.state.newEvent;
        newEvent[type] = e.target.value;
        this.setState({newEvent: newEvent});
    }
    
    setNewEventRepeat = (e) => {
        var newEvent = this.state.newEvent;
        newEvent.repeat = e.target.value === "false" ? true : false;
        this.setState({newEvent: {...newEvent}}, ()=>console.log(this.state.newEvent.repeat));
    }

    addEvent = async () => {
        var startTime = parseInt(this.state.newEvent.startTime);
        var endTime = parseInt(this.state.newEvent.endTime);
        if(startTime >= endTime) {
            alert("Start Time must be smaller than the End Time.");
        } else {            
            const token = "coach_kackey_" + localStorage.getItem("token");
            var res = await callApi("POST", "/user/setCoachTimes/" + this.props.auth._id , token, this.state.newEvent);
            console.log(res);
            if(res.status === 400) {
                alert(res.statusText);
            } else {
                setSession(res.token);
                this.initEvents(res.data);
                this.hideAddEventModal();
            }
        }
    }

    hideAddEventModal = () => {
        this.setState({
            calendarOpacity: 1, 
            addModalShow: "none",
            newEvent : {
                date: "2021-12-04",
                startTime: 0,
                endTime: 1,
                repeat: false,
                every: 1,
                repeatType: "day",
                iteration: 2
            }
        });
    }

    //----- Detail Event
    showEventDetailModal = () => {
        this.setState({eventDetailModalShow: "block", calendarOpacity: 0.5});
    }

    hideEventDetailModal = () => {
        this.setState({eventDetailModalShow: "none", calendarOpacity: 1});
    }

    setCancelThis = (e) => {
        var cancelThis = e.target.value === "true" ? false : true;
        this.setState({cancelThis: cancelThis, cancelAll: false});
    }

    setCancelAll = (e) => {
        var cancelAll = e.target.value === "true" ? false : true;
        this.setState({cancelAll: cancelAll, cancelThis: false});
    }

    cancelEvent = async () => {
        if(this.state.cancelThis || this.state.cancelAll) {
            var data;
            if(this.state.cancelThis) {
                data = {
                    coachTimeId: this.state.selectedEvent._id,
                    date: this.state.selectedEvent.start
                }
            } else {
                data = {
                    coachTimeId: this.state.selectedEvent._id,
                    date: false
                }
            }            
            const token = "coach_kackey_" + localStorage.getItem("token");
            var res = await callApi("POST", "/user/cancelCoachTimes/" + this.props.auth._id , token, data);
            console.log(res);
            if(res.status === 400) {
                alert(res.statusText);
            } else {
                setSession(res.token);
                this.initEvents(res.data);
                this.hideEventDetailModal();
            }
        } else {
            this.hideEventDetailModal();
        }
    }

    render() {
        return (
            <div className="row"  style={{padding: 60}}>
                <div className="user_dash_part" style={{position: "relative"}}>
                    <h4 className="w3-center w3-text-blue">Session</h4>
                    <hr/>
                    <div style={{maxWidth: 750, height: 40, margin: "auto auto 10px"}}>
                        <button className="w3-btn w3-round w3-border w3-border-blue w3-hover w3-hover-blue w3-right" style={{width: 100}} onClick={() => this.showAddEventModal(new Date())}> Add Event </button>    
                    </div>
                    <div style={{width: "100%", overflowX: "auto", opacity: this.state.calendarOpacity}}>
                        <div style={{width: 750, height: 450, margin: "auto auto"}}>                 
                            <Calendar
                                selectable={true}
                                localizer={localizer}
                                events={this.state.events}
                                startAccessor="start"
                                endAccessor="end"
                                onSelectEvent={this.onSelectEvent}
                                onSelectSlot={this.onSelectSlot}
                            />
                        </div>
                    </div>  
                </div>
                <div className="w3-modal" style={{display: this.state.addModalShow}}>
                    <div className="w3-modal-content" style={{width: 500, backgroundColor: "white", zIndex: 100}}>
                        <div className="w3-container" style={{paddingBottom: 20}}>
                            <span onClick={this.hideAddEventModal}
                            className="w3-button w3-display-topright">&times;</span>
                            <br/>
                            <h3 className="w3-center w3-text-blue"> Add New Event </h3>
                            <hr/>
                            <label className="w3-text-blue" style={{marginTop: "10px"}}><b>Date</b></label>
                            <input className="w3-input w3-border" type="date" value={this.state.newEvent.date} onChange={(e) => this.setNewEventVal(e, "date")}/>
                            <div className="row">
                                <div className="col-6">
                                    <label className="w3-text-blue" style={{marginTop: "10px"}}><b>Start Time</b></label>
                                    <input className="w3-input w3-border" type="number" min={0} max={23}  value={this.state.newEvent.startTime} onChange={(e) => this.setNewEventVal(e, "startTime")}/>
                                </div>
                                <div className="col-6">
                                    <label className="w3-text-blue" style={{marginTop: "10px"}}><b>End Time</b></label>
                                    <input className="w3-input w3-border" type="number" min={1} max={24} value={this.state.newEvent.endTime} onChange={(e) => this.setNewEventVal(e, "endTime")}/>
                                </div>
                            </div>
                            <input className="w3-check" checked={this.state.newEvent.repeat} style={{marginTop: 20}} type="checkbox" value={this.state.newEvent.repeat} onChange={this.setNewEventRepeat}/>
                            <label className="w3-text-blue"> &nbsp;&nbsp; Repeat </label>
                            <div className="row">
                                <div className="col-6">
                                    <label className="w3-text-blue" style={{marginTop: "10px"}}><b>Every</b></label>
                                    <input className="w3-input w3-border" disabled={!this.state.newEvent.repeat} type="number" min={1} max={10}  value={this.state.newEvent.every} onChange={(e) => this.setNewEventVal(e, "every")}/>
                                </div>
                                <div className="col-6" style={{marginTop: 32}}>
                                    <select className='w3-select w3-border' disabled={!this.state.newEvent.repeat} value={this.state.newEvent.repeatType} onChange={(e) => this.setNewEventVal(e, "repeatType")}>
                                        <option value="day">Days</option>
                                        <option value="week">Weeks</option>
                                        <option value="month">Months</option>
                                    </select>
                                </div>
                            </div>
                            <label className="w3-text-blue" style={{marginTop: "10px"}}><b>Iterations</b></label>
                            <input className="w3-input w3-border" disabled={!this.state.newEvent.repeat} type="number" min={2} max={10} value={this.state.newEvent.iteration} onChange={(e) => this.setNewEventVal(e, "iteration")}/>
                            <br/>
                            <hr/>
                            <button className="w3-btn w3-blue" onClick={this.addEvent} style={{marginRight: 10}}> Add </button>
                            <button className="w3-btn w3-black" onClick={this.hideAddEventModal}> Cancel </button>
                        </div>
                    </div>
                </div>
                <div className="w3-modal" style={{display: this.state.eventDetailModalShow}}>
                    <div className="w3-modal-content" style={{width: 300, backgroundColor: "white", zIndex: 100}}>
                        <div className="w3-container" style={{paddingBottom: 20}}>
                            <span onClick={this.hideEventDetailModal}
                            className="w3-button w3-display-topright">&times;</span>
                            <br/>
                            <h3 className="w3-center w3-text-blue"> Event Details </h3>
                            <hr/>
                            <p> <b className="w3-text-blue">Selected Date : </b>{this.formatDate(this.state.selectedEvent.start)}</p>
                            <p> <b className="w3-text-blue">Time : </b>{this.state.selectedEvent.startTime+ ":00 ~ " + this.state.selectedEvent.endTime + ":00"}</p>
                            <input className="w3-check" checked={this.state.cancelThis} type="checkbox" value={this.state.cancelThis} onChange={this.setCancelThis}/>
                            <label className="w3-text-blue"> &nbsp;&nbsp; Cancel This </label>
                            <div style={{display: this.state.selectedEvent.repeat ? "block" : "none"}}>
                                <input className="w3-check" checked={this.state.cancelAll} style={{marginTop: 10, marginBottom: 20}} type="checkbox" value={this.state.cancelAll} onChange={this.setCancelAll}/>
                                <label className="w3-text-blue"> &nbsp;&nbsp; Cancel All Future </label>
                                <p> <b className="w3-text-blue">Start Date : </b>{this.formatDate(new Date(this.state.selectedEvent.date))}</p>
                                <p> <b className="w3-text-blue">Repeat: </b>{this.state.selectedEvent.repeat ? "every " + this.state.selectedEvent.every + " " + this.state.selectedEvent.repeatType + " ( " + this.state.selectedEvent.iteration + " times ) " : "none"}</p>
                            </div>
                            <hr/>
                            <button className="w3-btn w3-black w3-right" onClick={this.hideEventDetailModal}> Cancel </button>
                            <button className="w3-btn w3-blue w3-right" onClick={this.cancelEvent} style={{marginRight: 10}}> OK </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Session);