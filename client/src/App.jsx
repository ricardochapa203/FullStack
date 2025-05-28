import React from 'react';
"use client"

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { useState, useEffect } from "react"
import Login from "./components/Login"
import Dashboard from "./components/Dashboard"

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          setIsAuthenticated(false)
          setLoading(false)
          return
        }

        // Optional: verify token with backend
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/verify`, {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (response.ok) {
          setIsAuthenticated(true)
        } else {
          localStorage.removeItem("token")
          setIsAuthenticated(false)
        }
      } catch (err) {
        console.error("Token verification failed:", err)
        setIsAuthenticated(false)
      } finally {
        setLoading(false)
      }
    }

    verifyToken()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login setAuth={setIsAuthenticated} />}
        />
        <Route
          path="/dashboard"
          element={isAuthenticated ? <Dashboard setAuth={setIsAuthenticated} /> : <Navigate to="/login" />}
        />
        <Route
          path="/"
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
