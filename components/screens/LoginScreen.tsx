import React from 'react';

interface LoginScreenProps {
    onLogin: () => void;
}

const GoogleIcon = () => (
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-6 h-6 mr-3">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.82l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
        <path fill="none" d="M0 0h48v48H0z"></path>
    </svg>
);

const AppleIcon = ({ className }: { className?: string }) => (
    <svg className={`w-6 h-6 mr-2 ${className}`} viewBox="0 0 24 24" fill="currentColor">
       <path d="M19.043 14.161c-.022 2.376-1.996 4.305-4.363 4.305-1.14 0-1.956-.638-2.956-.638s-1.838.638-2.956.638c-2.388 0-4.363-1.929-4.363-4.305 0-2.422 2.065-4.48 4.606-4.48 1.162 0 2.044.66 3.022.66s1.882-.66 3.044-.66c2.564 0 4.587 2.058 4.606 4.48zM14.931 7.21c.963-1.12 1.544-2.638 1.344-4.22h-2.662c-.756.022-1.556.398-2.112.982-.844.864-1.688 2.278-1.466 3.82.062 1.62 1.162 2.958 2.25 2.958.462 0 .925-.198 1.55-.574.625-.376 1.07-.916 1.096-1.946z"/>
    </svg>
);


const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <div className="mb-8">
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
            
            <div className="w-full max-w-xs space-y-4 animate-fade-in" style={{ animationDelay: '600ms' }}>
                <button 
                    onClick={onLogin} 
                    className="w-full py-3 px-4 bg-white dark:bg-gray-200 text-gray-800 font-semibold rounded-lg shadow-md border border-gray-200 dark:border-transparent hover:bg-gray-100 dark:hover:bg-white transition-all duration-200 transform hover:scale-105 flex items-center justify-center"
                >
                    <GoogleIcon />
                    Continue with Google
                </button>
                <button 
                    onClick={onLogin} 
                    className="w-full py-3 px-4 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-lg shadow-md hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-200 transform hover:scale-105 flex items-center justify-center"
                >
                    <AppleIcon className="text-white dark:text-black" />
                    Continue with Apple
                </button>
            </div>

            <footer className="absolute bottom-4 text-xs text-text-secondary-light dark:text-text-secondary-dark animate-fade-in" style={{ animationDelay: '750ms' }}>
                <p>By continuing, you agree to our Privacy Policy.</p>
            </footer>
        </div>
    );
};

export default LoginScreen;