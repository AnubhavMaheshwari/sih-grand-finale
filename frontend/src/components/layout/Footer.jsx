// src/components/Footer.jsx
import footerLogos from '../../assets/images/footer_logos.png';

function Footer() {
  return (
    <footer className="text-center text-xs text-gray-400 mt-16 pt-6 pb-6 border-t border-gray-200 bg-white w-full">
      <div className="flex justify-center mb-4">
        <img src={footerLogos} alt="Partner Logos" className="h-32 object-contain" />
      </div>
      2025 SARTHI National Portal, all rights reserved
    </footer>
  );
}

export default Footer;