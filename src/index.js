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

var currentMatchList;
var currentMatch;


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
    "GetGroupMatchList": function (intent, session, response) {
        getMatchList(function (jsonResponse) {
            var outputText = '';
            currentMatchList = jsonResponse;
            outputText += "Getting Match List for Group " + intent.slots.groups.value + ". ";
            outputText += speakMatchList(currentMatchList);
            response.tellWithCard(outputText, "Match List Card", "Match List Card Stuff?");
        }, intent.slots.groups.value);
    },
    "GetAllGroupMatchList": function (intent, session, response) {
        var outputText = '';
        createGroupStageJSON();
        outputText += "Getting Match List for all Groups. ";
        outputText += JSON.stringify(currentMatch);
        response.tellWithCard(outputText, "Match List Card", "Match List Card Stuff?");
    },
    "GetAllMatchList": function (intent, session, response) {
        var outputText = '';
        createWorldsJSON();
        outputText += "Getting Match List for all Games in the tournament. ";
        outputText += JSON.stringify(currentMatch);
        response.tellWithCard(outputText, "Match List Card", "Match List Card Stuff?");
    },
    "GetKnockoutRoundMatchList": function (intent, session, response) {
        getMatchList(function (jsonResponse) {
            var outputText = '';
            outputText += speakKnockoutRoundMatchList(jsonResponse, intent.slots.rounds.value);
            response.tellWithCard(outputText, "Match List Card", "Match List Card Stuff?");
        }, "KNOCKOUT");
    },
    "GetKnockoutList": function (intent, session, response) {
        getMatchList(function (jsonResponse) {
            var outputText = '';
            currentMatchList = jsonResponse;
            console.log(currentMatchList);
            outputText += "Getting Match List for all of the Knockout Stages. ";
            outputText += speakMatchList(currentMatchList);
            response.tellWithCard(outputText, "Match List Card", "Match List Card Stuff?");
        }, "KNOCKOUT");
    },
    "GetNextMatch": function (intent, session, response) {
        //Begins looping through events in json response
        getMatchList(function (jsonResponse) {
            var outputText = '';
            outputText += "Getting next game to be played. ";
            outputText += speakNextGame(jsonResponse, true);
            response.tellWithCard(outputText, "Match List Card", "Match List Card Stuff?");
        }, "Get Next Match");
    },
    "GetLastMatch": function (intent, session, response) {
        //Begins looping through events in json response
        getMatchList(function (jsonResponse) {
            var outputText = '';
            outputText += "Getting last game that was played. ";
            outputText += speakNextGame(jsonResponse, false);
            response.tellWithCard(outputText, "Match List Card", "Match List Card Stuff?");
        }, "Get Next Match");
    },
    "GetTournamentList": function (intent, session, response) {
        getFutureTournamentList(function (jsonResponse) {
            var outputText = '';
            outputText += 'Here is the list of future tournaments with a fixed date! ';
            outputText += speakFutureTournamentList(jsonResponse);
            response.tellWithCard(outputText, "Match List Card", "Match List Card Stuff?");
        })
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

function createGroupStageJSON() {
    //creates a JSON object of all the group stage matches and assigns it to the global variable
    currentMatch = '';
    var groupArray = ["A", "B", "C", "D"];
    for (var i = 0; i < 4; i++) {
        getMatchList(function (jsonResponse) {
            currentMatch.push(jsonResponse)
        }, groupArray[i]);
    }
}

function createWorldsJSON() {
    //creates a JSON object of all the tournament matches and assigns it to the global variable
    currentMatch = '';
    var groupArray = ["A", "B", "C", "D", "KNOCKOUT"];
    for (var i = 0; i < 5; i++) {
        getMatchList(function (jsonResponse) {
            currentMatch.push(jsonResponse)
        }, groupArray[i]);
    }
}

function speakNextGame(jsonObject, nextGame) {
    // Earliest event initialised to first event in json list
    var outputText = '';
    //Current Date for comparison
    var currentDate = Date.now();
    var jsonResponse = jsonObject.filter(function (e) {
        return (e.start !== null & e.start != 'no start time');
    });
    var earliestEvent;
    if (jsonResponse.length > 0)
    {
        earliestEvent = jsonResponse[0];
    }
    var earliestDate;
    console.log(jsonObject);
    for (var i = 1; i < jsonResponse.length; i++)
    {
        earliestDate = new Date(earliestEvent.start);
        var crtItemDate = new Date(jsonResponse[i].start);
        var diff = Math.abs(currentDate - earliestDate);
        if (nextGame) {
            if (crtItemDate > currentDate && crtItemDate < earliestDate) {
                earliestEvent = jsonResponse[i];
                earliestDate = crtItemDate;
            }
        } else {
            if ((Math.abs(currentDate - crtItemDate) < diff) && crtItemDate < currentDate)
            {
                earliestEvent = jsonResponse[i];
                earliestDate = crtItemDate;
            }
        }
    }
    // Creates output text based on what is earliest event

    console.log(earliestEvent.start);
    earliestDate.setHours(earliestDate.getHours()+1);
    outputText += ('Next game is ' + earliestEvent.name + ' - starting on ' + earliestDate.toISOString().replace(/T/, ' ').replace(/\..+/, '') + ', with team(s) ');
    // Adds team names to event, if they exist
    if (earliestEvent.teams.length == 0)
    {
        outputText += ', not decided yet. ';
    } else {
        for (var j = 0; j < earliestEvent.teams.length; j++) {
            outputText += (earliestEvent.teams[j].name);
            if (j !== 1 && earliestEvent.teams.length >= 2)
            {
                outputText += ', and ';
            }

            if (j !== 0 || (j == 0 && earliestEvent.teams.length == 1)) {
                outputText += '. ';
            }
        }
    }

    if (earliestEvent.winner_id !== null)
    {
        var winnerId = earliestEvent.winner_id;
        var t = earliestEvent.teams.filter(function (e) {
            return e.id === winnerId;
        });
        outputText += (' The winner was ' + t[0].name + '. ');
    }
    return outputText;
}

function speakKnockoutRoundMatchList(jsonResponse, round) {
    var outputText = '';
    currentMatchList = jsonResponse;
    var newMatchList = [];
    switch (round.toUpperCase()) {
        case "QUARTER FINAL":
            outputText += "Getting Match List for the Quarter finals. ";
            for (var i = 0; i < currentMatchList.length; i++) {
                if (currentMatchList[i].name.substring(0,2) === "R1") {
                    newMatchList.push(currentMatchList[i]);
                }
            }
            break;
        case "SEMI FINAL":
            outputText += "Getting Match List for the Semi finals. ";
            for (var i = 0; i < currentMatchList.length; i++) {
                if (currentMatchList[i].name.substring(0,2) === "R2")  {
                    newMatchList.push(currentMatchList[i]);
                }
            }
            break;
        case "FINAL":
            outputText += "Getting Match for the final. ";
            for (var i = 0; i < currentMatchList.length; i++) {
                if (currentMatchList[i].name.substring(0,2) === "R3")  {
                    newMatchList.push(currentMatchList[i]);
                }
            }
            break;
    }
    outputText += speakMatchList(newMatchList);

    return outputText;
}

function speakMatchList(jsonObject) {
    var outputText = "";
    var jsonResponse = jsonObject;
    for (var i = 0; i < jsonResponse.length; i++)
    {
        var dt = new Date(jsonResponse[i].start);
        outputText += ('Match, with name ' + jsonResponse[i].name + ' - starting on ' + dt.toDateString() + ', with team(s) ');

        for (var j = 0; j < jsonResponse[i].teams.length; j++){

            console.log('Length of teams: ' + jsonResponse[i].teams.length)
            console.log(JSON.stringify(jsonResponse[i].teams) + ' - Value of j: ' + j);
            outputText += (jsonResponse[i].teams[j].name);
            if (j !== 1 && jsonResponse[i].teams.length >= 2)
            {
                outputText += ', and ';
            }

            if (j !== 0 || (j == 0 && jsonResponse[i].teams.length == 1)) {
                outputText +=  '. ';
            }

        }

        if (jsonResponse[i].teams.length == 0)
        {
            outputText += ', not decided yet. ';
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
            outputText += (' The winner was ' + t[0].name + '. ');
        }

    }
    return outputText;
}

function speakFutureTournamentList(jsonResponse) {
    var outputText = '';
    var filteredData = jsonResponse.filter(function (d) {
        if (d.start !== null)
        {
            var dt = new Date(d.start);
            var curDate = new Date();
            return dt > curDate;
        }

    });

    for(var i = 0; i < filteredData.length; i++)
    {
        var dt = new Date(filteredData[i].start);
        outputText += filteredData[i].name + ', organised on ' + dt.toISOString().replace(/T/, ' ').replace(/\..+/, '') + ', with a total prizepool of ';
        if (filteredData[i].total_prizepool == 'TBD' || filteredData[i].total_prizepool === null)
        {
            outputText +=  ', not yet announced.';
        }
        else
        {
            outputText += filteredData[i].total_prizepool + ' dollars.';
        }
    }
    return outputText;
}

function getFutureTournamentList(callback) {
    var http = require('http');

    var options = {
        "method": "GET",
        "hostname": "api.pandascore.co",
        "port": null,
        "path": "/all/v1/tournamentlist",
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

function getMatchList(callback, groups) {
    var http = require("http");
    var tournamentID;

    switch (groups.toUpperCase()) {
        case 'A':
            tournamentID = "?tournament=" + 93;
            break;
        case 'B':
            tournamentID = "?tournament=" + 92;
            break;
        case 'C':
            tournamentID = "?tournament=" + 94;
            break;
        case 'D':
            tournamentID = "?tournament=" + 96;
            break;
        case 'KNOCKOUT':
            tournamentID = "?tournament=" + 95;
            break;
        default:
            tournamentID = "";
            break;
    }

    var options = {
        "method": "GET",
        "hostname": "api.pandascore.co",
        "port": null,
        "path": "/lol/v1/matchlist" + tournamentID,
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