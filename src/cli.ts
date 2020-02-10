import { build, GluegunToolbox } from 'gluegun'

async function run(argv): Promise<GluegunToolbox> {
  const cli = build()
    .brand('firestore-tools')
    .src(__dirname)
    .plugins('./node_modules', { matching: 'firestore-tools-*', hidden: true })
    .help()
    .version()
    .create()

  return await cli.run(argv)
}

module.exports = { run }
