# [firestore](https://firebase.google.com/docs/firestore)-tools CLI

A CLI for [firestore](https://firebase.google.com/docs/firestore) data management.

![size](https://img.shields.io/bundlephobia/minzip/firestore-tools.svg) ![dependencies](https://img.shields.io/david/shadowwalker/firestore-tools.svg) ![downloads](https://img.shields.io/npm/dw/firestore-tools.svg) ![license](https://img.shields.io/npm/l/firestore-tools.svg)

**Features**

- export data from firestore into json
- import data into firestore from json

**Must Read Before Use**

`firestore-tools` CLI is not suitable to use directly on production database or large datasets. It's recommended to use during concept validation, test, data mock of project development.

## Getting Started

## Install

Install `firestore-tools` globally

```bash
yarn global add firestore-tools
# or
npm install --global firestore-tools
```

Alternatively, you can run it using `npx` without install, for example

```bash
npx firestore-tools ...
```

## Get Firebase Service Account Private Key JSON file

Go to [GCP IAM & Identity Console](https://console.cloud.google.com/iam-admin/serviceaccounts), select your firebase project on the top. Then select the `firebase adminsdk` service account, create a private key and download the JSON file. This file will be used to authenticate the CLI to access firestore database with admin access.

![firebase-service-account](https://github.com/shadowwalker/firestore-tools/blob/master/res/img/service-account.png?raw=true)

## Export

``` bash
# if arguments supplied from command line, you will be prompt to give that information
firestore-tools export

# you can also supply arguments from command line
firestore-tools export --key project-id-36257f6a2dcc.json --json data.json -spaces 2 --collections Users,Posts
```

- export - command name, could also use alias `e`
- key - required service account private key json file
- json - output JSON file
- spaces - indentation in JSON file
- collections - comma separated top level collections to export

## Import

``` bash
# if arguments supplied from command line, you will be prompt to give that information
firestore-tools import

# you can also supply arguments from command line
firestore-tools import --key project-id-36257f6a2dcc.json --json data.json
```

- import - command name, could also use alias `i`
- key - required service account private key json file

## JSON

`firestore-tools` use JSON data schema to map the data in firestore database, below is an example.

Any key prefixed with lower dash `_` has special meaning of indicating data type and structure.

``` json
{
  "collection-id": {
    "document-id": {
      "_data": {
        "geopoint": {
          "_latitude": 47.7558843,
          "_longitude": 122.2646634
        },
        "null": null,
        "number": 123456,
        "array": [
          "hello",
          "world"
        ],
        "reference": {
          "_segments": [
            "Test",
            "referred"
          ]
        },
        "map": {
          "field": "hellofield"
        },
        "timestamp": {
          "_seconds": 1580848496,
          "_nanoseconds": 0
        },
        "boolean": true,
        "string": "helloworld"
      },
      "_collections": {
        "subcollection-id": {
          "document-id": {
            "_data": {
              "text": "hello"
            },
            "_collections": {}
          }
        }
      }
    }
  }
}

```



