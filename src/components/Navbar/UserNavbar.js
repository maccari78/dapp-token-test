import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';  // Si no está, agregalo para links
import Cookies from 'js-cookie';  // Ya está
import axios from 'axios';  // Ya está
import { useNavigate } from 'react-router-dom';  // NUEVO: Para navigate limpio

function UserNavbar() {
  const navigate = useNavigate();  // NUEVO: Hook para redirigir

  const handleLogout = async (e) => {
    e.preventDefault();  // NUEVO: Evita navegación por href si aplica

    // Limpia cookies tradicionales
    Cookies.remove('myCookie');
    Cookies.remove('userData');  // NUEVO: Limpia la user full que agregamos

    // Limpia localStorage para Web3
    localStorage.removeItem('walletAddress');

    // Llama al backend para logout (cambia a GET, como en routes)
    try {
      await axios.get('/logout');  // CAMBIO: GET en lugar de POST para match backend
      console.log('Backend logout exitoso');
    } catch (err) {
      console.error('Error en backend logout:', err);  // Ignora si falla (e.g., CORS)
    }

    // Opcional: Desconecta MetaMask
    if (window.ethereum) {
      try {
        await window.ethereum.request({
          method: 'wallet_revokePermissions',
        });
        console.log('MetaMask desconectado');
      } catch (err) {
        console.error('Error desconectando MetaMask:', err);
      }
    }

    // Redirige a login
    navigate('/login');  // O '/SignIn' si es la ruta exacta en tu router
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand href="/User">Online Voting System</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link className="Nav-items" href="/Home">Home</Nav.Link>
            {/* Agrega más links si hay */}
          </Nav>
          <Nav>
            <Nav.Link className="Nav-items" href="/Edit">Edit Profile</Nav.Link>
            {/* CAMBIO: Removí href del Nav.Link, solo onClick en Button para evitar doble nav */}
            <Nav.Link className="Nav-items">
              <Button onClick={handleLogout} variant="outline-light">Logout</Button>
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default UserNavbar;