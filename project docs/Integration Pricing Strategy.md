# Strategic Monetization Proposal: Zivox Integrations

Based on the economic analysis of early 2026 multichannel LLM platforms, this proposal refines Zivox's current pricing to capitalize on "Multichannel Orchestration" rather than just lead volume.

## 🏛️ Foundational Logic: Value-Based Gating

We will transition from purely volume-based gating (messages/chatbots) to **Feature & Channel Gating**. This ensures that high-value business users (using WhatsApp or HubSpot) pay a premium for the increased complexity and value.

---

## 💎 Proposed Unified Plan Structure

| Feature | **Starter ($15/mo)** | **Growth ($49/mo)** | **Professional ($129/mo)** | **Enterprise ($399/mo)** |
| :--- | :--- | :--- | :--- | :--- |
| **Value Prop** | *Presence* | *Automation* | *Orchestration* | *Scale & Resell* |
| **Channels** | Web, Telegram, Discord | All + WhatsApp (SV), Slack, Shopify | All + WhatsApp (HSM), HubSpot, Zendesk | Full White-Label / Omnichannel |
| **Integrations** | ❌ None | 1-way Lead Sync, Zapier (Basic) | 2-way Real-time Sync, Zapier (Pro) | Custom / API / BYOK |
| **AI Models** | GPT-4o mini | GPT-4o / Claude Sonnet | GPT-4o / Claude Opus | Flagship + BYOK Option |
| **Messages/mo** | 2,000 | 5,000 | 15,000 | Unlimited / BYOK Volume |
| **Chatbots** | 2 | 5 | 10 | Unlimited |
| **Branding** | Removed | Removed | Removed | Full White-Label |

---

## ⚡ Integration-Specific Logics

### 1. WhatsApp: The "SV vs HSM" Split
*   **Service Window (SV)**: Included in **Growth ($49)**. User handles their own 24h replies.
*   **Template Messages (HSM)**: Requires **Professional ($129)**. This is because business-initiated messages carry variable Meta costs (see Table 2 in Research).
*   **BYO Cloud API**: For **Enterprise**, we allow users to connect their own Meta Business IDs so we don't have to manage their messaging taxes.

### 2. CRM (HubSpot/Zendesk): Sync Frequency
*   **Batch Sync (6hr)**: Included in **Growth**. Good for basic lead collection.
*   **Real-time Sync**: Reserved for **Professional/Enterprise**. This justifies the cost through "Ticket Deflection" savings (reducing manual data entry).

### 3. Shopify Actions (Agentic RAG)
*   **Read-Only**: View orders (included in Growth).
*   **Write-Access**: Edit orders, issue refunds via AI (reserved for **Professional**). This moves the bot from "Answering" to "Acting."

---

## 💰 Optional Add-Ons (Standalone Plans)

If a user wants to stay on a lower plan but needs one specific high-power integration, we can offer "Power Packs":
*   **WhatsApp Pro Pack**: +$29/mo (Adds WhatsApp HSM capability to Starter/Growth).
*   **Marketing Agency Pack**: +$99/mo (Adds 5 sub-accounts and White-labeling to Professional).

## 🚀 Technical Implementation Strategy

1.  **Feature Flags**: Use the existing `feature_flags` table to toggle specific `integration_slugs` per plan.
2.  **API Metadata**: Pass the plan ID in the `ChatContext` to allow/block integration triggers (e.g., Zapier webhooks).
3.  **BYOK Mode**: Add a section in Org Settings for "API Keys" where Enterprise users can overwrite our keys with their own (OpenAI, Anthropic, Meta).

---

> [!IMPORTANT]
> This strategy shifts our perception from a "Token Reseller" to an "Integrated Orchestration Layer," which is the dominant winning strategy identified in the 2026 research report.
