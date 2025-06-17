import React, { useState, KeyboardEvent } from 'react'
import { ChatInputProps } from '../types'

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
    const [message, setMessage] = useState('')

    const handleSubmit = () => {
        if (message.trim() && !isLoading) {
            onSendMessage(message)
            setMessage('')
        }
    }

    const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit()
        }
    }

    return (
        <div className="flex items-end space-x-3">
            <div className="flex-1">
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message here..."
                    disabled={isLoading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    rows={1}
                    style={{ minHeight: '48px', maxHeight: '120px' }}
                />
            </div>
            <button
                onClick={handleSubmit}
                disabled={!message.trim() || isLoading}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2"
            >
                {isLoading ? (
                    <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Sending...</span>
                    </>
                ) : (
                    <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        <span>Send</span>
                    </>
                )}
            </button>
        </div>
    )
}

export default ChatInput 