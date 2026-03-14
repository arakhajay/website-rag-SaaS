import { 
    MessageCircle, 
    Slack, 
    Send, 
    Zap, 
    Globe, 
    ShoppingBag, 
    Database, 
    MessageSquare,
    CheckCircle2,
    Clock,
    ShieldCheck,
    BarChart3
} from "lucide-react"
import React from "react"

export interface IntegrationDetail {
    slug: string
    title: string
    subtitle: string
    description: string
    icon: React.ReactNode
    category: string
    useCases: { title: string; description: string }[]
    benefits: { title: string; description: string }[]
    faqs: { question: string; answer: string }[]
    chatSimulation: {
        platform: 'whatsapp' | 'slack' | 'telegram' | 'discord' | 'web'
        messages: { role: 'user' | 'assistant'; content: string }[]
    }
}

export const INTEGRATIONS: Record<string, IntegrationDetail> = {
    whatsapp: {
        slug: "whatsapp",
        title: "WhatsApp",
        subtitle: "Automate Customer Experience on the World's #1 Messaging App",
        description: "Scale your customer support and sales instantly. Connect your custom-trained AI agent to WhatsApp Business a handle inquiries, qualify leads, and provide 24/7 service without additional headcount.",
        icon: <MessageCircle className="h-12 w-12 text-green-500" />,
        category: "Messaging",
        useCases: [
            { title: "24/7 Customer Support", description: "Answer product questions and support inquiries instantly at any time of day." },
            { title: "Lead Qualification", description: "Engage prospects immediately and gather critical info before handing over to sales." },
            { title: "Order Tracking", description: "Let customers check their delivery status via a simple text message." }
        ],
        benefits: [
            { title: "Global Reach", description: "Meet your customers on the app they already use every single day." },
            { title: "Low Friction", description: "No app downloads or website visits required for your customers." },
            { title: "High Open Rates", description: "WhatsApp messages have a 98% open rate compared to traditional email." }
        ],
        faqs: [
            { question: "Do I need a WhatsApp Business API account?", answer: "Yes, we help you connect your existing WhatsApp Business API or set up a new one via our providers." },
            { question: "Can the AI handle multiple languages?", answer: "Absolutely. Our AI is multilingual and will respond to your users in whatever language they message in." }
        ],
        chatSimulation: {
            platform: 'whatsapp',
            messages: [
                { role: 'user', content: "Hi, I'm interested in the Summer Collection. Do you have the Blue Linen Shirt in size M?" },
                { role: 'assistant', content: "Hi there! 👋 Let me check our inventory for you... Yes, we have 4 units left of the Blue Linen Shirt in size Medium! Would you like me to send you a checkout link or add it to a cart?" },
                { role: 'user', content: "Yes, send me the link. Also, what's your return policy?" },
                { role: 'assistant', content: "Great choice! Here is your quick checkout link: [zivox.io/pay/shirt-m]. Regarding returns, we offer a 30-day hassle-free return policy. If it doesn't fit, we'll swap it for free! 🚚" }
            ]
        }
    },
    slack: {
        slug: "slack",
        title: "Slack",
        subtitle: "The Ultimate AI Assistant for Your Internal Workspace",
        description: "Transform your team's productivity. Bring your custom knowledge base directly into Slack channels. Empower your employees to find answers to policy questions, technical docs, and project info instantly.",
        icon: <Slack className="h-12 w-12 text-purple-500" />,
        category: "Workspace",
        useCases: [
            { title: "Internal Knowledge Base", description: "Let your team query company wikis, HR policies, and technical docs within Slack." },
            { title: "Onboarding Assistant", description: "Help new hires get up to speed by answering their questions about company processes." },
            { title: "Project Summarization", description: "Quickly pull information from various data sources to share in channel discussions." }
        ],
        benefits: [
            { title: "Native Workflow", description: "No need to switch between tabs. Access AI power directly where you work." },
            { title: "Reduced Interruptions", description: "Lower the burden on HR and Tech leads by automating common repetitive questions." },
            { title: "Centralized Truth", description: "Ensure every team member gets the same, accurate information based on your uploaded docs." }
        ],
        faqs: [
            { question: "Can I limit the AI to specific channels?", answer: "Yes, you have full control over which Slack channels the AI agent is active in." },
            { question: "Is my data secure?", answer: "We use enterprise-grade encryption and your internal docs never leave our secure environment." }
        ],
        chatSimulation: {
            platform: 'slack',
            messages: [
                { role: 'user', content: "@SiteBot where can I find the latest brand guidelines for the Q3 campaign?" },
                { role: 'assistant', content: "Hey! You can find the Q3 Brand PDF in the `#marketing-assets` channel or directly at `internal.company.com/branding/q3`. Key changes include the new primary gradient spec. 🎨" },
                { role: 'user', content: "Thanks! What's the hex code for the new primary purple?" },
                { role: 'assistant', content: "The new primary purple is `#6366F1`. I've added the full color palette snippet below for your CSS! 👾" }
            ]
        }
    },
    telegram: {
        slug: "telegram",
        title: "Telegram",
        subtitle: "Deploy Powerful, Lightning-Fast AI Bots",
        description: "Create sleek, responsive AI bots for your Telegram community or direct support. Ideal for crypto projects, developer communities, and automated news updates with integrated AI intelligence.",
        icon: <Send className="h-12 w-12 text-sky-500" />,
        category: "Messaging",
        useCases: [
            { title: "Community Management", description: "Handle frequently asked questions in large groups automatically." },
            { title: "Direct Support Bots", description: "Provide a dedicated channel for customers to get help and information." },
            { title: "Automated Updates", description: "Connect your AI to external tools to fetch and relay information on demand." }
        ],
        benefits: [
            { title: "Speed & Security", description: "Telegram's architecture ensures your AI responds in milliseconds." },
            { title: "Bot Ecosystem", description: "Leverage Telegram's robust bot features like custom keyboards and rich media." },
            { title: "Privacy First", description: "Perfect for organizations that prioritize secure, encrypted communication." }
        ],
        faqs: [
            { question: "How long does setup take?", answer: "Deploying to Telegram is one of the fastest integrations, usually taking less than 2 minutes." },
            { question: "Can the bot process files?", answer: "Currently, our Telegram integration focuses on text-based interaction and document-informed answers." }
        ],
        chatSimulation: {
            platform: 'telegram',
            messages: [
                { role: 'user', content: "/start" },
                { role: 'assistant', content: "Welcome to the Official Support Bot! How can I assist you today? 🤖\n\n1. Token Economics\n2. Roadmap\n3. Technical Support" },
                { role: 'user', content: "Tell me about the token burn schedule." },
                { role: 'assistant', content: "The next token burn is scheduled for October 1st. We burn 2% of transaction fees quarterly to maintain scarcity. You can view the burn wallet here: [link] 🔥" }
            ]
        }
    },
    zapier: {
        slug: "zapier",
        title: "Zapier",
        subtitle: "Connect Your AI to 5,000+ Applications",
        description: "Unlock infinite possibilities. Use your AI agent as a trigger or an action in your existing automations. Connect your brain to Google Sheets, Gmail, CRM, and thousands of other tools without writing code.",
        icon: <Zap className="h-12 w-12 text-orange-500" />,
        category: "Automation",
        useCases: [
            { title: "Smart Lead Routing", description: "Let AI qualify a lead and then have Zapier push the data into your specific CRM pipeline." },
            { title: "Automated Reporting", description: "Summarize chatbot conversations and automatically log them into a Google Sheet." },
            { title: "Trigger Actions", description: "Have the AI detect intent like 'I want to book a call' and automatically trigger a Calendly event." }
        ],
        benefits: [
            { title: "Infinite Scalability", description: "If an app has a Zapier integration, your custom AI can now talk to it." },
            { title: "No-Code Required", description: "Build complex cross-platform workflows using a simple visual interface." },
            { title: "Business Logic", description: "Combine the reasoning power of AI with the deterministic execution of Zapier." }
        ],
        faqs: [
            { question: "What counts as a Zap?", answer: "Each time your AI agent interacts with Zapier, it counts as a task within your Zapier plan." },
            { question: "Can I use webhooks instead?", answer: "Yes, for developers, we offer direct webhook support for even more control." }
        ],
        chatSimulation: {
            platform: 'web',
            messages: [
                { role: 'user', content: "Integrate with my Google Sheets." },
                { role: 'assistant', content: "I've detected you want to sync lead data. I'm triggering the Zapier flow to update your 'August Leads' sheet right now. Done! ✅" },
                { role: 'user', content: "Wait, also send a Gmail notification to my boss." },
                { role: 'assistant', content: "No problem. I've added a Gmail action to the sequence. Your boss will get a summary of every qualified lead I talk to. 📧" }
            ]
        }
    },
    wordpress: {
        slug: "wordpress",
        title: "WordPress",
        subtitle: "The Easiest Way to Add AI Brain to Your WordPress Site",
        description: "Enhance your website instantly. Embed your custom-trained AI agent into any WordPress page or blog post. Provide instant answers to your readers and convert visitors into leads.",
        icon: <Globe className="h-12 w-12 text-blue-600" />,
        category: "Web",
        useCases: [
            { title: "Dynamic FAQ", description: "Replace your static FAQ page with an interactive AI that actually answers questions." },
            { title: "Article Summarization", description: "Let readers ask questions about your blog content and get instant summaries." },
            { title: "Lead Generation", description: "Capture visitor info directly through the chat interface and sync to your site." }
        ],
        benefits: [
            { title: "Easy Installation", description: "Just paste a single line of code or use our upcoming plugin." },
            { title: "SEO Friendly", description: "Engage visitors longer, reducing bounce rates and improving your site rankings." },
            { title: "Custom Styling", description: "Match the chatbot bubble and interface to your site's branding perfectly." }
        ],
        faqs: [
            { question: "Will it slow down my site?", answer: "Not at all. The chatbot loads asynchronously, meaning it won't impact your PageSpeed scores." },
            { question: "Does it work with Elementor/Divi?", answer: "Yes, it works with all WordPress themes and page builders." }
        ],
        chatSimulation: {
            platform: 'web',
            messages: [
                { role: 'user', content: "Is this plugin compatible with the latest PHP version?" },
                { role: 'assistant', content: "Yes! SiteBot's WordPress widget is compatible with PHP 7.4 through 8.3. We've optimized it for performance on all major hosting providers. 🐘" },
                { role: 'user', content: "Can I hide it on mobile?" },
                { role: 'assistant', content: "You can toggle mobile visibility in your Dashboard settings under Widget > Appearance. 📱" }
            ]
        }
    },
    shopify: {
        slug: "shopify",
        title: "Shopify",
        subtitle: "Scale Your E-commerce Sales with an AI Shop Assistant",
        description: "Your 24/7 personal shopper. Help customers find products, check order status, and understand your shipping policies without lifting a finger.",
        icon: <ShoppingBag className="h-12 w-12 text-lime-600" />,
        category: "E-commerce",
        useCases: [
            { title: "Product Discovery", description: "Help customers find the right product based on their specific needs and preferences." },
            { title: "Order Tracking", description: "Seamlessly integrate with Shopify's API to provide real-time shipping updates." },
            { title: "Sizing Help", description: "Answer specific questions about product dimensions and fit to reduce returns." }
        ],
        benefits: [
            { title: "Boost Conversion", description: "Answering customer questions instantly at the point of purchase increases sales." },
            { title: "Reduce Support Vol", description: "Automate up to 80% of common 'Where is my order?' inquiries." },
            { title: "Checkout Integration", description: "Guide customers through the purchase journey and handle objections in real-time." }
        ],
        faqs: [
            { question: "How do I connect my store?", answer: "Simply provide your store URL and grant the necessary API permissions in our dashboard." },
            { question: "Can it suggest upsells?", answer: "Yes, the AI can be trained to recommend complementary products based on what the user is asking about." }
        ],
        chatSimulation: {
            platform: 'web',
            messages: [
                { role: 'user', content: "My order #1234 hasn't arrived yet." },
                { role: 'assistant', content: "Let me check that for you... I see order #1234 was shipped yesterday via FedEx! Current status is 'In Transit' and it's expected to arrive by Friday. 📦" },
                { role: 'user', content: "Can I change the address?" },
                { role: 'assistant', content: "Since it's already in transit, you'll need to contact FedEx directly with your tracking number: [tracking-link]. I can help you with anything else! 😊" }
            ]
        }
    },
    hubspot: {
        slug: "hubspot",
        title: "HubSpot",
        subtitle: "Supercharge Your CRM with AI Conversation Data",
        description: "Turn conversations into closed deals. Automatically sync chatbot leads, contact info, and full transcriptions directly into your HubSpot CRM for your sales team to follow up.",
        icon: <Database className="h-12 w-12 text-orange-600" />,
        category: "CRM",
        useCases: [
            { title: "Lead Ingestion", description: "Instantly create contact records in HubSpot when a user provides their info to the AI." },
            { title: "Activity Logging", description: "Log every chat interaction as an activity on the contact's timeline." },
            { title: "Deal Attribution", description: "Track which chatbot interactions led to successful sales outcomes." }
        ],
        benefits: [
            { title: "Data Integrity", description: "Avoid manual data entry. Let the AI accurately capture and sync lead details." },
            { title: "Faster Follow-up", description: "Alert your sales team in real-time when a high-intent lead finish chatting." },
            { title: "Full Context", description: "Provide your reps with the full conversation history so they know exactly what the lead needs." }
        ],
        faqs: [
            { question: "Which HubSpot plans are supported?", answer: "Our integration works with Free, Starter, Professional, and Enterprise plans." },
            { question: "Can I map custom fields?", answer: "Yes, you can map chatbot variables to any standard or custom HubSpot property." }
        ],
        chatSimulation: {
            platform: 'web',
            messages: [
                { role: 'user', content: "Can I book a demo for next Tuesday?" },
                { role: 'assistant', content: "I'd love to help with that! I can see our sales team has availability at 2 PM and 4 PM EST. Which works for you?" },
                { role: 'user', content: "2 PM works." },
                { role: 'assistant', content: "Perfect! I've created a new contact in your HubSpot CRM and booked the 2 PM slot. You'll receive a confirmation email shortly. 🗓️" }
            ]
        }
    },
    discord: {
        slug: "discord",
        title: "Discord",
        subtitle: "The Ultimate AI Moderator for Your Community",
        description: "Keep your Discord servers engaged and helpful 24/7. Your AI agent can answer technical questions, explain community rules, and support members across any channel.",
        icon: <MessageSquare className="h-12 w-12 text-indigo-500" />,
        category: "Workspace",
        useCases: [
            { title: "Automated Support", description: "Answer common technical questions and support tickets in dedicated channels." },
            { title: "Member Onboarding", description: "Help new members understand the server structure and rules instantly." },
            { title: "Knowledge Hub", description: "Allow members to query your project's documentation directly within Discord." }
        ],
        benefits: [
            { title: "Scale Moderation", description: "Free up your human moderators by letting AI handle the first line of questions." },
            { title: "24/7 Availability", description: "Provide support to your global community regardless of your team's timezone." },
            { title: "Native Experience", description: "Members get help in the same environment where they hang out." }
        ],
        faqs: [
            { question: "Can the AI mention users?", answer: "Yes, it can be configured to ping specific roles when it can't answer a question." },
            { question: "Is it easy to set up?", answer: "It takes just 3 clicks to authorize the bot and select the channels it should listen to." }
        ],
        chatSimulation: {
            platform: 'discord',
            messages: [
                { role: 'user', content: "!verify" },
                { role: 'assistant', content: "To verify your account, please link your wallet at zivox.io/verify. This will unlock the #holders channel! 🔒" },
                { role: 'user', content: "What are the rules for posting memes?" },
                { role: 'assistant', content: "Memes are welcome in #random-memes! Please keep them respectful and avoid spamming. See #rules for the full list. 🎭" }
            ]
        }
    }
}

export function getAllIntegrations() {
    return Object.values(INTEGRATIONS)
}

export function getIntegrationBySlug(slug: string) {
    return INTEGRATIONS[slug]
}
