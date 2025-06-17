import React from 'react'
import { ChatMessageProps } from '../types'

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
    const isUser = message.role === 'user'

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2 rounded-lg ${isUser
                    ? 'bg-primary-600 text-white rounded-br-none'
                    : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none shadow-sm'
                }`}>
                <div className="text-sm">
                    {message.content}
                </div>
                <div className={`text-xs mt-1 ${isUser ? 'text-primary-100' : 'text-gray-500'
                    }`}>
                    {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </div>
            </div>
        </div>
    )
}

export default ChatMessage 