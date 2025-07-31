import { useState, useContext, useEffect } from "react"
import api from '../api/baseurl'
import { useNavigate, NavLink } from "react-router-dom"

const ChatPage = () => {

    const [showDropdown, setShowDropdown] = useState(false)

    return (
        <>
            <div className="flex items-start gap-2.5">
                <img className="w-8 h-8 rounded-full" src="/profile.jpg" alt="Jese image" />
                <div className="flex flex-col w-full max-w-[320px] leading-1.5 p-4 border-gray-200 bg-gray-100 rounded-e-xl rounded-es-xl dark:bg-gray-700">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">Bonnie Green</span>
                        <span className="text-sm font-normal text-gray-500 dark:text-gray-400">11:46</span>
                    </div>
                    <p className="text-sm font-normal py-2.5 text-gray-900 dark:text-white">That's awesome. I think our users will really appreciate the improvements.</p>
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400">Delivered</span>
                </div>
                <button
                    id="dropdownMenuIconButton"
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="inline-flex self-center items-center text-sm font-medium text-center text-gray-900  rounded-lg hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-white  dark:hover:bg-gray-800"
                    type="button"
                >
                    <img className="w-8 h-8 rounded-full" src="/profile.jpg" alt="Profile" />
                </button>
                {showDropdown && (
                    <div id="dropdownDots" className="z-10 bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-40 dark:bg-gray-700 dark:divide-gray-600">
                        <ul className="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownMenuIconButton">
                            {/* <li>
                            <a href="#" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Reply</a>
                        </li>
                        <li>
                            <a href="#" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Forward</a>
                        </li>
                        <li>
                            <a href="#" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Copy</a>
                        </li>
                        <li>
                            <a href="#" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Report</a>
                        </li> */}
                            <li>
                                <button className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Delete</button>
                            </li>
                        </ul>
                    </div>)}
            </div>

        </>
    )

}

export default ChatPage