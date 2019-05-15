# node-jsonrequest

A simple wrapper for Node's built-in Request API. This wrapper makes it simple to use JSON endpoints by providing a Promise API that encodes and decodes JSON requests and responses and also supports compressed server responses. It also supports binary or non-JSON responses and passes the buffer back directly if they are encountered.

## Installation
This module is not currently registered with NPM. In order to install, you must use the following command:

`npm install git+https://github.com/unidyne/node-jsonrequest.git`

## Usage Example

```js
const JSONRequest = require('node-jsonrequest');

const myResultObj = await JSONRequest({
	hostname: 'my.hostname.com',
	method: 'post',
	path: '/my/snazzy/jsonRestService',
	payload: {
		field1: 'some value',
		field2: 1298,
		myArrayField: [
			{ id: 1, name: 'object 1' },
			{ id: 2, name: 'object 2' }
		]
	},
	headers: {
		'X-Auth-Client': 'MyAuthClientID',
		'X-Auth-Token': 'MyAuthClientToken'
	}
});

console.log(myResultObj);

```

# Options
The options object parameter supports the following options:
* `hostname` : Required string. This is the hostname of the server to connect to.
* `port` : Optional integer. The port number to send request to. Defaults to `443`.
* `method` : Optional string. Defaults to `post` if a payload is specified, otherwise uses `get`.
* `path` : Required string. Path of endpoint.
* `payload` : Optional any. This gets JSON encoded and sent as the request body.
* `headers` : Optional object. This is a kvp object containing any additional headers that should be sent with the request.
