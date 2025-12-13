import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowRight, Home, Mail } from 'lucide-react';

const PaymentFailure = () => {
    return (
        <div className="min-h-screen pt-20 bg-gradient-to-br from-red-50 to-gray-100 flex items-center justify-center px-4">
            <div className="max-w-2xl w-full">
                <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
                        <AlertCircle className="w-12 h-12 text-red-600" />
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Paiement échoué
                    </h1>

                    <p className="text-lg text-gray-600 mb-8">
                        Une erreur s'est produite lors du traitement de votre paiement. Aucun montant n'a été débité de votre compte.
                    </p>

                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8">
                        <h2 className="font-semibold text-gray-900 mb-3">Que faire maintenant ?</h2>
                        <ul className="text-left space-y-2 text-gray-700">
                            <li className="flex items-start gap-2">
                                <span className="text-amber-600 font-bold">1.</span>
                                <span>Vérifiez les informations de votre carte bancaire</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-amber-600 font-bold">2.</span>
                                <span>Assurez-vous d'avoir les fonds nécessaires</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-amber-600 font-bold">3.</span>
                                <span>Réessayez ou contactez-nous pour un paiement par virement</span>
                            </li>
                        </ul>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                        <Link
                            to="/packs"
                            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Réessayer le paiement
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Link>
                        <Link
                            to="/contact"
                            className="inline-flex items-center justify-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-colors"
                        >
                            <Mail className="w-5 h-5 mr-2" />
                            Nous contacter
                        </Link>
                    </div>

                    <Link
                        to="/"
                        className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <Home className="w-4 h-4 mr-2" />
                        Retour à l'accueil
                    </Link>

                    <div className="mt-8 pt-8 border-t border-gray-200">
                        <h3 className="font-semibold text-gray-900 mb-3">Paiement par virement bancaire</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Vous pouvez également effectuer un virement bancaire. Contactez-nous pour obtenir nos coordonnées bancaires.
                        </p>
                        <a
                            href="mailto:israel.growth.venture@gmail.com?subject=Demande de coordonnées bancaires"
                            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                        >
                            <Mail className="w-4 h-4 mr-2" />
                            israel.growth.venture@gmail.com
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentFailure;
