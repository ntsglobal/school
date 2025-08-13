import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, hasRole } = useAuth();
  const isMinimal = ["/login", "/signup", "/forgot-password"].includes(location.pathname);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Define navigation items based on authentication and role
  const getNavigationItems = () => {
    const baseItems = [
      { label: "Home", path: "/" },
      { label: "Courses", path: "/courses" },
      { label: "About", path: "/about" },
      { label: "Contact", path: "/contact" }
    ];

    if (isAuthenticated) {
      const authenticatedItems = [
        { label: "Live Classes", path: "/live-classes" },
        { label: "Community", path: "/community" },
        { label: "Premium", path: "/premium" }
      ];

      // Add role-specific navigation
      if (hasRole('student')) {
        authenticatedItems.push({ label: "Dashboard", path: "/student-dashboard" });
      } else if (hasRole('teacher')) {
        authenticatedItems.push({ label: "Dashboard", path: "/teacher-dashboard" });
      } else if (hasRole('admin')) {
        authenticatedItems.push({ label: "Dashboard", path: "/admin-dashboard" });
      } else if (hasRole('parent')) {
        authenticatedItems.push({ label: "Portal", path: "/parent-portal" });
      }

      return [...baseItems, ...authenticatedItems];
    }

    return baseItems;
  };

  return (
    <nav className="flex justify-between items-center px-6 py-4 bg-white shadow-md">
      {/* Logo and Title - Always Shown */}
      <div className="flex items-center gap-2">
        <img src="/images/NTS_Green_School.png" alt="NTS School Logo" className="h-10" />
        <span className="font-bold text-lg text-[#2F855A]">NTS Green School</span>
      </div>

      {/* Main Navigation - Hidden on login/signup */}
      {!isMinimal && (
        <>
          <div className="hidden md:flex gap-6 text-gray-700 font-medium">
            {getNavigationItems().map(({ label, path }) => (
              <NavLink
                key={label}
                to={path}
                className={({ isActive }) =>
                  isActive ? "text-[#2F855A] font-semibold" : "hover:text-[#2F855A]"
                }
              >
                {label}
              </NavLink>
            ))}
          </div>

          {/* Auth Buttons or User Menu */}
          <div className="flex gap-3 items-center">
            {isAuthenticated ? (
              // Authenticated User Menu
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">
                  Welcome, <span className="font-medium capitalize">{user?.firstName}</span>
                  <span className="text-xs text-gray-500 ml-1">({user?.role})</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="border border-red-500 text-red-500 px-4 py-1 rounded-md font-semibold hover:bg-red-50 transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              // Guest User Buttons
              <>
                <Link to="/login">
                  <button className="border border-[#2F855A] text-[#2F855A] px-4 py-1 rounded-md font-semibold hover:bg-green-50 transition">
                    Login
                  </button>
                </Link>
                <Link to="/signup">
                  <button className="border border-[#2F855A] bg-[#2F855A] text-white px-4 py-1 rounded-md font-semibold hover:bg-green-600 transition">
                    Get Started
                  </button>
                </Link>
              </>
            )}
          </div>
        </>
      )}
    </nav>
  );
}

export default Navbar;
