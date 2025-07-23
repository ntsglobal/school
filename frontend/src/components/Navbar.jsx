import { NavLink, Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="flex justify-between items-center px-6 py-4 bg-white shadow-md">
      <div className="flex items-center gap-2">
        <img src="/images/NTS_Green_School.png" alt="NTS School Logo" className="h-10" />
        <span className="font-bold text-lg text-gray-800">NTS Green School</span>
      </div>

      {/* MAIN NAV LINKS */}
      <div className="hidden md:flex gap-6 text-gray-700 font-medium">
        {[
          { label: "Home", path: "/" },
          { label: "Courses", path: "/courses" },
          { label: "Buddy Finder", path: "/buddy-finder" },
          { label: "Pricing", path: "/pricing" },
          { label: "About", path: "/about" },
          { label: "Contact", path: "/contact" },
          { label: "Community", path: "/community" }
        ].map(({ label, path }) => (
          <NavLink
            key={label}
            to={path}
            className={({ isActive }) =>
              isActive ? "text-green-600 font-semibold" : "hover:text-green-600"
            }
          >
            {label}
          </NavLink>
        ))}
      </div>

      {/* AUTH BUTTONS */}
      <div className="flex gap-3">
        <Link to="/login">
          <button className="border border-green-700 text-green-700 px-4 py-1 rounded-md font-semibold hover:bg-green-50 transition">
            Login
          </button>
        </Link>
        <Link to="/signup">
          <button className="bg-green-700 text-white px-4 py-1 rounded-md font-semibold hover:bg-green-500 transition">
            Get Started
          </button>
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
