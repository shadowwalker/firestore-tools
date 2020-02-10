import { GluegunCommand } from 'gluegun'
import * as firebase from 'firebase-admin'
import * as fs from 'fs-extra'

const setCollection = async (
  db: firebase.firestore.Firestore,
  collection: firebase.firestore.CollectionReference,
  documents: object
): Promise<void> => {
  for (const id in documents) {
    const doc = collection.doc(id)
    let data = {}
    for (const [k, v] of Object.entries(documents[id]['_data'])) {
      if (v !== null && typeof v === 'object') {
        if ('_segments' in v && Array.isArray(v['_segments'])) {
          const reference = db.doc(`/${v['_segments'].join('/')}`)
          data = { ...data, [k]: reference }
          continue
        } else if ('_latitude' in v && '_longitude' in v) {
          const geopoint = new firebase.firestore.GeoPoint(
            v['_latitude'],
            v['_longitude']
          )
          data = { ...data, [k]: geopoint }
          continue
        } else if ('_seconds' in v && '_nanoseconds' in v) {
          const timestamp = new firebase.firestore.Timestamp(
            v['_seconds'],
            v['_nanoseconds']
          )
          data = { ...data, [k]: timestamp }
          continue
        }
      }

      data = { ...data, [k]: v }
    }

    await collection.doc(id).set(data)
    if ('_collections' in documents[id]) {
      for (const cid in documents[id]['_collections']) {
        setCollection(
          db,
          doc.collection(cid),
          documents[id]['_collections'][cid]
        )
      }
    }
  }
}

const command: GluegunCommand = {
  name: 'import',
  alias: ['i'],
  description: 'Import data from json to firestore',
  run: async toolbox => {
    const { print, firestore, arg } = toolbox

    const key = await arg({
      name: 'key',
      description: 'Firebase service account private key json file',
      message: 'Where is the firebase service account private key json file?'
    })

    const json = await arg({
      name: 'json',
      description: 'Input json file path name',
      message: 'Where is the json data to import?'
    })

    const db = await firestore(key)
    const collections = await fs.readJson(json)

    const spin = print.spin('Importing')
    for (const id in collections) {
      await setCollection(db, db.collection(id), collections[id])
    }
    spin.succeed('Completed')
  }
}

module.exports = command
