var etag = require('etag');
var filesizeParser = require('filesize-parser');

module.exports = function(options) {
	var max_length = options && options.limit;
	if (typeof max_length === 'string') {
		max_length = filesizeParser(max_length);
	} else if (max_length === null) {
		max_length = Infinity;
	} else if (!max_length) {
		max_length = 512 * 1024;
	}

	return {
		name: 'etag',
		reshook: function(server, tile, req, res, result, callback) {
			var status_type = result.status / 100 | 0;
			if (status_type === 2 && result.buffer && result.buffer.length < max_length) {
				result.headers['ETag'] = etag(result.buffer);
				var ifnonematch = req.headers['if-none-match'];
				if (ifnonematch && ifnonematch === result.headers['ETag']) {
					result.status = 304;
					result.buffer = new Buffer([]);
				}
			}
			callback();
		}
	};
};
