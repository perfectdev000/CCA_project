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
        auth: state.auth,
        coach: state.coach
    }
  };
  
const mapDispatchToProps = dispatch => ({
    setCurLoc: (data) => dispatch({type: SET_CUR_LOC, data})
});

class Booking extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedCoach: {},
            events: [
                {
                    _id: '',
                    title: 'test',
                    description: 'loren ipsm nundselveheid sehdxo ...',
                    start: new Date('2021-12-27T21:45:00.000Z'),
                    end: new Date('2021-12-27T21:45:00.000Z')
                }
            ],
            calendarOpacity: 1,
            // Event Detail Modal
            eventDetailModalShow: "true",
            selectedEvent: {
                _id: "",
                start: new Date(),
                end: new Date(),
                title: "",
                role: "top",
                description: "",
                date: "",
                startTime: 0,
                endTime: 1,
                repeat: false,
                every: 1,
                repeatType: "day",
                iteration: 2
            },
            bookThis: false,
            bookAll: false
        }
    }

    componentDidMount = async () => {
        if(this.props.coach.selectedCoach !== "") {
            const token = "member_kackey_" + localStorage.getItem("token");
            var res = await callApi("get", "/user/getById/" + this.props.coach.selectedCoach, token);
            console.log(res);
            if(res.status === 400) {
                alert(res.statusText);
            } else {
                setSession(res.token);
                this.setState({selectedCoach: {...res.data}}, () => {
                    this.initEvents(this.state.selectedCoach);
                });
            }
        }
    }

    // make events
    initEvents = (coach) => {
        var events = [];
        var coachTimes = coach.coachTimes;
        var buyers = coach.buyers;
        for(var i = 0; i < coachTimes.length; i++) {
            var coachTime = coachTimes[i];
            if(coachTime.repeat) {
                var every = coachTime.every;
                var repeatType = coachTime.repeatType;
                var iteration = coachTime.iteration;
                for (let j = 0; j < iteration; j++) {
                    var temp = coachTime;
                    var start = new Date (coachTime.date);
                    var end = new Date (coachTime.date);

                    switch (repeatType) {
                        case "day":
                            var offset = j * every;
                            start.setDate(start.getDate() + offset);
                            start.setHours (coachTime.startTime);
                            end.setDate(end.getDate() + offset);
                            end.setHours (coachTime.endTime);
                            temp.start = start;
                            temp.end = end;
                            break;
                        case "week":
                            var offset = 7 * every * j;
                            start.setDate(start.getDate() + offset);
                            start.setHours (coachTime.startTime);
                            end.setDate(end.getDate() + offset );
                            end.setHours (coachTime.endTime);
                            temp.start = start;
                            temp.end = end;
                            break;
                        case "month":
                            var offset = every * j;
                            start.setMonth(start.getMonth() + offset);
                            start.setHours (coachTime.startTime);
                            end.setMonth(end.getMonth() + offset);
                            end.setHours (coachTime.endTime);
                            temp.start = start;
                            temp.end = end;
                            break;
                    }                        
                    
                    //check if the start date belongs to the exception list
                    var exceptions = coachTime.exceptions;
                    var except = false;
                    for (var k = 0; k < exceptions.length; k++) {
                        if(new Date(exceptions[k]).toString() === temp.start.toString())
                            except = true;
                    }
                    if(!except) {
                        temp.booked = false;
                        for (var m = 0; m < buyers.length; m++) {
                            if(buyers[m].buyerId === this.props.auth._id) {
                                for(var n = 0; n < buyers[m].bookings.length; n++) {
                                    if(new Date(buyers[m].bookings[n].start).toString() === temp.start.toString())
                                        temp.booked = true;
                                    
                                    console.log(new Date(buyers[m].bookings[n].start).toString() ,"/", temp.start.toString());
                                    console.log(temp.booked);
                                }
                            }
                        }
                        if(temp.booked)
                            temp.title = "* " + temp.startTime + ":00 ~ " + temp.endTime + ":00";
                        else
                            temp.title = temp.startTime + ":00 ~ " + temp.endTime + ":00";
                        
                        events.push({... temp}); 
                    }
                }
            } else {
                var temp = coachTime;
                start = new Date (coachTime.date);
                start.setHours(coachTime.startTime);
                end = new Date (coachTime.date);
                end.setHours(coachTime.endTime);
                temp.start = start;
                temp.end = end;
                temp.booked = false;
                for (var m = 0; m < buyers.length; m++) {
                    if(buyers[m].buyerId === this.props.auth._id) {
                        for(var n = 0; n < buyers[m].bookings.length; n++) {
                            if(new Date(buyers[m].bookings[n].start).toString() === temp.start.toString())
                                temp.booked = true;
                        }
                    }
                }
                if(temp.booked)
                    temp.title = "* " + temp.startTime + ":00 ~ " + temp.endTime + ":00";
                else
                    temp.title = temp.startTime + ":00 ~ " + temp.endTime + ":00";
                    
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
            bookThis: false,
            bookAll: false          
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

    //----- Detail Event
    showEventDetailModal = () => {
        this.setState({eventDetailModalShow: "block", calendarOpacity: 0.5});
    }

    hideEventDetailModal = () => {
        this.setState({eventDetailModalShow: "none", calendarOpacity: 1});
    }

    bookSession = async (isBook) => {
        var data = {
            isBook: isBook,
            coachId: this.state.selectedCoach._id,
            userId: this.props.auth._id,
            time: {
                start: this.state.selectedEvent.start,
                end: this.state.selectedEvent.end
            }
        }        
        const token = "member_kackey_" + localStorage.getItem("token");
        var res = await callApi("POST", "/user/bookCoachTime/", token, data);
        console.log(res);
        if(res.status === 400) {
            alert(res.statusText);
        } else {
            setSession(res.token);
            this.initEvents(res.coach);
            this.hideEventDetailModal();
        }
    }

    render() {
        return (
            <div className="row"  style={{padding: 60}}>
                <div className="user_dash_part" style={{position: "relative"}}>
                    <h4 className="w3-center w3-text-blue">Booking Session</h4>
                    <hr/>
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
                <div className="w3-modal" style={{display: this.state.eventDetailModalShow}}>
                    <div className="w3-modal-content" style={{width: 300, backgroundColor: "white", zIndex: 100}}>
                        <div className="w3-container" style={{paddingBottom: 20}}>
                            <span onClick={this.hideEventDetailModal}
                            className="w3-button w3-display-topright">&times;</span>
                            <br/>
                            <h3 className="w3-center w3-text-blue"> Event Details</h3>
                            <hr/>
                            <p className="w3-blue w3-right w3-round" style={{display: this.state.selectedEvent.title.split(" ")[0] === "*"? "block": "none", padding: 5}}> Booked </p>
                            <p> <b className="w3-text-blue">Time : </b>{this.state.selectedEvent.startTime+ ":00 ~ " + this.state.selectedEvent.endTime + ":00"}</p>
                            <p> <b className="w3-text-blue">Selected Date : </b>{this.formatDate(this.state.selectedEvent.start)}</p>
                            <p> <b className="w3-text-blue">Role : </b>{this.state.selectedEvent.role}</p>
                            <hr/>
                            <button className="w3-btn w3-black w3-right" onClick={this.hideEventDetailModal}> Cancel </button>
                            <button className="w3-btn w3-blue w3-right" onClick={()=>this.bookSession(true)} style={{marginRight: 10, display: this.state.selectedEvent.title.split(" ")[0] === "*"? "none": "block"}}> BOOK </button>
                            <button className="w3-btn w3-blue w3-right" onClick={()=>this.bookSession(false)} style={{marginRight: 10, display: this.state.selectedEvent.title.split(" ")[0] === "*"? "block": "none"}}> UNBOOK </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Booking);