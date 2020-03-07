import { Collection, Item, ItemGroup, VariableList, Property, Variable } from 'postman-collection';
const codegen = require('postman-code-generators')

import { readFileSync } from 'fs';

import * as commander from 'commander';

const languageVariantPairs = [
    ["Language", "Variant"],
    ["C#", "RestSharp"],
    ["cURL", "cURL"],
    ["Go", "Native"],
    ["HTTP", "HTTP"],
    ["Java", "OkHttp"],
    ["Java", "Unirest"],
    ["JavaScript", "Fetch"],
    ["JavaScript", "jQuery"],
    ["JavaScript", "XHR"],
    ["NodeJs", "Native"],
    ["NodeJs", "Request"],
    ["NodeJs", "Unirest"],
    ["Objective-C", "NSURLSession"],
    ["OCaml", "Cohttp"],
    ["PHP", "cURL"],
    ["PHP", "pecl_http"],
    ["PHP", "HTTP_Request2"],
    ["PowerShell", "RestMethod"],
    ["Ruby", "Net:HTTP"],
    ["Shell", "Httpie"],
    ["Shell", "wget"],
    ["Swift", "URLSession"],
];

const program = new commander.Command('generate');
program.version('0.1');

program
    .requiredOption('-c, --collection <path>', 'Path to the Postman 2.1 Collection JSON')
    .option('-l,--language <string>', 'Language to output', 'cURL')
    .option('-v,--variant <string>', 'Variant of language to output', 'cURL')
    .option('-e,--envvars <path>', `Path to environment variables exported from Postman.
    NOTE: Environment variables will not override variables provided in collection`)
    .option('-d, --debug', 'Output additional debugging info');

program.parse(process.argv);

function debugPrint(message: any) {
    if (program.debug) {
        console.log(message);
    }
}

debugPrint(program.opts());

const collectionPath: string = program['collection']

const collection = new Collection(JSON.parse(readFileSync(collectionPath).toString()));

debugPrint(collection);

const language = program['language'],
    variant = program['variant'],
    options = {
        trimRequestBody: true,
        followRedirect: true
    };


function isItem(itemG: Item | ItemGroup<Item>): itemG is Item {
    return (<Item>itemG).request !== undefined;
}

let environmentVariables = new VariableList(new Property({ name: 'environmentVariables' }), []);
if (program['envvars']) {
    const environment = JSON.parse(readFileSync(program['envvars']).toString())
    debugPrint(environment);
    environment['values'].forEach((v: { value: string, key: string }) => {
        environmentVariables.append(new Variable(v));
    });
}

debugPrint(environmentVariables);

collection.items.all().forEach(item => {
    if (isItem(item))
        codegen.convert(language, variant, item.request, options, function (error: any, snippet: any) {
            if (error) {
                console.error('Error trying to generate code for request:', item.request, error);
            }
            const completeSnippet = collection.variables.replace(snippet)
            const re = /(?:\{\{(.+?)\}\})/g
            const matches = re.exec(completeSnippet);
            if (matches && matches.length > 0) {
                matches.forEach(m => console.warn(`${m} : Variable not provided`));
            }
            console.log(completeSnippet);
        });
});
