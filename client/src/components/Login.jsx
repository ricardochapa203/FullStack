"use client"

import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import PropTypes from 'prop-types';
import "../styles/Login.css"
import { getApiUrl } from '../utils/getApiUrl';

// Helper para soportar import.meta.env en Vite y evitar errores en Jest
let API_URL = 'http://localhost:5050';
try {
  if (import.meta && import.meta.env && import.meta.env.VITE_API_URL) {
    API_URL = import.meta.env.VITE_API_URL;
  }
} catch (e) {
  // Ignora error en Jest
}

function Login({ setAuth }) {
  const [inputs, setInputs] = useState({
    correo: "",
    contraseña: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const { correo, contraseña } = inputs

  const onChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value })
  }

  const onSubmitForm = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError("")
      const response = await fetch(`${getApiUrl()}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, contraseña }),
      })

      const parseRes = await response.json()

      if (!response.ok) {
        throw new Error(parseRes.message || "Authentication failed")
      }

      localStorage.setItem("token", parseRes.token)
      setAuth(true)
      navigate("/dashboard")
    } catch (err) {
      setError(err.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={onSubmitForm}>
        <h1>Login</h1>
        {error && <div className="error-message">{error}</div>}
        <div className="form-group">
          <label>Correo</label>
          <input 
            type="email" 
            name="correo" 
            placeholder="Correo" 
            value={correo} 
            onChange={onChange} 
            required 
          />
        </div>
        <div className="form-group">
          <label>Contraseña</label>
          <input 
            type="password" 
            name="contraseña" 
            placeholder="Contraseña" 
            value={contraseña} 
            onChange={onChange} 
            required 
          />
        </div>
        <button type="submit" className="login-button" disabled={loading}>
          {loading ? "Loading..." : "Login"}
        </button>
      </form>
    </div>
  )
}

Login.propTypes = {
  setAuth: PropTypes.func.isRequired
};

export default Login
