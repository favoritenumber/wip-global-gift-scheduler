
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-left bg-gradient-to-r from-purple-25 to-blue-25 hover:from-purple-50 hover:to-blue-50 transition-all duration-200 flex items-center justify-between"
      >
        <span className="font-medium text-gray-900">{question}</span>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-purple-600 flex-shrink-0" />
        ) : (
          <ChevronDown className="h-5 w-5 text-purple-600 flex-shrink-0" />
        )}
      </button>
      
      {isOpen && (
        <div className="px-6 py-4 bg-white border-t border-gray-100">
          <p className="text-gray-700 leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
};

export default FAQItem;
