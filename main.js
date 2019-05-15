"use-strict";

// node-jsonrequest

const
	https = require('https'),
	zlib = require('zlib');

// valid options
// hostname : Required.
// method : Defaults to 'post' if payload specified, 'get' otherwise.
// path : Required.
// payload : Defaults to no payload. Object to be JSON encoded.
// headers : Optional HTTP headers.
// port : Defaults to 443

module.exports = function(options) {
	const jsonString = options.payload ? JSON.stringify(options.payload) : null;
	
	const requestOptions = {
		path: options.path,
		hostname: options.hostname,
		method: (options.method ||  (jsonString ? 'post' : 'get')).toUpperCase(),
		port: options.port || 443,
		headers: Object.assign({
			'User-Agent': 'node-testing/0.1',
			'Content-Type': 'application/json', // JSON payload
			'Accept-Encoding': 'gzip, deflate' // enable compression
		}, options.headers)
	};
	
	// set Content-Length
	if(jsonString) options.headers['Content-Length'] = Buffer.from(jsonString).length;
	
	return new Promise((resolve, reject) => {
		const req = https.request(options, res => {
			const contentEncoding = res.headers['content-encoding'];
			const compressed = ['deflate', 'gzip'].indexOf(contentEncoding) !== -1;
			const encoding = compressed ? 'binary' : 'utf8';
			
			let body = '';
			
			res.setEncoding(encoding);
			
			// request limit reached
			if(res.statusCode == 429) {
				const timeToWait = res.headers['x-retry-after'];
				
				return setTimeout(() => {
					logger('Restarting request call after suggested time');
		
					this.run(options)
					  .then(resolve)
					  .catch(reject);
				  }, timeToWait * 1000);
			}
			
			
			res.on('data', chunk => body += chunk);
			
			res.on('end', () => {
				
				//if(res.statusCode >= 400 && res.statusCode <= 600)
				//	return reject(res.statusCode);
					
				if(compressed) {
					const unzip = contentEncoding === 'deflate' ? zlib.deflate : zlib.gunzip;
					return unzip(Buffer.from(body, encoding), (err, data) => {
						if(err) return reject(err);
						
						return parseResponse(res, data.toString('utf8'), resolve, reject);
					});
				}
				
				return parseResponse(res, body, resolve, reject);
			});
		});
		
		req.on('error', e => {console.log(e);reject(e);});
		
		if(jsonString) req.write(jsonString);
		
		req.end();
	});
};

function parseResponse(res, body, resolve, reject) {
	try {
		// if not JSON, just return the raw response
		if (!/application\/(problem\+)?json/.test(res.headers['content-type']) || body.trim() === '')
			return resolve(body);
		
		const data = JSON.parse(body);
		
		// if an error or error collection returned, reject
		//if(data.error || data.errors)
		if(data.status >= 400)
			return reject(data);//.error || data.errors);
		
		// return the parsed JSON
		return resolve(data);
		
	} catch(e) {
		return reject(e);
	}
}
