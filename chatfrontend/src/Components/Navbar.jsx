import { useState, useContext, useEffect } from "react"
import api from '../api/baseurl'
import { useNavigate, NavLink } from "react-router-dom"
import DropdownContext from "../Contexts/DropdownContexts"

const Navbar = () => {

    // const dropdown = useContext(DropdownContext)

    const[showDropdown,setShowDropdown]=useState(false)

    const isLoggedIn = localStorage.getItem('login')
    const navigate = useNavigate()

    useEffect(() => {

        if (!isLoggedIn)
            return

        const fetchUsers = async () => {
            try {
                const user = await api.get('get_user/')
                // console.log("user details:", user.data)
                localStorage.setItem('email', user.data['email'])
                localStorage.setItem('user_id', user.data['id'])
                localStorage.setItem('username', user.data['username'])
            }
            catch (error) {
                console.log("Failed to load conversations:", error)
            }
        }
        fetchUsers()
    }, [isLoggedIn])

    return (
        <>
            <nav className="bg-[#2E2E2E] text-white shadow-md border-b border-[#383838]">

                <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
                    <NavLink to={isLoggedIn ? "/conversations" : "/"} className="flex items-center space-x-3 rtl:space-x-reverse">
                        <img src="../public/logo.png" className="h-8" />
                        <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">ChitChat</span>
                    </NavLink>
                    {isLoggedIn ? (
                        <div className="relative flex items-center space-x-3 md:space-x-0 rtl:space-x-reverse">
                            <button
                                type="button"
                                onClick={() => setShowDropdown(!showDropdown)}
                                className="cursor-pointer flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
                                id="user-menu-button"
                                aria-expanded={showDropdown}
                            >
                                <span className="sr-only">Open user menu</span>
                                <img className="w-8 h-8 rounded-full" src="/profile.jpg" alt="User profile" />
                            </button>

                            {showDropdown && (
                                <div className="absolute top-12 right-0 z-50 w-44 text-base list-none bg-white divide-y divide-gray-100 rounded-lg shadow dark:bg-gray-700 dark:divide-gray-600">
                                    <div className="px-4 py-3">
                                        <span className="block text-sm text-gray-900 dark:text-white">{localStorage.getItem('username')}</span>
                                        <span className="block text-sm text-gray-500 truncate dark:text-gray-400">{localStorage.getItem('email')}</span>
                                    </div>
                                    <ul className="py-2" aria-labelledby="user-menu-button">
                                        {/* <li>
                                        <NavLink to="" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white">Settings</NavLink>
                                    </li> */}
                                        <li>
                                            <button
                                                onClick={() => {
                                                    localStorage.clear();
                                                    navigate("/");
                                                }}
                                                className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white"
                                            >
                                                Log Out
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </div>) : null}
                </div>
            </nav>
        </>
    )
}

export default Navbar