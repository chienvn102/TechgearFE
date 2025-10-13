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
    question: 'Bạn có giao hàng quốc tế không?',
    answer: 'Có, chúng tôi giao hàng toàn cầu! Chúng tôi cung cấp dịch vụ giao hàng quốc tế đến hầu hết các quốc gia. Chi phí vận chuyển và thời gian giao hàng thay đổi tùy theo địa điểm. Vui lòng kiểm tra chính sách vận chuyển của chúng tôi để biết thêm chi tiết.'
  },
  {
    id: '2',
    question: 'Mất bao lâu để nhận được đơn hàng?',
    answer: 'Đơn hàng trong nước thường đến trong vòng 2-3 ngày làm việc. Đơn hàng quốc tế có thể mất 7-14 ngày làm việc tùy thuộc vào vị trí của bạn và quá trình thông quan.'
  },
  {
    id: '3',
    question: 'Chính sách bảo hành của bạn như thế nào?',
    answer: 'Chúng tôi cung cấp bảo hành 12 tháng cho tất cả sản phẩm. Bảo hành của chúng tôi bao gồm lỗi sản xuất và các vấn đề về phần cứng. Vui lòng giữ hóa đơn và liên hệ với đội ngũ hỗ trợ của chúng tôi để yêu cầu bảo hành.'
  },
  {
    id: '4',
    question: 'Còn câu hỏi nào khác?',
    answer: 'Nếu bạn có bất kỳ câu hỏi nào khác, đừng ngần ngại liên hệ với đội ngũ hỗ trợ khách hàng của chúng tôi. Chúng tôi luôn sẵn sàng hỗ trợ bạn với mọi thắc mắc về sản phẩm, đơn hàng hoặc dịch vụ của chúng tôi.'
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
              Có câu hỏi? Chúng tôi luôn sẵn sàng hỗ trợ.
            </h2>
            
            <p className="text-lg text-gray-600 leading-relaxed">
              Xem qua những câu hỏi thường gặp nhất mà khách hàng của chúng tôi đã hỏi. Vẫn còn thắc mắc? Hãy liên hệ với đội ngũ hỗ trợ khách hàng của chúng tôi.
            </p>
            
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
              <p className="text-blue-800 font-medium">
                Đội ngũ hỗ trợ khách hàng của chúng tôi hoạt động từ Thứ Hai đến Thứ Sáu từ 9:00 đến 18:30 (giờ Việt Nam).
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
