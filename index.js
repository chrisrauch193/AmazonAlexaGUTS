/**
 Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

 Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

 http://aws.amazon.com/apache2.0/

 or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

/**
 * This simple sample has no external dependencies or session management, and shows the most basic
 * example of how to create a Lambda function for handling Alexa Skill requests.
 *
 * Examples:
 * One-shot model:
 *  User: "Alexa, tell Hello World to say hello"
 *  Alexa: "Hello World!"
 */

/**
 * App ID for the skill
 */
var APP_ID = undefined; //replace with "amzn1.echo-sdk-ams.app.[your-unique-value-here]";

/**
 * The AlexaSkill prototype and helper functions
 */
var AlexaSkill = require('./AlexaSkill');

/**
 * HelloWorld is a child of AlexaSkill.
 * To read more about inheritance in JavaScript, see the link below.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript#Inheritance
 */
var ESportsReports = function () {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
ESportsReports.prototype = Object.create(AlexaSkill.prototype);
ESportsReports.prototype.constructor = ESportsReports;

ESportsReports.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("ESportsReports onSessionStarted requestId: " + sessionStartedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any initialization logic goes here
};

ESportsReports.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log("ESportsReports onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
    var speechOutput = "Would you like to know the League of Legends worlds schedule";
    var repromptText = "You can say ask me about the League of Legends worlds schedule";
    response.ask(speechOutput, repromptText);
};

ESportsReports.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("ESportsReports onSessionEnded requestId: " + sessionEndedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any cleanup logic goes here
};

ESportsReports.prototype.intentHandlers = {
    // register custom intent handlers
    "GetLoLWorldsSchedule": function (intent, session, response) {
        var outputText = '';
        getEsportsSchedule(function (jsonResponse) {
            console.log(jsonResponse);
            for (var i = 0; i < jsonResponse.length; i++)
            {
                var dt = new Date(jsonResponse[i].start);
                outputText += ('Match, with name ' + jsonResponse[i].name + ' - starting on ' + dt.toDateString() + ', with team(s) ');
                //if (jsonResponse[i].teams.length > 1)
                //{
                for (var j = 0; j < jsonResponse[i].teams.length - 1; j++){
                    if (j !== 0)
                    {
                        outputText += ' and ';
                    }
                    console.log('Length of teams: ' + jsonResponse[i].teams.length)
                    console.log(JSON.stringify(jsonResponse[i].teams) + ' - Value of j: ' + j);
                    outputText += (jsonResponse[i].teams[j].name + '. ');

                }
                console.log(JSON.stringify(jsonResponse[i]));
                console.log(jsonResponse[i].winner_id);
                if (jsonResponse[i].winner_id !== null)
                {
                    var winnerId = jsonResponse[i].winner_id;
                    var t = jsonResponse[i].teams.filter(function (e) {
                        console.log(JSON.stringify(e));
                        console.log(e.id + ' ' + winnerId + ' = ' + (e.id === winnerId));
                        return e.id === winnerId;
                    });
                    console.log(JSON.stringify(t));
                    outputText += ('where the winner is ' + t[0].name + '. ');
                }

                //else
                //{
                //    if (jsonResponse[i].teams.length == 1)
                //    {
                //        outputText += (jsonResponse[i].teams[0].name + ' however, the opponent is not known yet.');
                //    }
                //}
            }


            response.tellWithCard(outputText, "Match List Card", "Match List Card Stuff?");
        }, intent.slots.groups.value);

    },
    "AMAZON.HelpIntent": function (intent, session, response) {
        response.ask("You can say ask me about the League of Legends worlds schedule!", "You can say ask me about the League of Legends worlds schedule!");
    }
};

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    // Create an instance of the HelloWorld skill.
    var eSportsReports = new ESportsReports();
    eSportsReports.execute(event, context);
};

function getEsportsSchedule(callback, groups) {
    var http = require("http");
    var tournamentID;

    switch (groups.toUpperCase()) {
        case 'A':
            tournamentID = 93;
            break;
        case 'B':
            tournamentID = 92;
            break;
        case 'C':
            tournamentID = 94;
            break;
        case 'D':
            tournamentID = 96;
            break;
        case 'KNOCK OUT':
            tournamentID = 95;
            break;
    }

    var options = {
        "method": "GET",
        "hostname": "api.pandascore.co",
        "port": null,
        "path": "/lol/v1/matchlist?tournament=" + tournamentID,
        "headers": {
            "authorization": "Bearer 112950-b3jkqCt49dzM85H0wslLA",
            "cache-control": "no-cache",
            "postman-token": "654d93a1-3c75-7097-d2a4-8d0af7623aec"
        }
    };

    var req = http.request(options, function (res) {
        var chunks = [];

        res.on("data", function (chunk) {
            chunks.push(chunk);
        });

        res.on("end", function () {
            var body = Buffer.concat(chunks);
            callback(JSON.parse(body.toString()));
        });
    });

    req.end();

}