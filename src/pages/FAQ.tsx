
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HelpCircle, Shield, Clock, Users } from 'lucide-react';

const FAQ = () => {
  const faqData = [
    {
      question: "How does trip creation and matching work?",
      answer: "Create a trip by providing your flight details, direction (to/from airport), and preferences. The system will match you with other students traveling on the same date with compatible timing and gender preferences. You can only have one active trip at a time, and each trip allows only one match."
    },
    {
      question: "Why can I only have one active trip at a time?",
      answer: "This policy ensures fairness and prevents trip hoarding. It encourages users to be committed to their posted trips and reduces confusion. Once your trip is matched or completed, you can create a new one."
    },
    {
      question: "How do cancellation and auto-rejection work?",
      answer: "When a trip host accepts one request, all other pending requests are automatically rejected. Both the host and matched traveler can cancel the match, which reopens the trip. If you manually reject a request, that user cannot send another request for the same trip."
    },
    {
      question: "Why is trip data removed after 24 hours?",
      answer: "To maintain data privacy and platform hygiene, all trip and match data is automatically deleted 24 hours after a successful match. This ensures your personal information isn't stored longer than necessary and keeps the platform clean."
    },
    {
      question: "How can I stay safe during cab sharing?",
      answer: "Always verify the identity of your travel companion, share your trip details with friends/family, meet in public spaces, trust your instincts, and use the WhatsApp contact only for trip coordination. CAB POOL is for SRM students only, adding an extra layer of security."
    },
    {
      question: "What happens if my match doesn't show up?",
      answer: "If your matched traveler doesn't show up, you can cancel the match from your requests page. This will reopen your trip for new matches. We recommend confirming trip details via WhatsApp before the travel date."
    },
    {
      question: "Can I change my gender or other profile details?",
      answer: "Most profile details like name, email, and registration number are auto-fetched and cannot be changed. Gender can only be set once during profile setup. Only your WhatsApp number can be updated later from the Settings page."
    },
    {
      question: "How does the time buffer system work?",
      answer: "Time buffers help match you with travelers who have compatible timing. For airport trips, it represents how early you want to arrive. For return trips, it's how long you're willing to wait after landing. The system matches users with overlapping time windows."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 md:pb-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold gradient-text">Frequently Asked Questions</h1>
        <p className="text-muted-foreground">
          Everything you need to know about using CAB POOL
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="glass border-0 text-center">
          <CardContent className="p-6">
            <Users className="h-8 w-8 text-primary mx-auto mb-2" />
            <h3 className="font-semibold text-foreground mb-1">SRM Exclusive</h3>
            <p className="text-sm text-muted-foreground">Only verified SRM students can access the platform</p>
          </CardContent>
        </Card>
        <Card className="glass border-0 text-center">
          <CardContent className="p-6">
            <Shield className="h-8 w-8 text-accent mx-auto mb-2" />
            <h3 className="font-semibold text-foreground mb-1">Safe & Secure</h3>
            <p className="text-sm text-muted-foreground">Gender preferences and verified identities</p>
          </CardContent>
        </Card>
        <Card className="glass border-0 text-center">
          <CardContent className="p-6">
            <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
            <h3 className="font-semibold text-foreground mb-1">Auto Cleanup</h3>
            <p className="text-sm text-muted-foreground">Data automatically deleted after 24 hours</p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            <span>Common Questions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full space-y-2">
            {faqData.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="glass border-white/10 rounded-lg px-4">
                <AccordionTrigger className="text-left font-medium hover:text-primary">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <Card className="glass border-0 border-primary/20">
        <CardContent className="p-6 text-center">
          <h3 className="text-lg font-semibold mb-2">Still have questions?</h3>
          <p className="text-muted-foreground mb-4">
            Need help with something specific? Contact our support team.
          </p>
          <div className="space-x-4">
            <span className="text-sm text-muted-foreground">Support Email: </span>
            <span className="text-primary font-medium">support@cabpool.srmist.edu.in</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FAQ;
