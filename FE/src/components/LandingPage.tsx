import { motion } from 'motion/react';
import { Camera, TrendingUp, BarChart3, Target, ChevronRight, Sparkles, ChevronDown, Heart, Shield, Zap, Award, Users, Clock } from 'lucide-react';
import { Button } from './ui/button';

interface LandingPageProps {
  onStart: () => void;
}

export function LandingPage({ onStart }: LandingPageProps) {
  const features = [
    {
      icon: Camera,
      title: 'AI Recognition',
      description: 'Snap a photo and GPT-4 Vision instantly identifies nutritional content'
    },
    {
      icon: BarChart3,
      title: 'Precise Analysis',
      description: 'Real-time tracking of calories, protein, carbs, and fats'
    },
    {
      icon: TrendingUp,
      title: 'Personalized Advice',
      description: 'AI nutritionist provides expert dietary recommendations based on your goals'
    },
    {
      icon: Target,
      title: 'Goal Management',
      description: 'Support for weight loss, maintenance, and muscle gain goals'
    }
  ];

  return (
    <div className="h-full bg-gradient-to-br from-[#F8F9FA] via-white to-[#F8F9FA] overflow-y-auto overflow-x-hidden">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="px-6 pt-16 pb-8 text-center relative"
      >
        {/* Logo and Badge */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex flex-col items-center mb-6"
        >
          <div className="relative mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-[#2ECC71] to-[#27AE60] rounded-3xl flex items-center justify-center shadow-lg shadow-[#2ECC71]/30">
              <Sparkles className="w-10 h-10 text-white" strokeWidth={2.5} />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#3498DB] rounded-full border-2 border-white flex items-center justify-center">
              <span className="text-white text-xs font-bold">AI</span>
            </div>
          </div>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-4xl font-bold text-gray-900 mb-3 leading-tight"
        >
          Your Personal
          <br />
          <span className="bg-gradient-to-r from-[#2ECC71] to-[#27AE60] bg-clip-text text-transparent">
            AI Nutritionist
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-base text-gray-600 mb-6 max-w-sm mx-auto leading-relaxed"
        >
          Snap a photo to get precise nutritional analysis and smart dietary advice, easily achieving your health goals
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <Button
            onClick={onStart}
            className="bg-gradient-to-r from-[#2ECC71] to-[#27AE60] hover:from-[#27AE60] hover:to-[#229954] text-white px-8 py-5 text-base rounded-2xl shadow-lg shadow-[#2ECC71]/30 hover:shadow-xl hover:shadow-[#2ECC71]/40 transition-all duration-300"
          >
            Start Now
            <ChevronRight className="ml-2 w-5 h-5" />
          </Button>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="mt-8 flex flex-col items-center"
        >
          <span className="text-xs text-gray-500 mb-2">Scroll down to learn more</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            <ChevronDown className="w-5 h-5 text-[#2ECC71]" />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Hero Image Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="px-6 py-8"
      >
        <div className="relative mx-auto w-full max-w-xs">
          {/* Phone Frame Mockup */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-[3rem] p-3 shadow-2xl">
            <div className="bg-white rounded-[2.5rem] overflow-hidden aspect-[9/19]">
              <img
                src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800"
                alt="Healthy food"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          
          {/* Floating Elements */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="absolute -top-4 -right-4 bg-white rounded-2xl px-4 py-2 shadow-xl"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#2ECC71] rounded-full"></div>
              <span className="text-sm font-semibold text-gray-700">520 kcal</span>
            </div>
          </motion.div>
          
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: 0.5 }}
            className="absolute -bottom-4 -left-4 bg-white rounded-2xl px-4 py-2 shadow-xl"
          >
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-[#3498DB]" />
              <span className="text-sm font-semibold text-gray-700">AI Recognition</span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Features Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="px-6 py-12"
      >
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-3">
          Core Features
        </h2>
        <p className="text-center text-gray-600 mb-8 max-w-md mx-auto">
          Professional nutrition management tools, making healthy eating simple and efficient
        </p>

        <div className="grid grid-cols-1 gap-4 max-w-md mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#2ECC71]/10 to-[#2ECC71]/5 rounded-xl flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-[#2ECC71]" strokeWidth={2} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Why Choose Us Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="px-6 py-12 bg-gradient-to-b from-white to-[#F8F9FA]"
      >
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-3">
          Why Choose Us
        </h2>
        <p className="text-center text-gray-600 mb-8 max-w-md mx-auto">
          Leveraging cutting-edge AI technology, we provide professional and reliable nutrition management services
        </p>

        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
          {[
            { icon: Heart, title: 'Professional Reliability', desc: 'Based on nutritional standards', color: '#E74C3C' },
            { icon: Shield, title: 'Privacy Security', desc: 'Data locally encrypted', color: '#3498DB' },
            { icon: Zap, title: 'Fast Response', desc: 'Millisecond AI analysis', color: '#F39C12' },
            { icon: Award, title: 'High Accuracy', desc: '95%+ recognition accuracy', color: '#2ECC71' },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="bg-white rounded-2xl p-5 shadow-md text-center"
            >
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
                style={{ background: `${item.color}15` }}
              >
                <item.icon className="w-6 h-6" style={{ color: item.color }} strokeWidth={2} />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">
                {item.title}
              </h3>
              <p className="text-xs text-gray-600">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Stats Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="px-6 py-12"
      >
        <div className="max-w-md mx-auto bg-gradient-to-br from-[#2ECC71]/5 to-[#3498DB]/5 rounded-3xl p-8">
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { value: '10K+', label: 'Active Users', icon: Users },
              { value: '95%', label: 'Satisfaction', icon: Award },
              { value: '24/7', label: 'Round-the-Clock Service', icon: Clock }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <stat.icon className="w-6 h-6 text-[#2ECC71] mx-auto mb-2" strokeWidth={2} />
                <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-xs text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* How It Works Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="px-6 py-12 bg-gradient-to-b from-[#F8F9FA] to-white"
      >
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
          Simple Three Steps, Start Your Healthy Journey
        </h2>

        <div className="max-w-md mx-auto space-y-6">
          {[
            { step: '01', title: 'Snap and Upload', description: 'Photograph your meal or select a photo from your gallery', color: '#2ECC71' },
            { step: '02', title: 'AI Analysis', description: 'GPT-4 Vision instantly identifies and analyzes nutritional content', color: '#3498DB' },
            { step: '03', title: 'Get Recommendations', description: 'Receive personalized nutritional advice and meal plans', color: '#E74C3C' }
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.6 }}
              className="flex items-start gap-4"
            >
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 font-bold text-white text-lg shadow-lg"
                style={{ 
                  background: `linear-gradient(135deg, ${item.color}, ${item.color}dd)`,
                  boxShadow: `0 4px 15px ${item.color}40`
                }}
              >
                {item.step}
              </div>
              <div className="pt-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Final CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="px-6 py-16 text-center"
      >
        <div className="max-w-md mx-auto bg-gradient-to-br from-[#2ECC71] to-[#27AE60] rounded-3xl p-8 shadow-2xl shadow-[#2ECC71]/30">
          <h2 className="text-2xl font-bold text-white mb-3">
            Ready to Start?
          </h2>
          <p className="text-white/90 mb-6 leading-relaxed">
            Join thousands of users and let AI help you achieve your health goals
          </p>
          <Button
            onClick={onStart}
            className="bg-white text-[#2ECC71] hover:bg-gray-50 px-8 py-6 text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 w-full font-semibold"
          >
            Start Experiencing Now
            <ChevronRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="px-6 py-8 text-center text-sm text-gray-500"
      >
        <p>Powered by OpenAI GPT-4 Vision</p>
        <p className="mt-2">Empowering healthy living with technology</p>
      </motion.div>
    </div>
  );
}