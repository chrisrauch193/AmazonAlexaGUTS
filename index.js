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
    var speechOutput = "Would you like know the League of Legends schedule";
    var repromptText = "You can say ask me about the League of Legends schedule";
    response.ask(speechOutput, repromptText);
};

ESportsReports.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("ESportsReports onSessionEnded requestId: " + sessionEndedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any cleanup logic goes here
};

ESportsReports.prototype.intentHandlers = {
    // register custom intent handlers
    "GetLoLSchedule": function (intent, session, response) {
        //getEsportsSchedule2();

        /*
        //var noaaResponseObject = JSON.parse(noaaResponseString);
        var jsonObject = {"id":1,"name":"Cloud9 ","acronym":"C9","roster":[
            {"id":24,
                "name":"Bunny FuFuu","first_name":"Michael","last_name":"Kurylo","role":"Support",
                "bio":"Known for his Thresh picks, Michael Bunny Fufuu Kurylo is a long time support " +
                "player in the N A scene. Bunny Fufuu originally played support for Curse during the 2014 N A " +
                "LCS Spring Split before moving to Curse Academy (now Gravity). Bunny Fufuu has continued to pull" +
                " out his aggressive moves in the bot lane as Gravity battled through their debut season in the N A " +
                "L C S.","hometown":null},
            {"id":13,"name":"Incarnati0n","first_name":"Nicolaj","last_name":"Jensen",
                "role":"Mid Lane","bio":"Nicolaj Incarnati0n Jensen is a high elo mid laner from Denmark known " +
            "for favoring assassin champions like Zed and Fizz. Incarnati0n launched his esports career with " +
            "Team Solo Mebdi in 2012 competing in the Season 3 EU LCS Qualifier. However, the team was disqualified" +
            " from the tournament and disbanded in early 2013. Incarnati0n himself was banned in 2013 due to verbal " +
            "abuse and other unsportsmanlike behavior. When his ban was rescinded in mid 2015, Incarnati0n was almost" +
            " immediately acquired by Cloud9.","hometown":null},
            {"id":166,"name":"Hai","first_name":"Hai","last_name":"Lam",
                "role":"Mid Lane","bio":"Hai “Hai” Lam is a veteran mid laner. Preferring assassin champs, Hai is happiest" +
            " when he can explode the enemy carry instantly to turn team fights in Cloud9’s favor. After suffering a" +
            " collapsed lung in 2014 Hai was forced to take a brief recovery apart from Cloud9, but he returned with " +
            "a vengeance to lead Cloud9 to victory in IEM San Jose 2015. Hai has continued to push the Cloud9 " +
            "organization forward both on and off The Rift since he retired from competitive play in 2015.","hometown":null},
            {"id":18,"name":"Sneaky","first_name":"Zachary ","last_name":"Scuderi","role":"AD Carry",
                "bio":"Once the AD Carry for Team Dignitas’ B Team, Zachary “Sneaky” Scuderi joined Cloud9 " +
                "when they were still Quantic Gaming in 2013.. Sneaky became known for his Ashe/Zyra bot lane" +
                " in combination with Lemonnation during Season 3, a deadly duo of crowd control and late game" +
                " damage. Since then Sneaky has transitioned into a fantastic all-around AD carry. He now plays" +
                " a strong Corki and Graves, and a world-class Lucian. Consistently earning one of the highest " +
                "KDA ratios in the NA LCS, Sneaky has been instrumental in Cloud9’s rise to prominence.","hometown":null},
            {"id":53,"name":"Smoothie","first_name":"Andy","last_name":"Ta","role":"Support","bio":"Andy “Smoothie”" +
            " Ta joined Team Dragon Knights in 2015. Despite initial communication issues with his Korean bot lane " +
            "partner LouisXGeeGee, Smoothie and TDK fought their way through the NA Challenger Series and earned a " +
            "spot in the 2015 NA LCS Summer Split. Smoothie will need to level up his synergy with the new TDK AD " +
            "carry Emperor if TDK are going to survive the NA LCS.","hometown":null},
            {"id":118,"name":"Link","first_name":"Austin","last_name":"Shin","role":"Mid Lane","bio":"Austin Link " +
            "Shin replaced veteran member Bigfatlp in the mid lane during late December 2012 after just two weeks as " +
            "his substitute. Suddenly thrown into the fierce competition of the North American LCS, Link quickly " +
            "adapted using his previous experience from professional teams, utilizing his versatile play style to " +
            "stay alive against some of the best mid lane players in the world.  With many other roster adjustments," +
            " Link is now one of the oldest members left.   The 2014 spring split saw a reinvigorated Link and " +
            "revitalized CLG. Playing some of the most promising games in recent memory, Link helped his team finish" +
            " the split in a solid third place. In a dramatic turn of events leading into the 2014 All-Star event, " +
            "Link was traded to Cloud 9 to relieve an injured and ailing Hai as he recovered from a collapsed lung. " +
            "Although Cloud 9 was knocked out during the semi finals against OMG, Link demonstrated that he is a " +
            "world class mid laner.\r\n\r\nLuckily for Link, visiting Paris was just icing on the cake. Hardened " +
            "from battle on the Field of Justice, and armed with new-found knowledge of Cloud 9’s inner workings, " +
            "Link may be just the person to catapult CLG to a first place finish this summer split.","hometown":"North" +
            " Hills, CA"},
            {"id":39,"name":"Rush","first_name":"Yoonjae","last_name":"Lee","role":"Jungler","bio":"A relatively new " +
            "player in the NA scene, Yoonjae “Rush” Lee moved from Korea to join LMQ in 2014. When LMQ was rebranded " +
            "as Team Impulse, Rush was kept on the roster as their starting jungler. With a reputation for incredibly " +
            "aggressive plays, Rush generally either dominates his enemies with early ganks or give up a slew of deaths." +
            " Known for his Lee Sin and Vi in the NA LCS, Rush is going to take any opening to dive the backline and " +
            "explode a carry.","hometown":null},
            {"id":25,"name":"LemonNation","first_name":"Daerek","last_name":"Hart","role":"Support","bio":"Along with" +
            " Hai, Daerek “LemonNation” Hart is one of the founding members of Cloud9. As the official “Carrier of the" +
            " Secret Notebook,” LemonNation is widely seen as Cloud9’s strategist. However, don’t let the book fool you " +
            "– LemonNation is one of the best supports in the NA LCS when it comes to early game map and lane control. " +
            "LemonNation continues to import unexpected bot lane champions such as Nautilus and Veigar into the NA LCS " +
            "from other regions.","hometown":"Eden Prairie"},{"id":8,"name":"Meteos","first_name":"William",
                "last_name":"Hartman","role":"Jungler","bio":"William “Meteos” Hartman is the jungler for Cloud9. " +
                "A purveyor of experimental jungle champions, Meteos has helped popularize a farm-heavy jungle style" +
                " that relies on out-scaling his opponent in the mid and late game. By combining that with an uncanny" +
                " intuition for countering his opposing jungler’s ganks, Meteos quickly rose to MVP status in the LCS." +
                " However, the NA LCS has become more competitive than ever, and C9 is no longer guaranteed their spot" +
                " at the top. ","hometown":"Fairfax"},
            {"id":2,"name":"Balls","first_name":"An","last_name":"Le","role":"Top Lane","bio":"One of the best top " +
            "laners in North America, Balls helped Cloud9 to an astonishing 25-3 record in their debut NA LCS season " +
            "and is a huge factor in their ongoing success. Balls is also known for being on the of best Rumble players" +
            " in the world, with a 100% win rate on the Mechanized Menace over the course of the 2014 and 2015 NA LCS." +
            " The rest of the top lane field will need to be prepared, because Balls isn’t one to back down from a" +
            " challenge.","hometown":"Pharr"},
            {"id":32,"name":"Impact","first_name":"Eon-Young","last_name":"Jeong","role":"Top Lane","bio":"One " +
            "of two former World Champions currently playing in the NA LCS (the other being Team Liquid’s Piglet)," +
            " Eon-Young “Impact” Jeong is one of the most formidable top laners in the world. Impact rose to fame " +
            "while playing with SK Telecom T1 K in 2013. With a squad packed with talent including Faker, bengi, " +
            "and Piglet, SK Telecom T1 K claimed 1st place at the Season 3 World Championship. Impact was acquired" +
            " by Team Impulse in the 2015 NA LCS Spring Split Preseason and helped the team achieve a 4th place " +
            "finish in their debut season.","hometown":"South Korea"},
            {"id":608,"name":"Jensen","first_name":"Nicolaj","last_name":"Jensen","role":"midlane",
                "bio":null,"hometown":"Denmark"}],
            "image":{"image":{"url":"/uploads/open-uri20160803-18976-1lxe9in",
                "thumb":{"url":"/uploads/thumb_open-uri20160803-18976-1lxe9in"}}}};

        var cloud9Array = jsonObject.roster;
        var bunny = cloud9Array[0];


        response.tellWithCard(bunny.bio,
            bunny.bio, bunny.bio);
            */
        getEsportsSchedule2(function (jsonResponse) {
            console.log(jsonResponse);
            response.tellWithCard(jsonResponse.name,
                jsonResponse.name, jsonResponse.name);
        });

    },
    "AMAZON.HelpIntent": function (intent, session, response) {
        response.ask("You can say ask me about the League of Legends schedule!", "You can say ask me about the League of Legends schedule!");
    }
};

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    // Create an instance of the HelloWorld skill.
    var eSportsReports = new ESportsReports();
    eSportsReports.execute(event, context);
};

function getEsportsSchedule() {

    var url = 'api.pandascore.co/all/v1/tournaments/1';

    http.get(url, function (res) {
        var noaaResponseString = '';

        res.on('data', function (data) {
            noaaResponseString += data;
        });

        res.on('end', function () {




            response.tellWithCard("The League of Legends schedule is!",
                "The League of Legends schedule is", "The League of Legends schedule is!");
        });
    })
}

function getEsportsSchedule2(callback) {
    var http = require("http");

    var options = {
        "method": "GET",
        "hostname": "api.pandascore.co",
        "port": null,
        "path": "/lol/v1/matches/1",
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