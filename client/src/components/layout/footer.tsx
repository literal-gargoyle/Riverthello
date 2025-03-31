import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-[#1A237E] text-white py-4 mt-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <span className="text-2xl mr-2">🌊</span>
            <h2 className="font-poppins font-bold text-lg">Riverthello</h2>
          </div>
          
          <nav className="flex flex-wrap mb-4 md:mb-0">
            <Link href="/how-to-play" className="mr-6 mb-2 text-sm text-gray-200 hover:text-white transition duration-150">
              Rules & How to Play
            </Link>
            <a href="#" className="mr-6 mb-2 text-sm text-gray-200 hover:text-white transition duration-150">
              Community
            </a>
            <a href="#" className="mr-6 mb-2 text-sm text-gray-200 hover:text-white transition duration-150">
              Tournaments
            </a>
            <a href="#" className="text-sm text-gray-200 hover:text-white transition duration-150">
              Support
            </a>
          </nav>
          
          <div className="flex space-x-4">
            <a href="#" className="text-gray-200 hover:text-white transition duration-150">
              <i className="ri-discord-fill text-xl"></i>
            </a>
            <a href="#" className="text-gray-200 hover:text-white transition duration-150">
              <i className="ri-twitter-fill text-xl"></i>
            </a>
            <a href="#" className="text-gray-200 hover:text-white transition duration-150">
              <i className="ri-facebook-circle-fill text-xl"></i>
            </a>
            <a href="#" className="text-gray-200 hover:text-white transition duration-150">
              <i className="ri-github-fill text-xl"></i>
            </a>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-700 text-sm text-gray-300 flex flex-col md:flex-row md:justify-between">
          <p>© {new Date().getFullYear()} Riverthello. All rights reserved.</p>
          <div className="mt-2 md:mt-0 flex flex-wrap">
            <a href="#" className="mr-4 hover:text-white transition duration-150">Privacy Policy</a>
            <a href="#" className="mr-4 hover:text-white transition duration-150">Terms of Service</a>
            <a href="#" className="hover:text-white transition duration-150">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
