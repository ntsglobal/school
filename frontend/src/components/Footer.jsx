import React from "react";

const year = new Date().getFullYear();

function Footer() {
  return (
    <footer className="bg-[#1A2330] text-white text-sm">
      <div className="max-w-7xl mx-auto px-6 pt-12 pb-6">
        <div className="flex flex-col lg:flex-row justify-between gap-10">
          {/* Left Section: Logo and Description */}
          <div className="w-full lg:w-1/4">
            <div className="flex items-center gap-2 mb-3">
              <img src="/images/NTS_Green_School.png" alt="Logo" className="w-6 h-6" />
              <h3 className="text-lg font-semibold">NTS Green School</h3>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Making language learning accessible and enjoyable for everyone.
            </p>
          </div>

          {/* Right Section: Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 flex-grow">
            {/* Product */}
            <div>
              <h4 className="font-semibold mb-2">Product</h4>
              <ul className="space-y-1 text-gray-300">
                <li><a href="#">Features</a></li>
                <li><a href="#">Languages</a></li>
                <li><a href="#">Pricing</a></li>
                <li><a href="#">Updates</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold mb-2">Company</h4>
              <ul className="space-y-1 text-gray-300">
                <li><a href="#">About</a></li>
                <li><a href="#">Careers</a></li>
                <li><a href="#">Blog</a></li>
                <li><a href="#">Press</a></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-semibold mb-2">Resources</h4>
              <ul className="space-y-1 text-gray-300">
                <li><a href="#">Help Center</a></li>
                <li><a href="#">Terms</a></li>
                <li><a href="#">Privacy</a></li>
                <li><a href="#">Contact</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-600 mt-10 pt-4 flex flex-col lg:flex-row justify-between items-center text-gray-400">
          <p className="text-sm">© {year} NTS Green School. All rights reserved.</p>
          <div className="flex gap-4 mt-4 lg:mt-0">
            <a href="#"><i className="fab fa-facebook-f hover:text-white"></i></a>
            <a href="#"><i className="fab fa-twitter hover:text-white"></i></a>
            <a href="#"><i className="fab fa-instagram hover:text-white"></i></a>
            <a href="#"><i className="fab fa-linkedin-in hover:text-white"></i></a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
