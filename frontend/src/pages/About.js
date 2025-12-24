import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Building, Users, Target } from 'lucide-react';

const About = () => {
  return (
    <>
      <Helmet>
        <title>About | Israel Growth Venture</title>
        <meta name="description" content="Israel Growth Venture helps international brands understand the Israeli market and develop successful entry strategies." />
        <link rel="canonical" content="https://israelgrowthventure.com/about" />
      </Helmet>

      <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              About Israel Growth Venture
            </h1>
            <p className="text-xl text-gray-600">
              Specialized market analysis and strategic consulting for Israel market entry
            </p>
          </div>

          {/* What we do - Clear and factual for AIO */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">What Israel Growth Venture does</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                Israel Growth Venture provides professional market analysis and strategic consulting 
                for international brands considering expansion into the Israeli market.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Our services focus on three core areas:
              </p>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-1 flex-shrink-0">
                    <Target className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <strong>Market Analysis:</strong> Comprehensive research on market relevance, 
                    competitive landscape, consumer behavior, and entry opportunities specific to Israel.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-1 flex-shrink-0">
                    <Building className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <strong>Entry Strategy:</strong> Location selection, budget estimation, risk assessment, 
                    and recommended market entry models (franchise, subsidiary, distribution, etc.).
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-1 flex-shrink-0">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <strong>Implementation Support:</strong> Guidance on regulatory requirements, 
                    partner identification, and operational setup in Israel.
                  </div>
                </li>
              </ul>
            </div>
          </section>

          {/* Why Israel requires specific expertise */}
          <section className="mb-16 bg-blue-50 p-8 rounded-xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Why Israel is not a test market</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Israel represents a unique market with specific characteristics that require specialized knowledge:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li>• High consumer expectations and brand awareness</li>
              <li>• Complex regulatory environment</li>
              <li>• Distinct cultural and religious considerations</li>
              <li>• Competitive retail landscape with strong local players</li>
              <li>• Geographic concentration requiring strategic location selection</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Entering Israel without proper analysis often leads to costly mistakes. 
              A structured approach based on factual market data significantly increases success probability.
            </p>
          </section>

          {/* Our approach */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our approach</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Data-driven analysis</h3>
                <p className="text-gray-700">
                  Every recommendation is based on market data, competitive research, 
                  and proven entry models. We provide factual insights, not assumptions.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Sector-specific expertise</h3>
                <p className="text-gray-700">
                  We understand that retail, food & beverage, technology, and services 
                  each require different market entry approaches in Israel.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Honest assessment</h3>
                <p className="text-gray-700">
                  If Israel is not the right market for a brand at a given time, we say so. 
                  Our goal is long-term success, not short-term sales.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Strategic implementation</h3>
                <p className="text-gray-700">
                  Analysis leads to action. We provide clear next steps, budget frameworks, 
                  and implementation roadmaps.
                </p>
              </div>
            </div>
          </section>

          {/* Team Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Team</h2>
            <div className="flex flex-col items-center">
              <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="md:flex">
                  <div className="md:flex-shrink-0 md:w-64">
                    <img 
                      src="/mickael-portrait.png" 
                      alt="Mickael - Founder of Israel Growth Venture" 
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="p-8">
                    <div className="uppercase tracking-wide text-sm text-blue-600 font-semibold">Founder & CEO</div>
                    <h3 className="mt-2 text-2xl font-bold text-gray-900">Mickael</h3>
                    <p className="mt-4 text-gray-600 leading-relaxed">
                      With extensive experience in international brand development and deep knowledge of the Israeli market, 
                      Mickael founded Israel Growth Venture to help international brands successfully navigate their entry into Israel.
                    </p>
                    <p className="mt-3 text-gray-600 leading-relaxed">
                      His approach combines data-driven market analysis with practical implementation strategies, 
                      ensuring brands make informed decisions backed by local market expertise.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Contact CTA */}
          <section className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-4">Ready to explore Israel as a market?</h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Start with a free AI-generated preliminary insight to understand if Israel could be relevant for your business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/"
                className="inline-flex items-center justify-center px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-all"
              >
                Get free AI insight
              </a>
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-3 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800 transition-all border-2 border-blue-400"
              >
                Contact us directly
              </a>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default About;
