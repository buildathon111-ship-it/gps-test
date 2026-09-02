import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
    return (
        <header className="navbar">
            <div className="navbar-left">
                <span className="logo">🌾</span>
                <h1>AgriRover</h1>
            </div>
            <nav className="navbar-links">
                <Link to="/" className="nav-link">
                    ← Back to Dashboard
                </Link>
            </nav>
        </header>
    );
}

export default Navbar;
