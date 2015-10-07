# tilestrata-etag
[![NPM version](http://img.shields.io/npm/v/tilestrata-etag.svg?style=flat)](https://www.npmjs.org/package/tilestrata-etag)
[![Build Status](https://travis-ci.org/naturalatlas/tilestrata-etag.svg)](https://travis-ci.org/naturalatlas/tilestrata-etag)
[![Coverage Status](http://img.shields.io/codecov/c/github/naturalatlas/tilestrata-etag/master.svg?style=flat)](https://codecov.io/github/naturalatlas/tilestrata-etag)

A [TileStrata](https://github.com/naturalatlas/tilestrata) plugin that adds [Conditional GET](https://tools.ietf.org/html/rfc7232) support using [ETags](https://en.wikipedia.org/wiki/HTTP_ETag). This will prevent a browser from having to download all the bytes of a tile if the version it has cached is the same as what the server's going to send.

### Sample Usage

By default, the plugin will skip anything that's bigger than 512kb. This is because ETag calculation takes a non-trivial amount of CPU time on large buffers. This limit is configurable via the `"limit"` option. Set to `null` to enable ETags for all sizes, or set to a filesize string or integer, representing the upper limit in bytes.

```js
var tilestrata = require('tilestrata');
var etag = require('tilestrata-etag');
var strata = tilestrata.createServer();

// etags enabled for responses up to 512kb
strata.layer('mylayer').route('t.png')
	.use(/* some provider */)
	.use(etag())

// etags enabled for responses up to 1mb
strata.layer('mylayer').route('t.png')
	.use(/* some provider */)
	.use(etag({limit: '1mb'}))

strata.listen(8080);
```

## Contributing

Before submitting pull requests, please update the [tests](test) and make sure they all pass.

```sh
$ npm test
```

## License

Copyright &copy; 2015 [Natural Atlas, Inc.](https://github.com/naturalatlas) & [Contributors](https://github.com/naturalatlas/tilestrata-etag/graphs/contributors)

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at: http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
