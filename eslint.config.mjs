import oneInchEslintConfig from '@1inch/eslint-config'
import requireExtension from './eslint/require-extension.mjs'

export default [...oneInchEslintConfig, requireExtension.configs.recommended]
