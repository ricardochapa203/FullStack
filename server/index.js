import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import sql from "mssql"
import jwt from "jsonwebtoken"
import swaggerUi from "swagger-ui-express"
import swaggerJsDoc from "swagger-jsdoc"
import { fileURLToPath } from "url"
import path from "path"
import bcrypt from "bcrypt" // 👈 Agrega esta línea

// Configuration
dotenv.config()
const app = express()
const PORT = process.env.PORT || 5050
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Database config
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
}

// Pool configuration
const poolConfig = {
  ...dbConfig,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
}

// Swagger config (mejorada para documentar rutas externas)
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "User API",
      version: "1.0.0",
      description: "API para gestión de usuarios con autenticación y CRUD."
    },
    servers: [
      { url: "http://localhost:5050" }
    ]
  },
  apis: [
    "./routes/*.js", // Documenta endpoints en archivos de rutas
    "./index.js"      // (opcional) también documenta los del archivo principal
  ]
}
const swaggerDocs = swaggerJsDoc(swaggerOptions)
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs))

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         nombre:
 *           type: string
 *         correo:
 *           type: string
 *     UserInput:
 *       type: object
 *       required:
 *         - nombre
 *         - correo
 *         - contraseña
 *       properties:
 *         nombre:
 *           type: string
 *         correo:
 *           type: string
 *         contraseña:
 *           type: string
 *     LoginInput:
 *       type: object
 *       required:
 *         - correo
 *         - contraseña
 *       properties:
 *         correo:
 *           type: string
 *         contraseña:
 *           type: string
 */

/**
 * @swagger
 * /api/login:
 *   post:
 *     tags: [Auth]
 *     summary: Autentica un usuario y retorna un JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: JWT generado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Credenciales inválidas
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: Obtiene todos los usuarios
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Token inválido o expirado
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /api/users:
 *   post:
 *     tags: [Users]
 *     summary: Crea un nuevo usuario
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserInput'
 *     responses:
 *       201:
 *         description: Usuario creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Datos inválidos o usuario ya existe
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Token inválido o expirado
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     tags: [Users]
 *     summary: Actualiza los datos de un usuario
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserInput'
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Token inválido o expirado
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Elimina un usuario por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario eliminado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Token inválido o expirado
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /api/verify:
 *   get:
 *     tags: [Auth]
 *     summary: Verifica la validez del token JWT
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token válido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                 user:
 *                   type: object
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Token inválido o expirado
 *       500:
 *         description: Error interno del servidor
 */

// Middleware
app.use(cors())
app.use(express.json())

// DB connection
async function connectToDatabase() {
  try {
    // Create a new connection pool
    const pool = await new sql.ConnectionPool(poolConfig).connect()
    sql.globalConnection = pool
    console.log("✅ Connected to SQL Server")
  } catch (err) {
    console.error("❌ DB Connection Error:", err)
    process.exit(1)
  }
}

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    console.log('No token provided') // Debug log
    return res.status(401).json({ message: "No token provided" })
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET)
    req.user = verified
    console.log('Token verified for user:', verified) // Debug log
    next()
  } catch (err) {
    console.error('Token verification failed:', err) // Debug log
    return res.status(403).json({ message: "Invalid or expired token" })
  }
}

// Login
app.post("/api/login", async (req, res) => {
  try {
    const { correo, contraseña } = req.body
    const pool = sql.globalConnection
    if (!pool) {
      throw new Error("Database connection not established")
    }

    const result = await pool.request()
      .input('correo', sql.VarChar, correo)
      .query('SELECT * FROM Chapa WHERE correo = @correo')

    const user = result.recordset[0]

    // Cambia la comparación para usar bcrypt
    if (!user || !(await bcrypt.compare(contraseña, user.contraseña))) {
      return res.status(401).json({ message: "Invalid correo or contraseña" })
    }

    const token = jwt.sign({ id: user.id, correo: user.correo }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    })

    res.json({ token })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

// Get users
app.get("/api/users", authenticateToken, async (req, res) => {
  try {
    console.log('GET /api/users - User authenticated:', req.user)
    
    const pool = sql.globalConnection
    if (!pool) {
      console.error('Database pool not initialized')
      throw new Error("Database connection not established")
    }

    const result = await pool.request()
      .query(`
        SELECT 
          id_usuario as id,
          nombre as name,
          correo
        FROM Chapa
        ORDER BY creado_en DESC
      `)

    console.log(`Users fetched successfully. Count: ${result.recordset.length}`)
    res.json(result.recordset)
  } catch (err) {
    console.error("Database error in GET /api/users:", err)
    res.status(500).json({ 
      message: "Error retrieving users",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    })
  }
})

// Create user (con hash)
app.post("/api/users", authenticateToken, async (req, res) => {
  const pool = sql.globalConnection
  if (!pool) {
    return res.status(500).json({ message: "Database connection not established" })
  }

  try {
    const { nombre, correo, contraseña } = req.body

    if (!nombre || !correo || !contraseña) {
      return res.status(400).json({ message: "All fields are required" })
    }

    // Check if user exists
    const checkResult = await pool.request()
      .input('correo', sql.VarChar, correo)
      .query('SELECT * FROM Chapa WHERE correo = @correo')

    if (checkResult.recordset.length > 0) {
      return res.status(400).json({ message: "User already exists" })
    }

    // Siempre hashea la contraseña antes de guardar
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(contraseña, salt)
    console.log('Contraseña original:', contraseña)
    console.log('Contraseña hasheada:', hashedPassword)

    // Insert new user con hash
    const result = await pool.request()
      .input('nombre', sql.VarChar, nombre)
      .input('correo', sql.VarChar, correo)
      .input('contraseña', sql.VarChar, hashedPassword)
      .query(`
        INSERT INTO Chapa (nombre, correo, contraseña)
        OUTPUT INSERTED.id_usuario as id, INSERTED.nombre, INSERTED.correo
        VALUES (@nombre, @correo, @contraseña)
      `)

    res.status(201).json(result.recordset[0])
  } catch (err) {
    console.error("Database error:", err)
    res.status(500).json({ message: "Error creating user" })
  }
})

// Update user
app.put("/api/users/:id", authenticateToken, async (req, res) => {
  try {
    const pool = sql.globalConnection
    if (!pool) {
      return res.status(500).json({ message: "Database connection not established" })
    }

    const { id } = req.params
    const { nombre, correo, contraseña } = req.body

    // Check if user exists
    const checkResult = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM Chapa WHERE id_usuario = @id')

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({ message: "User not found" })
    }

    // Build update query dynamically
    let updateFields = []
    const request = pool.request()
    request.input('id', sql.Int, id)

    if (nombre) {
      updateFields.push('nombre = @nombre')
      request.input('nombre', sql.VarChar, nombre)
    }
    if (correo) {
      updateFields.push('correo = @correo')
      request.input('correo', sql.VarChar, correo)
    }
    if (contraseña) {
      // Siempre hashea la contraseña antes de actualizar
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(contraseña, salt)
      console.log('Contraseña original (update):', contraseña)
      console.log('Contraseña hasheada (update):', hashedPassword)
      updateFields.push('contraseña = @contraseña')
      request.input('contraseña', sql.VarChar, hashedPassword)
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: "No fields to update" })
    }

    const query = `
      UPDATE Chapa 
      SET ${updateFields.join(', ')}
      OUTPUT 
        INSERTED.id_usuario as id,
        INSERTED.nombre,
        INSERTED.correo
      WHERE id_usuario = @id
    `

    const result = await request.query(query)
    res.json(result.recordset[0])
  } catch (err) {
    console.error("Error updating user:", err)
    res.status(500).json({ message: "Error updating user" })
  }
})

// Delete user
app.delete("/api/users/:id", authenticateToken, async (req, res) => {
  try {
    const pool = sql.globalConnection
    if (!pool) {
      return res.status(500).json({ message: "Database connection not established" })
    }

    const { id } = req.params

    // Check if user exists
    const checkResult = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM Chapa WHERE id_usuario = @id')

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({ message: "User not found" })
    }

    // Delete user
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM Chapa WHERE id_usuario = @id')

    res.json({ message: "User deleted successfully" })
  } catch (err) {
    console.error("Error deleting user:", err)
    res.status(500).json({ message: "Error deleting user" })
  }
})

// Verify token endpoint
app.get("/api/verify", authenticateToken, (req, res) => {
  res.json({ valid: true, user: req.user })
})

// Static assets in prod
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/dist")))
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../client/dist", "index.html"))
  })
}

// Error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ 
    message: "Internal server error",
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  })
})

connectToDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`)
  })
})
