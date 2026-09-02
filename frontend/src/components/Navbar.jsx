import { NavLink } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
    return (
        <header className="navbar">
            <div className="navbar-left">
                <span className="logo">🌾</span>
                <h1>AgriRover</h1>
            </div>
            <nav className="navbar-links">
                <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                    Map Tracking
                </NavLink>
            </nav>
        </header>
    );
}

export default Navbar;
