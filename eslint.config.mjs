// @ts-check
import antfu from '@antfu/eslint-config'
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  // @ts-expect-error - Type mismatch between FlatConfigComposer versions
  antfu({
    // ...@antfu/eslint-config options
  }),
  // ...your other rules
)
