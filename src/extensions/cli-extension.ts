import { GluegunToolbox } from 'gluegun'
import * as fs from 'fs-extra'
import * as firebase from 'firebase-admin'

export default (toolbox: GluegunToolbox): void => {
  toolbox.arg = async (options: {
    name: string
    description?: string
    ask?: boolean
    message?: string
    required?: boolean
    initial?: string
    type?: string
  }): Promise<string | null> => {
    const {
      name,
      description,
      ask = true,
      message = '',
      required = true,
      initial,
      type='input'
    } = options

    const { print, parameters, prompt } = toolbox

    if (name in parameters.options) {
      return parameters.options[name]
    }

    if (!ask) {
      print.error(`Missing required argument: ${name}`)
      if (description) print.error(`Description: ${description}`)
      print.printHelp(toolbox)
      process.exit(-1)
    }

    const result = await prompt.ask({
      type,
      name,
      message: `${name}${message ? ' - ' + message : ''}${
        initial ? ' (default: ' + initial + ')' : ''
      }`,
      required,
      initial
    })

    return result[name]
  }

  toolbox.firestore = async (
    serviceAccountKeyJSONFile: string
  ): Promise<firebase.firestore.Firestore> => {
    const { print } = toolbox

    const key = await fs.readJson(serviceAccountKeyJSONFile)

    print.info(
      `Load service account private key json: ${serviceAccountKeyJSONFile}`
    )
    print.info(`Intialize firebase app with project id: ${key['project_id']}`)

    firebase.initializeApp({
      credential: firebase.credential.cert(key as any)
    })

    return firebase.firestore()
  }
}
