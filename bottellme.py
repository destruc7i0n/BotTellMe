"""

------------ A Twitter bot that will give answers to a query that is sent to the bot via Twitter ------------

By @TheDestruc7i0n, inspiration from @labnol (http://ctrlq.org/code/19408-create-bot)

Feel free to modify and use this code, but if you do, credit @TheDestruc7i0n (http://thedestruc7i0n.ca)

Uses Tweepy, Wolfram Alpha  and python-duckduckgo for Python Wrappers for the Twitter API, WolframAlpha API and the DuckDuckGo API
Tweepy: http://www.tweepy.org/
WolframAlpha: https://bitbucket.org/jaraco/wolframalpha
python-duckduckgo: https://github.com/crazedpsyc/python-duckduckgo

------------                                                                                     ------------

"""

METHOD = "CONSOLE"

import tweepy, wolframalpha, time, urllib2, urllib, duckduckgo, re, json
	
TWITTER_CONSUMER_KEY = "ABC"	
TWITTER_CONSUMER_SECRET = "DEF"	
TWITTER_ACCESS_KEY = "GHI"
TWITTER_ACCESS_SECRET = "JKL"

TWITTER_HANDLE = "@bottellme"
TWITTER_ID = "MNO"

WOLFRAM_API_ID = "PQR"

#Authenticate
auth = tweepy.OAuthHandler(TWITTER_CONSUMER_KEY, TWITTER_CONSUMER_SECRET)
auth.set_access_token(TWITTER_ACCESS_KEY, TWITTER_ACCESS_SECRET)
api = tweepy.API(auth)	
 
# We are using Tweepy to connect to Twitter

class cSL(tweepy.StreamListener):

	def on_data(self, sdata):
		sdatal = []
		sdatal.append(sdata)
		ndel = 0
		for b, data in enumerate(list(sdatal)):
			print "{}: Started at {}".format(METHOD, time.ctime())
			jdata = json.loads(data.strip())
			print METHOD+": Question from @"+ jdata.get("user",{}).get("screen_name") + ": " + jdata.get("text")
			tweetsl  = " ".join([x for x in jdata.get("text").split() if not x.startswith("@")])
			tweetsl = str("".join([i if ord(i) < 128 else " " for i in tweetsl]))

			retweeted = jdata.get("retweeted")
			from_self = jdata.get("user",{}).get("id_str","") == TWITTER_ID

			if retweeted is not None and not retweeted and not from_self:
				#We are using v2 of the Wolfram Alpha API 
				t2 = None
				answer = None
				client = wolframalpha.Client(WOLFRAM_API_ID)
				res = client.query(tweetsl)

				if len(res.pods) > 0 and res.pods[1].title == "Result":
					pod = res.pods[1]
					if pod.text:
						answer = pod.text
					else:
						answer = "Sorry, I have no answer for that question."
					# to skip ascii character in case of error
					answer = answer.encode("ascii", "ignore")
				else:
					short = duckduckgo.get_zci(q = tweetsl, priority = ["answer", "abstract", "definition", "related.0"], web_fallback = True, urls = True) # Get DuckDuckGo response
					if short != "Sorry, no results.":
						answer = "Closest answer: " + str(short)
					else:
						short = urllib2.urlopen("http://v.gd/create.php?format=simple&url=http://duckduckgo.com/?"+str(urllib.urlencode({"q": tweetsl}))).read()
						answer = "Sorry, I have no answer for that. Try this to continue your search: " + str(short)
				
				if not answer:
					answer = "Sorry, I have no answer for that question." # Final response

				furl = re.findall("http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\(\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+", answer)
				if furl:
					for fu in furl:
						if fu:
							newurl = urllib2.urlopen("http://v.gd/create.php?"+urllib.urlencode({"format": "simple", "url": str(fu)})).read() # To shorten the URL
							answer = answer.replace(fu,newurl)
				try:	
					if len(answer) > 140:
						iterate = 138-len(jdata.get("user",{}).get("screen_name"))
						listt = [answer[i:i+iterate] for i in range(0, len(answer), iterate)]
						recentt = jdata.get("id_str","")
						for lt in listt:
							ltt = "@" + jdata.get("user",{}).get("screen_name") + " " + lt
							print METHOD+": Reply: "+ltt
							api.update_status(ltt, in_reply_to_status_id = recentt)
							recentt = str("".join([m.id_str for m in api.user_timeline(user_id = TWITTER_ID, count = 1)]))
							time.sleep(5)
					else:
						lt = "@" + jdata.get("user",{}).get("screen_name") + " " + answer
						print METHOD+": Reply: "+lt
						api.update_status(lt, in_reply_to_status_id = jdata.get("id_str",""))
				except tweepy.error.TweepError:
					pass
			print "{}: Ended at {}".format(METHOD, time.ctime())
			return True
			del sdatal[b-ndel]
			ndel += 1
			time.sleep(5)

	def on_error(self, status):
		print METHOD+": "+str(status)
		time.sleep(5)
		return True

def tweetStream():
	l = cSL()
	stream = tweepy.Stream(api.auth, l)
	while 1:
		stream.filter(track=[TWITTER_HANDLE])


if __name__ == "__main__":
	tweetStream()
