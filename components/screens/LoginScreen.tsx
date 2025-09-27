import React, { useEffect } from 'react';
import { User } from '../../types';

declare global {
    interface Window {
        google: any;
    }
}

// Simple JWT decoder to extract user profile info from Google's credential response.
// Note: In a production app, the token should be sent to a backend server for verification.
function jwt_decode(token: string): any {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Failed to decode JWT", e);
        return null;
    }
}


interface LoginScreenProps {
    onLogin: (user: User) => void;
}

const AppleIcon = ({ className }: { className?: string }) => (
    <svg className={`w-6 h-6 mr-2 ${className}`} viewBox="0 0 24 24" fill="currentColor">
       <path d="M19.043 14.161c-.022 2.376-1.996 4.305-4.363 4.305-1.14 0-1.956-.638-2.956-.638s-1.838.638-2.956.638c-2.388 0-4.363-1.929-4.363-4.305 0-2.422 2.065-4.48 4.606-4.48 1.162 0 2.044.66 3.022.66s1.882-.66 3.044-.66c2.564 0 4.587 2.058 4.606 4.48zM14.931 7.21c.963-1.12 1.544-2.638 1.344-4.22h-2.662c-.756.022-1.556.398-2.112.982-.844.864-1.688 2.278-1.466 3.82.062 1.62 1.162 2.958 2.25 2.958.462 0 .925-.198 1.55-.574.625-.376 1.07-.916 1.096-1.946z"/>
    </svg>
);


const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {

    useEffect(() => {
        const handleGoogleLogin = (response: any) => {
            if (!response.credential) {
                console.error("Google Sign-In failed: No credential returned.");
                return;
            }

            const decodedToken = jwt_decode(response.credential);
            if (decodedToken) {
                const user: User = {
                    name: decodedToken.name,
                    email: decodedToken.email,
                    photoURL: decodedToken.picture,
                };
                onLogin(user);
            }
        };

        const googleButtonContainer = document.getElementById("googleSignInButton");

        if (window.google?.accounts?.id && googleButtonContainer) {
            window.google.accounts.id.initialize({
                // IMPORTANT: This is a placeholder. To make Google Sign-In functional, 
                // you must create a project in the Google Cloud Console, configure the
                // OAuth consent screen, and generate your own Client ID.
                // Replace the placeholder below with your actual Client ID.
                // See: https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid
                client_id: '427543445915-k08l4837225mlqgpulso4rg5ji3k2f9a.apps.googleusercontent.com',
                callback: handleGoogleLogin
            });

            window.google.accounts.id.renderButton(
                googleButtonContainer,
                { theme: "outline", size: "large", type: 'standard', text: 'continue_with', width: '318' }
            );
        } else if (googleButtonContainer) {
             // Fallback in case the Google script fails to load
            googleButtonContainer.innerHTML = '<p class="text-xs text-red-500">Google Sign-In failed to load. Please try again later.</p>';
        }
    }, [onLogin]);


    return (
        <div className="flex flex-col h-full text-center p-6 sm:p-8">
            <div className="flex-grow flex flex-col items-center justify-center">
                <div className="mb-10">
                    <div className="inline-block p-4 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full mb-4 shadow-lg animate-fade-in" style={{ animationDelay: '150ms' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 1v4m0 0h-4m4 0l-5-5" />
                        </svg>
                    </div>
                    <h1 className="text-4xl font-bold text-text-primary-light dark:text-text-primary-dark animate-fade-in" style={{ animationDelay: '300ms' }}>
                        Welcome to <span className="text-accent-light dark:text-accent-dark">EchoVerse</span>
                    </h1>
                    <p className="text-text-secondary-light dark:text-text-secondary-dark mt-2 max-w-md mx-auto animate-fade-in" style={{ animationDelay: '450ms' }}>
                        Your personal AI voice journal for self-reflection and mental clarity.
                    </p>
                </div>
                
                <div className="w-full max-w-xs space-y-3 animate-fade-in" style={{ animationDelay: '600ms' }}>
                    {/* This div will be populated by the Google Sign-In button */}
                    <div id="googleSignInButton" className="flex justify-center items-center h-[44px] w-full rounded-lg bg-bkg-light dark:bg-content-dark border border-gray-300 dark:border-gray-600">
                        {/* Loading placeholder to prevent layout shift */}
                        <svg className="animate-spin h-5 w-5 text-text-secondary-light dark:text-text-secondary-dark" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>

                    {/* 
                      Apple Sign-In requires a server-side implementation to handle the callback securely.
                      Without a backend, we can't implement real Apple authentication.
                      For this demo, we will use mock data for the Apple login flow.
                    */}
                    <button 
                        onClick={() => onLogin({ name: 'Casey Smith', email: 'casey.s@example.com', photoURL: 'https://i.pravatar.cc/150?u=casey' })}
                        className="w-full h-[44px] px-4 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-lg shadow-sm hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center"
                    >
                        <AppleIcon className="text-white dark:text-black" />
                        Continue with Apple
                    </button>
                </div>
            </div>

            <footer className="w-full text-center text-xs text-text-secondary-light dark:text-text-secondary-dark animate-fade-in" style={{ animationDelay: '750ms' }}>
                <p>By continuing, you agree to our Privacy Policy.</p>
            </footer>
        </div>
    );
};

export default LoginScreen;