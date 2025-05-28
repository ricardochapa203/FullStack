// babel.config.js
export default {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    ['@babel/preset-react', { runtime: 'automatic' }]
  ],
  overrides: [
    {
      test: /\.css$/,
      plugins: [
        [
          function () {
            return {
              visitor: {
                ImportDeclaration(path) {
                  if (path.node.source.value.endsWith('.css')) {
                    path.remove();
                  }
                }
              }
            };
          },
          {}
        ]
      ]
    }
  ]
}

