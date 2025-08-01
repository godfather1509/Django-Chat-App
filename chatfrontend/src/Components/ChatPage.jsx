import { useState, useEffect } from "react";
// use useState hook when we want to display updates in UI
import { useRef } from "react";
// useRef hook is used to access DOM elements
// it can hold values like useState hook and does not cause re-render when value changes
import EmojiPicker from 'emoji-picker-react';
import api from "../api/baseurl";
import { data } from "react-router-dom";
import { ACCESS_TOKEN } from "../../token";

const ChatPage = ({ messages, conversationId }) => {

    // console.log(messages)
    const [showDropdown, setShowDropdown] = useState(null);
    const [emojiMenu, setEmojiMenu] = useState(false);
    const [message, setMessage] = useState("")
    const [msgContent, setContent] = useState([])
    const [typingUser, setTypingUser]=useState(null)
    const [onlineUser,setOnlineUsers]=useState([])
    const [socket, setSocket] = useState(null)
    const textRef = useRef(null)
    const typingTimeoutRef=useRef(null)

    const handelMessages = () => {
        const newMsg = messages.map((msg) => {
            const timeStamp = msg.time_stamp
            const dateObj = new Date(timeStamp)
            const receiver = msg.participants.find((participant) => localStorage.getItem('username') !== participant.username)
            // console.log(receiver)
            // console.log("sender", msg.sender)
            const username = localStorage.getItem('username')
            const isSender = msg.sender.username === username
            return {
                ...msg,
                isSender,
                receiver,
                date: dateObj.toLocaleDateString(),
                time: dateObj.toLocaleTimeString(),
            }
        })
        setContent(newMsg)
        // console.log(newMsg)
    }

    useEffect(() => { handelMessages() }, [messages])

    function handleEmoji(emoji) {

        const ref = textRef.current
        const currentText = ref.value
        const start = ref.selectionStart
        const end = ref.selectionEnd
        const newText = currentText.substring(0, start) + emoji + currentText.substring(end)
        setMessage(newText)
        setTimeout(() => {
            const cursorPos = start + emoji.length
            ref.focus()
            ref.setSelectionRange(cursorPos, cursorPos)
        }, 0)
    }

    const sendMessage = async (data) => {

        if (!data.trim()) {
            console.error("Empty Message")
            return
        }

        if (socket?.readyState === WebSocket.OPEN) {
            const payload = {
                type: "chat_message",
                message: data,
                user: localStorage.getItem('username')
            }

            socket.send(JSON.stringify(payload))
            setMessage("")
        }
        else {
            console.error("WebSocket connection is not open")
        }
        console.log(data)
    }

    const handleTyping = () => {

    }

    const handleDelete = async (msgId) => {
        // console.log(msgId)
        console.log(conversationId)
        try {
            const response = await api.delete(`conversations/${conversationId}/messages/${msgId}`)
            if (response.status === 204) {
                setContent((prevMessage) => prevMessage.filter((msg) => msg.id !== msgId))
            }
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        const token = localStorage.getItem(ACCESS_TOKEN)
        const websocket = new WebSocket(`ws://localhost:8000/ws/chat/${conversationId}/?token=${token}`);

        websocket.onopen = () => {
            console.log("Websocket connection established")
        }

        websocket.onmessage = (event) => {

            try {

                const data = JSON.parse(event.data)

                if (data.type === "chat_message") {
                    const { text, user, timeStamp } = data

                    setMessage((prevMessage) => [
                        ...prevMessage,
                        {
                            sender: user,
                            content: text,
                            timeStamp
                        }
                    ]);
                }
                else if(data.type==='typing'){
                    const{user, receiver}=data;

                    if(typingTimeoutRef.current){
                        clearTimeout(typingTimeoutRef.current)
                    }
                }
            }
            catch (error) {
                console.error("Error parsing websocket message:", error)
            }

            websocket.onerror=(error)=>{
                console.error("Websocket Error:", error)
            }

            setSocket(websocket)

            return()=>{
                if(typingTimeoutRef.current){
                    clearTimeout(typingTimeoutRef.current)
                }
                websocket.close()
            }
        }
    }, [])

    return (
        <>
            {/* <div className="flex flex-col h-screen"> */}
            <div className="pt-16 h-[calc(100vh-64px)] overflow-y-auto pb-2">
                {msgContent.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-2.5 p-4 ${msg.isSender ? 'justify-end' : ''}`}>
                        {!msg.isSender && (
                            <img className="w-8 h-8 rounded-full" src="/profile.jpg" alt="User profile" />
                        )}
                        <div className={`flex flex-col w-full max-w-[320px] leading-1.5 p-4 border-gray-200 bg-gray-100
          ${msg.isSender ? 'bg-blue-100 dark:bg-blue-700 rounded-s-xl rounded-ee-xl' : 'bg-gray-100 dark:bg-gray-700 rounded-e-xl rounded-es-xl'}
        `}
                        >
                            <div className={`flex items-center gap-2 ${msg.isSender ? 'justify-end' : ''}`}>
                                {msg.isSender ? (
                                    <>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">{msg.time}</span>
                                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{msg.sender.username}</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{msg.sender.username}</span>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">{msg.time}</span>
                                    </>)}
                            </div>
                            <p className={`text-sm text-gray-900 dark:text-white py-2.5 ${msg.isSender ? 'text-right' : ''}`}>{msg.content}</p>
                            <span className={`text-sm text-gray-500 dark:text-gray-400 ${msg.isSender ? 'text-right' : ''}`}>{msg.date}</span>
                        </div>
                        <div className="relative self-center">
                            {msg.isSender && (<button
                                onClick={() => setShowDropdown(showDropdown === index ? null : index)}
                                className="inline-flex cursor-pointer items-center p-2 text-sm font-medium text-center text-gray-900 bg-white rounded-lg hover:bg-gray-100 dark:text-white focus:outline-none dark:bg-gray-900 dark:hover:bg-gray-800"
                                type="button"
                            >
                                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 4 15">
                                    <path d="M3.5 1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 6.041a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.959a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
                                </svg>
                            </button>)}
                            {showDropdown === index && (
                                <div className="absolute right-0 mt-2 z-10 w-40 bg-white divide-y divide-gray-100 rounded-lg shadow-sm dark:bg-gray-700 dark:divide-gray-600">
                                    <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
                                        <li>
                                            <button className="w-full cursor-pointer text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                                                Copy
                                            </button>
                                        </li>
                                        <li>
                                            <button onClick={() => handleDelete(msg.id)} className="w-full cursor-pointer text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                                                Delete
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>))}

                <form onSubmit={(e) => {
                    e.preventDefault()
                    sendMessage(message)
                }} className="fixed bottom-0 left-0 right-0 md:ml-[448px] md:w-[calc(100%-445px)] w-full">
                    <label htmlFor="chat" className="sr-only">Your message</label>
                    <div className="flex items-center px-3 py-2 bg-gray-50 dark:bg-gray-700">
                        <button type="button" className="p-2 text-gray-500 rounded-lg cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600" onClick={() => { setEmojiMenu(!emojiMenu) }}>
                            <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.408 7.5h.01m-6.876 0h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM4.6 11a5.5 5.5 0 0 0 10.81 0H4.6Z" />
                            </svg>
                            <span className="sr-only">Add emoji</span>
                        </button>
                        <textarea id="chat" rows="1" className="block mx-4 p-2.5 w-full text-sm text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            type="text"
                            ref={textRef} value={message} onChange={(evt) => setMessage(evt.target.value)} placeholder="Type message"></textarea>

                        <button type="submit"
                            className="inline-flex justify-center p-2 text-blue-600 rounded-full cursor-pointer hover:bg-blue-100 dark:text-blue-500 dark:hover:bg-gray-600">
                            <svg className="w-5 h-5 rotate-90 rtl:-rotate-90" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 20">
                                <path d="m17.914 18.594-8-18a1 1 0 0 0-1.828 0l-8 18a1 1 0 0 0 1.157 1.376L8 18.281V9a1 1 0 0 1 2 0v9.281l6.758 1.689a1 1 0 0 0 1.156-1.376Z" />
                            </svg>
                            <span className="sr-only">Send message</span>
                        </button>
                    </div>
                </form>
                {emojiMenu ? (
                    <EmojiPicker onEmojiClick={(evt) => handleEmoji(evt.emoji)} />
                ) : null}
            </div>
            {/* </div> */}
        </>
    );
};

export default ChatPage;
