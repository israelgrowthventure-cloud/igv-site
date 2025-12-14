import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, Home } from 'lucide-react';

const PaymentSuccess = () => {
    return (
        <div className="min-h-screen pt-20 bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
            <div className="max-w-2xl w-full">
                <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Paiement réussi !
                    </h1>

                    <p className="text-lg text-gray-600 mb-8">
                        Votre commande a été confirmée. Vous allez recevoir un email de confirmation dans quelques instants.
                    </p>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                        <h2 className="font-semibold text-gray-900 mb-3">Prochaines étapes :</h2>
                        <ul className="text-left space-y-2 text-gray-700">
                            <li className="flex items-start gap-2">
                                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                <span>Vérifiez votre boîte email pour la confirmation</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                <span>Notre équipe vous contactera sous 24h</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                <span>Un conseiller dédié sera assigné à votre projet</span>
                            </li>
                        </ul>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/"
                            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Home className="w-5 h-5 mr-2" />
                            Retour à l'accueil
                        </Link>
                        <Link
                            to="/contact"
                            className="inline-flex items-center justify-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-colors"
                        >
                            Nous contacter
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Link>
                    </div>

                    <p className="mt-8 text-sm text-gray-500">
                        Besoin d'aide ? Contactez-nous à{' '}
                        <a href="mailto:israel.growth.venture@gmail.com" className="text-blue-600 hover:underline">
                            israel.growth.venture@gmail.com
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;
