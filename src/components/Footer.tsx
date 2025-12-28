import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="border-t mt-12 py-6 bg-card">
      <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
        <p>
          © 2024 All Rights Reserved By{' '}
          <a 
            href="https://error-404-42e6b.web.app/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium"
          >
            Developer
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;

