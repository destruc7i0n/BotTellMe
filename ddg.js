import c from "./config.json";
import _ from "lodash";
import request from "request";

function determine(data,priority,web_fallback) {
    
    let response = "";
    
    for (let p in priority) {
        p = priority[p];
        const ps = p.split(".");
        const type = ps[0];
        if(ps.length > 1) {
            var index = ps[1];
        } else {
            var index = null;
        }

        let result = data[type];
        if (index) {
            if (result.length > index) { result = result[index]; } else { result=null; }
        } 
        if(!result) { continue; }
        
        
        if (result.Text) { response = result.Text; }
        if (result.Text && "url" in result && urls) { 
            if (result.url){ response += ` (${result.url})`; }
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

export function query(ops, cb) {

    const defaultops = {
        q: "", 
        web_fallback: true, 
        priority: ["Answer", "Abstract", "RelatedTopics.0", "Definition"], 
        urls: true
    };
    
    const ddg_options = {
        "q": ops["q"],
        "t": c.USERAGENT,
        "format": "json",
        "pretty": "0",
        "no_redirects": "1",
        "no_html": "1",
        "skip_disambig": "0"
    };    
    
    var ops = _.merge({}, defaultops, ops);
    let out = new Array();
    
    const q = ops["q"];
    const web_fallback = ops["web_fallback"];
    const priority = ops["priority"];
    const urls = ops["urls"];  
    
    for(key in ddg_options) {
        out.push(`${key}=${encodeURIComponent(ddg_options[key])}`);
    }
    
    out = out.join("&");
    
	request(`https://api.duckduckgo.com/?${out}`, (err, response, body) => {
		if (err) console.log(err);
		if (response.statusCode == 200) {
			
            body = JSON.parse(body)
            cb(determine(body, priority, web_fallback));

		} else if (response.statusCode == 500) {
			console.log("ddg error: server error")
		} else {
			console.log(`ddg error: problem with request code: ${response.statusCode}`)
		}
	});    
}
