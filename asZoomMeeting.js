//include required modules
const jwt = require('jsonwebtoken');
const config = require('./config');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');

const express = require('express');
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
var email, userid, resp;
const port = 3000;

//Use the ApiKey and APISecret from config.js
const payload = {
    iss: config.APIKey,
    exp: ((new Date()).getTime() + 5000)
};
const token = jwt.sign(payload, config.APISecret);


//get the form 
app.get('/', (req,res) => res.send(req.body));

app.get('/meetings/:email', (req, res) => {
    const email = req.params.email;
    if(email) {
        const options = {
            method: 'get',
            qs: {
                status: 'active' 
            },
            headers: {
                'Authorization': `Bearer ${token}`,
                'User-Agent': 'Zoom-api-Jwt-Request',
                'content-type': 'application/json'
            },
            json: true //Parse the JSON string in the response
        }
        fetch( "https://api.zoom.us/v2/users/" + email + '/meetings', options)
            //.then( res => console.log(res.body) )
            .then( resp => resp.json())
            .then( json => res.json({
                status: 200,
                email,
                responseFromAPI: json
            }))
            .catch( err => console.error('This went wrong: ', err) )
    }
    else {
        res.json({
            status: "not ok",
            err: "no fucking email given"
        })
    }
})

app.post('/meetings/new', (req, res) => {
    //store the email address of the user in the email variable
    email = req.body.email;
    const topic = req.body.topic || 'General Counselling';
    const duration = req.body.duration || 10; // Duration of a the session
    const type = req.body.type || 1; // Is it a live meeting (1) or a scheduled meeting (2)
    let startTime = req.body.start_time || new Date(new Date().toUTCString()); // Use this as an example, replace new Date() with your date
    startTime.setTime( startTime.getTime() + 10 * 60 * 1000 ); // Adding 10 minutes for testing purpose
    const start_time = ( type === 1 ) ? null : startTime
    //check if the email was stored in the console
    console.log('UTC Timestamp: ', start_time);
    console.log('Local time: ', start_time.toString());
    //console.log('Access token generated: ', token);
    //Store the options for Zoom API which will be used to make an API call later

    if(email) {
        const meetingSchema = {
            topic,
            duration,
            type,
            start_time
        }
    
        const options = {
            method: 'post',
            qs: {
                status: 'active' 
            },
            headers: {
                'Authorization': `Bearer ${token}`,
                'User-Agent': 'Zoom-api-Jwt-Request',
                'content-type': 'application/json'
            },
            body: JSON.stringify(meetingSchema),
            json: true //Parse the JSON string in the response
        }
    
        fetch( "https://api.zoom.us/v2/users/" + email + '/meetings', options)
            //.then( res => console.log(res.body) )
            .then( resp => resp.json() )
            .then( json => res.json({
                status: 200,

                responseFromTheAPI: json
            }) )
            .catch( err => {
                console.error('This went wrong: ', err)
                res.json({
                    email,
                    status: "not ok",
                    error: err
                })
            })
    }
    else {
        res.json({
            status: "not ok",
            err: "no fucking email given"
        })
    }

});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));