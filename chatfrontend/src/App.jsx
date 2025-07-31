import { useState, useContext } from 'react'
import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Conversation from './Components/Conversation'
import Home from './Components/Home'
import Navbar from './Components/Navbar'
import Register from './Components/Register'
import ForgotPassword from './Components/ForgotPassword'
import NotFound from './Components/NotFound'
import ChatPage from './Components/ChatPage'
import ProtectedRoutes from './ProtectedRoutes'
import DropdownContext from './Contexts/DropdownContexts'
import loginContext from './Contexts/loginContext'

const router = createBrowserRouter(
  [
    {
      path: "/",
      element:
        <>
          <Navbar />
          <Home />
        </>
    },
    {
      path: "/register",
      element:
        <>
          <Navbar />
          <Register />
        </>
    },
    {
      // path: "/conversation/:id",
      path: "/conversations",
      element:
        <>
          <Navbar />
          <ProtectedRoutes>
            <Conversation />
          </ProtectedRoutes>
        </>
    },
    {
      // path: "/chat/:id",
      path: "/chat",
      element: <>
        <Navbar />
        <ProtectedRoutes>
          <ChatPage />
        </ProtectedRoutes>
      </>
    },
    {
      path: "/forgotpassword",
      element: <>
        <ForgotPassword />
      </>
    },
    {
      path: "*",
      element: <>
        <Navbar />
        <NotFound />
      </>
    }
  ]
)


function App() {
  const [count, setCount] = useState(0)
  const [showDropdown, setShowDropdown] = useState(false)
  const LoggedIn=localStorage.getItem('login')

  return (
    <>
      <loginContext.Provider value={{LoggedIn}}>
        <DropdownContext.Provider value={{ showDropdown, setShowDropdown }}>
          <RouterProvider router={router} />
        </DropdownContext.Provider>
      </loginContext.Provider>
    </>
  )
}

export default App
