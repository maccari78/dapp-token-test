import "./SignUtils/CSS/Sign.css"
import "./SignUtils/CSS/style.css.map"
import "./SignUtils/fonts/material-icon/css/material-design-iconic-font.min.css"
import signinimage from "./SignUtils/images/signin-image.jpg"
import { useState, useEffect } from 'react';  // useEffect ya está
import { Link } from 'react-router-dom';
import Nav_bar from "../Navbar/Navbar";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from "../../helper";
import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';

const Login = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [walletAddress, setWalletAddress] = useState('');
    const [walletLoading, setWalletLoading] = useState(false);

    const loginSuccess = (message = "Login Success") => toast.success(message, {
        className: "toast-message",
    });
    const loginFailed = (message = "Invalid Details or User Doesn't exist") => toast.error(message, {
        className: "toast-message",
    });

    // Login tradicional (con mock, sin cambios)
    const handleLogin = async () => {
        setLoading(true);
        if (username === 'user@gmail.com' && password === '123') {
            const mockVoter = { id: 1, name: 'Test User', email: username };
            loginSuccess('Login exitoso (mock)');
            setTimeout(() => {
                navigate('/User', { state: { voterst: mockVoter } });
            }, 2000);
        } else {
            loginFailed('Credenciales inválidas');
        }
        setLoading(false);
    };

    // Connect Wallet (sin el setTimeout ahora — lo maneja useEffect)
    const connectWallet = async () => {
        setWalletLoading(true);
        try {
            const provider = await detectEthereumProvider();
            if (!provider) {
                loginFailed('Por favor, instala MetaMask!');
                return;
            }

            const accounts = await provider.request({ method: 'eth_requestAccounts' });
            const web3Provider = new ethers.BrowserProvider(provider);
            const signer = await web3Provider.getSigner();
            const address = await signer.getAddress();

            setWalletAddress(address);
            setWalletLoading(false);
            
            loginSuccess(`Wallet conectada: ${address.slice(0, 6)}...${address.slice(-4)}`);
            
            localStorage.setItem('walletAddress', address);
            
            console.log('Wallet conectada:', address);
        } catch (err) {
            setWalletLoading(false);
            loginFailed('Error al conectar wallet: ' + err.message);
            console.error('Wallet connect failed:', err);
        }
    };

    // useEffect: Auto-conecta si ya guardada (sin cambios)
    useEffect(() => {
        const savedAddress = localStorage.getItem('walletAddress');
        if (savedAddress && walletAddress === '') {
            setWalletAddress(savedAddress);
            loginSuccess('Wallet ya conectada previamente');
        }
    }, [walletAddress]);

    // NUEVO useEffect: Redirect automático cuando walletAddress se setee
    useEffect(() => {
        if (walletAddress) {
            // Espera un poquito para que el toast se vea, luego redirige
            const timer = setTimeout(() => {
                navigate('/User', { state: { walletAddress: walletAddress } });
            }, 2000);  // Mismo delay que el toast

            // Cleanup: Cancela si desmonta
            return () => clearTimeout(timer);
        }
    }, [walletAddress, navigate]);  // Deps: Vigila walletAddress, y navigate es stable

    return (
        <div>
            <Nav_bar />
            <section className="sign-in">
                <div className="container">
                <p>Use user@gmail.com as email and 123 as password (o conecta tu wallet para login Web3)</p>

                    <div className="signin-content">
                    
                        <div className="signin-image">
                            <figure><img src={signinimage} alt="sing up image" /></figure>
                            <Link to="/Signup" className="signup-image-link">Create an account</Link>
                        </div>

                        <div className="signin-form">
                            <h2 className="form-title">Sign In</h2>
                            <ToastContainer />
                            
                            {/* Login Tradicional */}
                            <div className="form-group">
                                <label htmlFor="email"><i className="zmdi zmdi-account material-icons-name"></i></label>
                                <input 
                                    type="email" 
                                    name="email" 
                                    id="email" 
                                    placeholder="Enter Email" 
                                    onChange={(e) => setUsername(e.target.value)} 
                                    value={username}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="pass"><i className="zmdi zmdi-lock"></i></label>
                                <input 
                                    type="password" 
                                    name="pass" 
                                    id="pass" 
                                    placeholder="Password" 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    value={password}
                                />
                            </div>
                            <div className="form-group form-button">
                                <button onClick={handleLogin} disabled={loading}>
                                    {loading ? <div className="spinner"></div> : 'Login Tradicional'}
                                </button>
                            </div>

                            {/* Wallet Login */}
                            <div style={{ marginTop: '20px', padding: '10px', borderTop: '1px solid #ddd' }}>
                                <h3>Ó Login con Wallet (Web3)</h3>
                                {walletAddress ? (
                                    <p style={{ color: 'green' }}>Conectado: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</p>
                                ) : (
                                    <button 
                                        onClick={connectWallet} 
                                        disabled={walletLoading}
                                        style={{ 
                                            padding: '10px 20px', 
                                            background: '#007bff', 
                                            color: 'white', 
                                            border: 'none', 
                                            borderRadius: '5px',
                                            width: '100%'
                                        }}
                                    >
                                        {walletLoading ? 'Conectando...' : 'Connect MetaMask'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
export default Login;