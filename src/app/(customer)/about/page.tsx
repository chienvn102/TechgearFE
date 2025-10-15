'use client';

import { motion } from 'framer-motion';
import FeaturedProducts from '@/components/FeaturedProducts';
import {
  SparklesIcon,
  ShieldCheckIcon,
  TrophyIcon,
  HeartIcon,
  UserGroupIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Về TechGear
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto opacity-90">
              Chúng tôi mang đến những sản phẩm Gaming Gear chính hãng, 
              giúp game thủ Việt Nam nâng tầm trải nghiệm chơi game.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Sứ mệnh của chúng tôi
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              TechGear được thành lập với sứ mệnh cung cấp các sản phẩm Gaming Gear 
              chất lượng cao, chính hãng với giá cả hợp lý cho cộng đồng game thủ Việt Nam.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Value 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white rounded-lg shadow-md p-8 text-center hover:shadow-xl transition-shadow"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheckIcon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Chính hãng 100%
              </h3>
              <p className="text-gray-600">
                Tất cả sản phẩm đều là hàng chính hãng, có tem bảo hành, 
                được nhập khẩu trực tiếp từ các nhà phân phối ủy quyền.
              </p>
            </motion.div>

            {/* Value 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-lg shadow-md p-8 text-center hover:shadow-xl transition-shadow"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <HeartIcon className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Dịch vụ tận tâm
              </h3>
              <p className="text-gray-600">
                Đội ngũ nhân viên nhiệt tình, am hiểu sản phẩm, 
                luôn sẵn sàng tư vấn và hỗ trợ khách hàng 24/7.
              </p>
            </motion.div>

            {/* Value 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white rounded-lg shadow-md p-8 text-center hover:shadow-xl transition-shadow"
            >
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrophyIcon className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Chất lượng hàng đầu
              </h3>
              <p className="text-gray-600">
                Cam kết mang đến những sản phẩm có chất lượng tốt nhất, 
                được kiểm tra kỹ lưỡng trước khi giao đến tay khách hàng.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Câu chuyện của chúng tôi
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  TechGear bắt đầu từ niềm đam mê với gaming và mong muốn mang đến 
                  những sản phẩm chất lượng cho cộng đồng game thủ Việt Nam. 
                  Chúng tôi hiểu rằng để có trải nghiệm chơi game tốt nhất, 
                  bạn cần những thiết bị đáng tin cậy.
                </p>
                <p>
                  Với kinh nghiệm nhiều năm trong ngành công nghệ và gaming, 
                  chúng tôi đã xây dựng mối quan hệ vững chắc với các thương hiệu 
                  hàng đầu thế giới như Logitech, Razer, SteelSeries, HyperX và nhiều hơn nữa.
                </p>
                <p>
                  Hôm nay, TechGear tự hào là địa chỉ tin cậy của hàng nghìn game thủ 
                  trên toàn quốc, không chỉ về sản phẩm mà còn về dịch vụ chăm sóc khách hàng.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-2 gap-6"
            >
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-8 text-white">
                <div className="text-4xl font-bold mb-2">10K+</div>
                <div className="text-blue-100">Khách hàng tin dùng</div>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-8 text-white">
                <div className="text-4xl font-bold mb-2">500+</div>
                <div className="text-green-100">Sản phẩm đa dạng</div>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-8 text-white">
                <div className="text-4xl font-bold mb-2">24/7</div>
                <div className="text-purple-100">Hỗ trợ khách hàng</div>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-8 text-white">
                <div className="text-4xl font-bold mb-2">100%</div>
                <div className="text-orange-100">Hàng chính hãng</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Giá trị cốt lõi
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Những giá trị này định hình cách chúng tôi làm việc và phục vụ khách hàng mỗi ngày
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Core Value 1 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow"
            >
              <SparklesIcon className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Đổi mới</h3>
              <p className="text-gray-600">
                Luôn tìm kiếm và cập nhật những sản phẩm công nghệ mới nhất, 
                mang đến trải nghiệm tốt nhất cho game thủ.
              </p>
            </motion.div>

            {/* Core Value 2 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow"
            >
              <UserGroupIcon className="w-12 h-12 text-green-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Khách hàng là trung tâm</h3>
              <p className="text-gray-600">
                Đặt lợi ích và trải nghiệm của khách hàng lên hàng đầu 
                trong mọi quyết định và hành động của chúng tôi.
              </p>
            </motion.div>

            {/* Core Value 3 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow"
            >
              <GlobeAltIcon className="w-12 h-12 text-purple-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Trách nhiệm</h3>
              <p className="text-gray-600">
                Cam kết với chất lượng sản phẩm, dịch vụ hậu mãi tốt nhất 
                và xây dựng lòng tin với khách hàng.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Commitment Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Cam kết của chúng tôi
            </h2>
            <p className="text-xl max-w-3xl mx-auto opacity-90 mb-8">
              Chúng tôi cam kết mang đến sản phẩm chính hãng 100%, 
              giá cả cạnh tranh, bảo hành chu đáo và dịch vụ khách hàng xuất sắc.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <div className="text-3xl font-bold mb-2">✓</div>
                <h3 className="text-lg font-semibold mb-2">Bảo hành chính hãng</h3>
                <p className="text-sm opacity-90">
                  Tất cả sản phẩm đều có tem bảo hành chính hãng từ nhà sản xuất
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <div className="text-3xl font-bold mb-2">✓</div>
                <h3 className="text-lg font-semibold mb-2">Đổi trả 30 ngày</h3>
                <p className="text-sm opacity-90">
                  Đổi trả miễn phí trong vòng 30 ngày nếu có lỗi từ nhà sản xuất
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <div className="text-3xl font-bold mb-2">✓</div>
                <h3 className="text-lg font-semibold mb-2">Giao hàng nhanh</h3>
                <p className="text-sm opacity-90">
                  Giao hàng toàn quốc, nhanh chóng và an toàn
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Recommended Products Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Sản phẩm đề xuất
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Khám phá những sản phẩm gaming gear được yêu thích nhất tại TechGear
            </p>
          </motion.div>

          {/* Featured Products Component */}
          <FeaturedProducts />
        </div>
      </section>
    </div>
  );
}
