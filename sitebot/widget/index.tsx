import { h, render } from 'preact'
import { useState, useEffect, useRef } from 'preact/hooks'
import { v4 as uuidv4 } from 'uuid'
import { marked } from 'marked'

// Configure marked
marked.setOptions({
  breaks: true,
  gfm: true,
})

// Quick action buttons config
const QUICK_ACTIONS = [
  { id: 'about', label: 'About', icon: 'ℹ️', query: 'Tell me about yourself' },
  { id: 'products', label: 'Products', icon: '📦', query: 'What products do you offer?' },
  { id: 'services', label: 'Services', icon: '🔧', query: 'What services do you provide?' },
  { id: 'contact', label: 'Contact', icon: '📧', isForm: true },
]

// Inline styles
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
    width: 380px;
    height: 560px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.15);
    display: flex;
    flex-direction: column;
    overflow: hidden;
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
    max-width: 85%;
    padding: 10px 14px;
    border-radius: 12px;
    font-size: 14px;
    line-height: 1.6;
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
  .sitebot-message.ai h1, .sitebot-message.ai h2, .sitebot-message.ai h3 {
    font-size: 14px;
    font-weight: 700;
    margin: 8px 0 4px 0;
  }
  .sitebot-message.ai p { margin: 4px 0; }
  .sitebot-message.ai ul, .sitebot-message.ai ol { margin: 4px 0; padding-left: 18px; }
  .sitebot-message.ai li { margin: 2px 0; }
  .sitebot-message.ai strong { font-weight: 600; }
  .sitebot-message.ai code { background: rgba(0,0,0,0.08); padding: 1px 4px; border-radius: 3px; font-size: 12px; }
  
  /* Quick actions */
  .sitebot-quick-actions {
    display: flex;
    gap: 8px;
    padding: 12px 16px;
    border-top: 1px solid #e4e4e7;
    background: #fafafa;
    flex-wrap: wrap;
    justify-content: center;
  }
  .sitebot-quick-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    border: 1px solid #e4e4e7;
    background: #fff;
    border-radius: 20px;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .sitebot-quick-btn:hover {
    background: #000;
    color: #fff;
    border-color: #000;
  }
  
  /* Contact form */
  .sitebot-contact-form {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .sitebot-form-title {
    font-size: 18px;
    font-weight: 600;
    text-align: center;
    margin-bottom: 8px;
  }
  .sitebot-form-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .sitebot-form-label {
    font-size: 13px;
    font-weight: 500;
    color: #333;
  }
  .sitebot-form-label span { color: #ef4444; }
  .sitebot-form-input {
    padding: 10px 12px;
    border: 1px solid #e4e4e7;
    border-radius: 6px;
    font-size: 14px;
    outline: none;
  }
  .sitebot-form-input:focus { border-color: #000; }
  .sitebot-form-textarea {
    padding: 10px 12px;
    border: 1px solid #e4e4e7;
    border-radius: 6px;
    font-size: 14px;
    outline: none;
    resize: none;
    min-height: 100px;
  }
  .sitebot-form-textarea:focus { border-color: #000; }
  .sitebot-form-char-count {
    font-size: 11px;
    color: #888;
    text-align: right;
  }
  .sitebot-form-submit {
    background: #000;
    color: #fff;
    padding: 12px;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
  }
  .sitebot-form-submit:hover { opacity: 0.9; }
  .sitebot-form-submit:disabled { opacity: 0.5; cursor: not-allowed; }
  .sitebot-form-back {
    background: transparent;
    color: #666;
    padding: 8px;
    border: none;
    font-size: 13px;
    cursor: pointer;
    text-align: center;
  }
  .sitebot-form-success {
    text-align: center;
    padding: 40px 20px;
  }
  .sitebot-form-success-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }
  .sitebot-form-success-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 8px;
  }
  .sitebot-form-success-text {
    color: #666;
    font-size: 14px;
  }
  
  .sitebot-input-area {
    padding: 12px 16px;
    border-top: 1px solid #e4e4e7;
    display: flex;
    gap: 8px;
  }
  .sitebot-input {
    flex: 1;
    padding: 10px 14px;
    border: 1px solid #e4e4e7;
    border-radius: 6px;
    font-size: 14px;
    outline: none;
  }
  .sitebot-input:focus { border-color: #000; }
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
  const [showContactForm, setShowContactForm] = useState(false)
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([
    { role: 'ai', content: 'Hi! How can I help you today?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Session state
  const [sessionId, setSessionId] = useState('')

  // Initialize session on mount
  useEffect(() => {
    const storageKey = `sitebot_session_${chatbotId}`
    let storedSession = localStorage.getItem(storageKey)
    if (!storedSession) {
      storedSession = uuidv4()
      localStorage.setItem(storageKey, storedSession)
    }
    setSessionId(storedSession)
  }, [chatbotId])

  // Contact form state
  const [formData, setFormData] = useState({ email: '', phone: '', message: '' })
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (query: string) => {
    if (!query.trim()) return

    const userMessage = { role: 'user', content: query }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const apiMessages = [...messages, userMessage].map(m => ({
        role: m.role === 'ai' ? 'assistant' : m.role,
        content: m.content
      }))

      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          chatbotId,
          sessionId,
          source: 'widget',
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

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    await sendMessage(input)
  }

  const handleQuickAction = (action: typeof QUICK_ACTIONS[0]) => {
    if (action.isForm) {
      setShowContactForm(true)
      setFormSubmitted(false)
    } else if (action.query) {
      sendMessage(action.query)
    }
  }

  const handleFormSubmit = async (e: any) => {
    e.preventDefault()
    if (!formData.email.trim()) return

    setFormLoading(true)
    try {
      const response = await fetch('http://localhost:3000/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatbotId,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
          source: 'widget',
        }),
      })

      if (response.ok) {
        setFormSubmitted(true)
        setFormData({ email: '', phone: '', message: '' })
      }
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setFormLoading(false)
    }
  }

  const renderContent = (message: { role: string; content: string }) => {
    if (message.role === 'ai' && message.content) {
      const html = marked.parse(message.content) as string
      return <div dangerouslySetInnerHTML={{ __html: html }} />
    }
    return message.content
  }

  return (
    <div className="sitebot-widget">
      {isOpen && (
        <div className="sitebot-window">
          <div className="sitebot-header">
            <span>{showContactForm ? 'Contact Us' : 'Chat Support'}</span>
            <button className="sitebot-close" onClick={() => setIsOpen(false)}>×</button>
          </div>

          {showContactForm ? (
            formSubmitted ? (
              <div className="sitebot-form-success">
                <div className="sitebot-form-success-icon">✅</div>
                <div className="sitebot-form-success-title">Thank you!</div>
                <div className="sitebot-form-success-text">We'll get back to you soon.</div>
                <button
                  className="sitebot-form-back"
                  onClick={() => { setShowContactForm(false); setFormSubmitted(false); }}
                >
                  ← Back to chat
                </button>
              </div>
            ) : (
              <form className="sitebot-contact-form" onSubmit={handleFormSubmit}>
                <div className="sitebot-form-title">Get in Touch</div>

                <div className="sitebot-form-group">
                  <label className="sitebot-form-label">Email <span>*</span></label>
                  <input
                    type="email"
                    className="sitebot-form-input"
                    placeholder="your@email.com"
                    value={formData.email}
                    onInput={(e) => setFormData({ ...formData, email: (e.target as HTMLInputElement).value })}
                    required
                  />
                </div>

                <div className="sitebot-form-group">
                  <label className="sitebot-form-label">Phone</label>
                  <input
                    type="tel"
                    className="sitebot-form-input"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone}
                    onInput={(e) => setFormData({ ...formData, phone: (e.target as HTMLInputElement).value })}
                  />
                </div>

                <div className="sitebot-form-group">
                  <label className="sitebot-form-label">Message <span>*</span></label>
                  <textarea
                    className="sitebot-form-textarea"
                    placeholder="How can we help you?"
                    value={formData.message}
                    maxLength={2000}
                    onInput={(e) => setFormData({ ...formData, message: (e.target as HTMLTextAreaElement).value })}
                    required
                  />
                  <div className="sitebot-form-char-count">{formData.message.length}/2000</div>
                </div>

                <button
                  type="submit"
                  className="sitebot-form-submit"
                  disabled={formLoading}
                >
                  {formLoading ? 'Sending...' : 'Submit'}
                </button>

                <button
                  type="button"
                  className="sitebot-form-back"
                  onClick={() => setShowContactForm(false)}
                >
                  ← Back to chat
                </button>
              </form>
            )
          ) : (
            <>
              <div className="sitebot-messages">
                {messages.map((m, i) => (
                  <div key={i} className={`sitebot-message ${m.role}`}>
                    {renderContent(m)}
                  </div>
                ))}
                {loading && <div className="sitebot-message ai">...</div>}
                <div ref={messagesEndRef} />
              </div>

              <div className="sitebot-quick-actions">
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action.id}
                    className="sitebot-quick-btn"
                    onClick={() => handleQuickAction(action)}
                  >
                    <span>{action.icon}</span>
                    <span>{action.label}</span>
                  </button>
                ))}
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
            </>
          )}
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

// Initialization
const scriptValues = document.currentScript
const chatbotId = scriptValues?.getAttribute('data-chatbot-id')

if (chatbotId) {
  const container = document.createElement('div')
  container.id = `sitebot-${uuidv4()}`
  document.body.appendChild(container)

  const shadow = container.attachShadow({ mode: 'open' })
  render(<Widget chatbotId={chatbotId} />, shadow)
} else {
  console.error('Sitebot: No chatbot ID found.')
}
