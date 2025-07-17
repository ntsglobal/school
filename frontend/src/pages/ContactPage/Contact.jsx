import React, { useState } from "react";

function Contact() {
  const latitude = 13.0827;
  const longitude = 80.2707;
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

  const faqs = [
    {
      question: "How do I enroll in a language course?",
      answer: "Sign up and choose your preferred language level."
    },
    {
      question: "What are the system requirements for the platform?",
      answer: "Modern browser and a stable internet connection."
    },
    {
      question: "How long are the language sessions?",
      answer: "Each session lasts 30–45 minutes based on your plan."
    }
  ];

  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-white">
      {/* Header */}
      <section className="text-center py-12 bg-gradient-to-b from-[#A7F3D0] to-[#FFFFFF]">
        <h1 className="text-3xl font-bold mb-2">We’re Here to Help</h1>
        <p className="text-gray-600 max-w-xl mx-auto">
          Get in touch with our support team for any questions about our language-based services.
        </p>
      </section>

      {/* Support Cards */}
      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            title: "General Inquiries",
            icon: "/images/icons/email.png",
            desc: "care@ntsnihon.com for general help and services."
          },
          {
            title: "Technical Support",
            icon: "/images/icons/support.png",
            desc: "Reach our tech support team via care@ntsnihon.com."
          },
          {
            title: "Academic Counseling",
            icon: "/images/icons/book.png",
            desc: "Connect with our academic advisors at care@ntsnihon.com."
          }
        ].map((item, idx) => (
          <div
            key={idx}
            className="bg-white border p-6 rounded-lg shadow-sm hover:border-green-500 hover:shadow-md transition duration-300"
          >
            <img src={item.icon} alt="icon" className="w-10 h-10 mb-3" />
            <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
            <p className="text-sm text-gray-600">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Contact Form */}
      <div className="max-w-xl mx-auto my-12 bg-white p-8 rounded-lg border shadow">
        <h2 className="text-xl font-semibold mb-6">Send us a Message</h2>
        <form className="space-y-4">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Full Name"
              className="w-1/2 border px-4 py-2 rounded"
              required
            />
            <input
              type="email"
              placeholder="Email Address"
              className="w-1/2 border px-4 py-2 rounded"
              required
            />
          </div>
          <input
            type="text"
            placeholder="Phone Number"
            className="w-full border px-4 py-2 rounded"
          />
          <input
            type="text"
            placeholder="Subject"
            className="w-full border px-4 py-2 rounded"
          />
          <textarea
            placeholder="Message"
            className="w-full border px-4 py-2 rounded h-32"
          ></textarea>
          <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
            Send Message
          </button>
        </form>
      </div>

      {/* FAQ */}
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h2 className="text-xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
        <ul className="space-y-4">
          {faqs.map((faq, index) => (
            <li
              key={index}
              className="border rounded p-4 cursor-pointer hover:border-green-500 hover:shadow-md transition duration-300"
              onClick={() => toggleFAQ(index)}
            >
              <div className="flex items-center justify-between">
                <strong>{faq.question}</strong>
                <img
                  src="/images/icons/chevron-down.png"
                  alt="toggle"
                  className={`w-4 h-4 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}
                />
              </div>
              {openIndex === index && (
                <p className="text-sm text-gray-600 mt-2">{faq.answer}</p>
              )}
            </li>
          ))}
        </ul>
        <div className="text-center mt-4">
          <a href="#" className="text-blue-600 text-sm">View all FAQs</a>
        </div>
      </div>

      {/* Additional Resources */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 px-4 py-10">
        {[
          {
            title: "Help Center",
            icon: "/images/icons/help.png",
            desc: "Browse our comprehensive help guides."
          },
          {
            title: "Live Chat",
            icon: "/images/icons/chat.png",
            desc: "Chat with our support team in real-time."
          },
          {
            title: "Knowledge Base",
            icon: "/images/icons/knowledge.png",
            desc: "Answers to detailed documentation."
          }
        ].map((item, i) => (
          <div
            key={i}
            className="bg-white p-6 border rounded-lg shadow-sm hover:border-green-500 hover:shadow-md transition duration-300"
          >
            <img src={item.icon} alt="icon" className="w-10 h-10 mb-3" />
            <h3 className="font-semibold mb-1">{item.title}</h3>
            <p className="text-sm text-gray-600">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Office Map & Info */}
      <div className="bg-gray-50 py-10 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6 items-center">
          <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
            <iframe
              title="Google Map"
              width="100%"
              height="300"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              src={`https://maps.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`}
              className="rounded-md border"
            ></iframe>
          </a>
          <div>
            <h3 className="text-xl font-semibold mb-2">Visit Our Office</h3>
            <p className="text-gray-600 mb-2">Headquarters</p>
            <p className="text-sm text-gray-700 mb-4">
              NTS Green School, Delhi - 600001
            </p>
            <p className="text-gray-600 mb-1">Working Hours:</p>
            <p className="text-sm text-gray-700 mb-4">Mon - Fri: 9:00 AM to 6:00 PM</p>
            <p className="text-sm text-gray-700">Phone: +91 98765 43210</p>
            <p className="text-sm text-gray-700">Email: care@ntsnihon.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
