
import React, { useState } from 'react';
import { Phone, Mail, MessageCircle, ChevronDown, ChevronUp, Search, HelpCircle } from 'lucide-react';
import FAQItem from './FAQItem';

const SupportPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const faqCategories = [
    { id: 'all', name: 'All' },
    { id: 'billing', name: 'Billing & Payment' },
    { id: 'delivery', name: 'Delivery' },
    { id: 'account', name: 'Account Management' },
    { id: 'technical', name: 'Technical Support' },
    { id: 'privacy', name: 'Privacy & Security' }
  ];

  const faqData = [
    {
      id: 1,
      category: 'billing',
      question: 'How does billing work for gifts?',
      answer: 'To make your gifting experience seamless, we authorize your credit card when you schedule a gift. We will only deduct the final amount **5 days before** the scheduled delivery date. This gives you a window to make any changes to your gift. You can cancel or modify your gift at any time before the 5-day processing window.'
    },
    {
      id: 2,
      category: 'account',
      question: 'Can I edit or cancel a gift after scheduling it?',
      answer: 'Yes! You can edit or cancel any gift up to **5 days before** the scheduled delivery date. After this point, the gift is sent for processing and cannot be changed. You can edit a gift by finding it in the \'Gifts\' tab (either list or calendar view) and clicking the edit icon.'
    },
    {
      id: 3,
      category: 'delivery',
      question: 'Do you deliver globally?',
      answer: 'Yes, we offer global delivery to over 190 countries. Please ensure you enter the correct and complete address, including the country, for your recipient. Delivery times may vary by location, typically ranging from 3-14 business days depending on the destination.'
    },
    {
      id: 4,
      category: 'account',
      question: 'What is a Gift ID?',
      answer: 'Each gift you schedule is assigned a unique Gift ID (e.g., SUR-20250602-BIRT). This ID helps our support team track your specific gift if you ever need assistance. You can find this ID in your order history and confirmation emails.'
    },
    {
      id: 5,
      category: 'delivery',
      question: 'What happens if a gift can\'t be delivered?',
      answer: 'If a delivery fails due to an incorrect address or other issues, our support team will contact you via your registered email to resolve the problem. In the \'Gifts\' tab, the gift status will be updated to "Delivery Failed". As a token of our apology, we will send a gift of 5x the value on the same occasion next year, on us.'
    },
    {
      id: 6,
      category: 'account',
      question: 'How do I add or edit a recipient\'s information?',
      answer: 'You can manage all your recipients in the \'People\' tab. Clicking on a person\'s name will open a pop-up where you can edit their nickname, key dates, and address. All changes will be automatically saved for future gifts.'
    },
    {
      id: 7,
      category: 'billing',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, MasterCard, American Express, Discover), PayPal, Apple Pay, Google Pay, and bank transfers. For corporate accounts, we also offer net-30 billing terms upon approval.'
    },
    {
      id: 8,
      category: 'delivery',
      question: 'Can I track my gift delivery?',
      answer: 'Yes! Once your gift is processed and shipped, you\'ll receive a tracking number via email. You can track your gift\'s progress in real-time through our tracking portal or the carrier\'s website.'
    },
    {
      id: 9,
      category: 'account',
      question: 'How do I set up recurring gifts?',
      answer: 'When creating or editing a gift, simply check the "Make this gift recurring annually" checkbox. The gift will automatically be scheduled for the same date each year. You can modify or cancel recurring gifts at any time in your account settings.'
    },
    {
      id: 10,
      category: 'privacy',
      question: 'How do you protect my personal information?',
      answer: 'We use industry-standard encryption (SSL/TLS) to protect your data in transit and at rest. We never share your personal information with third parties without your consent. You can review our full privacy policy in your account settings.'
    },
    {
      id: 11,
      category: 'technical',
      question: 'I\'m having trouble uploading photos. What should I do?',
      answer: 'Ensure your photo is in JPG, PNG, or HEIC format and under 10MB. Clear your browser cache, try a different browser, or use our mobile app. If issues persist, contact our technical support team.'
    },
    {
      id: 12,
      category: 'billing',
      question: 'Can I get a refund for a cancelled gift?',
      answer: 'Yes, full refunds are available for gifts cancelled more than 5 days before the delivery date. Refunds typically process within 3-5 business days to your original payment method.'
    },
    {
      id: 13,
      category: 'account',
      question: 'How do I import contacts from social media?',
      answer: 'Go to Settings > Find Friends to connect your Facebook, LinkedIn, or other social media accounts. You can then select which friends to import along with their birthday information where available.'
    },
    {
      id: 14,
      category: 'delivery',
      question: 'What types of gifts can I send?',
      answer: 'We offer personalized photo cards, custom gifts, flowers, chocolates, wine, gift baskets, and digital gift cards. All gifts can be personalized with your message and photo.'
    },
    {
      id: 15,
      category: 'technical',
      question: 'Is there a mobile app available?',
      answer: 'Yes! Download the Global Gift Scheduler app from the App Store or Google Play Store. The mobile app includes all desktop features plus push notifications for upcoming gift reminders.'
    }
  ];

  const filteredFAQs = faqData.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white min-h-screen">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-black mb-4">
          How can we help you?
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Get instant answers to your questions or reach out to our support team
        </p>

        {/* Search Bar */}
        <div className="relative max-w-2xl mx-auto mb-8">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search frequently asked questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-black focus:border-black"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {faqCategories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === category.id
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Contact Options */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {/* WhatsApp */}
        <div className="bg-white border border-gray-300 rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
          <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">WhatsApp Support</h3>
          <p className="text-gray-600 mb-4">Get instant help via WhatsApp</p>
          <a
            href="https://wa.me/15551234567"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center w-full bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            +1 (555) 123-4567
          </a>
        </div>

        {/* Email */}
        <div className="bg-white border border-gray-300 rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
          <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Email Support</h3>
          <p className="text-gray-600 mb-4">Send us a detailed message</p>
          <a
            href="mailto:support@globalgiftscheduler.com"
            className="inline-flex items-center justify-center w-full bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            support@globalgiftscheduler.com
          </a>
        </div>

        {/* Phone */}
        <div className="bg-white border border-gray-300 rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
          <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
            <Phone className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Phone Support</h3>
          <p className="text-gray-600 mb-4">Speak with our team directly</p>
          <a
            href="tel:+15551234567"
            className="inline-flex items-center justify-center w-full bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            +1 (555) 123-4567
          </a>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mb-12">
        <div className="flex items-center justify-center mb-8">
          <HelpCircle className="h-6 w-6 text-gray-600 mr-2" />
          <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
        </div>

        {filteredFAQs.length > 0 ? (
          <div className="space-y-4">
            {filteredFAQs.map(faq => (
              <FAQItem
                key={faq.id}
                question={faq.question}
                answer={faq.answer}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No FAQs found matching your search.</p>
            <p className="text-gray-400 mt-2">Try adjusting your search terms or contact our support team directly.</p>
          </div>
        )}
      </div>

      {/* Additional Help */}
      <div className="bg-gray-100 border border-gray-300 rounded-lg p-8 text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Still need help?</h3>
        <p className="text-gray-600 mb-6">
          Our support team is available 24/7 to assist you with any questions or concerns.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="mailto:support@globalgiftscheduler.com"
            className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            Contact Support
          </a>
          <a
            href="https://wa.me/15551234567"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-black border border-black px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Chat on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
