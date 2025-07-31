import React, { useEffect, useState, useRef } from "react"
import api from "../api/baseurl"
import { ACCESS_TOKEN } from "../../token"
import ChatPage from "./ChatPage"

const Conversation = () => {

    const [view, setView] = useState(false)
    const [no_conversation, setNoConversation] = useState(0)
    const [conversations, setConversation] = useState([])
    const [message, setMessage] = useState([])

    useEffect(() => {

        const fetchUsers = async () => {
            try {
                const getConversation = await api.get('conversations/')
                setConversation(getConversation.data)
                const res = getConversation.data.map((conversation) => {
                    const dateTime = conversation.created_at
                    const participants = conversation.participants
                    // console.log(participants)
                    const receiver = participants.find((participant) => localStorage.getItem('username') !== participant.username)
                    // console.log(receiver)
                    const dateObj = new Date(dateTime)
                    return {
                        ...conversation,
                        receiver,
                        date: dateObj.toLocaleDateString(),
                        time: dateObj.toLocaleTimeString(),
                    }
                })
                // console.log(res)
                setConversation(res)
                setNoConversation(getConversation.data.length)
                // sessionStorage.setItem('no_conversation',conversations.data.length)
            }
            catch (error) {
                console.log("Failed to load conversations:", error)
            }
        }
        fetchUsers()
    }, [])

    const getMessages = async (conversation) => {
        // console.log(conversation.id)
        const messages = await api.get(`conversations/${conversation.id}/messages/`)
        // console.log(messages.data)
        setView(true)
        setMessage(messages.data)
    }

    return (
        <> 
            <div className="flex flex-col md:flex-row w-full overflow-hidden h-[calc(100vh)]">
                {/* Sidebar */}
                <aside className="w-full max-w-md p-4 bg-[#3A3A3A] border border-gray-200 shadow-sm sm:p-8 dark:border-gray-700 overflow-y-auto max-h-[calc(100vh)]">

                    <header className="flex items-center justify-between mb-4">
                        <h5 className="text-xl font-bold leading-none text-white">All Contacts</h5>
                    </header>

                    {/* Search Form */}
                    <form className="flex items-center max-w-sm mx-auto mb-4">
                        <label htmlFor="chat-search" className="sr-only">Search</label>
                        <div className="relative w-full">
                            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 18 20">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M3 5v10M3 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm12 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm0 0V6a3 3 0 0 0-3-3H9m1.5-2-2 2 2 2" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                id="chat-search"
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full ps-10 p-2.5 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder="Search Chat"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="p-2.5 ms-2 text-sm font-medium text-white bg-[#3A3A3A] border border-blue-700 rounded-lg hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-[#4A4A4A] focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-gray-800"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 20 20">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                            </svg>
                            <span className="sr-only">Search</span>
                        </button>
                    </form>

                    {/* Contact List */}
                    <div className="flow-root py-2">
                        {no_conversation > 0 && (
                            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                {conversations.map((conversation, index) => (
                                    <li key={index} className="py-1">
                                        <button
                                            className="w-full cursor-pointer text-left hover:bg-gray-100 dark:hover:bg-[#4A4A4A] transition-colors duration-200 rounded-lg p-2"
                                            onClick={() => { getMessages(conversation) }}
                                        >
                                            <div className="flex items-center">
                                                <div className="shrink-0">
                                                    <img
                                                        className="w-8 h-8 rounded-full"
                                                        src="/profile.jpg"
                                                        alt={`${conversation.receiver.username}'s profile`}
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0 ms-4">
                                                    <p className="text-sm font-medium text-white truncate">
                                                        {conversation.receiver.username}
                                                    </p>
                                                    <div className="flex items-center justify-between text-sm">
                                                        <p className="text-gray-400 truncate">
                                                            {conversation.receiver.email}
                                                        </p>
                                                        <p className="text-gray-400 ms-2 whitespace-nowrap">
                                                            {conversation.date}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </aside>

                {/* Chat Area */}
                {view ? (<main className="flex-1 bg-gray-100 dark:bg-gray-900">
                    <ChatPage messages={message} />
                </main>) : null}
            </div>
        </>

    )
}

export default Conversation