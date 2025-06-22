import next from '@next/eslint-plugin-next'

export default [
  {
    plugins: {
      'next': next
    },
    rules: {
      ...next.configs.recommended.rules,
      ...next.configs['core-web-vitals'].rules,
      // Le tue regole personalizzate:
      '@typescript-eslint/no-unused-vars': 'warn'
    }
  }
]