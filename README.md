# Postman Gen
Just a small command line tool that's takes advantage of the Postman SDK to create code snippets from Postman Collections (Exported from Postman).

For some reason this feature is missing in the actual client so I thought I would quickly make a tool that does what I want.

## Usage
### Help
```bash
> node main.js --help
Usage: generate [options]

Options:
  -V, --version                  output the version number
  -c, --collection <path>        Path to the Postman 2.1 Collection JSON
  -l,--language_variant <tuple>  Language,Variant pair to output (default: "cURL,cURL")
  -e,--envvars <path>            Path to environment variables exported from Postman. NOTE: Environment variables will not override variables provided in collection
  -d, --debug                    Output additional debugging info
  -h, --help                     output usage information
```
### Generate cURL code
- Export your Collection from Postman as JSON in the 2.1 format e.g. [`example_collection.json`](./example_collection.json)
- To generate `cURL` snippets:
`node main.js -c example_collection.json`
### Generate other languages
`node main.js -c example_collection.json -d -l shell -v httpie`
`node main.js -c example_collection.json -d -l Swift -v URLSession`
For a full list see:
https://github.com/postmanlabs/postman-code-generators#postman-code-generators-

