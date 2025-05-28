"use client"

import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import PropTypes from 'prop-types';
import "../styles/Dashboard.css"

function Dashboard({ setAuth }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    contraseña: ""
  })
  const navigate = useNavigate()

  useEffect(() => {
    fetchUsers()
  }, []) // Remove token check here since it's handled in App.jsx

  const handleAuthError = (status) => {
    if (status === 401 || status === 403) {
      localStorage.removeItem("token")
      setAuth(false)
      navigate("/login")
    }
  }

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })

      if (!response.ok) {
        handleAuthError(response.status)
        throw new Error("Failed to fetch users")
      }

      const data = await response.json()
      setUsers(data)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    setAuth(false)
    navigate("/login")
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // Validar campos requeridos
      if (!formData.nombre || !formData.correo || (!editingUser && !formData.contraseña)) {
        setError("Todos los campos son requeridos")
        return
      }

      const token = localStorage.getItem("token")
      const method = editingUser ? "PUT" : "POST"
      const url = `${import.meta.env.VITE_API_URL}/api/users${editingUser ? `/${editingUser.id}` : ''}`

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData) // Enviar formData directamente
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Failed to ${editingUser ? "update" : "create"} user`)
      }

      // Reset form and refresh
      setFormData({ nombre: "", correo: "", contraseña: "" })
      setEditingUser(null)
      fetchUsers()
    } catch (err) {
      console.error("Submit error:", err)
      setError(err.message)
    }
  }

  const handleEdit = (user) => {
    setEditingUser(user)
    setFormData({
      nombre: user.nombre || "",
      correo: user.correo || "",
      contraseña: "" // Don't populate password for security
    })
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return
    
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to delete user")
      }

      fetchUsers()
    } catch (err) {
      setError(err.message)
    }
  }

  const cancelEdit = () => {
    setEditingUser(null)
    setFormData({ nombre: "", correo: "", contraseña: "" })
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>User Management Dashboard</h1>
        <button onClick={logout} className="logout-button">
          Logout
        </button>
      </header>

      {loading && <p>Loading users...</p>}
      {error && <p className="error-message">{error}</p>}
      {!loading && !error && users.length === 0 && <p>No users found.</p>}

      <div className="dashboard-content">
        <div className="user-form-container">
          <h2>{editingUser ? "Edit User" : "Add New User"}</h2>
          <form onSubmit={handleSubmit} className="user-form">
            <div className="form-group">
              <label>Name</label>
              <input type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>Correo</label>
              <input 
                type="email" 
                name="correo" 
                value={formData.correo} 
                onChange={handleInputChange} 
                required 
              />
            </div>
            <div className="form-group">
              <label>Contraseña {editingUser && "(leave blank to keep current)"}</label>
              <input
                type="password"
                name="contraseña"
                value={formData.contraseña}
                onChange={handleInputChange}
                required={!editingUser}
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="submit-button">
                {editingUser ? "Update User" : "Add User"}
              </button>
              {editingUser && (
                <button type="button" onClick={cancelEdit} className="cancel-button">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="users-table-container">
          <h2>Users</h2>
          {loading ? (
            <p>Loading users...</p>
          ) : (
            <table className="users-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.nombre}</td>
                    <td>{user.correo}</td>
                    <td className="action-buttons">
                      <button onClick={() => handleEdit(user)} className="edit-button">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(user.id)} className="delete-button">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

Dashboard.propTypes = {
  setAuth: PropTypes.func.isRequired
};

export default Dashboard
