// hash.cjs
// Script para generar un hash de contraseña manualmente desde consola

const bcrypt = require('bcrypt')

async function main() {
  const contraseña = process.argv[2]
  if (!contraseña) {
    console.error('Uso: node hash.cjs <contraseña>')
    process.exit(1)
  }
  const salt = await bcrypt.genSalt(10)
  const hash = await bcrypt.hash(contraseña, salt)
  console.log('Hash generado:')
  console.log(hash)
}

main()
