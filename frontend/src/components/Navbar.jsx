import { NavLink, Link, useLocation } from 'react-router-dom';

function Navbar() {
  const location = useLocation();
  const isMinimal = ["/login", "/signup"].includes(location.pathname);

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
            {[
              { label: "Home", path: "/" },
              { label: "Courses", path: "/courses" },
              { label: "Pricing", path: "/pricing" },
              { label: "About", path: "/about" },
              { label: "Contact", path: "/contact" },
              { label: "Community", path: "/community" }
            ].map(({ label, path }) => (
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

          {/* Auth Buttons */}
          <div className="flex gap-3">
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
          </div>
        </>
      )}
    </nav>
  );
}

export default Navbar;
