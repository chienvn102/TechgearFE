'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    id: '1',
    question: 'Do you ship overseas?',
    answer: 'Yes, we ship worldwide! We offer international shipping to most countries. Shipping costs and delivery times vary by location. Please check our shipping policy for more details.'
  },
  {
    id: '2',
    question: 'How long will it take to get my orders?',
    answer: 'Domestic orders typically arrive within 2-3 business days. International orders may take 7-14 business days depending on your location and customs processing.'
  },
  {
    id: '3',
    question: 'What is your warranty policy?',
    answer: 'We offer a 12-month warranty on all products. Our warranty covers manufacturing defects and hardware issues. Please keep your receipt and contact our support team for warranty claims.'
  },
  {
    id: '4',
    question: 'Any question?',
    answer: 'If you have any other questions, please don\'t hesitate to contact our customer support team. We\'re here to help you with any inquiries about our products, orders, or services.'
  }
];

export const FAQSection: React.FC = () => {
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Column - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-4xl font-bold text-gray-900 leading-tight">
              Have a question? We are here to help.
            </h2>
            
            <p className="text-lg text-gray-600 leading-relaxed">
              Check out the most common questions our customers asked. Still have questions? Contact our customer support.
            </p>
            
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
              <p className="text-blue-800 font-medium">
                Our customer support is available Monday to Friday from 9 AM to 6:30 PM CST.
              </p>
            </div>
          </motion.div>

          {/* Right Column - FAQ Accordion */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-white rounded-lg border border-gray-200 shadow-sm"
          >
            <div className="p-6 space-y-4">
              {faqData.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="border-b border-gray-100 last:border-b-0"
                >
                  <button
                    onClick={() => toggleItem(item.id)}
                    className="w-full flex items-center justify-between py-4 text-left hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors"
                  >
                    <span className="font-medium text-gray-900 pr-4">
                      {item.question}
                    </span>
                    <motion.div
                      animate={{ rotate: openItems.includes(item.id) ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDownIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    </motion.div>
                  </button>
                  
                  <AnimatePresence>
                    {openItems.includes(item.id) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="pb-4 px-2">
                          <p className="text-gray-600 leading-relaxed">
                            {item.answer}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
