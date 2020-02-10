import { GluegunCommand } from 'gluegun'
import * as firebase from 'firebase-admin'
import * as fs from 'fs-extra'

const getCollection = async (
  collection: firebase.firestore.CollectionReference
): Promise<object> =>
  (await collection.listDocuments()).reduce(
    async (a, document) => ({
      ...a,
      [document.id]: {
        _data: (await document.get()).data(),
        _collections: await (await document.listCollections()).reduce(
          async (a, collection) => ({
            ...a,
            [collection.id]: await getCollection(collection)
          }),
          {}
        )
      }
    }),
    {}
  )

const command: GluegunCommand = {
  name: 'export',
  alias: ['e'],
  description: 'Export data from firestore to json',
  run: async toolbox => {
    const { print, prompt, parameters, firestore, arg } = toolbox

    const key = await arg({
      name: 'key',
      description: 'Firebase service account private key json file',
      message: 'Where is the firebase service account private key json file?'
    })

    const json = await arg({
      name: 'json',
      description: 'Output json file path name',
      message: 'Which file to output exported json data?',
      initial: 'out.json'
    })

    const spaces = await arg({
      name: 'spaces',
      description: 'Spaces used to intend json data',
      message: 'Spaces used to intend json data?',
      initial: 2,
      type: 'numeral'
    })

    const db = (await firestore(key)) as firebase.firestore.Firestore

    let { collections } = parameters.options

    if (collections) {
      collections = collections.split(',')
    } else {
      const listCollectionsRes = await db.listCollections()
      const allCollectionIds = listCollectionsRes.map(c => c.id)

      const collectionsPromptRes = await prompt.ask({
        type: 'multiselect',
        name: 'collections',
        message: 'collections - Which collections to export? (default: all)',
        required: true,
        choices: allCollectionIds,
        initial: allCollectionIds
      })

      if (collectionsPromptRes && 'collections' in collectionsPromptRes) {
        collections = collectionsPromptRes['collections']
      } else {
        print.error('Failed to get collections')
        process.exit(-1)
      }
    }

    if (collections.length < 1) {
      print.error('No collections selected, nothing to export')
    }

    const spin = print.spin('Exporting')
    const data = await collections
      .map(c => db.collection(c))
      .reduce(
        async (a, collection) => ({
          [collection.id]: await getCollection(collection)
        }),
        {}
      )

    await fs.writeJson(json, data, {
      spaces,
      replacer: (k, v) =>
        v !== null && typeof v === 'object' && '_path' in v
          ? { _segments: v._path.segments }
          : v
    })
    spin.succeed('Completed')
  }
}

module.exports = command
