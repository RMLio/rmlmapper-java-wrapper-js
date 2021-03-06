# JavaScript wrapper for Java RMLMapper

This is a JavaScript library offering a wrapper around the [Java RMLMapper](https://github.com/RMLio/rmlmapper-java).

## Requirements
- Node.js
- Java VM
- [Jar](https://github.com/RMLio/rmlmapper-java/releases) of the RMLMapper, 
which you can download via `npm run download:rmlmapper`.

## Usage
```javascript
const RMLMapperWrapper = require('@rmlio/rmlmapper-java-wrapper');
const fs = require('fs');

const rmlmapperPath = './rmlmapper.jar';
const tempFolderPath = './tmp';

const wrapper = new RMLMapperWrapper(rmlmapperPath, tempFolderPath, true);
const rml = fs.readFileSync('./test/tc01/mapping.ttl', 'utf-8');
const sources = {
  'student.csv': fs.readFileSync('./test/tc01/student.csv', 'utf-8')
};

const result = await wrapper.execute(rml, {sources, generateMetadata: false, serialization: 'turtle'});
```

Note that you can also provide an array of [quads](http://rdf.js.org/data-model-spec/) to `execute` instead of a string with RDF.
An example can be found in the tests.

## License

This code is copyrighted by [Ghent University – imec](http://idlab.ugent.be/) and released under the [MIT license](http://opensource.org/licenses/MIT).
