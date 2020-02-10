import { GluegunCommand } from 'gluegun'

const command: GluegunCommand = {
  name: 'firestore-tools',
  hidden: true,
  description: 'Default (print help information)',
  run: async toolbox => {
    const { print } = toolbox
    print.printHelp(toolbox)
  }
}

module.exports = command
