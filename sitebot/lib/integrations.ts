export type IntegrationPlatform = 'whatsapp' | 'slack' | 'telegram' | 'zapier' | 'wordpress' | 'discord' | 'messenger' | 'shopify' | 'hubspot'

export interface Integration {
    id: string
    chatbot_id: string
    user_id: string
    platform: IntegrationPlatform
    enabled: boolean
    config: Record<string, any>
    api_key: string | null
    webhook_url: string | null
    status: 'connected' | 'disconnected' | 'error' | 'pending'
    last_message_at: string | null
    message_count: number
    created_at: string
    updated_at: string
}

export interface PlatformInfo {
    id: IntegrationPlatform
    name: string
    description: string
    icon: string
    category: 'messaging' | 'workspace' | 'automation' | 'ecommerce' | 'crm'
    status: 'available' | 'coming_soon'
    configFields: ConfigField[]
}

export interface ConfigField {
    key: string
    label: string
    type: 'text' | 'password' | 'select' | 'toggle'
    placeholder?: string
    helpText?: string
    required?: boolean
    options?: { label: string; value: string }[]
}

// Platform definitions with config requirements
export const PLATFORMS: PlatformInfo[] = [
    {
        id: 'whatsapp',
        name: 'WhatsApp',
        description: 'Connect your chatbot to WhatsApp Business to handle customer messages automatically.',
        icon: 'whatsapp',
        category: 'messaging',
        status: 'available',
        configFields: [
            { key: 'provider', label: 'Provider', type: 'select', required: true, options: [{ label: 'Twilio', value: 'twilio' }, { label: 'Meta Cloud API', value: 'meta' }] },
            { key: 'account_sid', label: 'Twilio Account SID', type: 'text', placeholder: 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', required: true },
            { key: 'auth_token', label: 'Twilio Auth Token', type: 'password', placeholder: 'Your Twilio Auth Token', required: true },
            { key: 'phone_number', label: 'WhatsApp Phone Number', type: 'text', placeholder: '+1234567890', required: true, helpText: 'Your Twilio WhatsApp-enabled phone number' },
        ]
    },
    {
        id: 'slack',
        name: 'Slack',
        description: 'Add your chatbot to Slack channels as an AI assistant for your team.',
        icon: 'slack',
        category: 'workspace',
        status: 'available',
        configFields: [
            { key: 'bot_token', label: 'Bot OAuth Token', type: 'password', placeholder: 'xoxb-...', required: true, helpText: 'Found in your Slack App → OAuth & Permissions' },
            { key: 'signing_secret', label: 'Signing Secret', type: 'password', placeholder: 'Your Slack Signing Secret', required: true, helpText: 'Found in your Slack App → Basic Information' },
            { key: 'channel_id', label: 'Default Channel', type: 'text', placeholder: 'C0123456789', helpText: 'Optional — the channel where the bot will respond' },
        ]
    },
    {
        id: 'telegram',
        name: 'Telegram',
        description: 'Deploy your chatbot as a Telegram bot that responds to direct messages.',
        icon: 'telegram',
        category: 'messaging',
        status: 'available',
        configFields: [
            { key: 'bot_token', label: 'Bot Token', type: 'password', placeholder: '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11', required: true, helpText: 'Get this from @BotFather on Telegram' },
            { key: 'bot_username', label: 'Bot Username', type: 'text', placeholder: '@YourBotName', helpText: 'Your Telegram bot username' },
        ]
    },
    {
        id: 'zapier',
        name: 'Zapier',
        description: 'Connect your chatbot to 5,000+ apps through Zapier workflows.',
        icon: 'zapier',
        category: 'automation',
        status: 'available',
        configFields: []
    },
    {
        id: 'wordpress',
        name: 'WordPress',
        description: 'Install a WordPress plugin that embeds your chatbot on any WordPress site.',
        icon: 'wordpress',
        category: 'automation',
        status: 'available',
        configFields: [
            { key: 'site_url', label: 'WordPress Site URL', type: 'text', placeholder: 'https://yoursite.com', helpText: 'The URL of your WordPress website' },
        ]
    },
    {
        id: 'discord',
        name: 'Discord',
        description: 'Add your chatbot to Discord servers as an AI-powered assistant.',
        icon: 'discord',
        category: 'workspace',
        status: 'available',
        configFields: [
            { key: 'bot_token', label: 'Bot Token', type: 'password', placeholder: 'Your Discord Bot Token', required: true, helpText: 'Found in Discord Developer Portal → Bot → Token' },
            { key: 'application_id', label: 'Application ID', type: 'text', placeholder: '123456789012345678', required: true, helpText: 'Found in Discord Developer Portal → General Information' },
            { key: 'guild_id', label: 'Server (Guild) ID', type: 'text', placeholder: '123456789012345678', helpText: 'Optional — restrict to a specific server. Right-click server → Copy ID' },
        ]
    },
    {
        id: 'messenger',
        name: 'Facebook Messenger',
        description: 'Connect your chatbot to Facebook Messenger for automated customer support.',
        icon: 'messenger',
        category: 'messaging',
        status: 'available',
        configFields: [
            { key: 'page_access_token', label: 'Page Access Token', type: 'password', placeholder: 'EAAxxxxxxx...', required: true, helpText: 'Generate from Meta Developer Portal → Your App → Messenger → Settings' },
            { key: 'verify_token', label: 'Verify Token', type: 'text', placeholder: 'my_custom_verify_token', required: true, helpText: 'A custom string you choose — must match the webhook verify token in Meta settings' },
            { key: 'app_secret', label: 'App Secret', type: 'password', placeholder: 'Your App Secret', required: true, helpText: 'Found in Meta Developer Portal → Settings → Basic' },
        ]
    },
    {
        id: 'shopify',
        name: 'Shopify',
        description: 'Add your chatbot to your Shopify store for product Q&A and support.',
        icon: 'shopify',
        category: 'ecommerce',
        status: 'available',
        configFields: [
            { key: 'shop_domain', label: 'Shop Domain', type: 'text', placeholder: 'your-store.myshopify.com', required: true, helpText: 'Your Shopify store domain' },
            { key: 'storefront_token', label: 'Storefront Access Token', type: 'password', placeholder: 'shpat_xxxxxxxx', helpText: 'Optional — enables product lookup in chat responses' },
        ]
    },
    {
        id: 'hubspot',
        name: 'HubSpot',
        description: 'Send chatbot leads and conversations directly into your HubSpot CRM.',
        icon: 'hubspot',
        category: 'crm',
        status: 'available',
        configFields: [
            { key: 'access_token', label: 'Private App Access Token', type: 'password', placeholder: 'pat-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', required: true, helpText: 'Create a Private App in HubSpot → Settings → Integrations → Private Apps' },
            { key: 'pipeline_id', label: 'Deal Pipeline ID', type: 'text', placeholder: 'default', helpText: 'Optional — pipeline to create deals in' },
            { key: 'sync_leads', label: 'Sync Leads as Contacts', type: 'toggle', helpText: 'Automatically create HubSpot contacts from chatbot leads' },
        ]
    },
]
