/*jslint bitwise: true, node: true */

var c = require("./config.json");
var Twitter = require("twitter");
var ddg = require("./ddg.js");
var vgd = require("vgd");
var wolfram = require("wolfram-alpha").createClient(c.WOLFRAM_API_ID, {});

var client = new Twitter({
    consumer_key: c.TWITTER_CONSUMER_KEY,
    consumer_secret: c.TWITTER_CONSUMER_SECRET,
    access_token_key: c.TWITTER_ACCESS_KEY,
    access_token_secret: c.TWITTER_ACCESS_SECRET,
});

client.stream("statuses/filter", {track: c.TWITTER_HANDLE},  function(stream){
    stream.on("data", function(tweet) {
        console.log("[INFO] Question from @"+ tweet.user.screen_name + ": " + tweet.text);

        var retweeted = tweet.retweeted;
        var from_self = tweet.user.id_str == c.TWITTER_ID;

        if(!retweeted && !from_self) {
            var newtweet = tweet.text.replace(/\B@[a-z0-9_-]+/gi, "");            
            newtweet = newtweet.replace(/[^\x00-\x7F]/g, ""); // remove non-ascii
            evaluateWithWolfram(tweet,newtweet);
        }
    });

    stream.on("error", function(error) {
        console.log("[ERROR]: "+error);
    });        
});

function evaluateWithWolfram(tweet, quest) {
    wolfram.query(quest, function(err,answer){
        if(answer.length > 0 && answer[1].title == "Result") {
            var finalanswer = answer[1].subpods[0].text;
            tweetIt(tweet, finalanswer);
        } else {
            evaluateWithDDG(tweet, quest);
        }
    });
}

function evaluateWithDDG(tweet, quest) {
    ddg.query({q:quest}, function(info){
        if(info != "Sorry, no results.") {
            var answer = "Closest answer: " + info;
            tweetIt(tweet, answer);
        } else {
            vgd.shorten(encodeURI("http://duckduckgo.com/?q="+quest), function(res){
                var answer = "Sorry, I have no answer for that. Try this to continue your search: "+res;
                tweetIt(tweet, answer);           
            });            
        }
    });    
}

function tweetIt(tweet, answer) {
    if(answer.length > 140) {
        var blocks = 138-tweet.user.screen_name.length;
        var parts = answer.match(new RegExp("[\s\S]{1,"+blocks+"}", "g")) || [];        
        multipleTweets(tweet,parts);                              
    } else {
        var lastTweet = tweet.id_str;
        var toTweet = "@"+tweet.user.screen_name+" "+answer;
        client.post("statuses/update", {status: toTweet, in_reply_to_status_id: lastTweet}, function(error, tweet, response){
            if (!error) {
                console.log("[INFO] Tweeted: "+tweet.text);
            }
        });        
    }
}

function multipleTweets(tweet, tweets) {
    var lastTweet = tweet.id_str;

    tweetParts(0, lastTweet);
    function tweetParts(i, lastTweet) {

        if(i >= tweets.length) {
            return;
        }

        var toTweet = "@"+tweet.user.screen_name+" "+tweets[i];

        client.post("statuses/update", {status: tweet, in_reply_to_status_id: lastTweet}, function(error, tweet, response){
            if (!error) {
                console.log("[INFO] Reply: "+tweet.text);
                client.get("statuses/user_timeline", {user_id: c.TWITTER_ID, count: 1}, function(error, tweets, response){
                    lastTweet = tweets[0].id_str;
                    tweetParts(i+1,lastTweet);
                });
            }
        }); 
    }
}