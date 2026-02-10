
import Link from "next/link"

export const metadata = {
    title: "Terms of Service - Zivox Agent",
    description: "Read our terms and conditions for using Zivox Agent services.",
}

export default function TermsPage() {
    return (
        <div className="min-h-screen pb-20">
            {/* Header Section */}
            <div className="container pt-20 pb-16 text-center">
                <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl mb-6">
                    Terms of <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Service</span>
                </h1>
                <p className="text-muted-foreground text-lg md:text-xl">Last updated: February 3, 2026</p>
            </div>

            {/* Content Card */}
            <div className="container max-w-4xl">
                <div className="rounded-3xl border bg-card/50 px-6 py-10 shadow-2xl backdrop-blur-sm sm:px-10 sm:py-16 md:p-20">
                    <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-h2:text-2xl prose-h2:mt-12 prose-p:text-muted-foreground prose-p:leading-relaxed prose-li:text-muted-foreground">
                        <h2>1. Acceptance of Terms</h2>
                        <p>
                            By accessing or using Zivox Agent ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of the terms, you may not access the Service. These Terms apply to all visitors, users, and others who access or use the Service.
                        </p>

                        <h2>2. Description of Service</h2>
                        <p>
                            Zivox Agent is an AI-powered chatbot platform that allows businesses to create custom AI assistants trained on their own data. The Service includes chatbot creation, training, deployment, and analytics features.
                        </p>

                        <h2>3. User Accounts</h2>
                        <p>
                            When you create an account with us, you must provide accurate, complete, and current information. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.
                        </p>
                        <p>
                            You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password. You agree not to disclose your password to any third party.
                        </p>

                        <h2>4. Subscription and Billing</h2>
                        <ul>
                            <li>Subscription fees are billed in advance on a monthly basis</li>
                            <li>All fees are non-refundable except as required by law</li>
                            <li>You may cancel your subscription at any time through your account settings</li>
                            <li>Upon cancellation, you will retain access until the end of your billing period</li>
                            <li>We reserve the right to modify pricing with 30 days notice</li>
                        </ul>

                        <h2>5. Acceptable Use</h2>
                        <p>You agree not to use the Service to:</p>
                        <ul>
                            <li>Violate any laws or regulations</li>
                            <li>Infringe upon intellectual property rights of others</li>
                            <li>Transmit harmful, offensive, or illegal content</li>
                            <li>Attempt to gain unauthorized access to systems or data</li>
                            <li>Interfere with or disrupt the Service or servers</li>
                            <li>Use the Service for spam, phishing, or fraudulent activities</li>
                            <li>Collect user information without consent</li>
                        </ul>

                        <h2>6. Intellectual Property</h2>
                        <p>
                            The Service and its original content, features, and functionality are owned by Zivox Agent and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
                        </p>
                        <p>
                            You retain ownership of any content, data, or materials you upload to the Service. By uploading content, you grant us a non-exclusive license to use, process, and display your content solely for the purpose of providing the Service.
                        </p>

                        <h2>7. Data Processing</h2>
                        <p>
                            Your data is processed solely to provide the Service. We do not use your data to train public AI models. Your data remains isolated in your private environment. For more details, please refer to our <Link href="/privacy" className="text-primary hover:underline font-medium">Privacy Policy</Link>.
                        </p>

                        <h2>8. Service Availability</h2>
                        <p>
                            We strive to maintain 99.9% uptime but do not guarantee uninterrupted access. The Service may be temporarily unavailable due to maintenance, updates, or circumstances beyond our control. We will provide reasonable notice of scheduled maintenance when possible.
                        </p>

                        <h2>9. Limitation of Liability</h2>
                        <p>
                            To the maximum extent permitted by law, Zivox Agent shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or other intangible losses resulting from your use of the Service.
                        </p>

                        <h2>10. Indemnification</h2>
                        <p>
                            You agree to defend, indemnify, and hold harmless Zivox Agent and its officers, directors, employees, and agents from any claims, damages, losses, or expenses arising from your use of the Service or violation of these Terms.
                        </p>

                        <h2>11. Termination</h2>
                        <p>
                            We may terminate or suspend your account immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties, or for any other reason at our sole discretion.
                        </p>

                        <h2>12. Changes to Terms</h2>
                        <p>
                            We reserve the right to modify these Terms at any time. We will notify users of material changes via email or through the Service. Your continued use of the Service after changes constitutes acceptance of the new Terms.
                        </p>

                        <h2>13. Governing Law</h2>
                        <p>
                            These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which Zivox Agent operates, without regard to its conflict of law provisions.
                        </p>

                        <h2>14. Contact Us</h2>
                        <p>
                            If you have any questions about these Terms, please contact us at:
                        </p>
                        <p className="not-prose mt-6 p-6 border rounded-xl bg-background/50 text-center">
                            <a href="mailto:support@zivoxagent.com" className="text-xl font-medium text-primary hover:text-primary/80 transition-colors">support@zivoxagent.com</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
