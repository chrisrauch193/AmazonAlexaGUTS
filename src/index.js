/**
 Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
 http://aws.amazon.com/apache2.0/
 or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
 
/**
 * App ID for the skill
 */
var APP_ID = undefined; //replace with "amzn1.echo-sdk-ams.app.[your-unique-value-here]";

/**
 * The AlexaSkill prototype and helper functions
 */
var AlexaSkill = require('./AlexaSkill');

var ESportsReports = function () {
    AlexaSkill.call(this, APP_ID);
};

// Global variables
var currentMatchList;
var currentMatch;


// Extend AlexaSkill
ESportsReports.prototype = Object.create(AlexaSkill.prototype);
ESportsReports.prototype.constructor = ESportsReports;

ESportsReports.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("ESportsReports onSessionStarted requestId: " + sessionStartedRequest.requestId
        + ", sessionId: " + session.sessionId);
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
};

ESportsReports.prototype.intentHandlers = {
    // Gets list of matches for a given group (A, B, C, D)
    "GetGroupMatchList": function (intent, session, response) {
        getMatchList(function (jsonResponse) {
            var outputText = '';
            currentMatchList = jsonResponse;
            outputText += "Getting Match List for Group " + intent.slots.groups.value + ". ";
            outputText += speakMatchList(currentMatchList);
            response.tellWithCard(outputText, "Match List Card", "Match List Card Stuff?");
        }, intent.slots.groups.value);
    },
    // Gets list of matches from a given knockout round
    "GetKnockoutRoundMatchList": function (intent, session, response) {
        getMatchList(function (jsonResponse) {
            var outputText = '';
            outputText += speakKnockoutRoundMatchList(jsonResponse, intent.slots.rounds.value);
            response.tellWithCard(outputText, "Match List Card", "Match List Card Stuff?");
        }, "KNOCKOUT");
    },
    // Gets list of all matches from all knockout stages
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
    // Tells user about the next match
    "GetNextMatch": function (intent, session, response) {
        //Begins looping through events in json response
        getMatchList(function (jsonResponse) {
            var outputText = '';
            outputText += "Getting next game to be played. ";
            outputText += speakNextGame(jsonResponse, true);
            currentMatchList = jsonResponse;
            response.tellWithCard(outputText, "Match List Card", "Match List Card Stuff?");
        }, "Get Next Match");
    },
    // Tells user about the most recent match
    "GetLastMatch": function (intent, session, response) {
        //Begins looping through events in json response
        getMatchList(function (jsonResponse) {
            var outputText = '';
            outputText += "Getting last game that was played. ";
            outputText += speakNextGame(jsonResponse, false);
            response.tellWithCard(outputText, "Match List Card", "Match List Card Stuff?");
        }, "Get Next Match");
    },
    // Gets a list of all announced tournaments with a definite date
    "GetFutureTournamentList": function (intent, session, response) {
        getTournamentList(function (jsonResponse) {
            var outputText = '';
            outputText += 'Here is the list of future tournaments with a fixed date! ';
            outputText += speakFutureTournamentList(jsonResponse);
            response.tellWithCard(outputText, "Match List Card", "Match List Card Stuff?");
        })
    },
    // Gets the details of a match between two given teams
    "GetMatchSelection": function (intent, session, response) {
        // Checks group A for game between teams
        getMatchList(function (jsonResponse) {
            // B...
            getMatchList(function (jsonResponse1) {
                // C...
                getMatchList(function (jsonResponse2) {
                    // D...
                    getMatchList(function (jsonResponse3) {
                        // puts team names in format used by API
                        var team1 = getTeamInitals(intent.slots.teamOne.value);
                        var team2 = getTeamInitals(intent.slots.teamTwo.value);
                        var matchName = team1 + "-vs-" + team2;
                        var matchID = "";
                        if ((getMatchID(jsonResponse, matchName) != "")) {
                            matchID = getMatchID(jsonResponse, matchName);
                        }
                        else if ((getMatchID(jsonResponse1, matchName) != "")) {
                            matchID = getMatchID(jsonResponse1, matchName);
                        }
                        else if ((getMatchID(jsonResponse2, matchName) != "")) {
                            matchID = getMatchID(jsonResponse2, matchName);
                        }
                        else if ((getMatchID(jsonResponse3, matchName) != "")) {
                            matchID = getMatchID(jsonResponse3, matchName);
                        }

                        getMatchFromMatchID(function(jsonResponse4) {
                            var outputText = '';
                            outputText += 'Here are the details of the match: ';
                            outputText += speakMatchDetails(jsonResponse4);
                            response.tellWithCard(outputText, "Match Details Card", "Match Details Stuff?");
                        }, matchID);
                    }, "D");
                }, "C");
            }, "B");
        }, "A");
    },
    // Tells user details about a given match, retrieved using its unique id
    "GetMatchDetails": function (intent, session, response) {
        var id = intent.slots.id.value;
        getMatchFromMatchID(function (jsonResponse) {
            var outputText = '';
            outputText += 'Here are the details of the match: ';
            outputText += speakMatchDetails(jsonResponse);
            response.tellWithCard(outputText, "Match Details Card", "Match Details Stuff?");
        }, id);
    },
    "GetNextMatchFacts": function (intent, session, response) {
        getMatchList(function (jsonResponse) {
            var lastMatchID = getClosestMatchID(jsonResponse, true);
            getMatchFromMatchID(function(jsonResponse4) {
                var outputText = '';
                outputText += 'Here are the details of the match: ';
                outputText += speakMatchDetails(jsonResponse4);
                response.tellWithCard(outputText, "Match Details Card", "Match Details Stuff?");
            }, lastMatchID);
        }, "Get Next Match");
    },
    "GetLastMatchFacts": function (intent, session, response) {
        getMatchList(function (jsonResponse) {
            var lastMatchID = getClosestMatchID(jsonResponse, false);
            getMatchFromMatchID(function(jsonResponse4) {
                var outputText = '';
                outputText += 'Here are the details of the match: ';
                outputText += speakMatchDetails(jsonResponse4);
                response.tellWithCard(outputText, "Match Details Card", "Match Details Stuff?");
            }, lastMatchID);
        }, "Get Next Match");
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

// Creates a JSON object of all the group stage matches and assigns it to the global variable
function createGroupStageJSON() {
    currentMatchList = '';
    var groupArray = ["A", "B", "C", "D"];
    for (var i = 0; i < 4; i++) {
        getMatchList(function (jsonResponse) {
            currentMatchList.push(jsonResponse)
        }, groupArray[i]);
    }
}

//creates a JSON object of all the tournament matches and assigns it to the global variable
function createWorldsJSON() {
    currentMatchList = '';
    var groupArray = ["A", "B", "C", "D", "KNOCKOUT"];
    for (var i = 0; i < 5; i++) {
        getMatchList(function (jsonResponse) {
            console.log(jsonResponse);
            currentMatchList.push(jsonResponse)
        }, groupArray[i]);
    }
}

// Speaks next game to user, or most recent game if 'nextGame' is false
function speakNextGame(jsonObject, nextGame) {
    // Earliest event initialised to first event in json list
    var outputText = '';
    //Current Date for comparison
    var currentDate = Date.now();
    var jsonResponse = jsonObject.filter(function (e) {
        return (e.start !== null & e.start != 'no start time');
    });
    for (i = 0; i < jsonResponse.length; i++)
    {
        // Correcting for time zone issues (HARD CODED, COULD BE MORE ROBUST)
        dt = new Date(jsonResponse[i].start);
        dt.setHours(dt.getHours() +25);
        // Changes api date format to something more approppriate for reading out
        jsonResponse[i].start = dt.toISOString().replace(/T/, ' ').replace(/\..+/, '');
    }
    // earliest event declaration, acts as most recent event if nextGame is false
    var earliestEvent;
    // Confirms list of event exists and if so, initialises earliest event 
    if (jsonResponse.length > 0)
    {
        earliestEvent = jsonResponse[0];
    }
    var earliestDate;
    
    // Find most recent/find next event by max/min comparison of dates 
    for (var i = 1; i < jsonResponse.length; i++)
    {
        earliestDate = new Date(earliestEvent.start);
        var crtItemDate = new Date(jsonResponse[i].start);

        if (nextGame) {
            if (crtItemDate > currentDate && crtItemDate < earliestDate) {
                earliestEvent = jsonResponse[i];
                earliestDate = crtItemDate;
            }
        } else {
            // date with smallest difference in time from today is most recent
            var diff = Math.abs(currentDate - earliestDate);
            if ((Math.abs(currentDate - crtItemDate) < diff) && crtItemDate < currentDate)
            {
                earliestEvent = jsonResponse[i];
                earliestDate = crtItemDate;
            }
        }
    }
    currentMatch = earliestEvent;
    
    // Creates output text based on what is earliest event
    if (nextGame)
    {
        outputText += ('Next game is ' + earliestEvent.name + ' - starting on ' + earliestDate.toISOString().replace(/T/, ' ').replace(/\..+/, '') + ', with team(s) ');
    }
    else
    {
        outputText += ('Last game was ' + earliestEvent.name + ' - started on ' + earliestDate.toISOString().replace(/T/, ' ').replace(/\..+/, '') + ', with team(s) ');
    }

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
    // Adds winner if there is one
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

// Gets user list of matches in a given knockout round
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

// Gets user list of matches
function speakMatchList(jsonObject) {
    var outputText = "";
    var jsonResponse = jsonObject;
    console.log(JSON.stringify(jsonObject));
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

//Gets match id from either last or next game
function getClosestMatchID(jsonObject, nextGame) {
    // Earliest event initialised to first event in json list
    //Current Date for comparison
    var currentDate = Date.now();
    var jsonResponse = jsonObject.filter(function (e) {
        return (e.start !== null & e.start != 'no start time');
    });
    for (i = 0; i < jsonResponse.length; i++)
    {
        console.log(jsonResponse[i].start);
        dt = new Date(jsonResponse[i].start);
        dt.setHours(dt.getHours() +25);
        console.log(dt);
        jsonResponse[i].start = dt.toISOString().replace(/T/, ' ').replace(/\..+/, '');
        console.log(jsonResponse[i].start);
    }
    var earliestEvent;
    if (jsonResponse.length > 0)
    {
        earliestEvent = jsonResponse[0];
    }
    var earliestDate;
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
    return earliestEvent.id;
}

// Gets user list of tournaments due to occur
function speakFutureTournamentList(jsonResponse) {
    var outputText = '';
    // removes any events that haven't had a date announced
    var filteredData = jsonResponse.filter(function (d) {
        if (d.start !== null)
        {
            var dt = new Date(d.start);
            var curDate = new Date();
            return dt > curDate;
        }

    });

    // Creates text output to describe tournaments
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

// API GET call for tournament list
function getTournamentList(callback) {
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

// API Call for list of matches in a given group
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

function getMatchID(jsonObject, matchName) {
    var jsonResponse = jsonObject;
    console.log(JSON.stringify(jsonResponse));
    var match;
    for (var i = 0; i < jsonResponse.length; i++) {
        match = jsonResponse[i].name;
        console.log(match);
        if (match == matchName) {
            return jsonResponse[i].id;
        }
    }
    return "";
}

function getTeamInitals(teamName) {
    switch (teamName.toUpperCase()) {
        case "SPLYCE":
            return "SPY";
        case "SPLICE":
            return "SPY";
        case "SPLICED":
            return "SPY";
        case "LIGHTS":
            return "SPY";
        case "LIGHT":
            return "SPY";
        case "SPY":
            return "SPY";
        case "T S M":
            return "TSM";
        case "TSM":
            return "TSM";
        case "ROYAL NEVER GIVE UP":
            return "RNG";
        case "ROYAL":
            return "RNG";
        case "NEVER":
            return "RNG";
        case "GIVE":
            return "RNG";
        case "UP":
            return "RNG";
        case "RNG":
            return "RNG";
        case "SAMSUNG GALAXY":
            return "SSG";
        case "SAMSUNG":
            return "SSG";
        case "GALAXY":
            return "SSG";
        case "SSG":
            return "SSG";
        case "SK TELECOM T 1":
            return "SKT";
        case "SK":
            return "SKT";
        case "KT":
            return "SKT";
        case "T1":
            return "SKT";
        case "1":
            return "SKT";
        case "TELECOM":
            return "SKT";
        case "SKT":
            return "SKT";
        case "FLASH WOLVES":
            return "FW";
        case "FLASH":
            return "FW";
        case "WOLVES":
            return "FW";
        case "FW":
            return "FW";
        case "CLOUD 9":
            return "C9";
        case "CLOUD":
            return "C9";
        case "9":
            return "C9";
        case "C9":
            return "C9";
        case "I MAY":
            return "IM";
        case "I":
            return "IM";
        case "EYE":
            return "IM";
        case "MAY":
            return "IM";
        case "IM":
            return "IM";
        case "ALBUS NOX LUNA":
            return "ANX";
        case "ALBUS":
            return "ANX";
        case "NOX":
            return "ANX";
        case "LUNA":
            return "ANX";
        case "ANX":
            return "ANX";
        case "ROX TIGERS":
            return "ROX";
        case "ROX":
            return "ROX";
        case "TIGERS":
            return "ROX";
        case "G2 ESPORTS":
            return "G2";
        case "G 2 ESPORTS":
            return "G2";
        case "G2":
            return "G2";
        case "COUNTER LOGIC GAMING":
            return "CLG";
        case "COUNTER":
            return "CLG";
        case "LOGIC":
            return "CLG";
        case "CLG":
            return "CLG";
        case "H 2 K":
            return "H2K";
        case "H TWO K":
            return "H2K";
        case "H2K":
            return "H2K";
        case "A H Q E SPORTS CLUB":
            return "AHQ";
        case "A H Q E SPORTS CLUB":
            return "AHQ";
        case "AHQ E SPORTS CLUB":
            return "AHQ";
        case "CLUB":
            return "AHQ";
        case "AHQ":
            return "AHQ";
        case "EDWARD GAMING":
            return "EDG";
        case "EDWARD":
            return "EDG";
        case "EDG":
            return "EDG";
        case "INTZ E SPORTS":
            return "ITZ";
        case "Ints":
            return "ITZ";
        case "Int":
            return "ITZ";
        case "ITZ":
            return "ITZ";
    }
}

function getMatchFromMatchID(callback, id) {
    var http = require("http");

    var options = {
        "method": "GET",
        "hostname": "api.pandascore.co",
        "port": null,
        "path": "/lol/v1/matches/" + id,
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

function speakMatchDetails(JSONData) {
    var outputText = '';
    // Retrieves team details
    var JSONTeams = JSONData.teams;
    var team1 = {id: JSONTeams[0].id, name: JSONTeams[0].name};
    var team2 = {id: JSONTeams[1].id, name: JSONTeams[1].name};
    // Begins rundown compilation
    outputText += team1.name + ' versus ' + team2.name + '. ';
    // Adds details for each game
    var gameArray = JSONData.games;
    for(var i = 0; i < gameArray.length; i++) {
        outputText += 'In game '+(i+1)+', ';
        outputText += concatGameDetails(gameArray[i], team1, team2);
    }
    return outputText;
}

function concatGameDetails(JSONGame, team1, team2) {
    // first blood, tower, inhibitor, baron, dragon
    // #of tower_kills, inhibitor_kills, baron_kills, dragon_kills
    var outputText = '';
    // Adds winner of game
    if(JSONGame.winner_id === team1.id) {
        outputText += 'Winner was '+team1.name+'. ';
    } else {
        outputText += 'Winner was '+team2.name+'. ';
    }
    // Adds first blood, tower, etc...
    var gameTeamsArr = JSONGame.game_teams;
    for(var i = 0; i < gameTeamsArr.length; i++) {
        var teamStats = gameTeamsArr[i];
        if(teamStats.team_id === team1.id) {
            outputText += team1.name + ' got: ';
        } else {
            outputText += team2.name + ' got: ';
        }
        if (teamStats.first_blood) {
            outputText += ' first blood, ';
        }
        if (teamStats.first_tower) {
            outputText += ' first tower, ';
        }
        if (teamStats.first_inhibitor) {
            outputText += ' first inhibitor, ';
        }
        if (teamStats.first_baron) {
            outputText += ' first baron, ';
        }
        if (teamStats.first_dragon) {
            outputText += ' first dragon, ';
        }
        outputText += teamStats.tower_kills + ' tower kills, ';
        outputText += teamStats.inhibitor_kills + ' inhibitor kills, ';
        outputText += teamStats.baron_kills + ' baron kills, ';
        outputText += teamStats.dragon_kills + ' dragon kills, ';
        outputText += teamStats.vilemaw_kills + ' vilemaw kills. ';
    }
    return outputText;
}
