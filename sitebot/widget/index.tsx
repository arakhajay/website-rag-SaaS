import { h, render } from 'preact'
import { useState, useEffect, useRef } from 'preact/hooks'
import { v4 as uuidv4 } from 'uuid'

// Inline styles to ensure self-containment
const styles = `
  .sitebot-widget {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 9999;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  }
  .sitebot-button {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background-color: #000;
    color: #fff;
    border: none;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s;
  }
  .sitebot-button:hover {
    transform: scale(1.05);
  }
  .sitebot-window {
    position: absolute;
    bottom: 80px;
    right: 0;
    width: 350px;
    height: 500px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.15);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition: opacity 0.2s, transform 0.2s;
    transform-origin: bottom right;
  }
  .sitebot-header {
    padding: 16px;
    background: #f4f4f5;
    border-bottom: 1px solid #e4e4e7;
    font-weight: 600;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .sitebot-messages {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .sitebot-message {
    max-width: 80%;
    padding: 8px 12px;
    border-radius: 12px;
    font-size: 14px;
    line-height: 1.5;
  }
  .sitebot-message.user {
    background: #000;
    color: #fff;
    align-self: flex-end;
    border-bottom-right-radius: 2px;
  }
  .sitebot-message.ai {
    background: #f4f4f5;
    color: #000;
    align-self: flex-start;
    border-bottom-left-radius: 2px;
  }
  .sitebot-input-area {
    padding: 16px;
    border-top: 1px solid #e4e4e7;
    display: flex;
    gap: 8px;
  }
  .sitebot-input {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid #e4e4e7;
    border-radius: 6px;
    font-size: 14px;
    outline: none;
  }
  .sitebot-input:focus {
    border-color: #000;
  }
  .sitebot-send {
    background: #000;
    color: #fff;
    border: none;
    border-radius: 6px;
    padding: 0 16px;
    font-size: 14px;
    cursor: pointer;
  }
  .sitebot-close {
    background: transparent;
    border: none;
    cursor: pointer;
    font-size: 18px;
    color: #555;
  }
`

function Widget({ chatbotId }: { chatbotId: string }) {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<{ role: string; content: string }[]>([
        { role: 'ai', content: 'Hi! How can I help you today?' }
    ])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSubmit = async (e: Event) => {
        e.preventDefault()
        if (!input.trim()) return

        const userMessage = { role: 'user', content: input }
        setMessages((prev) => [...prev, userMessage])
        setInput('')
        setLoading(true)

        try {
            const response = await fetch('http://localhost:3000/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMessage],
                    chatbotId,
                }),
            })

            if (!response.body) throw new Error('No response body')

            const reader = response.body.getReader()
            const decoder = new TextDecoder()
            let aiMessage = { role: 'ai', content: '' }
            setMessages((prev) => [...prev, aiMessage])

            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                const chunk = decoder.decode(value)
                aiMessage.content += chunk

                // Force update (since object ref didn't change, we need to clone or trigger render)
                setMessages((prev) => {
                    const newMessages = [...prev]
                    newMessages[newMessages.length - 1] = { ...aiMessage }
                    return newMessages
                })
            }
        } catch (error) {
            console.error('Chat error:', error)
            setMessages((prev) => [...prev, { role: 'ai', content: 'Sorry, something went wrong.' }])
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="sitebot-widget">
            {isOpen && (
                <div className="sitebot-window">
                    <div className="sitebot-header">
                        <span>Chat Support</span>
                        <button className="sitebot-close" onClick={() => setIsOpen(false)}>×</button>
                    </div>
                    <div className="sitebot-messages">
                        {messages.map((m, i) => (
                            <div key={i} className={`sitebot-message ${m.role}`}>
                                {m.content}
                            </div>
                        ))}
                        {loading && <div className="sitebot-message ai">...</div>}
                        <div ref={messagesEndRef} />
                    </div>
                    <form className="sitebot-input-area" onSubmit={handleSubmit}>
                        <input
                            className="sitebot-input"
                            value={input}
                            onInput={(e) => setInput((e.target as HTMLInputElement).value)}
                            placeholder="Type a message..."
                        />
                        <button className="sitebot-send" type="submit">Send</button>
                    </form>
                </div>
            )}
            <button className="sitebot-button" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                )}
            </button>
            <style>{styles}</style>
        </div>
    )
}

// Initialization Logic
const scriptValues = document.currentScript
const chatbotId = scriptValues?.getAttribute('data-chatbot-id')

if (chatbotId) {
    const container = document.createElement('div')
    container.id = `sitebot-${uuidv4()}`
    document.body.appendChild(container)

    const shadow = container.attachShadow({ mode: 'open' })
    render(<Widget chatbotId={chatbotId} />, shadow)
} else {
    console.error('Sitebot: No chatbot ID found. Please add data-chatbot-id attribute to the script tag.')
}
