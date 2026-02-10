
import Link from "next/link"
import { Lock } from "lucide-react"

export const metadata = {
    title: "Privacy Policy - Zivox Agent",
    description: "Learn how we collect, use, and protect your data.",
}

export default function PrivacyPage() {
    return (
        <div className="min-h-screen pb-20">
            {/* Header Section */}
            <div className="container pt-20 pb-16 text-center">
                <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl mb-6">
                    Privacy <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-400 to-green-400">Policy</span>
                </h1>
                <p className="text-muted-foreground text-lg md:text-xl">Last updated: February 3, 2026</p>
            </div>

            {/* Content Card */}
            <div className="container max-w-4xl">
                 <div className="rounded-3xl border bg-card/50 px-6 py-10 shadow-2xl backdrop-blur-sm sm:px-10 sm:py-16 md:p-20">
                    <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-h2:text-2xl prose-h2:mt-12 prose-p:text-muted-foreground prose-p:leading-relaxed prose-li:text-muted-foreground">
                        <h2>1. Introduction</h2>
                        <p>
                            Zivox Agent ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our AI chatbot services (collectively, the "Services"). By accessing or using our Services, you agree to the terms of this Privacy Policy.
                        </p>

                        <h2>2. Information We Collect</h2>
                        <h3 className="text-xl font-semibold mt-8 mb-4">2.1 Information You Provide</h3>
                        <p>We may collect personal information such as:</p>
                        <ul>
                            <li>Account information (name, email address, password)</li>
                            <li>Payment information (processed securely by Dodo Payments)</li>
                            <li>Communications (support tickets, feedback)</li>
                            <li>User Content (documents, website URLs, and other training data you upload)</li>
                        </ul>

                        <h3 className="text-xl font-semibold mt-8 mb-4">2.2 Automatically Collected Information</h3>
                        <p>We automatically collect certain information when you visit, use, or navigate the Service:</p>
                        <ul>
                            <li>Log and Usage Data (IP address, browser type, pages visited)</li>
                            <li>Device Data (computer, phone, or tablet information)</li>
                            <li>Location Data (general location based on IP)</li>
                        </ul>

                        <h2>3. How We Use Your Information</h2>
                        <p>We use the collected information for the following purposes:</p>
                        <ul>
                            <li>To provide, maintain, and improve the Service</li>
                            <li>To process transactions and send related information</li>
                            <li>To train and operate your custom AI chatbots</li>
                            <li>To respond to your comments, questions, and support requests</li>
                            <li>To send administrative information, updates, and security alerts</li>
                            <li>To monitor and analyze usage patterns and trends</li>
                            <li>To detect, prevent, and address technical issues or fraud</li>
                            <li>To comply with legal obligations</li>
                        </ul>

                        <h2>4. Data Isolation & AI Training</h2>
                        <div className="not-prose my-10 p-8 rounded-2xl border border-emerald-500/20 bg-emerald-500/10">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 rounded-full bg-emerald-500/20">
                                    <Lock className="h-6 w-6 text-emerald-500" />
                                </div>
                                <h3 className="text-2xl font-bold text-foreground m-0">Your Data is Private</h3>
                            </div>
                            <p className="text-muted-foreground mb-4 text-lg leading-relaxed">
                                We do <strong>NOT</strong> use your training data, documents, or chat logs to train our public AI models. Your data is isolated in your own private vector database and is used solely to power your chatbots.
                            </p>
                            <p className="text-sm text-muted-foreground/80">
                                Each customer's data is logically separated and encrypted. We employ industry-standard security measures to protect the confidentiality and integrity of your information.
                            </p>
                        </div>

                        <h2>5. Data Sharing & Disclosure</h2>
                        <p>We do not sell your personal information. We may share your information only in the following circumstances:</p>
                        <ul>
                            <li><strong>Service Providers:</strong> Third-party vendors who assist in providing the Service (hosting, payment processing, analytics)</li>
                            <li><strong>Legal Requirements:</strong> When required by law, regulation, or legal process</li>
                            <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                            <li><strong>With Your Consent:</strong> When you have given explicit permission</li>
                        </ul>

                        <h2>6. Data Retention</h2>
                        <p>
                            We retain your information for as long as your account is active or as needed to provide the Service. Upon account deletion, we will delete or anonymize your data within 30 days, except where retention is required by law or for legitimate business purposes.
                        </p>

                        <h2>7. Data Security</h2>
                        <p>We implement appropriate technical and organizational measures to protect your information, including:</p>
                        <ul>
                            <li>Encryption of data in transit (TLS 1.3) and at rest (AES-256)</li>
                            <li>Regular security assessments and penetration testing</li>
                            <li>Access controls and authentication mechanisms</li>
                            <li>Employee security training and background checks</li>
                            <li>24/7 monitoring and incident response procedures</li>
                        </ul>

                        <h2>8. Your Rights</h2>
                        <p>Depending on your location, you may have the following rights regarding your personal data:</p>
                        <ul>
                            <li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
                            <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data</li>
                            <li><strong>Deletion:</strong> Request deletion of your personal data</li>
                            <li><strong>Portability:</strong> Request your data in a portable format</li>
                            <li><strong>Objection:</strong> Object to certain processing of your data</li>
                            <li><strong>Restriction:</strong> Request restriction of processing</li>
                        </ul>
                        <p>To exercise these rights, please contact us at <a href="mailto:support@zivoxagent.com" className="text-primary hover:underline font-medium">support@zivoxagent.com</a>.</p>

                        <h2>9. Cookies & Tracking</h2>
                        <p>We use cookies and similar tracking technologies to:</p>
                        <ul>
                            <li>Maintain your session and preferences</li>
                            <li>Analyze usage patterns and improve the Service</li>
                            <li>Provide personalized experiences</li>
                        </ul>
                        <p>You can control cookies through your browser settings. Note that disabling cookies may affect the functionality of the Service.</p>

                        <h2>10. Third-Party Services</h2>
                        <p>
                            Our Service may contain links to third-party websites or integrate with third-party services. We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies before providing any personal information.
                        </p>

                        <h2>11. Children's Privacy</h2>
                        <p>
                            Our Service is not intended for children under 16 years of age. We do not knowingly collect personal information from children. If we learn that we have collected personal information from a child, we will delete it promptly.
                        </p>

                        <h2>12. International Data Transfers</h2>
                        <p>
                            Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers, including Standard Contractual Clauses or other legally recognized transfer mechanisms.
                        </p>

                        <h2>13. Changes to This Policy</h2>
                        <p>
                            We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically.
                        </p>

                        <h2>14. Contact Us</h2>
                        <p>
                            If you have any questions about this Privacy Policy or our data practices, please contact us at:
                        </p>
                        <div className="not-prose mt-8">
                             <div className="p-6 border rounded-xl bg-background/50 text-center max-w-md mx-auto">
                                <p className="text-muted-foreground text-sm mb-2">Support & Legal</p>
                                <a href="mailto:support@zivoxagent.com" className="text-lg font-medium text-primary hover:text-primary/80 transition-colors">support@zivoxagent.com</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
