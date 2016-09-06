// Microsoft Graph API Backend for Zipwhip Integration

// This Node server provides web services to interact with the Microsoft Graph API
// from a Zipwhip integration. It handles authentication to the Graph API's OAuth
// system. It also handles retrieving contacts for an account.

var http = require('http');
var url = require('url');
var path = require('path');
var fs = require('fs');
var qs = require('querystring');
var authHelper = require('./msftAuth.js');

var mimeTypes = {
    "html": "text/html",
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "png": "image/png",
    "js": "text/javascript",
    "css": "text/css"
};

http.createServer(function(req, res) {

    var fullUrl = req.protocol + '://' + req.headers.host + req.url;
    var corsUrl;
    if (req.headers.referer) {
        var referUrl = url.parse(req.headers.referer);
        corsUrl = referUrl.protocol + "//" + referUrl.hostname;
        console.log("corsUrl:", corsUrl); //, "referrer:", req.headers.referer);
    }
    // console.log("full url:", req);
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    var uri = url.parse(req.url).pathname;
    console.log("URL being requested:", uri, "fullUrl:", fullUrl);

    if (uri == "/") {

        handleHomePage(res, uri);

    }
    else if (uri == "/authurl") {

        var authUrl = authHelper.getAuthUrl(corsUrl);
        var json = {
            authurl: authUrl
        }
        res.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': corsUrl,
            'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE',
            "Access-Control-Allow-Headers": "X-Requested-With"
        });
        res.end(JSON.stringify(json));

    }
    else if (uri == "/gettokenfromcode") {

        // check that we got expected params
        if (query.code && query.session_state) {
            
            var authUrl = authHelper.getTokenFromCode(corsUrl, query.code, function(err, token) {
                var json = {error:err, token:token, session_state:query.session_state, orig_code:query.code};
                if (err) {
                    json.error = true;
                    
                } else {
                    json.token = token;
                }
                res.writeHead(200, {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': corsUrl,
                    'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE',
                    "Access-Control-Allow-Headers": "X-Requested-With"
                });
                res.end(JSON.stringify(json));
            });
        } else {
            var json = {error:true, msg:"Did not supply the code or session_state query parameters so cannot get token from Microsoft Graph API without those."};
            res.writeHead(200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': corsUrl,
                'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE',
                "Access-Control-Allow-Headers": "X-Requested-With"
            });
            res.end(JSON.stringify(json));
        }
    }
    else if (uri == "/gettokenfromrefreshtoken") {

        // check that we got expected params
        if (query.refreshToken) {
            
            var authUrl = authHelper.getTokenFromRefreshToken(corsUrl, query.refreshToken, function(err, refreshResponse) {
                var json = {error:err, refreshResponse:refreshResponse, orig_refreshToken:query.refreshToken};
                if (err) {
                    json.error = true;
                    
                } else {
                    // json.token = token;
                }
                res.writeHead(200, {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': corsUrl,
                    'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE',
                    "Access-Control-Allow-Headers": "X-Requested-With"
                });
                res.end(JSON.stringify(json));
            });
        } else {
            var json = {error:true, msg:"Did not supply the original refreshToken parameter so cannot get new token from Microsoft Graph API without that."};
            res.writeHead(200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': corsUrl,
                'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE',
                "Access-Control-Allow-Headers": "X-Requested-With"
            });
            res.end(JSON.stringify(json));
        }
    }
    else {

        var filename = path.join(process.cwd(), unescape(uri));
        var stats;

        try {
            stats = fs.lstatSync(filename); // throws if path doesn't exist
        }
        catch (e) {
            res.writeHead(404, {
                'Content-Type': 'text/plain'
            });
            res.write('404 Not Found\n');
            res.end();
            return;
        }

        if (stats.isFile()) {
            // path exists, is a file
            var mimeType = mimeTypes[path.extname(filename).split(".").reverse()[0]];
            res.writeHead(200, {
                'Content-Type': mimeType
            });

            var fileStream = fs.createReadStream(filename);
            fileStream.pipe(res);
        }
        else if (stats.isDirectory()) {
            // path exists, is a directory
            res.writeHead(200, {
                'Content-Type': 'text/plain'
            });
            res.write('Index of ' + uri + '\n');
            res.write('TODO, show index?\n');
            res.end();
        }
        else {
            // Symbolic link, other?
            // TODO: follow symlinks?  security?
            res.writeHead(500, {
                'Content-Type': 'text/plain'
            });
            res.write('500 Internal server error\n');
            res.end();
        }

    }

}).listen(process.env.PORT);

var handleHomePage = function(res, uri) {

    res.writeHead(200, {
        'Content-Type': 'text/html'
    });

    var fileStream = fs.createReadStream("widget.html");
    fileStream.pipe(res);

    //res.end("The entry page for this server is widget.html");
}