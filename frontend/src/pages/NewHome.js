import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Sparkles, Download, Check } from 'lucide-react';
import { toast } from 'sonner';

const NewHome = () => {
  const [formData, setFormData] = useState({
    email: '',
    sector: '',
    customSector: '',
    companyAge: '',
    differentiation: '',
    wantInsight: 'yes'
  });
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);

  const sectors = [
    'Retail & E-commerce',
    'Technology & Software',
    'Food & Beverage',
    'Fashion & Apparel',
    'Health & Wellness',
    'Beauty & Cosmetics',
    'Home & Lifestyle',
    'Services & Consulting',
    'Other'
  ];

  const companyAges = [
    'Less than 1 year',
    '1-3 years',
    '3-5 years',
    '5-10 years',
    'More than 10 years'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.sector || !formData.differentiation) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.wantInsight === 'no') {
      toast.info('Thank you for your interest. Feel free to contact us directly.');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('/api/ai/generate-insight', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          sector: formData.sector === 'Other' ? formData.customSector : formData.sector,
          companyAge: formData.companyAge,
          differentiation: formData.differentiation
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate analysis');
      }

      const data = await response.json();
      setAnalysis(data.analysis);
      setPdfUrl(data.pdfUrl);
      toast.success('Your Israel market insight has been generated!');
      
      // Scroll to results
      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Is your brand relevant for the Israeli market? | Israel Growth Venture</title>
        <meta name="description" content="Get a first AI-generated market insight for Israel in less than 2 minutes. Understand if, how, and where your brand could make sense in the Israeli market." />
        
        {/* OpenGraph */}
        <meta property="og:title" content="Is your brand relevant for the Israeli market?" />
        <meta property="og:description" content="Get a free AI-generated Israel market insight in less than 2 minutes." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://israelgrowthventure.com" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Is your brand relevant for the Israeli market?" />
        <meta name="twitter:description" content="Get a free AI-generated Israel market insight in less than 2 minutes." />
        
        {/* Canonical */}
        <link rel="canonical" content="https://israelgrowthventure.com" />
        
        {/* Schema.org Organization markup for AIO */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Israel Growth Venture",
            "alternateName": "IGV",
            "url": "https://israelgrowthventure.com",
            "description": "Israel Growth Venture provides professional market analysis and strategic consulting for international brands considering expansion into the Israeli market. Services include market analysis, entry strategy, location selection, and implementation support for Israel market entry.",
            "foundingDate": "2024",
            "areaServed": {
              "@type": "Country",
              "name": "Israel"
            },
            "serviceType": [
              "Market Analysis",
              "Israel Market Entry Consulting",
              "Strategic Business Consulting",
              "Market Research",
              "Franchise Consulting",
              "Retail Expansion Consulting"
            ],
            "knowsAbout": [
              "Israel market entry",
              "Israeli consumer market",
              "Franchise expansion Israel",
              "Retail market Israel",
              "Market analysis Israel",
              "Business consulting Israel"
            ],
            "contactPoint": {
              "@type": "ContactPoint",
              "email": "israel.growth.venture@gmail.com",
              "contactType": "Customer Service"
            }
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        {/* Hero Section */}
        <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4" />
              Free AI-Generated Market Insight
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Is your brand relevant for the Israeli market?
            </h1>
            
            <p className="text-xl text-gray-700 mb-4 font-medium">
              Get a first AI-generated market insight in less than 2 minutes.
            </p>
            
            <div className="max-w-2xl mx-auto bg-blue-50 border-l-4 border-blue-600 p-6 rounded-lg mb-12">
              <p className="text-base text-gray-700 leading-relaxed">
                <strong>Israel is not a test market.</strong><br />
                This first analysis helps you understand if, how, and where your brand could make sense in Israel.
              </p>
            </div>
          </div>
        </section>

        {/* Form Section */}
        <section className="pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 text-center">
                Generate your free Israel market insight
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>

                {/* Sector */}
                <div>
                  <label htmlFor="sector" className="block text-sm font-semibold text-gray-700 mb-2">
                    Business sector *
                  </label>
                  <select
                    id="sector"
                    name="sector"
                    required
                    value={formData.sector}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select your sector</option>
                    {sectors.map(sector => (
                      <option key={sector} value={sector}>{sector}</option>
                    ))}
                  </select>
                </div>

                {/* Custom Sector */}
                {formData.sector === 'Other' && (
                  <div>
                    <label htmlFor="customSector" className="block text-sm font-semibold text-gray-700 mb-2">
                      Please specify your sector *
                    </label>
                    <input
                      type="text"
                      id="customSector"
                      name="customSector"
                      required={formData.sector === 'Other'}
                      value={formData.customSector}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your business sector"
                    />
                  </div>
                )}

                {/* Company Age */}
                <div>
                  <label htmlFor="companyAge" className="block text-sm font-semibold text-gray-700 mb-2">
                    Company age
                  </label>
                  <select
                    id="companyAge"
                    name="companyAge"
                    value={formData.companyAge}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select company age</option>
                    {companyAges.map(age => (
                      <option key={age} value={age}>{age}</option>
                    ))}
                  </select>
                </div>

                {/* Differentiation */}
                <div>
                  <label htmlFor="differentiation" className="block text-sm font-semibold text-gray-700 mb-2">
                    What makes your brand unique or different? *
                  </label>
                  <textarea
                    id="differentiation"
                    name="differentiation"
                    required
                    rows={4}
                    value={formData.differentiation}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Describe your unique value proposition, competitive advantage, or what differentiates you in the market..."
                  />
                </div>

                {/* Final Question */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <p className="text-base font-semibold text-gray-900 mb-4">
                    Do you want to know if Israel makes sense for your business?
                  </p>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="wantInsight"
                        value="yes"
                        checked={formData.wantInsight === 'yes'}
                        onChange={handleChange}
                        className="w-5 h-5 text-blue-600"
                      />
                      <span className="text-gray-700">Yes, generate my free insight</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="wantInsight"
                        value="no"
                        checked={formData.wantInsight === 'no'}
                        onChange={handleChange}
                        className="w-5 h-5 text-blue-600"
                      />
                      <span className="text-gray-700">No, not right now</span>
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Generating your insight...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate my free Israel market insight
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* Results Section */}
        {analysis && (
          <section id="results" className="pb-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    Your Israel Market Insight
                  </h2>
                  {pdfUrl && (
                    <a
                      href={pdfUrl}
                      download
                      className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all"
                    >
                      <Download className="w-5 h-5" />
                      Download PDF
                    </a>
                  )}
                </div>

                <div className="prose prose-lg max-w-none mb-8">
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {analysis}
                  </div>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-lg mb-8">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    <strong>Note:</strong> This first insight was generated by an AI model based on your inputs.
                    It provides an initial orientation but does not replace a full human market analysis.
                    If you want a detailed, strategic and location-based study, you can request a complete analysis conducted by Israel Growth Venture.
                  </p>
                </div>

                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-8 text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Want to go further?
                  </h3>
                  <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
                    A complete human-led Israel Market Analysis (locations, budget, risks, entry model) is available.
                  </p>
                  <a
                    href={`/contact?email=${encodeURIComponent(formData.email)}`}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white text-lg font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl"
                  >
                    Request full analysis (3,000 USD)
                    <ArrowRight className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Trust Indicators */}
        <section className="pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              {[
                { icon: Check, text: 'AI-Powered Insights' },
                { icon: Check, text: 'Israel Market Specialists' },
                { icon: Check, text: 'Free Preliminary Analysis' }
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <item.icon className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-gray-700 font-medium">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default NewHome;
