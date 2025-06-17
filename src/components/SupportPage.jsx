
import React from 'react';
import { MessageCircle, Mail, Phone } from 'lucide-react';
import FAQItem from './FAQItem';

const SupportPage = () => {
  const faqs = [
    {
      question: "How does billing work for gifts?",
      answer: "To make your gifting experience seamless, we authorize your credit card when you schedule a gift. We will only deduct the final amount 5 days before the scheduled delivery date. This gives you a window to make any changes to your gift."
    },
    {
      question: "Can I edit or cancel a gift after scheduling it?",
      answer: "Yes! You can edit or cancel any gift up to 5 days before the scheduled delivery date. After this point, the gift is sent for processing and cannot be changed. You can edit a gift by finding it in the 'Gifts' tab (either list or calendar view) and clicking the edit icon."
    },
    {
      question: "Do you deliver globally?",
      answer: "Yes, we offer global delivery. Please ensure you enter the correct and complete address, including the country, for your recipient."
    },
    {
      question: "What is a Gift ID?",
      answer: "Each gift you schedule is assigned a unique Gift ID (e.g., SUR-20250602-BIRT). This ID helps our support team track your specific gift if you ever need assistance. You can find this ID in your order history (a feature coming soon!)."
    },
    {
      question: "What happens if a gift can't be delivered?",
      answer: "If a delivery fails due to an incorrect address or other issues, our support team will contact you via your registered email to resolve the problem. In the 'Gifts' tab, the gift status will be updated to \"Delivery Failed\". As a token of our apology, we will send a gift of 5x the value on the same occasion next year, on us."
    },
    {
      question: "How do I add or edit a recipient's information?",
      answer: "You can manage all your recipients in the 'People' tab. Clicking on a person's name will open a pop-up where you can edit their nickname, key dates, and address. All changes will be automatically saved for future gifts."
    },
    {
      question: "How can I contact support?",
      answer: "For any immediate questions, you can reach our support team via WhatsApp at +1 (555) 123-4567 or email us at support@globalgiftscheduler.com."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Support & FAQ
        </h1>
        <p className="text-gray-600 text-lg">
          Get help with Global Gift Scheduler and find answers to common questions
        </p>
      </div>

      {/* Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-green-500 rounded-lg">
              <MessageCircle className="h-5 w-5 text-white" />
            </div>
            <h3 className="font-semibold text-green-900">WhatsApp Support</h3>
          </div>
          <p className="text-green-700 mb-3">Get instant help via WhatsApp</p>
          <a 
            href="https://wa.me/15551234567" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-green-600 font-medium hover:text-green-700 transition-colors"
          >
            +1 (555) 123-4567
          </a>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Mail className="h-5 w-5 text-white" />
            </div>
            <h3 className="font-semibold text-blue-900">Email Support</h3>
          </div>
          <p className="text-blue-700 mb-3">Send us a detailed message</p>
          <a 
            href="mailto:support@globalgiftscheduler.com"
            className="text-blue-600 font-medium hover:text-blue-700 transition-colors"
          >
            support@globalgiftscheduler.com
          </a>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-purple-500 rounded-lg">
              <Phone className="h-5 w-5 text-white" />
            </div>
            <h3 className="font-semibold text-purple-900">Phone Support</h3>
          </div>
          <p className="text-purple-700 mb-3">Call us for urgent matters</p>
          <a 
            href="tel:+15551234567"
            className="text-purple-600 font-medium hover:text-purple-700 transition-colors"
          >
            +1 (555) 123-4567
          </a>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg border border-purple-100">
        <div className="p-6 border-b border-purple-100">
          <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
          <p className="text-gray-600 mt-2">Find answers to the most common questions about our service</p>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
      </div>

      {/* Additional Help */}
      <div className="mt-12 text-center">
        <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Still need help?</h3>
          <p className="text-gray-600 mb-6">
            Our support team is available 24/7 to assist you with any questions or issues.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/15551234567"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors font-medium"
            >
              Chat on WhatsApp
            </a>
            <a
              href="mailto:support@globalgiftscheduler.com"
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              Send Email
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
