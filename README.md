# BotTellMe
A Twitter bot that will give answers to a query that is sent to the bot via Twitter

# Demo
There should be a demo running at [@bottellme](https://twitter.com/bottellme)

## Installation and usage

Clone repository onto a server, edit ```config.json``` (see below for more info) and change any options, and then, in the repository folder:
```sh
$ npm install
$ npm start
```

### Configuration
```js
{
    "USERAGENT": "Bot, Tell Me...", /* your usergagent (will be sent to duckduckgo) */
    
    "TWITTER_CONSUMER_KEY": "xxx", /* consumer key */
    "TWITTER_CONSUMER_SECRET": "xxx", /* consumer secret key */
    "TWITTER_ACCESS_KEY": "xxx", /* access key */
    "TWITTER_ACCESS_SECRET": "xxx", /* secret access key */
    "TWITTER_HANDLE": "@bottellme", /* your twitter handle */
    "TWITTER_ID": "xxx", /* twitter id (find here http://mytwitterid.com/) */
    
    "WOLFRAM_API_ID": "xxx" /* wolfram alpha key */
}
```

## Upcoming
None.

## Suggestions
If you have any suggestions or feature requests, feel free to add an issue and I will take a look and possibly add it to the "Upcoming" section!

## License

MIT. See `LICENSE`.
