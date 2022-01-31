import React from 'react';
import ReactDOM from "react-dom"
import { connect } from 'react-redux';
import { SET_AUTH, SET_CCA_ROLE } from '../../constants/actionTypes';
import stripeBtn from '../assets/images/stripeBtn.png';
import paypalBtn from '../assets/images/paypalBtn.png';
import StripeCheckout from 'react-stripe-checkout';
import { callApi, setSession } from '../../action';
import { history } from '../../store';
import $ from 'jquery';
import cca from './cca';

// const PayPalButton = window.paypal.Buttons.driver("react", { React, ReactDOM });

const mapStateToProps = state => {
    return {
        cca: state.cca
    }
  };
  
const mapDispatchToProps = dispatch => ({
    setAuth: (data) => dispatch({type: SET_AUTH, data}),
    setCCARole: (data) => dispatch({type: SET_CCA_ROLE, data})
});

class Payment extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            amount: 12000,
            payBy: "stripe"
        }
    }

    componentDidMount = () => {
        if(this.props.cca.selectedRole === "")
            history.push("/member/cca");
    }

    //----- STRIPE INTEGRATION
    onToken = async (res) => {
        var data = {
            token: res.id, 
            amount: this.state.amount,
            userId: localStorage.getItem('_id'),
            role: this.props.cca.selectedRole
        }
        var response = await callApi("POST", "/api/stripe/stripePayForSeason", null, data);
        console.log(response);
        if(response.status === 400) {
            alert(response.statusText);
        } else {
            alert(response.Message); 
            this.props.setAuth(response.user);        
            history.push("/member/cca");
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
                value: this.state.amount / 100,
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
            userId: localStorage.getItem('_id'),
            role: this.props.cca.selectedRole
        }
        var token =  "member_kackey_" + localStorage.getItem('token');
        var response = await callApi("POST", "/user/signUpForSeason", token, data);
        console.log(response);
        if(response.status === 400) {
            return actions.order.capture();
            alert(response.statusText);
        } else {
            alert(response.Message);   
            this.props.setAuth(response.user);         
            history.push("/member/cca");
        }
    }

    render() {
        return (
            <div className="row"  style={{padding: 60}}>
                <div className="user_dash_part w3-center" style={{position: "relative"}}>
                    <h4 className="w3-center w3-text-blue">Purchase for the Season Role</h4>
                    <hr/>
                    <br/>
                    <a className="w3-text-blue" style={{position: "absolute", left: 30, top: 80, cursor: "pointer"}} onClick={()=>{this.props.setCCARole(""); history.push("/member/cca")}}>Back to CCA</a>
                    <h4> Role: {this.props.cca.selectedRole}</h4>
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
                        name="Purchase for the Role"
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

export default connect(mapStateToProps, mapDispatchToProps)(Payment);