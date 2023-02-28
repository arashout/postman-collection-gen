"use strict";
exports.__esModule = true;
var postman_collection_1 = require("postman-collection");
var codegen = require('postman-code-generators');
var fs_1 = require("fs");
var commander = require("commander");
var languageVariantPairs = [
    'C#,RestSharp',
    'Dart,http',
    'cURL,cURL',
    'Go,Native',
    'HTTP,HTTP',
    'Java,OkHttp',
    'Java,Unirest',
    'JavaScript,Fetch',
    'JavaScript,jQuery',
    'JavaScript,XHR',
    'NodeJs,Native',
    'NodeJs,Request',
    'NodeJs,Unirest',
    'Objective-C,NSURLSession',
    'OCaml,Cohttp',
    'PHP,cURL',
    'PHP,pecl_http',
    'PHP,HTTP_Request2',
    'PowerShell,RestMethod',
    'Python,http.client',
    'Python,Requests',
    'Ruby,Net:HTTP',
    'Shell,Httpie',
    'Shell,wget',
    'Swift,URLSession'
].map(function (v) { return v.toLowerCase(); });
function parseTuple(value, dummy) {
    var v = value.trim().toLowerCase();
    if (!languageVariantPairs.includes(v)) {
        throw "Not a valid <langauge,variant> pair.Try one of:\n" + languageVariantPairs.join('\n') + "\n";
    }
    var tuple = v.split(',');
    console.assert(tuple.length === 2);
    return { language: tuple[0], variant: tuple[1] };
}
var program = new commander.Command('generate');
program.version('0.2');
program
    .requiredOption('-c, --collection <path>', 'Path to the Postman 2.1 Collection JSON')
    .option('-l,--language_variant <tuple>', 'Language,Variant pair to output', parseTuple, { language: 'curl', variant: 'curl' })
    .option('-e,--envvars <path>', "Path to environment variables exported from Postman. NOTE: Environment variables will not override variables provided in collection")
    .option('-d, --debug', 'Output additional debugging info');
program.parse(process.argv);
function debugPrint(message) {
    if (program.debug) {
        console.log('DEBUG:', message);
    }
}
debugPrint(program.opts());
var collectionPath = program['collection'];
var collection = new postman_collection_1.Collection(JSON.parse((0, fs_1.readFileSync)(collectionPath).toString()));
debugPrint(collection);
var options = {
    trimRequestBody: true,
    followRedirect: true
};
function isItem(itemG) {
    return itemG.request !== undefined;
}
function isItemGroup(itemG) {
    return itemG.items !== undefined;
}
function printSnippet(item) {
    if (isItem(item)) {
        codegen.convert(lvp.language, lvp.variant, item.request, options, function (error, snippet) {
            if (error) {
                console.error('Error trying to generate code for request:', item.request, error);
            }
            var completeSnippet = collection.variables.replace(snippet, environmentVariables);
            var re = /(?:\{\{(.+?)\}\})/g;
            var matches = re.exec(completeSnippet);
            if (matches && matches.length > 0) {
                matches.forEach(function (m) { return console.warn(m + " : Variable not provided"); });
            }
            console.log(completeSnippet);
        });
    }
    else if (isItemGroup(item)) {
        item.items.all().forEach(printSnippet);
    }
}
var environmentVariables = new postman_collection_1.VariableList(new postman_collection_1.Property({ name: 'environmentVariables' }), []);
if (program['envvars']) {
    var environment = JSON.parse((0, fs_1.readFileSync)(program['envvars']).toString());
    debugPrint(environment);
    environment['values'].forEach(function (v) {
        environmentVariables.append(new postman_collection_1.Variable(v));
    });
}
var lvp = program['language_variant'];
debugPrint(environmentVariables);
collection.items.all().forEach(printSnippet);
