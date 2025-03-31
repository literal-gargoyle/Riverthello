import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getRatingInfo } from "@/lib/utils";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const { user, signOut, isLoading } = useAuth();

  // Close mobile menu when location changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  return (
    <header className="bg-[#1A237E] text-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-2xl mr-2">🌊</span>
            <h1 className="text-xl md:text-2xl font-poppins font-bold">
              <Link href="/">Riverthello</Link>
            </h1>
          </div>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden text-white focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <i className={`ri-${mobileMenuOpen ? 'close-line' : 'menu-line'} text-2xl`}></i>
          </button>
          
          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-white hover:text-[#FFC107] transition duration-150 flex items-center">
              <i className="ri-home-4-line mr-1"></i> Home
            </Link>
            <Link href="/leaderboard" className="text-white hover:text-[#FFC107] transition duration-150 flex items-center">
              <i className="ri-trophy-line mr-1"></i> Leaderboard
            </Link>
            <Link href="/history" className="text-white hover:text-[#FFC107] transition duration-150 flex items-center">
              <i className="ri-history-line mr-1"></i> History
            </Link>
            <Link href="/how-to-play" className="text-white hover:text-[#FFC107] transition duration-150 flex items-center">
              <i className="ri-question-line mr-1"></i> How to Play
            </Link>
          </nav>
          
          {/* User info/login */}
          <div className="hidden md:flex items-center">
            {!isLoading && (
              user ? (
                <div className="flex items-center">
                  <div className="mr-3 text-sm">
                    <div className="font-medium">{user.displayName}</div>
                    <div className="text-xs text-gray-300">Rating: {user.rating}</div>
                  </div>
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    {user.photoURL ? (
                      <Avatar>
                        <AvatarImage src={user.photoURL} alt={user.displayName || 'User'} />
                        <AvatarFallback>{(user.displayName || 'U')[0]}</AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-700">
                        {(user.displayName || 'U')[0]}
                      </div>
                    )}
                  </div>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="ml-4 text-sm px-3 py-1 rounded flex items-center"
                    onClick={signOut}
                  >
                    <i className="ri-logout-box-line mr-1"></i> Logout
                  </Button>
                </div>
              ) : (
                <Link href="/login">
                  <Button className="bg-white text-[#1A237E] hover:bg-gray-100 px-4 py-2 rounded-md font-medium flex items-center">
                    <i className="ri-google-fill mr-2"></i> Sign in with Google
                  </Button>
                </Link>
              )
            )}
          </div>
        </div>
        
        {/* Mobile menu */}
        <div className={`md:hidden bg-[#1A237E] shadow-inner ${mobileMenuOpen ? 'block' : 'hidden'}`}>
          <div className="px-4 py-3 space-y-3">
            <Link href="/" className="block text-white hover:text-[#FFC107] transition duration-150 py-2">
              <i className="ri-home-4-line mr-1"></i> Home
            </Link>
            <Link href="/leaderboard" className="block text-white hover:text-[#FFC107] transition duration-150 py-2">
              <i className="ri-trophy-line mr-1"></i> Leaderboard
            </Link>
            <Link href="/history" className="block text-white hover:text-[#FFC107] transition duration-150 py-2">
              <i className="ri-history-line mr-1"></i> History
            </Link>
            <Link href="/how-to-play" className="block text-white hover:text-[#FFC107] transition duration-150 py-2">
              <i className="ri-question-line mr-1"></i> How to Play
            </Link>
            
            {/* Mobile user info */}
            <div className="border-t border-indigo-900 pt-3 mt-3">
              {!isLoading && (
                user ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                        {user.photoURL ? (
                          <Avatar>
                            <AvatarImage src={user.photoURL} alt={user.displayName || 'User'} />
                            <AvatarFallback>{(user.displayName || 'U')[0]}</AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-700">
                            {(user.displayName || 'U')[0]}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{user.displayName}</div>
                        <div className="text-xs text-gray-300">Rating: {user.rating}</div>
                      </div>
                    </div>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="text-sm px-3 py-1 rounded"
                      onClick={signOut}
                    >
                      <i className="ri-logout-box-line mr-1"></i> Logout
                    </Button>
                  </div>
                ) : (
                  <Link href="/login" className="w-full">
                    <Button className="w-full bg-white text-[#1A237E] hover:bg-gray-100 px-4 py-2 rounded-md font-medium flex items-center justify-center">
                      <i className="ri-google-fill mr-2"></i> Sign in with Google
                    </Button>
                  </Link>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
