import React, { useState } from 'react';

interface PremiumModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpgrade: () => void;
}

interface PlanCardProps {
    plan: 'pro' | 'plus';
    title: string;
    price: string;
    features: string[];
    isMostPopular?: boolean;
}

const PremiumModal = ({ isOpen, onClose, onUpgrade }: PremiumModalProps) => {
    if (!isOpen) return null;

    const [selectedPlan, setSelectedPlan] = useState<'pro' | 'plus'>('pro');
    const [isProcessing, setIsProcessing] = useState<boolean>(false);

    const handleUpgradeClick = async () => {
        setIsProcessing(true);
        await new Promise(resolve => setTimeout(resolve, 2000));
        onUpgrade();
    };

    const proFeatures = [
        "Unlimited AI Analysis",
        "Full Journal History",
        "Detailed Sentiment Charts",
        "AI 'Connect the Dots' Insights",
    ];

    const plusFeatures = [
        "All Pro features, plus:",
        "Advanced Pattern Reports",
        "Export Audio & Text Journals",
        "Priority Support",
        "Exclusive App Icons",
    ];

    const PlanCard = ({ plan, title, price, features, isMostPopular = false }: PlanCardProps) => {
        const isSelected = selectedPlan === plan;
        return (
            <div
                onClick={() => setSelectedPlan(plan)}
                className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${isSelected ? 'border-accent-light dark:border-accent-dark scale-105 bg-accent-light/5 dark:bg-accent-dark/5' : 'border-gray-300 dark:border-gray-600'} active:scale-[.98]`}
            >
                {isMostPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent-light dark:bg-accent-dark text-white text-xs font-bold px-3 py-1 rounded-full">
                        MOST POPULAR
                    </div>
                )}
                <h3 className="text-xl font-bold text-center text-text-primary-light dark:text-text-primary-dark">{title}</h3>
                <p className="text-center text-text-secondary-light dark:text-text-secondary-dark mb-4">{price}</p>
                <ul className="space-y-2 text-sm">
                    {features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                             <svg className="w-4 h-4 text-green-500 dark:text-green-400 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                            <span className="text-text-primary-light dark:text-text-primary-dark">{feature}</span>
                        </li>
                    ))}
                </ul>
            </div>
        );
    };


    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={!isProcessing ? onClose : undefined}
        >
            <div 
                className="bg-content-light dark:bg-content-dark rounded-2xl shadow-2xl p-6 max-w-lg w-full transform transition-all animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="text-center">
                     <div className="inline-block p-3 bg-gradient-to-r from-purple-500 to-indigo-500 dark:from-purple-600 dark:to-indigo-600 rounded-full mb-4">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">Go Premium</h2>
                    <p className="text-text-secondary-light dark:text-text-secondary-dark mt-2 mb-8">Choose the plan that's right for you.</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <PlanCard 
                        plan="pro"
                        title="Pro"
                        price="$7.99 / month"
                        features={proFeatures}
                        isMostPopular={true}
                    />
                     <PlanCard 
                        plan="plus"
                        title="Premium+"
                        price="$12.99 / month"
                        features={plusFeatures}
                    />
                </div>

                <button 
                    onClick={handleUpgradeClick}
                    disabled={isProcessing}
                    className="w-full mt-8 py-3 px-4 bg-accent-light dark:bg-accent-dark text-white font-semibold rounded-lg shadow-md hover:bg-accent-light-hover dark:hover:bg-accent-dark-hover transition-all duration-200 transform hover:scale-105 disabled:bg-gray-400 dark:disabled:bg-gray-500 disabled:cursor-wait flex items-center justify-center active:animate-button-press"
                >
                   {isProcessing ? (
                       <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                       </>
                   ) : (
                    `Upgrade to ${selectedPlan === 'pro' ? 'Pro' : 'Premium+'} - ${selectedPlan === 'pro' ? '$7.99/mo' : '$12.99/mo'}`
                   )}
                </button>
                <button 
                    onClick={!isProcessing ? onClose : undefined}
                    disabled={isProcessing}
                    className="w-full mt-3 py-2 text-sm text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark disabled:opacity-50 transition-colors rounded-md active:bg-gray-100 dark:active:bg-gray-800"
                >
                    Maybe Later
                </button>
            </div>
        </div>
    );
};

export default PremiumModal;