import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, CheckCircle, TrendingUp, Users, Building } from 'lucide-react';
import { api } from '../utils/api';

const Home = () => {
  const { t } = useTranslation();
  const [location, setLocation] = useState(null);

  useEffect(() => {
    // Detect user location on mount
    api.detectLocation().then(data => {
      setLocation(data);
    });
  }, []);

  const steps = [
    {
      number: '1',
      title: t('steps.step1.title'),
      description: t('steps.step1.description'),
      icon: Users,
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop'
    },
    {
      number: '2',
      title: t('steps.step2.title'),
      description: t('steps.step2.description'),
      icon: TrendingUp,
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop'
    },
    {
      number: '3',
      title: t('steps.step3.title'),
      description: t('steps.step3.description'),
      icon: Building,
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop'
    }
  ];

  const services = [
    t('about.description'),
    t('about.collaboration'),
    t('about.support')
  ];

  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-50 -z-10" />
        
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div data-testid="hero-section">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                {t('hero.title')}
              </h1>
              <p className="text-xl text-gray-600 mb-4 font-medium">
                {t('hero.subtitle')}
              </p>
              <p className="text-base text-gray-600 mb-8 leading-relaxed">
                {t('hero.description')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/appointment"
                  className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white text-base font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
                  data-testid="hero-appointment-btn"
                >
                  {t('hero.bookAppointment')}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link
                  to="/about"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 text-base font-semibold rounded-xl hover:bg-gray-50 transition-all shadow-md border-2 border-blue-600"
                  data-testid="hero-learn-more-btn"
                >
                  {t('hero.cta')}
                </Link>
              </div>
              
              {location && (
                <div className="mt-6 text-sm text-gray-500">
                  <span className="inline-flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    {t('pricing.region')}: {location.country}
                  </span>
                </div>
              )}
            </div>
            
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&h=600&fit=crop"
                alt="Israel Business"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-xl">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">20+</div>
                    <div className="text-sm text-gray-600">Years Experience</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {t('about.title')}
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="space-y-6">
              {services.map((service, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-base text-gray-600 leading-relaxed">{service}</p>
                </div>
              ))}
            </div>
            <div>
              <img
                src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=600&h=400&fit=crop"
                alt="Team"
                className="rounded-xl shadow-lg w-full h-full object-cover"
              />
            </div>
          </div>
          
          <div className="text-center">
            <Link
              to="/about"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              data-testid="about-learn-more-btn"
            >
              {t('hero.cta')}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {t('home.howItWorks.title')}
            </h2>
            <p className="text-lg text-gray-600">
              {t('home.howItWorks.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={index}
                  className="relative bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden group"
                  data-testid={`step-${step.number}`}
                >
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={step.image}
                      alt={step.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                        {step.number}
                      </div>
                      <Icon className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">{step.description}</p>
                    {index === 0 && (
                      <Link to="/appointment" className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm">
                        {t('hero.bookAppointment')} <ArrowRight className="ml-1 w-4 h-4" />
                      </Link>
                    )}
                    {index === 1 && (
                      <Link to="/mini-analyse" className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm">
                        {t('nav.miniAnalysis')} <ArrowRight className="ml-1 w-4 h-4" />
                      </Link>
                    )}
                    {index === 2 && (
                      <Link to="/packs" className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm">
                        {t('nav.packs')} <ArrowRight className="ml-1 w-4 h-4" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            {t('home.cta.title')}
          </h2>
          <p className="text-lg text-blue-100 mb-8">
            {t('home.cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/appointment"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 text-base font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              data-testid="cta-appointment-btn"
            >
              {t('hero.bookAppointment')}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-transparent text-white text-base font-semibold rounded-lg border-2 border-white hover:bg-white/10 transition-colors"
              data-testid="cta-contact-btn"
            >
              {t('nav.contact')}
            </Link>
          </div>
        </div>
      </section>
    </div>
    </>
  );
};

export default Home;
