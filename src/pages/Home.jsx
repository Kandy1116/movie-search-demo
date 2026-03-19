import { Link } from 'react-router-dom';
import '../App.css';

function Home() {
  return (
    <div className="home-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', textAlign: 'center', padding: '2rem', color: 'white' }}>
      <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem', lineHeight: '1.1' }}>
        Movie Search Demo
      </h1>
      <blockquote style={{ fontSize: '1.25rem', marginBottom: '2rem', maxWidth: '800px', color: '#cbd5e1' }}>
        “Filmmaking is all about appreciating the talents of the people you surround yourself with and knowing you could never have made any of these films by yourself.” — Steven Spielberg
      </blockquote>
      <Link to="/search">
        <button style={{ padding: '1rem 3rem', fontSize: '1.25rem', borderRadius: '9999px', border: 'none', cursor: 'pointer', fontWeight: '600', transition: 'all 0.3s ease' }}>
          ENTER
        </button>
      </Link>
    </div>
  );
}

export default Home;
