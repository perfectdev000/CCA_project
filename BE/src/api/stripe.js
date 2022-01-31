const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require("../modules/userSignUp/signup.model");

router.post('/stripePayForMembership', async (req, res) => {
    try {
        const charge = await stripe.charges.create({
            amount: req.body.amount,
            source: `${req.body.token}`,
            currency: 'USD',
            description: "First Test Charge"    
        });
        console.log(charge);
        if(charge.status == "succeeded") {
            var userId = req.body.userId;
            var expiryDate;
            if(req.body.type === "auto"){
            // if the user selected the auto renewal subscription, 
            // the expiryDate will be the same date of next month
            expiryDate = new Date(req.body.startDate);
            expiryDate.setUTCHours(0,0,0,0);
            expiryDate = expiryDate.setMonth(expiryDate.getMonth() + 1);
            } else {
            // check if the expiryDate greater than the startDate
            var startDate = new Date(req.body.startDate);
            startDate.setUTCHours(0,0,0,0);
            expiryDate = new Date(req.body.expiryDate);
            expiryDate.setUTCHours(0,0,0,0);
            if( startDate >= expiryDate )
                throw new Error ("Expiry Date must be later than the startDate");
            }

            const update = {
                subscription : {
                    startDate: req.body.startDate,
                    expiryDate: expiryDate,
                    type: req.body.type
                },
                type: "member"
            }
            // var result = await User.findByIdAndUpdate(query, update, { new: true });
            const user = await User.findByIdAndUpdate({_id: userId}, update, {new: true});
            console.log(user);
            return res.status(200).send({
                user: user,
                Message: "Successfully Purchased",
            });
        } else {
            res.writeHead( 400, "Failed to purchase", {'content-type' : 'text/plain'});
            return res.end();
        }
    } catch (error) {
        console.log(error);
        res.writeHead( 400, "Failed to purchase", {'content-type' : 'text/plain'});
        return res.end();
    }
    
});

router.post('/stripePayForSeason', async (req, res) => {
    try {
        const charge = await stripe.charges.create({
            amount: req.body.amount,
            source: `${req.body.token}`,
            currency: 'USD',
            description: "First Test Charge"    
        });
        console.log(charge);
        if(charge.status == "succeeded") {
            var userId = req.body.userId;
            var role = req.body.role;
            var update = {
                season: {
                    signedUp: true,
                    assigned: false,
                    role: role,
                }
            }
            var user = await User.findByIdAndUpdate({_id: userId}, update, {new: true});
            return res.status(200).send({
                user: user,
                Message: "Successfully Purchased",
            });            
        } else {
            res.writeHead( 400, "Failed to purchase", {'content-type' : 'text/plain'});
            return res.end();
        }
    } catch (error) {
        console.log(error);
        res.writeHead( 400, "Failed to purchase", {'content-type' : 'text/plain'});
        return res.end();
    }
    
});

module.exports = router;
