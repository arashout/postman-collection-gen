import {
  Collection,
  Item,
  ItemGroup,
  VariableList,
  Property,
  Variable
} from 'postman-collection';
const codegen = require('postman-code-generators');

import { readFileSync } from 'fs';

import * as commander from 'commander';

const languageVariantPairs = [
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
].map(v => v.toLowerCase());

function parseTuple(
  value: string,
  dummy: string
): { language: string; variant: string } {
  const v = value.trim().toLowerCase();
  if (!languageVariantPairs.includes(v)) {
    throw `Not a valid <langauge,variant> pair.Try one of:\n${languageVariantPairs.join(
      '\n'
    )}\n`;
  }

  const tuple = v.split(',');

  console.assert(tuple.length === 2);
  return { language: tuple[0], variant: tuple[1] };
}

const program = new commander.Command('generate');
program.version('0.2');

program
  .requiredOption(
    '-c, --collection <path>',
    'Path to the Postman 2.1 Collection JSON'
  )
  .option(
    '-l,--language_variant <tuple>',
    'Language,Variant pair to output',
    parseTuple,
    { language: 'curl', variant: 'curl' }
  )
  .option(
    '-e,--envvars <path>',
    `Path to environment variables exported from Postman. NOTE: Environment variables will not override variables provided in collection`
  )
  .option('-d, --debug', 'Output additional debugging info');

program.parse(process.argv);

function debugPrint(message: any) {
  if (program.debug) {
    console.log('DEBUG:', message);
  }
}

debugPrint(program.opts());

const collectionPath: string = program['collection'];

const collection = new Collection(
  JSON.parse(readFileSync(collectionPath).toString())
);

debugPrint(collection);

const options = {
  trimRequestBody: true,
  followRedirect: true
};

function isItem(itemG: Item | ItemGroup<Item>): itemG is Item {
  return (<Item>itemG).request !== undefined;
}

function isItemGroup(itemG: Item | ItemGroup<Item>): itemG is ItemGroup<Item> {
  return (<ItemGroup<Item>>itemG).items !== undefined;
}

function printSnippet(item: Item | ItemGroup<Item>) {
  if (isItem(item)) {
    codegen.convert(lvp.language, lvp.variant, item.request, options, function(
      error: any,
      snippet: any
    ) {
      if (error) {
        console.error(
          'Error trying to generate code for request:',
          item.request,
          error
        );
      }
      const completeSnippet = collection.variables.replace(
        snippet,
        environmentVariables
      );
      const re = /(?:\{\{(.+?)\}\})/g;
      const matches = re.exec(completeSnippet);
      if (matches && matches.length > 0) {
        matches.forEach(m => console.warn(`${m} : Variable not provided`));
      }
      console.log(completeSnippet);
    });
  } else if (isItemGroup(item)) {
    item.items.all().forEach(printSnippet);
  }
}

const environmentVariables = new VariableList(
  new Property({ name: 'environmentVariables' }),
  []
);
if (program['envvars']) {
  const environment = JSON.parse(readFileSync(program['envvars']).toString());
  debugPrint(environment);
  environment['values'].forEach((v: { value: string; key: string }) => {
    environmentVariables.append(new Variable(v));
  });
}

const lvp: { language: string; variant: string } = program['language_variant'];
debugPrint(environmentVariables);

collection.items.all().forEach(printSnippet);
