var c = require("./config.json");
var _ = require("lodash");
var request = require("request");

function determine(data,priority,web_fallback) {
    
    var response = "";
    
    for (var p in priority) {
        p = priority[p];
        var ps = p.split(".");
        var type = ps[0];
        if(ps.length > 1) {
            var index = ps[1];
        } else {
            var index = null;
        }

        var result = data[type];
        if (index) {
            if (result.length > index) { result = result[index]; } else { result=null; }
        } 
        if(!result) { continue; }
        
        
        if (result.Text) { response = result.Text; }
        if (result.Text && "url" in result && urls) { 
            if (result.url){ response += " ("+result.url+")"; }
        }
        if (response){ break; }
    }    

    
    // if there still isn"t anything, try to get the first web result
    if (!response && web_fallback) {        
        if (data.Redirect) {
            response = data.Redirect.url
        }          
    }     

    // final fallback
    if (!response){ 
        response = "Sorry, no results.";
    }    
    
    return response;    
}

exports.query = function(ops, cb) {

    var defaultops = {
        q: "", 
        web_fallback: true, 
        priority: ["Answer", "Abstract", "RelatedTopics.0", "Definition"], 
        urls: true
    }
    
    var ddg_options = {
        "q": ops["q"],
        "t": c.USERAGENT,
        "format": "json",
        "pretty": "0",
        "no_redirects": "1",
        "no_html": "1",
        "skip_disambig": "0"
    };    
    
    var ops = _.merge({}, defaultops, ops);
    var out = new Array();
    
    var q = ops["q"];
    var web_fallback = ops["web_fallback"];
    var priority = ops["priority"];
    var urls = ops["urls"];  
    
    for(key in ddg_options) {
        out.push(key + "=" + encodeURIComponent(ddg_options[key]));
    }
    
    out = out.join("&");
    
	request("https://api.duckduckgo.com/?"+out, function(err, response, body){
		if (err) console.log(err);
		if (response.statusCode == 200) {
			
            body = JSON.parse(body)
            cb(determine(body, priority, web_fallback));

		} else if (response.statusCode == 500) {
			console.log("ddg error: server error")
		} else {
			console.log("ddg error: problem with request code: "+response.statusCode)
		}
	});    
}