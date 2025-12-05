import { useState, useEffect, useRef } from 'react';  // Agregado: useRef para las refs
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import UserNavbar from "../Navbar/UserNavbar";
import './CSS/user.css'
import UserCard from './Components/UserCard/userCard'
import UpcomingElections from './Components/UpcomingElections';
import ScrollReveal from "scrollreveal";
import { BASE_URL } from '../../helper';
import Cookies from 'js-cookie';

const User = () => {
  const location = useLocation();
  const [singleVoter, setVoter] = useState({});  // Inicializamos vacío para evitar crashes
  const [isLoading, setIsLoading] = useState(true);  // Nuevo: Para manejar loading mientras fetch o mock

  const voterid = Cookies.get('myCookie');  // Mantengo para compatibilidad

  // Refs para ScrollReveal (sin cambios)
  const revealRefBottom = useRef(null);
  const revealRefLeft = useRef(null);  
  const revealRefTop = useRef(null);
  const revealRefRight = useRef(null);

  // Función setCookie unificada (ahora maneja ambos tipos)
  const setCookie = (id, userData) => {
    Cookies.set('myCookie', id, { expires: 7 });  // Set cookie con ID (voterst.id o walletAddress)
    // Opcional: Guarda full user en otra cookie si querés persistir más data
    Cookies.set('userData', JSON.stringify(userData), { expires: 7 });
  };

  // useEffect para inicializar user data y cookie (nuevo: maneja ambos logins)
  useEffect(() => {
    const state = location.state || {};  // Movido adentro para evitar warning de deps
    let userData = {};

    if (state.voterst) {
      // Login tradicional: usa voterst
      userData = state.voterst;
      if (!voterid) {  // Solo setea cookie si no existe
        setCookie(userData.id, userData);
      }
      // Fetch real del backend (como original)
      axios.get(`${BASE_URL}/getVoterbyID/${userData.id}`)
        .then((response) => {
          console.log(response.data);
          setVoter(response.data.voter || userData);  // Usa fetch o fallback a state
          setIsLoading(false);
        })
        .catch(error => {
          console.error('Error fetching user data:', error);
          setVoter(userData);  // Fallback si fetch falla
          setIsLoading(false);
        });
    } else if (state.walletAddress) {
      // Login wallet: mockea estructura para compatibilidad (no fetch, ya que no hay voter ID real)
      userData = {
        id: state.walletAddress,  // Address como ID único
        firstName: 'Wallet',      // Mock: Puedes personalizar o agregar input futuro
        lastName: 'User',
        email: 'wallet@web3.dapp',
        walletAddress: state.walletAddress,
        voteStatus: false,        // Mock para UpcomingElections
        // Agrega más fields si UserCard/UpcomingElections los esperan (e.g., age, address)
      };
      if (!voterid) {
        setCookie(userData.id, userData);
      }
      setVoter(userData);  // Set directo, sin fetch
      setIsLoading(false);
      console.log('Web3 User loaded:', userData);
    } else {
      // No hay state: redirige o error (ej: a login)
      console.error('No user data found in state');
      setIsLoading(false);
      // Opcional: navigate('/login') si importás useNavigate
      return;
    }

    // Si ya hay cookie de sesión previa, carga desde ahí (opcional)
    const savedData = Cookies.get('userData');
    if (savedData && !state.voterst && !state.walletAddress) {
      setVoter(JSON.parse(savedData));
      setIsLoading(false);
    }
  }, [location.state, voterid]);  // Fix deps: Usa location.state directo (stable), no 'state' derivado

  // useEffects para ScrollReveal (sin cambios, pero movidos al final para claridad)
  useEffect(() => {
    if (revealRefBottom.current) {
      ScrollReveal().reveal(revealRefBottom.current, {
        duration: 1000,
        delay: 200,
        distance: '50px',
        origin: 'bottom',
        easing: 'ease',
        reset: 'true',
      });
    }
  }, []);
  
  useEffect(() => {
    if (revealRefRight.current) {
      ScrollReveal().reveal(revealRefRight.current, {
        duration: 1000,
        delay: 200,
        distance: '50px',
        origin: 'right',
        easing: 'ease',
        reset: 'true',
      });
    }
  }, []);
  
  useEffect(() => {
    if (revealRefLeft.current) {
      ScrollReveal().reveal(revealRefLeft.current, {
        duration: 1000,
        delay: 200,
        distance: '50px',
        origin: 'left',
        easing: 'ease',
        reset: 'true',
      });
    }
  }, []);
  
  useEffect(() => {
    if (revealRefTop.current) {
      ScrollReveal().reveal(revealRefTop.current, {
        duration: 1000,
        delay: 200,
        distance: '50px',
        origin: 'top',
        easing: 'ease',
        reset: 'true',
      });
    }
  }, []);

  // Si loading, muestra spinner (nuevo: evita crashes)
  if (isLoading) {
    return <div className="User">Cargando dashboard...</div>;
  }

  return (
    <div className="User">
      <UserNavbar />
      <div className="Heading2" ref={revealRefTop}>
        <h3>Welcome <span>{singleVoter.firstName}</span></h3>
        {singleVoter.walletAddress && (
          <p style={{ fontSize: '14px', color: '#007bff' }}>Connected Wallet: {singleVoter.walletAddress.slice(0, 6)}...{singleVoter.walletAddress.slice(-4)}</p>
        )}  {/* Nuevo: Muestra wallet si es Web3 */}
      </div>
      <div className="userPage">
        <div className="userDetails" ref={revealRefLeft}>
          <UserCard voter={singleVoter} />
        </div>
        <div className="details" ref={revealRefRight}>
          <h2>Welcome to <span>Online Voting Platform</span></h2>
          <h6>Exercise Your Right to Vote Anytime, Anywhere</h6>
          <p>Welcome to our online voting platform, where your voice matters. With the convenience of modern technology, we bring democracy to your fingertips, enabling you to participate in important decisions and elections from the comfort of your own home. Our secure and user-friendly platform ensures that your vote is counted accurately and confidentially. Whether it's electing your local representatives, deciding on community initiatives, or participating in organizational polls, our platform empowers you to make a difference.</p>
        </div>
      </div>
      <UpcomingElections voteStatus={singleVoter.voteStatus} />
    </div>
  );
};

export default User;