import { Link } from 'react-router-dom';
import '../App.css';

function About() {
  return (
    <>
      <header className="site-header about-header">
        <div className="container header-inner">
          <div className="nav-left">
            <Link to="/" className="nav-home-link">Home</Link>
            <Link to="/about" className="nav-link active">About</Link>
            <Link to="/search" className="nav-link">Search</Link>
          </div>
          <div className="nav-right">
            <span className="logo">Movie Search Demo</span>
          </div>
        </div>
      </header>

      <main className="container about-page">
        <section className="about-content">
          <div className="about-logo-wrapper">
            <img
              src="/lfp-logo.png"
              alt="Movie Search Demo logo"
              className="about-logo"
            />
          </div>
          <div className="about-text">
            <h2 className="about-title">Project Summary: React Movie Search Application</h2>
            <p>
              This project is a dynamic and responsive single-page application (SPA) that allows users to search for movies using the OMDb API. It demonstrates a strong understanding of modern front-end development principles and showcases the ability to build a feature-rich, user-friendly interface with React.
            </p>
            <h3 style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>Key Technical Skills & Features Demonstrated:</h3>
            <ul style={{ listStylePosition: 'outside', paddingLeft: '20px' }}>
              <li style={{ marginBottom: '0.75rem' }}><strong>React & Core Concepts</strong>: The application is built entirely with <strong>React</strong>, using functional components and a comprehensive set of <strong>React Hooks</strong> (<code>useState</code>, <code>useEffect</code>, <code>useMemo</code>, <code>useRef</code>) for efficient and declarative state management, handling side effects, and optimizing performance.</li>
              <li style={{ marginBottom: '0.75rem' }}><strong>API Integration</strong>: It successfully integrates with the external <strong>OMDb API</strong> to asynchronously fetch movie data. The implementation includes handling loading states, managing API responses, and gracefully displaying errors, such as when an API key is missing.</li>
              <li style={{ marginBottom: '0.75rem' }}><strong>Client-Side Routing</strong>: The project uses <strong>React Router</strong> to enable seamless navigation between different views (Home, About, and Search), providing a true single-page application experience.</li>
              <li style={{ marginBottom: '0.75rem' }}><strong>Advanced UI/UX Features</strong>:
                <ul style={{ listStyleType: 'circle', paddingLeft: '20px', marginTop: '0.5rem' }}>
                  <li style={{ marginBottom: '0.5rem' }}><strong>Debounced Search</strong>: The search input is debounced to prevent excessive API calls while the user is typing, improving performance and user experience.</li>
                  <li style={{ marginBottom: '0.5rem' }}><strong>Dynamic Filtering</strong>: Users can filter search results on the client side by year range and minimum IMDb rating.</li>
                  <li style={{ marginBottom: '0.5rem' }}><strong>Modal Dialogs</strong>: Movie details are presented in a modal window, allowing users to view more information without losing their search context.</li>
                </ul>
              </li>
              <li style={{ marginBottom: '0.75rem' }}><strong>Modern JavaScript (ES6+)</strong>: The codebase is written in clean, modern JavaScript, utilizing features like <code>async/await</code> for handling asynchronous operations.</li>
              <li style={{ marginBottom: '0.75rem' }}><strong>Build Tools & Environment</strong>: The project is configured with <strong>Vite</strong>, a next-generation front-end tooling system, demonstrating familiarity with the modern JavaScript development ecosystem. It also correctly uses environment variables to protect sensitive data like API keys, which is a security best practice.</li>
            </ul>
            <p style={{ marginTop: '1.5rem' }}>
              In summary, this project is a practical demonstration of the ability to build, from the ground up, a complete React application that consumes a REST API and implements common, real-world features.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}

export default About;
