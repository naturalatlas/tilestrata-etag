/* globals describe it */
var etag = require('../index.js');
var tilestrata = require('tilestrata');
var assert = require('chai').assert;
var dummy_http = {req: {headers: {}}, res: {}};
var dummy_provider = function(size) {
	return {
		serve: function(server, tile, callback) {
			var buffer = new Buffer(size);
			buffer.fill(0);
			callback(null, buffer, {});
		}
	};
};

describe('"tilestrata-etag"', function() {
	it('should have "name" field', function() {
		assert.equal(etag().name, 'etag');
	});
	it('should always add etag if limit is `null`', function(done) {
		var server = new tilestrata.TileServer();
		var req = tilestrata.TileRequest.parse('/layer/3/2/1/tile.bin');
		server.layer('layer').route('tile.bin')
			.use(dummy_provider(1024*1024)) // default is below this
			.use(etag({limit: null}));

		server.serve(req, dummy_http, function(status, buffer, headers) {
			assert.equal(status, 200);
			assert.equal(headers['ETag'], '"100000-ttgbNgpWctgMJ0MPORU+LA"');
			done();
		});
	});
	it('should not add etag if buffer greater than limit', function(done) {
		var server = new tilestrata.TileServer();
		var req = tilestrata.TileRequest.parse('/layer/3/2/1/tile.bin');
		server.layer('layer').route('tile.bin')
			.use(dummy_provider(1024*300))
			.use(etag({limit: '200kb'}));

		server.serve(req, dummy_http, function(status, buffer, headers) {
			assert.equal(status, 200);
			assert.isUndefined(headers['ETag']);
			done();
		});
	});
	it('should add etag if buffer less than limit', function(done) {
		var server = new tilestrata.TileServer();
		var req = tilestrata.TileRequest.parse('/layer/3/2/1/tile.bin');
		server.layer('layer').route('tile.bin')
			.use(dummy_provider(1024*150))
			.use(etag({limit: '200kb'}));

		server.serve(req, dummy_http, function(status, buffer, headers) {
			assert.equal(status, 200);
			assert.equal(headers['ETag'], '"25800-Bq6KAdgNqWLHmHwmSvZM7A"');
			done();
		});
	});
	it('should serve 304 if if-none-match matches etag', function(done) {
		var server = new tilestrata.TileServer();
		var req = tilestrata.TileRequest.parse('/layer/3/2/1/tile.bin');
		server.layer('layer').route('tile.bin')
			.use(dummy_provider(1024*150))
			.use(etag({limit: '200kb'}));

		var dummy_http = {
			res: {},
			req: {
				headers: {'if-none-match': '"25800-Bq6KAdgNqWLHmHwmSvZM7A"'}
			}
		};
		server.serve(req, dummy_http, function(status, buffer, headers) {
			assert.equal(status, 304);
			assert.equal(buffer.length, 0);
			done();
		});
	});
	it('should serve 200 if if-none-match does not match etag', function(done) {
		var server = new tilestrata.TileServer();
		var req = tilestrata.TileRequest.parse('/layer/3/2/1/tile.bin');
		server.layer('layer').route('tile.bin')
			.use(dummy_provider(1024*150))
			.use(etag({limit: '200kb'}));

		var dummy_http = {
			res: {},
			req: {
				headers: {'if-none-match': '"25800-Aq6KAdgNqWLHmHwmSvZM7A"'}
			}
		};
		server.serve(req, dummy_http, function(status, buffer, headers) {
			assert.equal(status, 200);
			assert.equal(buffer.length, 1024*150);
			done();
		});
	});
});
