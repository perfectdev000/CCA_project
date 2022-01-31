import React from 'react';
import ReactDOM from "react-dom"
import { connect } from 'react-redux';
import { SET_CUR_LOC,  SET_AUTH } from '../../constants/actionTypes';
import stripeBtn from '../assets/images/stripeBtn.png';
import paypalBtn from '../assets/images/paypalBtn.png';
import StripeCheckout from 'react-stripe-checkout';
import { callApi, setSession } from '../../action';
import { history } from '../../store';
import $ from 'jquery';

// const PayPalButton = window.paypal.Buttons.driver("react", { React, ReactDOM });

const mapStateToProps = state => {
    return {
        location: state.location
    }
  };
  
const mapDispatchToProps = dispatch => ({
    setCurLoc: (data) => dispatch({type: SET_CUR_LOC, data}),
    setAuth: (data) => dispatch({type: SET_AUTH, data})
});

class Membership extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            type: "Monthly",
            amount: 1199,
            payBy: "stripe"
        }
    }

    componentDidMount = () => {
        this.props.setCurLoc("membership");
    }

    //----- STRIPE INTEGRATION
    onToken = async (res) => {
        var data = {
            token: res.id, 
            amount: this.state.amount,
            type: "auto",
            startDate: new Date(),
            expirationDate: new Date(),
            userId: localStorage.getItem('_id')
        }
        var response = await callApi("POST", "/api/stripe/stripePayForMembership", null, data);
        console.log(response);
        if(response.status === 400) {
            alert(response.statusText);
        } else {
            alert(response.Message);            
            setSession(null, null, response.user.type);
            this.props.setAuth({
                email: response.user.email,
                id: response.user.id,
                username: response.user.username,
                discriminator: response.user.discriminator,
                avatar: response.user.avatar,
                type: response.user.type,
                loggedIn: true,
                _id: response.user._id
            });
            history.push("/member");
        }
    };

    //----- PAYPAL INTEGRATION
    createOrder(data, actions) {
        console.log("createOrder");
        console.log(data);
        return actions.order.create({
          purchase_units: [
            {
              amount: {
                value: this.state.amount / 10,
              },
            },
          ],
        });
      }
    
    onApprove = async(data, actions) => {
        console.log("onApprove");
        console.log(data);
        const _id = localStorage.getItem('_id')
        var data = {
            type: "auto",
            startDate: new Date(),
            expirationDate: new Date()
        }
        var token =  "user_kackey_" + localStorage.getItem('token');
        var response = await callApi("POST", "/user/buySubscription/" + _id, token, data);
        console.log(response);
        if(response.status === 400) {
            alert(response.statusText);
        } else {
            alert(response.Message);            
            setSession(null, null, response.user.type);
            this.props.setAuth({
                email: response.user.email,
                id: response.user.id,
                username: response.user.username,
                discriminator: response.user.discriminator,
                avatar: response.user.avatar,
                type: response.user.type,
                loggedIn: true,
                _id: response.user._id
            });
            history.push("/member");
        }
        return actions.order.capture();
    }

    render() {
        return (
            <div className="row"  style={{padding: 60}}>
                <div className="user_dash_part w3-center">
                    <h4 className="w3-center w3-text-blue"> My Memberships </h4>
                    <hr/>
                    <br/>
                    <h4> Type: {this.state.type}</h4>
                    <h4> Amount: {"$ " + this.state.amount/100}</h4>
                    <p> Payment Method </p>
                    <div className={this.state.payBy === "stripe" ? "user_payment_box user_payment_selected" : "user_payment_box"} onClick={()=>this.setState({payBy: "stripe"})}>
                        <img src={stripeBtn} alt="stripe" />
                    </div>
                    <div className={this.state.payBy === "paypal" ? "user_payment_box user_payment_selected" : "user_payment_box"} onClick={()=>this.setState({payBy: "paypal"})}>
                        <img src={paypalBtn} alt="paypal" />
                    </div>
                    <hr/>
                    {/* <button className="w3-btn w3-blue w3-large w3-round" onClick={this.purchase}>Purchase</button> */}
                    <div style={{display: this.state.payBy === "stripe"? "block": "none"}}>
                        <StripeCheckout
                        amount = {this.state.amount}
                        name="Purchase for the Membership"
                        // functions defined above can be used to add more information while making the API call.
                        // description={`Order of ${computeQuantity(cart)} items!`}
                        image='LINKTOIMAGE'
                        stripeKey="pk_test_51K1DDoBfcuoLnkpM1WG7QSXWiTOv2zbtbhiCRLgVQkENqd0OT14Ojq4dwwEGfHmWKVufzcPXuY1yQ5L392FoVSKf00ixzjBYR2"
                        currency="USD"
                        email='jinwangdev531@gmail.com'
                        token={this.onToken}/>
                    </div>
                    <div style={{display: this.state.payBy === "paypal"? "block": "none"}}>
                        {/* <PayPalButton
                            createOrder={(data, actions) => this.createOrder(data, actions)}
                            onApprove={(data, actions) => this.onApprove(data, actions)}
                        /> */}
                    </div>
                </div>
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Membership);