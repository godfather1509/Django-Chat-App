import React, { useEffect, useState, useRef } from "react"
import api from "../api/baseurl"
import { ACCESS_TOKEN } from "../../token"

const Conversation = () => {

    const [view, setView] = useState(false)
    const [no_conversation, setNoConversation] = useState(0)
    const [conversations, setConversation] = useState([])

    useEffect(() => {

        const fetchUsers = async () => {
            try {
                const getConversation = await api.get('conversations/')
                setConversation(getConversation.data)
                console.log(conversations)
                const res = conversations.map((conversation) => {
                    const dateTime = conversation.created_at
                    const dateObj = new Date(dateTime)
                    const date = dateObj.toLocaleDateString()
                    const time = dateObj.toLocaleTimeString()
                    conversation.date = date
                    conversation.time = time

                    return {
                        ...conversation, date, time
                    }
                })
                console.log(res)
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

    return (
        <>
            <div className="w-full max-w-md p-4 bg-white border border-gray-200 rounded-lg shadow-sm sm:p-8 dark:bg-gray-800 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                    <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">All Contacts</h5>
                    {no_conversation > 5 ? (
                        <button onClick={() => { }} className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-500">
                            View more
                        </button>) : null}
                </div>
                <div className="flow-root">
                    {no_conversation > 0 ? (
                        <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
                            {
                                conversations.map((conversation, index) => (
                                    <li key={index} className="py-3 sm:py-4">
                                        <div className="flex items-center">
                                            <div className="shrink-0">
                                                <img className="w-8 h-8 rounded-full" src="/profile.jpg" alt="image" />
                                            </div>
                                            <div className="flex-1 min-w-0 ms-4">
                                                <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
                                                    Neil Sims
                                                </p>
                                                <p className="text-sm text-gray-500 truncate dark:text-gray-400">
                                                    email@windster.com
                                                </p>
                                                <div class="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">{conversation.date} </div>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                        </ul>
                    ) : null
                    }
                </div>
            </div>
        </>
    )
}

export default Conversation