import { useState, useEffect, useRef } from "react";
import EmojiPicker from 'emoji-picker-react';

const ChatPage = () => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [emojiMenu, setEmojiMenu] = useState(false);
    const [message, setMessage] = useState("")

    const textAreRef = useRef(null)

    function handleEmoji(emoji) {

        const ref=textAreRef.current
        const start=ref.selectionStart
        const end=ref.selectionEnd
        const newText=message.substring(0,start)+emoji+message.substring(end)
        setMessage(newText)
    }

    return (
        <>
            <div className="flex items-start gap-2.5 p-4">
                {/* Message bubble */}
                <img className="w-8 h-8 rounded-full" src="/profile.jpg" alt="User profile" />
                <div className="flex flex-col w-full max-w-[320px] p-4 bg-gray-100 border-gray-200 rounded-e-xl rounded-es-xl dark:bg-gray-700">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">Bonnie Green</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">11:46</span>
                    </div>
                    <p className="text-sm text-gray-900 dark:text-white py-2.5">
                        That's awesome. I think our users will really appreciate the improvements.
                    </p>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Delivered</span>
                </div>

                {/* Dropdown button and menu */}
                <div className="relative">
                    <button id="dropdownMenuIconButton"
                        onClick={() => setShowDropdown(!showDropdown)}
                        data-dropdown-toggle="dropdownDots" data-dropdown-placement="bottom-start" className="inline-flex self-center items-center p-2 text-sm font-medium text-center text-gray-900 bg-white rounded-lg hover:bg-gray-100 focus:outline-none dark:text-white focus:ring-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800 dark:focus:ring-gray-600" type="button">
                        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 4 15">
                            <path d="M3.5 1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 6.041a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.959a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
                        </svg>
                    </button>
                    {showDropdown && (
                        <div
                            className="absolute right-0 mt-2 z-10 w-40 bg-white divide-y divide-gray-100 rounded-lg shadow-sm dark:bg-gray-700 dark:divide-gray-600"
                            role="menu"
                            aria-label="Dropdown"
                        >
                            <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
                                <li>
                                    <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                                        Copy
                                    </button>
                                </li>
                                <li>
                                    <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                                        Delete
                                    </button>
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            <form className="fixed bottom-0 w-248 dark:bg-gray-800">
                <label htmlFor="chat" className="sr-only">Your message</label>
                <div className="flex items-center px-3 py-2 rounded-sm bg-gray-50 dark:bg-gray-700">
                    <button type="button" className="p-2 text-gray-500 rounded-lg cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600" onClick={() => { setEmojiMenu(!emojiMenu) }}>
                        <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.408 7.5h.01m-6.876 0h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM4.6 11a5.5 5.5 0 0 0 10.81 0H4.6Z" />
                        </svg>
                        <span className="sr-only">Add emoji</span>
                    </button>
                    <textarea id="chat" rows="1" className="block mx-4 p-2.5 w-full text-sm text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" ref={textAreRef} value={message} onChange={(evt) => setMessage(evt.target.value)} placeholder="Type message"></textarea>
                    <button type="submit" className="inline-flex justify-center p-2 text-blue-600 rounded-full cursor-pointer hover:bg-blue-100 dark:text-blue-500 dark:hover:bg-gray-600">
                        <svg className="w-5 h-5 rotate-90 rtl:-rotate-90" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 20">
                            <path d="m17.914 18.594-8-18a1 1 0 0 0-1.828 0l-8 18a1 1 0 0 0 1.157 1.376L8 18.281V9a1 1 0 0 1 2 0v9.281l6.758 1.689a1 1 0 0 0 1.156-1.376Z" />
                        </svg>
                        <span className="sr-only">Send message</span>
                    </button>
                </div>
            </form>
            {emojiMenu ? (
                <EmojiPicker onEmojiClick={(evt)=>handleEmoji(evt.emoji)} />
            ) : null}
        </>
    );
};

export default ChatPage;
