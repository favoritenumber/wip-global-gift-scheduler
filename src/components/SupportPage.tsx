import React, { useState } from 'react';
import { LifeBuoy, ChevronDown } from 'lucide-react';

interface FAQItemProps {
  question: string;
  children: React.ReactNode;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="border-b">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full flex justify-between items-center text-left p-4 hover:bg-gray-50"
      >
        <span className="font-semibold text-gray-800">{question}</span>
        <ChevronDown size={20} className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="p-4 bg-gray-50 text-gray-700 space-y-2">
          {children}
        </div>
      )}
    </div>
  );
};

const SupportPage: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md mt-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-3 flex items-center">
        <LifeBuoy className="mr-3 text-blue-600" /> Global Gift Scheduler - Support & FAQ
      </h2>
      <div className="space-y-2">
        <FAQItem question="How does billing work for gifts?">
          <p>To make your gifting experience seamless, we authorize your credit card when you schedule a gift. We will only deduct the final amount **5 days before** the scheduled delivery date. This gives you a window to make any changes to your gift.</p>
        </FAQItem>
        <FAQItem question="Can I edit or cancel a gift after scheduling it?">
          <p>Yes! You can edit or cancel any gift up to **5 days before** the scheduled delivery date. After this point, the gift is sent for processing and cannot be changed. You can edit a gift by finding it in the 'Gifts' tab (either list or calendar view) and clicking the edit icon.</p>
        </FAQItem>
        <FAQItem question="Do you deliver globally?">
          <p>Yes, we offer global delivery. Please ensure you enter the correct and complete address, including the country, for your recipient.</p>
        </FAQItem>
        <FAQItem question="What is a Gift ID?">
          <p>Each gift you schedule is assigned a unique Gift ID (e.g., SUR-20250602-BIRT). This ID helps our support team track your specific gift if you ever need assistance. You can find this ID in your order history (a feature coming soon!).</p>
        </FAQItem>
        <FAQItem question="What happens if a gift can't be delivered?">
          <p>If a delivery fails due to an incorrect address or other issues, our support team will contact you via your registered email to resolve the problem. In the 'Gifts' tab, the gift status will be updated to "Delivery Failed". As a token of our apology, we will send a gift of 5x the value on the same occasion next year, on us.</p>
        </FAQItem>
        <FAQItem question="How do I add or edit a recipient's information?">
          <p>You can manage all your recipients in the 'People' tab. Clicking on a person's name will open a pop-up where you can edit their nickname, key dates, and address. All changes will be automatically saved for future gifts.</p>
        </FAQItem>
        <FAQItem question="How can I contact support?">
          <p>For any immediate questions, you can reach our support team via WhatsApp at +1 (555) 123-4567 or email us at support@globalgiftscheduler.com.</p>
        </FAQItem>
      </div>
    </div>
  );
};

export default SupportPage; 