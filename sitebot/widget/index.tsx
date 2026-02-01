import { h, render } from 'preact'
import { useState, useEffect, useRef } from 'preact/hooks'
import { v4 as uuidv4 } from 'uuid'
import { marked } from 'marked'

// Configure marked
marked.setOptions({
  breaks: true,
  gfm: true,
})

// Types for Settings (simplified subset needed for widget)
interface WidgetSettings {
  general?: { description?: string }
  appearance?: {
    widget_name?: string
    subheading?: string
    accent_color?: string
    position?: 'left' | 'right'
    placeholder?: string
  }
  messaging?: {
    welcome_message?: string
    welcome_message_enabled?: boolean // mapped from show_floating_welcome_message
  }
  starter_questions?: string[]
  user_form?: {
    enabled?: boolean
    fields?: Array<{ id: string, type: string, label: string, required: boolean }>
  }
  working_hours?: {
    enabled?: boolean
    timezone?: string
    schedule?: Array<{ day: string, enabled: boolean, start: string, end: string }>
  }
}

function Widget({ chatbotId }: { chatbotId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [settings, setSettings] = useState<WidgetSettings | null>(null)
  const [loadingSettings, setLoadingSettings] = useState(true)

  // Logic states
  const [isOffline, setIsOffline] = useState(false)
  const [showContactForm, setShowContactForm] = useState(false) // For explicit "Contact" action
  const [showUserForm, setShowUserForm] = useState(false) // For mandatory pre-chat lead form
  const [userFormSubmitted, setUserFormSubmitted] = useState(false)

  const [messages, setMessages] = useState<{ role: string; content: string }[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Session state
  const [sessionId, setSessionId] = useState('')

  // 1. Initialize Session
  useEffect(() => {
    const storageKey = `sitebot_session_${chatbotId}`
    let storedSession = localStorage.getItem(storageKey)
    if (!storedSession) {
      storedSession = uuidv4()
      localStorage.setItem(storageKey, storedSession)
    }
    setSessionId(storedSession)

    // Check if user form was already submitted in this session (optional, for now simple session state)
    // For simplicity, we restart form check on reload unless we persist it.
  }, [chatbotId])

  // 2. Fetch Settings
  useEffect(() => {
    async function init() {
      try {
        const res = await fetch(`http://localhost:3001/api/widget/settings?chatbotId=${chatbotId}`)
        const data = await res.json()
        if (data.settings) {
          setSettings(data.settings)

          // Working Hours Check
          if (data.settings.working_hours?.enabled) {
            checkWorkingHours(data.settings.working_hours)
          }

          // Initial Welcome Message
          if (data.settings.messaging?.welcome_message) {
            setMessages([{ role: 'ai', content: data.settings.messaging.welcome_message }])
          } else {
            setMessages([{ role: 'ai', content: 'Hi! How can I help you today?' }])
          }

          // User Form Check
          if (data.settings.user_form?.enabled) {
            // In a real app, maybe check localStorage if already submitted
            setShowUserForm(true)
          }
        } else {
          // Default fallback
          setMessages([{ role: 'ai', content: 'Hi! How can I help you today?' }])
        }
      } catch (e) {
        console.error("Failed to load widget settings", e)
        setMessages([{ role: 'ai', content: 'Hi! How can I help you today?' }])
      } finally {
        setLoadingSettings(false)
      }
    }
    init()
  }, [chatbotId])

  const checkWorkingHours = (wh: any) => {
    try {
      if (!wh.enabled || !wh.schedule) return

      // Need to check current time in the specific timezone
      const timeZone = wh.timezone || 'UTC'
      const now = new Date()

      // Get day name (e.g., "Monday") in the target timezone
      const dayFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone })
      const currentDay = dayFormatter.format(now)

      // Get current HH:MM in target timezone
      const timeFormatter = new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone })
      const currentTime = timeFormatter.format(now)

      const daysSchedule = wh.schedule.find((s: any) => s.day === currentDay)

      if (!daysSchedule) return // Should not happen if all days present

      if (!daysSchedule.enabled) {
        setIsOffline(true)
        return
      }

      // Simple string comparison for HH:MM works because valid format is always 09:00 (24h)
      if (currentTime < daysSchedule.start || currentTime > daysSchedule.end) {
        setIsOffline(true)
      }
    } catch (e) {
      console.error("Error checking working hours", e)
    }
  }

  // Pre-chat User Form Logic
  const [userFormData, setUserFormData] = useState<Record<string, string>>({})
  const handleUserFormSubmit = async (e: any) => {
    e.preventDefault()
    // Here you would typically save the lead to DB
    // For now, just gate the chat
    try {
      // Optional: Send lead to backend immediately
      await fetch('http://localhost:3001/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatbotId,
          ...userFormData,
          source: 'user_form_gate'
        }),
      })
    } catch (e) {
      console.error("Error saving lead", e)
    }

    setShowUserForm(false)
    setUserFormSubmitted(true)
  }

  // Contact form state (Standalone explicit contact)
  const [contactFormData, setContactFormData] = useState({ email: '', phone: '', message: '' })
  const [contactFormLoading, setContactFormLoading] = useState(false)
  const [contactFormSubmitted, setContactFormSubmitted] = useState(false)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, showUserForm, showContactForm])

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

      const response = await fetch('http://localhost:3001/api/chat', {
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

  const handleContactFormSubmit = async (e: any) => {
    e.preventDefault()
    if (!contactFormData.email.trim()) return

    setContactFormLoading(true)
    try {
      const response = await fetch('http://localhost:3001/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatbotId,
          email: contactFormData.email,
          phone: contactFormData.phone,
          message: contactFormData.message,
          source: 'widget_contact',
        }),
      })

      if (response.ok) {
        setContactFormSubmitted(true)
        setContactFormData({ email: '', phone: '', message: '' })
      }
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setContactFormLoading(false)
    }
  }

  const renderContent = (message: { role: string; content: string }) => {
    if (message.role === 'ai' && message.content) {
      const html = marked.parse(message.content) as string
      return <div dangerouslySetInnerHTML={{ __html: html }} />
    }
    return message.content
  }

  // Styles generation
  const accentColor = settings?.appearance?.accent_color || '#000000'
  const position = settings?.appearance?.position || 'right'
  const styles = `
    .sitebot-widget {
      position: fixed;
      bottom: 20px;
      ${position === 'right' ? 'right: 20px;' : 'left: 20px;'}
      z-index: 9999;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    .sitebot-button {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background-color: ${accentColor};
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
      ${position === 'right' ? 'right: 0;' : 'left: 0;'}
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
      background: ${accentColor};
      color: #fff;
      font-weight: 600;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .sitebot-header h3 { margin: 0; font-size: 16px; }
    .sitebot-header p { margin: 4px 0 0; font-size: 12px; opacity: 0.9; font-weight: 400; }
    
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
      background: ${accentColor};
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
        font-size: 14px; font-weight: 700; margin: 8px 0 4px 0;
    }
    .sitebot-message.ai ul { margin: 4px 0; padding-left: 18px; }
    
    .sitebot-quick-actions {
        display: flex; gap: 8px; padding: 12px 16px; border-top: 1px solid #e4e4e7; background: #fafafa; flex-wrap: wrap; justify-content: center;
    }
    .sitebot-quick-btn {
        display: flex; align-items: center; gap: 6px; padding: 8px 14px; border: 1px solid #e4e4e7; background: #fff; border-radius: 20px; font-size: 13px; cursor: pointer; transition: all 0.2s;
    }
    .sitebot-quick-btn:hover {
        background: ${accentColor}; color: #fff; border-color: ${accentColor};
    }

    .sitebot-input-area {
        padding: 12px 16px; border-top: 1px solid #e4e4e7; display: flex; gap: 8px;
    }
    .sitebot-input {
        flex: 1; padding: 10px 14px; border: 1px solid #e4e4e7; border-radius: 6px; font-size: 14px; outline: none;
    }
    .sitebot-input:focus { border-color: ${accentColor}; }
    .sitebot-send {
        background: ${accentColor}; color: #fff; border: none; border-radius: 6px; padding: 0 16px; font-size: 14px; cursor: pointer;
    }
    .sitebot-close { background: transparent; border: none; cursor: pointer; font-size: 18px; color: #fff; }

    /* Form Styles */
     .sitebot-form-container { padding: 20px; display: flex; flex-direction: column; gap: 16px; height: 100%; overflow-y: auto; }
     .sitebot-form-label { font-size: 13px; font-weight: 500; color: #333; display: block; margin-bottom: 4px; }
     .sitebot-form-input { width: 100%; padding: 10px; border: 1px solid #e4e4e7; border-radius: 6px; box-sizing: border-box; }
     .sitebot-form-submit { width: 100%; background: ${accentColor}; color: white; padding: 12px; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; }
  `

  if (loadingSettings) return null // Don't render until we have settings

  // Offline view
  if (isOffline) {
    return (
      <div className="sitebot-widget">
        <style>{styles}</style>
        {isOpen && (
          <div className="sitebot-window">
            <div className="sitebot-header">
              <div>
                <h3>{settings?.appearance?.widget_name || 'Chat Support'}</h3>
                <p>We are currently offline</p>
              </div>
              <button className="sitebot-close" onClick={() => setIsOpen(false)}>×</button>
            </div>
            <div className="p-8 text-center" style={{ padding: '40px 20px', color: '#666' }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>😴</div>
              <h3>We are currently closed</h3>
              <p>Please check back during our working hours.</p>
            </div>
          </div>
        )}
        <button className="sitebot-button" style={{ filter: 'grayscale(1)' }} onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? "×" : "💬"}
        </button>
      </div>
    )
  }

  return (
    <div className="sitebot-widget">
      <style>{styles}</style>
      {isOpen && (
        <div className="sitebot-window">
          <div className="sitebot-header">
            <div>
              <h3>{settings?.appearance?.widget_name || 'Chat Support'}</h3>
              {settings?.appearance?.subheading && <p>{settings.appearance.subheading}</p>}
            </div>
            <button className="sitebot-close" onClick={() => setIsOpen(false)}>×</button>
          </div>

          {/* User Gate Form */}
          {showUserForm && !userFormSubmitted ? (
            <form className="sitebot-form-container" onSubmit={handleUserFormSubmit}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <h4>Please fill out the form to start chatting</h4>
              </div>
              {settings?.user_form?.fields?.map(field => (
                <div key={field.id}>
                  <label className="sitebot-form-label">
                    {field.label} {field.required && <span style={{ color: 'red' }}>*</span>}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      className="sitebot-form-input"
                      required={field.required}
                      onInput={(e) => setUserFormData({ ...userFormData, [field.id]: (e.target as any).value })}
                    />
                  ) : (
                    <input
                      type={field.type}
                      className="sitebot-form-input"
                      required={field.required}
                      onInput={(e) => setUserFormData({ ...userFormData, [field.id]: (e.target as any).value })}
                    />
                  )}
                </div>
              ))}
              <button type="submit" className="sitebot-form-submit">Start Chat</button>
            </form>
          ) : showContactForm ? (
            // Existing Contact Form Logic (simplified reuse)
            <form className="sitebot-form-container" onSubmit={handleContactFormSubmit}>
              <h3>Contact Us</h3>
              {contactFormSubmitted ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <p>Message Sent!</p>
                  <button type="button" onClick={() => setShowContactForm(false)} className="sitebot-form-submit" style={{ marginTop: '20px' }}>Back</button>
                </div>
              ) : (
                <>
                  <div>
                    <label className="sitebot-form-label">Email</label>
                    <input className="sitebot-form-input" required type="email" value={contactFormData.email} onInput={e => setContactFormData({ ...contactFormData, email: (e.target as any).value })} />
                  </div>
                  <div>
                    <label className="sitebot-form-label">Message</label>
                    <textarea className="sitebot-form-input" required value={contactFormData.message} onInput={e => setContactFormData({ ...contactFormData, message: (e.target as any).value })} />
                  </div>
                  <button type="submit" className="sitebot-form-submit" disabled={contactFormLoading}>
                    {contactFormLoading ? 'Sending...' : 'Send Message'}
                  </button>
                  <button type="button" onClick={() => setShowContactForm(false)} style={{ background: 'transparent', border: 'none', width: '100%', padding: '10px', cursor: 'pointer', marginTop: '10px' }}>Cancel</button>
                </>
              )}
            </form>

          ) : (
            <>
              {/* Chat View */}
              <div className="sitebot-messages">
                {messages.map((m, i) => (
                  <div key={i} className={`sitebot-message ${m.role}`}>
                    {renderContent(m)}
                  </div>
                ))}
                {loading && <div className="sitebot-message ai">...</div>}
                <div ref={messagesEndRef} />
              </div>

              {/* Dynamic Starter Questions */}
              {settings?.starter_questions && settings.starter_questions.length > 0 && messages.length === 1 && (
                <div className="sitebot-quick-actions">
                  {settings.starter_questions.map((q, i) => (
                    <button key={i} className="sitebot-quick-btn" onClick={() => sendMessage(q)}>
                      {q}
                    </button>
                  ))}
                </div>
              )}

              <form className="sitebot-input-area" onSubmit={handleSubmit}>
                <input
                  className="sitebot-input"
                  value={input}
                  onInput={(e) => setInput((e.target as HTMLInputElement).value)}
                  placeholder={settings?.appearance?.placeholder || "Type a message..."}
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
