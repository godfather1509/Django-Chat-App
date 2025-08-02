import { useState, useEffect, useRef } from "react";
import EmojiPicker from 'emoji-picker-react';
import api from "../api/baseurl";
import { ACCESS_TOKEN } from "../../token";

const ChatPage = ({ messages, conversationId }) => {
    const [showDropdown, setShowDropdown] = useState(null);
    // for displaying message menu
    const [emojiMenu, setEmojiMenu] = useState(false);
    // for displaying emoji menu 
    const [message, setMessage] = useState("");
    // holds message to be sent
    const [msgContent, setContent] = useState([]);
    // holds message to be displayed
    const [typingUser, setTypingUser] = useState(null);
    const [socket, setSocket] = useState(null);
    const [convoReceiver, setConvoReceiver] = useState({});
    // receiver in this conversation
    const [convoSender, setConvoSender] = useState({})
    // sender in this conversation

    const textRef = useRef(null);
    // to handle message form
    const typingTimeoutRef = useRef(null);
    const chatEndRef = useRef(null);
    // to scroll down to last message

    const username = localStorage.getItem("username");

    const handelMessages = () => {
        // here we are adding fields to messages as per our need
        const newMsg = messages.map((msg) => {
            const timeStamp = msg.time_stamp;
            const dateObj = new Date(timeStamp);
            const receiver = msg.participants.find((participant) => msg.sender.username !== participant.username)
            setConvoReceiver(msg.participants.find((participant) => username !== participant.username))
            setConvoSender(msg.participants.find((participant) => username === participant.username))
            const isSender = msg.sender.username === username;
            // check if logged in user sending the meesage

            return {
                ...msg,
                isSender,
                receiver,
                date: dateObj.toLocaleDateString(),
                time: dateObj.toLocaleTimeString(),
                // return original array with new fields added
            };
        });
        setContent(newMsg);
        // update new array
    };

    useEffect(() => {
        handelMessages();
        // run handelMessages() whenever we receive new messages
    }, [messages]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
        // to scroll down to last message on rendering
    }, [msgContent]);

    const handleEmoji = (emojiObj) => {
        // this handles emoji insertion in our text
        const emoji = emojiObj.emoji;
        // retrieve emoji
        const ref = textRef.current;
        // this gives whole html tag that was referenced to textRef
        const currentText = ref.value;
        // current value in tag
        const start = ref.selectionStart;
        const end = ref.selectionEnd;
        const newText = currentText.substring(0, start) + emoji + currentText.substring(end);
        // insert emoji in between text
        setMessage(newText);
        // update message field with new value
        setTimeout(() => {
            // position the cursor after the last typed emoji
            const cursorPos = start + emoji.length;
            ref.focus();
            ref.setSelectionRange(cursorPos, cursorPos);
            // set cursor after the last typed word/emoji
        }, 0);
    };

    const sendMessage = async (data) => {
        // send message to server
        if (!data.trim()) {
            console.error("Empty Message");
            return;
            // return if message field is empty
        }

        if (socket?.readyState === WebSocket.OPEN) {
            // if websocket is open send message
            const payload = {
                type: "chat_message",
                message: data,
                user: convoSender.id,
                receiver_id: convoReceiver.id,
            };
            const res = socket.send(JSON.stringify(payload));
        } else {
            console.error("WebSocket connection is not open");
        }
    };

    const handleTyping = () => {
        if (socket?.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({
                type: "typing",
                user: convoSender.id,
                receiver_id: convoReceiver.id,
            }));
        }
    };

    const handleDelete = async (msgId) => {
        // delete the message from chat
        try {
            const response = await api.delete(`conversations/${conversationId}/messages/${msgId}`);
            if (response.status === 204) {
                setContent((prevMessage) => prevMessage.filter((msg) => msg.id !== msgId));
            }
        } catch (error) {
            console.log(error);
        }
        setShowDropdown(null)
    };

    const handleCopy = (text) => {
        // copy the message
        window.navigator.clipboard.writeText(text)
        setShowDropdown(null)
    }

    useEffect(() => {

        const token = localStorage.getItem(ACCESS_TOKEN);
        const websocket = new WebSocket(`ws://localhost:8000/ws/chat/${conversationId}/?token=${token}`);
        // open the connection with websocket

        websocket.onopen = () => {
            // console.log("Websocket connection established");
            setSocket(websocket);
        };

        websocket.onmessage = (event) => {
            // triggered when message is sent by server
            try {
                // this will run when server sends some data
                const data = JSON.parse(event.data);

                if (data.type === "chat_message") {
                    setContent((prevMessage) => [
                        ...prevMessage,
                        {
                            sender: data.user,
                            content: data.message,
                            time: new Date(data.time_stamp).toLocaleTimeString(),
                            date: new Date(data.time_stamp).toLocaleDateString(),
                            isSender: data.user.username === username,
                        }
                    ]);
                    // add new message to list of sent message
                } else if (data.type === "typing") {
                    setTypingUser(data.user);
                    if (typingTimeoutRef.current) {
                        clearTimeout(typingTimeoutRef.current);
                    }
                    typingTimeoutRef.current = setTimeout(() => {
                        setTypingUser(null);
                    }, 1000);
                }
            } catch (error) {
                console.error("Error parsing websocket message:", error);
            }
        };

        websocket.onerror = (error) => {
            console.error("Websocket Error:", error);
        };

        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            websocket.close();
        };
    }, [conversationId]);


    return (
        <>
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
                                    </>
                                )}
                            </div>
                            <p className={`text-sm text-gray-900 dark:text-white py-2.5 ${msg.isSender ? 'text-right' : ''}`}>{msg.content}</p>
                            <span className={`text-sm text-gray-500 dark:text-gray-400 ${msg.isSender ? 'text-right' : ''}`}>{msg.date}</span>
                        </div>
                        <div className="relative self-center">
                            {msg.isSender && (
                                <button
                                    onClick={() => setShowDropdown(showDropdown === index ? null : index)}
                                    className="inline-flex cursor-pointer items-center p-2 text-sm font-medium text-center text-gray-900 bg-white rounded-lg hover:bg-gray-100 dark:text-white dark:bg-gray-900 dark:hover:bg-gray-800"
                                >
                                    <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 4 15">
                                        <path d="M3.5 1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 6.041a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.959a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
                                    </svg>
                                </button>
                            )}
                            {showDropdown === index && (
                                <div className="absolute right-0 mt-2 z-10 w-40 bg-white divide-y divide-gray-100 rounded-lg shadow-sm dark:bg-gray-700 dark:divide-gray-600">
                                    <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
                                        <li>
                                            <button onClick={() => handleCopy(msg.id, msg.content)} className="w-full text-left px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
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
                    </div>
                ))}

                {typingUser && (
                    <div className="px-4 pb-4 text-sm text-gray-500 italic">{typingUser.username} is typing...</div>
                )}

                <div ref={chatEndRef} />

                <form onSubmit={(e) => {
                    e.preventDefault();
                    sendMessage(message);
                    setMessage("")
                }} className="fixed bottom-0 left-0 right-0 md:ml-[448px] md:w-[calc(100%-445px)] w-full">
                    <div className="flex items-center px-3 py-2 bg-gray-50 dark:bg-gray-700">
                        <button type="button" className="p-2 text-gray-500 rounded-lg hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600" onClick={() => setEmojiMenu(!emojiMenu)}>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 20 20" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.408 7.5h.01m-6.876 0h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM4.6 11a5.5 5.5 0 0 0 10.81 0H4.6Z" />
                            </svg>
                        </button>
                        <textarea
                            rows="1"
                            className="block mx-4 p-2.5 w-full text-sm text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                            ref={textRef}
                            value={message}
                            onChange={(e) => {
                                setMessage(e.target.value);
                                handleTyping();
                            }}
                            placeholder="Type message"
                        />
                        <button type="submit" className="inline-flex justify-center p-2 text-blue-600 rounded-full hover:bg-blue-100 dark:text-blue-500 dark:hover:bg-gray-600">
                            <svg className="w-5 h-5 rotate-90" fill="currentColor" viewBox="0 0 18 20">
                                <path d="m17.914 18.594-8-18a1 1 0 0 0-1.828 0l-8 18a1 1 0 0 0 1.157 1.376L8 18.281V9a1 1 0 0 1 2 0v9.281l6.758 1.689a1 1 0 0 0 1.156-1.376Z" />
                            </svg>
                        </button>
                    </div>
                </form>

                {emojiMenu && (
                    <EmojiPicker onEmojiClick={handleEmoji} />
                )}
            </div>
        </>
    );
};

export default ChatPage;
