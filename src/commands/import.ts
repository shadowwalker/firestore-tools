import { GluegunCommand } from 'gluegun'

const command: GluegunCommand = {
  name: 'import',
  run: async toolbox => {
    const { print } = toolbox

    print.info('Welcome to your CLI import')
  }
}

module.exports = command
