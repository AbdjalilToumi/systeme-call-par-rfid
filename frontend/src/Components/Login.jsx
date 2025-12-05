import React, { useState, useContext } from 'react'
import { FectchLogin } from './API';
import { ThemeContext } from './ThemeContext'; 

const Login = ({ onLogin }) => {
    const { theme } = useContext(ThemeContext); 
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    

    // Handlers functions:

    const handleSubmit = async (event) => {
        event.preventDefault(); 
        setError('');

        const regEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email || !password) {
            setError('Veuillez remplir tous les champs.');
            return;
        }
        if(!regEmail.test(email)){
            setError("Veuillez entrer une adresse email valide.");
            return;
        }

        try {
            const response = await FectchLogin(email, password);
            
            if(!response.status){
                setError(response.error || "Email ou mot de passe incorrect.");
            }
            else{
               onLogin({isLogin: true, email: email});
            }
        } catch (err) {
            console.error("Erreur lors de la tentative de connexion:", err);
            setError("Une erreur de communication avec le serveur est survenue.");
        }
    }

  return (
    <div className={`flex items-center justify-center min-h-screen p-4 ${theme !== 'dark' ? 'bg-gray-100' : 'bg-gray-900'} transition-all duration-150`}>

        <div className={`w-full max-w-sm p-8 rounded-xl shadow-2xl border ${theme !== 'dark' ? 'bg-white border-gray-100' : 'bg-gray-800 border-gray-700'}`}>
            <h1 className={`text-3xl font-semibold mb-2 ${theme !== 'dark' ? 'text-gray-800' : 'text-white'}`}>Se Connecter</h1>
            <p className={`mb-6 ${theme !== 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Connectez-vous pour contrôler les pointages</p>
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4" role="alert">
                    <span className="block sm:inline">{error}</span>
                </div>
            )}
            <form onSubmit={(e) => handleSubmit(e)} className="space-y-6">
                <div>
                    <label 
                        htmlFor="Email" 
                        className={`block text-sm font-medium mb-1 ${theme !== 'dark' ? 'text-gray-700' : 'text-gray-300'}`}
                    >
                        Email 
                    </label>
                    <input 
                        type="text" 
                        id="Email"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out ${theme !== 'dark' ? 'bg-white border-gray-300 text-gray-900' : 'bg-gray-700 border-gray-600 text-white'}`} 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Entrez votre email "
                    />
                </div>
            
                <div>
                    <label 
                        htmlFor="Password" 
                        className={`block text-sm font-medium mb-1 ${theme !== 'dark' ? 'text-gray-700' : 'text-gray-300'}`}
                    >
                        Mot de Passe
                    </label>
                    <input 
                        type="password" 
                        id="Password"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out ${theme !== 'dark' ? 'bg-white border-gray-300 text-gray-900' : 'bg-gray-700 border-gray-600 text-white'}`} 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out"
                >
                    Connexion
                </button>
            </form>
            
            {/* Optionnel: Lien d'aide */}
            {/* <div className="mt-4 text-center">
                <a href="#" className="text-sm text-blue-600 hover:text-blue-700">
                    Mot de passe oublié?
                </a>
            </div> */}
        </div>
    </div>
  )
}

export default Login