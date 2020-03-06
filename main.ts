import { Collection, Item, ItemGroup } from 'postman-collection';
import { readFileSync } from 'fs';
const codegen = require('postman-code-generators')

const collection = new Collection(JSON.parse(readFileSync('UBCAPI.postman_collection.json').toString()));
console.log(collection);
const language = 'cURL',
    variant = 'cURL',
    options = {
        indentCount: 3,
        indentType: 'Space',
        trimRequestBody: true,
        followRedirect: true
    };


function isItem(itemG: Item | ItemGroup<Item>): itemG is Item {
    return (<Item>itemG).request !== undefined;
}

collection.items.all().forEach(item => {
    if (isItem(item)) {
        codegen.convert(language, variant, item.request, options, function (error: any, snippet: any) {
            if (error) {
                //  handle error
            }
            const bashSnippet = collection.variables.replace(snippet)
            console.log(bashSnippet);
        });
    }

})
