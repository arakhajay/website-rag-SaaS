'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export interface ChatbotSettings {
    id?: string
    chatbot_id: string
    general: {
        description?: string
    }
    appearance: {
        widget_name?: string
        subheading?: string
        branding_logo?: string
        bot_avatar?: string
        accent_color?: string
        widget_icon?: string
        position?: 'left' | 'right'
        placeholder?: string
    }
    messaging: {
        model?: string
        conversational_mode?: boolean
        strict_faq?: boolean
        response_length?: 'short' | 'medium' | 'long'
        suggest_follow_up?: boolean
        allow_image_usage?: boolean
        show_sources?: boolean
        post_chat_feedback?: boolean
        multilingual_support?: boolean
        show_floating_welcome_message?: boolean
        welcome_message?: string
        no_source_message?: string
        server_error_message?: string
    }
    starter_questions: string[]
    email_config: {
        send_email_transcript?: boolean
        support_email?: string
        additional_emails?: string[] // simplified list for "support_emails_list"
    }
    usage_security: {
        messages_per_user_limit?: number
        limit_unit?: 'day' | 'week' | 'month'
        limit_warning_message?: string
        rate_limit?: number
        block_masked_ips?: boolean
    }
    user_form: {
        enabled?: boolean
        force_gate?: boolean
        captcha_enabled?: boolean
        fields?: {
            id: string
            type: 'text' | 'email' | 'phone' | 'textarea'
            label: string
            required: boolean
        }[]
    }
    working_hours: {
        enabled?: boolean
        timezone?: string
        schedule?: {
            day: string
            enabled: boolean
            start: string
            end: string
        }[]
    }
}

export async function getChatbotSettings(chatbotId: string) {
    const supabase = createAdminClient()

    const { data, error } = await supabase
        .from('chatbot_settings')
        .select('*')
        .eq('chatbot_id', chatbotId)
        .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 code for no rows found
        console.error('Error fetching settings:', error)
        return null
    }

    if (!data) {
        // Return defaults
        return {
            chatbot_id: chatbotId,
            general: {},
            appearance: {
                widget_name: '',
                subheading: 'Our bot answers instantly',
                accent_color: '#7c3aed', // Default purple
                position: 'right',
                placeholder: 'Type your message...'
            },
            messaging: {
                model: 'gpt-4o-mini',
                response_length: 'medium',
                show_sources: true,
                show_floating_welcome_message: true,
                welcome_message: 'Hey there, how can I help you?',
                no_source_message: 'The bot is yet to be trained, please add the data and train the bot.',
                server_error_message: 'Apologies, there seems to be a server error.'
            },
            starter_questions: [],
            email_config: {
                send_email_transcript: false,
                support_email: '',
                additional_emails: []
            },
            usage_security: {
                messages_per_user_limit: 50,
                limit_unit: 'day',
                limit_warning_message: "You've reached the message limit",
                rate_limit: 300,
                block_masked_ips: false
            },
            user_form: {
                enabled: false,
                force_gate: false,
                captcha_enabled: false,
                fields: [
                    { id: 'name', type: 'text', label: 'Name', required: true },
                    { id: 'email', type: 'email', label: 'Email', required: true }
                ]
            },
            working_hours: {
                enabled: false,
                timezone: 'UTC',
                schedule: [
                    { day: 'Monday', enabled: true, start: '09:00', end: '17:00' },
                    { day: 'Tuesday', enabled: true, start: '09:00', end: '17:00' },
                    { day: 'Wednesday', enabled: true, start: '09:00', end: '17:00' },
                    { day: 'Thursday', enabled: true, start: '09:00', end: '17:00' },
                    { day: 'Friday', enabled: true, start: '09:00', end: '17:00' },
                    { day: 'Saturday', enabled: false, start: '09:00', end: '17:00' },
                    { day: 'Sunday', enabled: false, start: '09:00', end: '17:00' }
                ]
            }
        } as ChatbotSettings
    }

    return data as ChatbotSettings
}

export async function updateChatbotSettings(chatbotId: string, settings: Partial<ChatbotSettings>) {
    const supabase = createAdminClient()

    // check if exists
    const { data: existing } = await supabase
        .from('chatbot_settings')
        .select('id')
        .eq('chatbot_id', chatbotId)
        .single()

    const updatePayload = {
        general: settings.general,
        appearance: settings.appearance,
        messaging: settings.messaging,
        starter_questions: settings.starter_questions,
        email_config: settings.email_config,
        usage_security: settings.usage_security,
        user_form: settings.user_form,
        working_hours: settings.working_hours,
        updated_at: new Date().toISOString()
    }

    let error
    if (existing) {
        const { error: updateError } = await supabase
            .from('chatbot_settings')
            .update(updatePayload)
            .eq('chatbot_id', chatbotId)
        error = updateError
    } else {
        const { error: insertError } = await supabase
            .from('chatbot_settings')
            .insert({
                chatbot_id: chatbotId,
                ...updatePayload
            })
        error = insertError
    }

    if (error) {
        console.error('Error updating settings:', error)
        return { success: false, error: error.message }
    }

    revalidatePath(`/dashboard/chatbot/${chatbotId}/settings`)
    return { success: true }
}
