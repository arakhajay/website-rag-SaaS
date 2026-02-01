import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

export function FAQ() {
    return (
        <section className="container py-8 md:py-12 lg:py-24 max-w-[58rem]">
            <div className="mx-auto flex flex-col items-center space-y-4 text-center mb-12">
                <h2 className="font-heading text-3xl font-bold">Frequently Asked Questions</h2>
            </div>
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                    <AccordionTrigger>What happens if I exceed my message credits?</AccordionTrigger>
                    <AccordionContent>
                        Your bot will continue to work! We&apos;ll notify you when you hit 80% and 100%. You can upgrade instantly or pay a small overage fee of $5 per 1,000 messages. You never lose a lead.
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                    <AccordionTrigger>Can I remove the &apos;Powered By&apos; branding?</AccordionTrigger>
                    <AccordionContent>
                        Yes! Our Professional ($89/mo) and Business ($239/mo) plans allow you to remove our branding and use your own custom logo and colors.
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                    <AccordionTrigger>Is my data used to train the public ChatGPT model?</AccordionTrigger>
                    <AccordionContent>
                        Never. Your data is isolated in your own private vector database. We prioritize your privacy and security above all else.
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                    <AccordionTrigger>Can I integrate with my existing CRM?</AccordionTrigger>
                    <AccordionContent>
                        Absolutely. We support native integrations with HubSpot, Salesforce, and Zapier, allowing you to push leads and data anywhere you need.
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </section>
    )
}
