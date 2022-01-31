const Tour = require("../tournament/tournament.model");
const Team = require("../tourTeam/tourTeam.model");
const Course = require("../courses/course.model");
const User = require("../userSignUp/signup.model");

exports.sanitize = (obj) => {
    for(var key in obj) {
        if(typeof(obj[key]) === "string" && obj[key][0] === "$"){
            return false;
        }
    }
    return obj;
}

// exports.sanitize = (obj) => {
//     console.log("------------- START OF SATINIZING --------------");
//     console.log("ORIGINAL : ");
//     console.log(obj);
//     for(var key in obj) {
//         if(typeof(obj[key]) === "string"){
//             obj[key] = obj[key].replace(/[^a-z0-9áéíóúñü \@#!%^&*()+:.,_-]/gim, " ").trim();
//         }
//     }
//     console.log("SATINIZED : ");
//     console.log(obj);
//     console.log("-----------------------------------------------");
//     return obj;
// }

exports.everydayInvoking = () => {
    setTimeout(updateSubscriptions, 5000);
}
  
const updateSubscriptions = () => {
    console.log('----- Invoking Everyday ----');

    autoRenewalSubscription();
    autoClearCoachTimes();

    this.everydayInvoking();
}

const autoRenewalSubscription = async () => {
    var members = await User.find({type: "member"});
    for(var i = 0; i < members.length; i++){        
        // check if current date is later than the expiry date or not
        var currentDate = new Date();
        currentDate.setUTCHours(0,0,0,0);
        var expiryDate = new Date (members[i].subscription.expiryDate);
        expiryDate.setUTCHours(0,0,0,0);
        if(currentDate >= expiryDate) {
            // check if the user has got auto renewal subscription
            if(members[i].subscription.type === "auto") {
                // Do the auto purchase for the subscription of the next month
                console.log("Auto purchase for the subscription of '" + members[i].email + "'");
                // TODO : AUTO PURCHASE
            } else {
                // convert the user's role from "member" to "user" and clear subcription
                console.log("Auto Expiry the subscription of '" + members[i].email + "'");
                await User.findByIdAndUpdate({_id: members[i]._id}, {"$set": {type: "user", subscription: {}}}, {new: true});
            }
        }
    }
}

const autoClearCoachTimes = async () => {
    var coaches = await User.find({type: "coach"});
    // check if the coach user has got coach times or not
    for ( var i = 0; i < coaches.length; i++ ) {
        if(coaches[i].coachTimes !== {}) {
            // check if the currect date is later than the expiry date or not
            var currentDate = new Date();
            currentDate.setUTCHours(0,0,0,0);
            var expiryDate = new Date (coaches[i].coachTimes.endOn);
            expiryDate.setUTCHours(0,0,0,0);
            if( expiryDate > new Date("2000-1-1") && expiryDate <= currentDate) {
                // clear the coachTimes
                console.log("Auto Expiry the coach times of '" + coaches[i].email + "'");
                await User.findByIdAndUpdate({_id: coaches[i]._id}, {coachTimes: {}}, {new: true});
            }
        }
    }
}