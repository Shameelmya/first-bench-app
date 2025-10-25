import React, { useState, useEffect, useRef } from 'react'; // Added useRef

// Define country codes for dropdowns
const countryCodes = [
  { name: 'India', code: '+91' },
  { name: 'UAE', code: '+971' },
  { name: 'Saudi Arabia', code: '+966' },
  { name: 'Qatar', code: '+974' },
  { name: 'Kuwait', code: '+965' },
  { name: 'Bahrain', code: '+973' },
  { name: 'Oman', code: '+968' },
  { name: 'UK', code: '+44' },
  { name: 'US', code: '+1' },
  { name: 'Canada', code: '+1' },
];

// Main App Component
const App = () => {
  // State for form fields
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    phoneCode: '+91',
    phoneNumber: '',
    whatsappCode: '+91',
    whatsappNumber: '',
    email: '',
    place: '',
    district: '',
  });

  // State for UI flow
  const [currentPage, setCurrentPage] = useState('landingPage'); // 'landingPage', 'form', 'paymentOptions'
  const [originalAmount] = useState(999); // Base fee for the course
  const [payableAmount, setPayableAmount] = useState(999);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [showNamePromptModal, setShowNamePromptModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sameAsMobile, setSameAsMobile] = useState(false);
  const [showBankDetails, setShowBankDetails] = useState(false); // State for bank details toggle

  // State for Countdown Timer
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Google Apps Script URL for data submission
  const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx2Q-CVi1SQOwnPfqnkqc4mD7TzRjHZk2W-AlZVd-C-ys_9a6G0yGXppIbOBI80wucU/exec'; // <<< IMPORTANT: REPLACE THIS

  // Helper function to navigate and update hash
  const navigateTo = (page) => {
    setCurrentPage(page);
    window.location.hash = page;
    window.scrollTo(0, 0);
  };

  // Effect to scroll to top and manage browser history
  useEffect(() => {
    // On initial load, set the page based on hash or default
    const hash = window.location.hash.replace('#', '');
    if (hash === 'form' || hash === 'paymentOptions') {
      setCurrentPage(hash);
    } else {
      setCurrentPage('landingPage');
      window.location.hash = 'landingPage';
    }

    // Listen for hash changes (e.g., browser back/forward)
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'form' || hash === 'paymentOptions' || hash === 'landingPage') {
        setCurrentPage(hash);
      } else {
        setCurrentPage('landingPage');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  // Effect for Countdown Timer
  useEffect(() => {
    // Set the target date: November 1, 2025, 10:00 AM IST
    const targetDate = new Date('2025-11-01T10:00:00+05:30');

    const timer = setInterval(() => {
      const now = new Date();
      const difference = targetDate - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        // If the date has passed, stop the timer
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    // Clean up the interval on component unmount
    return () => clearInterval(timer);
  }, []); // Empty dependency array, runs once on mount
  // Removed extra closing brace that was here

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  
  // Handle "Same as Mobile Number" checkbox
  const handleSameAsMobileChange = (e) => {
    const isChecked = e.target.checked;
    setSameAsMobile(isChecked);
    if (isChecked) {
      setFormData((prevData) => ({
        ...prevData,
        whatsappCode: prevData.phoneCode,
        whatsappNumber: prevData.phoneNumber,
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        whatsappCode: '+91',
        whatsappNumber: '',
      }));
    }
  };

  // Effect to update WhatsApp number
  useEffect(() => {
    if (sameAsMobile) {
      setFormData((prevData) => ({
        ...prevData,
        whatsappCode: prevData.phoneCode,
        whatsappNumber: prevData.phoneNumber,
      }));
    }
  }, [formData.phoneCode, formData.phoneNumber, sameAsMobile]);

  // Validate form fields
  const validateForm = () => {
    const { name, age, phoneNumber, whatsappNumber, email } = formData;
    if (!name || !age || !phoneNumber || !whatsappNumber || !email) {
      setModalMessage('Please fill in all mandatory fields (Name, Age, Phone Number, WhatsApp Number, Email ID).');
      setShowModal(true);
      return false;
    }
    if (isNaN(age) || parseInt(age) <= 0) {
      setModalMessage('Please enter a valid age.');
      setShowModal(true);
      return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setModalMessage('Please enter a valid email address.');
      setShowModal(true);
      return false;
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setLoading(true);
      try {
        await fetch(GOOGLE_APPS_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            courseName: 'AI For Smart Teacher Course',
            originalFee: originalAmount,
            payableAmount: payableAmount,
            discountAmount: 0,
            couponApplied: false,
            couponCode: '',
            timestamp: new Date().toLocaleString(),
          }),
        });
        setModalMessage('Your application has been submitted! Please proceed to payment.');
        setShowModal(true);
        navigateTo('paymentOptions');
      } catch (error) {
        console.error('Error submitting form:', error);
        setModalMessage('Failed to submit application. Please try again. Error: ' + error.message);
        setShowModal(true);
      } finally {
        setLoading(false);
      }
    }
  };

  // Function to copy text to clipboard
  const copyToClipboard = (text, message) => {
    const tempInput = document.createElement('textarea');
    tempInput.value = text;
    document.body.appendChild(tempInput);
    tempInput.select();
    try {
      document.execCommand('copy');
      setModalMessage(message || 'Copied to clipboard!');
      setShowModal(true);
    } catch (err) {
      setModalMessage('Failed to copy. Please copy manually.');
      setShowModal(true);
    }
    document.body.removeChild(tempInput);
  };

  // --- Helper function for Google Calendar Link ---
  const getCalendarLink = () => {
    const title = encodeURIComponent('AI For Smart Teacher Course');
    // Format: YYYYMMDDTHHMMSS/YYYYMMDDTHHMMSS (local time)
    const startTime = '20251101T100000';
    const endTime = '20251101T163000';
    const dates = `${startTime}/${endTime}`;
    const location = encodeURIComponent('Alumni Center, Angadippuram, Perinthalmanna');
    
    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&location=${location}&ctz=Asia/Kolkata`;
  };

  // WhatsApp message generation for payment screenshot (now takes a name)
  const getWhatsAppScreenshotMessage = (name) => {
    return `Sir, I'm ${name}, and I'm sending here the screenshot of fee payment for AI For smart teacher Course.`;
  };

  // WhatsApp message generation for general inquiry
  const getWhatsAppInquiryMessage = () => {
    // Updated Salutation
    return `Hello Dot Projects, I'm interested in the AI For Smart Teacher Course and have some questions.`;
  };

  const getWhatsAppLink = (number, message) => {
    return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  };
  
  // Handle submission from the name prompt modal
  const handleNameSubmitForScreenshot = (name) => {
    const message = getWhatsAppScreenshotMessage(name);
    const link = getWhatsAppLink('918590319881', message);
    window.open(link, '_blank');
    setShowNamePromptModal(false);
  };

  // Generic Modal component with added animation for coupon success
  const Modal = ({ message, onClose }) => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full text-center">
        {message.includes('saved') && (
          <div className="flex justify-center items-center mb-4">
            <span className="text-3xl animate-pop">🎉</span>
          </div>
        )}
        <p className="text-base sm:text-lg font-semibold text-gray-800 mb-4">{message}</p>
        <button
          onClick={onClose}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          OK
        </button>
      </div>
    </div>
  );

  // WhatsApp Options Modal Component
  const WhatsAppModal = ({ onClose }) => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full text-center space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">How can we help?</h3>
        <button
          onClick={() => {
            onClose();
            setShowNamePromptModal(true);
          }}
          className="w-full block bg-green-500 text-white py-3 px-4 rounded-lg font-semibold shadow-md hover:bg-green-600 transition duration-300 ease-in-out"
        >
          Send Payment Screenshot
        </button>
        <a
          href={getWhatsAppLink('918590319881', getWhatsAppInquiryMessage())}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClose}
          className="w-full block bg-blue-500 text-white py-3 px-4 rounded-lg font-semibold shadow-md hover:bg-blue-600 transition duration-300 ease-in-out"
        >
          Make a Course Inquiry
        </a>
        <button
          onClick={onClose}
          className="mt-2 text-gray-600 hover:underline"
        >
          Cancel
        </button>
      </div>
    </div>
  );
  
  // New Modal to prompt for user's name
  const NamePromptModal = ({ onClose, onSubmit }) => {
    const [name, setName] = useState(formData.name || '');
    const inputRef = useRef(null); // Create a ref for the input

    // Effect to focus the input when the modal mounts
    useEffect(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, []); // Empty dependency array ensures this runs only once when modal mounts

    const handleSubmit = (e) => {
      e.preventDefault();
      if (name.trim()) {
        onSubmit(name.trim());
      } else {
        setModalMessage("Please enter your name to proceed.");
        setShowModal(true); // Show the generic modal for validation error
      }
    };

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full">
          <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center">Enter Your Name</h3>
          <p className="text-sm text-gray-600 mb-4 text-center">Please provide the name used in the application form.</p>
          <form onSubmit={handleSubmit}>
            <input
              ref={inputRef} // Assign the ref to the input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm mb-4"
              placeholder="Your Full Name"
              // required attribute removed previously
            />
            <div className="flex justify-end space-x-3">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition duration-300">
                Cancel
              </button>
              <button type="submit" className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition duration-300">
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };


  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 font-inter">
      {/* Custom fonts and keyframes */}
      <style>
        {`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 15s linear infinite;
        }
        .font-noto-serif-malayalam {
          font-family: 'Noto Serif Malayalam', serif;
        }
        .font-poppins {
            font-family: 'Poppins', sans-serif;
        }
        @keyframes pop {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-pop {
          animation: pop 0.5s ease-out;
        }
        `}
      </style>

      {/* Sticky Header - Conditionally rendered */}
      {currentPage === 'landingPage' && (
        <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-200 py-3 px-4 grid grid-cols-3 items-center rounded-b-xl">
          <div className="justify-self-start">
              <a href="tel:+917559865389" className="p-2 rounded-full bg-[#0da6b6] text-white hover:bg-[#0d7cb9] transition duration-300 ease-in-out inline-flex" aria-label="Call for Inquiry">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path></svg>
            </a>
          </div>
          <div className="justify-self-center">
              <button
                onClick={() => navigateTo('form')}
                style={{ backgroundColor: '#d72e12' }}
                className="text-white py-2 px-4 rounded-full font-semibold text-sm whitespace-nowrap hover:opacity-90 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
              >
                Register Now
              </button>
          </div>
          <div className="justify-self-end">
            <button
              onClick={() => setShowWhatsAppModal(true)}
              className="p-2 rounded-full bg-green-500 text-white hover:bg-green-600 transition duration-300 ease-in-out"
              aria-label="Contact via WhatsApp"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.72.45 3.38 1.22 4.85L2 22l5.09-1.34c1.42.78 3.02 1.25 4.85 1.25C17.5 21.91 22 17.46 22 11.91S17.5 2 12.04 2zM17.16 16.12c-.2.55-.7.83-1.07.83-.37 0-.7-.12-1.04-.25-.33-.12-1.55-.64-1.79-.73-.24-.09-.43-.13-.6-.13-.17 0-.36.06-.55.25-.19.19-.73.7-.89.85-.16.16-.32.18-.59.07-.26-.1-.97-.36-1.85-.92-.69-.44-1.15-.81-1.52-1.28-.37-.47-.39-.44-.66-.89-.27-.45-.03-.41.19-.64.22-.22.49-.51.66-.68.17-.17.23-.29.3-.47.07-.19.03-.36-.01-.52-.04-.15-.36-.86-.5-1.17-.14-.3-.28-.26-.48-.27-.2-.01-.43-.01-.66-.01-.23 0-.6.06-.92.35-.32.29-.97.94-.97 2.29 0 1.35 1 2.63 1.14 2.81.14.18 1.95 2.98 4.75 4.14 2.8.99 3.49.92 4.14.82.65-.09 1.4-.58 1.6-1.17.2-.59.2-1.09.14-1.19-.06-.1-.24-.15-.5-.25z"/>
              </svg>
            </button>
          </div>
        </header>
      )}

      <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 md:p-10 max-w-2xl w-full mt-4">
        <div className="flex justify-center mb-4">
          <img src="/logo.png" alt="First Bench Learning Logo" className="max-w-[200px] h-auto" onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/200x75/ffffff/000000?text=Dot+Projects" }} />
        </div>

        {/* Conditional Heading: Image on landing, Text on form/payment */}
        {currentPage === 'landingPage' && (
          <>
            <div className="flex justify-center mb-4">
              <img 
                src="heading1.png" 
                alt="AI For Smart Teacher Course" 
                width="2900" 
                height="1056" 
                className="w-full h-auto"
                onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/2900x1056/eeeeee/333333?text=AI+For+Smart+Teacher" }}
              />
            </div>
             {/* --- Requirements Text Moved Here, Updated Styling & Content --- */}
             {/* Changed color to gray, kept reduced font size */}
             <div className="mt-4 mb-2 text-center font-bold text-gray-600 text-sm sm:text-base"> 
                <p>⭐ No coding experience needed!</p>
                {/* Wrapped second line and HR in a div for width control */}
                <div className="inline-block max-w-max mx-auto"> 
                    <hr className="my-1 border-gray-300"/> {/* Adjusted HR margin */}
                    <p>⭐ No computer needed — mobile is enough!</p>
                </div>
             </div>
          </>
        )}

        {(currentPage === 'form' || currentPage === 'paymentOptions') && (
          <h1 className="text-4xl sm:text-5xl font-extrabold text-center mb-4 font-poppins bg-clip-text text-transparent bg-gradient-to-r from-[#0da6b6] to-[#0d7cb9]">
            <span className="block sm:inline">AI For Smart</span> <span className="block sm:inline">Teacher Course</span>
          </h1>
        )}


        {currentPage === 'landingPage' && (
          <div className="text-center space-y-4">

            {/* --- Countdown Timer --- */}
            {/* Increased text size slightly (text-2xl, text-[0.6rem]), kept padding and gap small */}
            <div className="mt-2 mb-2 py-2 sm:p-4 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Event Starts In:</h3>
              <div className="grid grid-cols-4 gap-1 sm:gap-2 text-center">
                {/* Alternating Background Colors */}
                <div style={{ backgroundColor: '#0d7cb9' }} className="p-1 sm:p-3 rounded-lg shadow-sm">
                  {/* Increased number size on mobile */}
                  <span className="text-2xl sm:text-4xl font-bold text-white block">{timeLeft.days}</span> 
                  {/* Increased label size on mobile */}
                  <span className="text-[0.6rem] sm:text-xs leading-tight text-gray-200 uppercase">Days</span>
                </div>
                <div style={{ backgroundColor: '#0da6b6' }} className="p-1 sm:p-3 rounded-lg shadow-sm">
                   {/* Increased number size on mobile */}
                  <span className="text-2xl sm:text-4xl font-bold text-white block">{timeLeft.hours}</span>
                   {/* Increased label size on mobile */}
                  <span className="text-[0.6rem] sm:text-xs leading-tight text-gray-200 uppercase">Hours</span>
                </div>
                <div style={{ backgroundColor: '#0d7cb9' }} className="p-1 sm:p-3 rounded-lg shadow-sm">
                   {/* Increased number size on mobile */}
                  <span className="text-2xl sm:text-4xl font-bold text-white block">{timeLeft.minutes}</span>
                   {/* Increased label size on mobile */}
                  <span className="text-[0.6rem] sm:text-xs leading-tight text-gray-200 uppercase">Minutes</span>
                </div>
                <div style={{ backgroundColor: '#0da6b6' }} className="p-1 sm:p-3 rounded-lg shadow-sm">
                   {/* Increased number size on mobile */}
                  <span className="text-2xl sm:text-4xl font-bold text-white block">{timeLeft.seconds}</span>
                   {/* Increased label size on mobile */}
                  <span className="text-[0.6rem] sm:text-xs leading-tight text-gray-200 uppercase">Seconds</span>
                </div>
              </div>
            </div>

            {/* --- Limited Seats Text --- */}
            {/* Reduced text size on mobile (text-lg), Added cursor-pointer and onClick */}
            <div className="text-lg sm:text-xl font-bold text-gray-800">
              <span className="animate-pulse">🔴</span> Limited Seats,{' '}
              <span 
                className="text-[#0d7cb9] cursor-pointer hover:opacity-80" 
                onClick={() => navigateTo('form')}
              >
                Register Now!
              </span>
            </div>

            {/* Removed the border-b */}
            <div className="my-6"></div> 
            
            <div className="space-y-6 text-left mt-10">
              {/* Faculty Section */}
              <div className="flex flex-col items-center sm:flex-row sm:items-start sm:space-x-6 bg-white p-0 sm:p-6 rounded-xl">
                {/* Mobile Image - Adjusted height slightly more (h-80) */}
                <img
                  src="facultymobileui.png"
                  alt="Faculty: Shameel Malayamma"
                  width="2259"
                  height="2869"
                  className="w-64 h-80 rounded-lg object-cover mb-4 sm:hidden" // Adjusted height
                  onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/256x320/eeeeee/333333?text=Faculty" }}
                />
                {/* Desktop Image */}
                <img
                  src="shameelsir.jpg"
                  alt="Faculty: Shameel Malayamma"
                  className="w-24 h-24 rounded-full object-cover sm:mb-0 flex-shrink-0 hidden sm:block"
                  onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/100x100/eeeeee/333333?text=Faculty" }}
                />
                <div className="text-center sm:text-left">
                  <h3 className="text-[#0d7cb9] font-normal text-sm sm:text-base">Faculty:</h3>
                  {/* Added margin-bottom */}
                  <p className="text-lg sm:text-xl font-bold text-gray-800 leading-tight mb-1">Shameel Malayamma</p> 
                  {/* Reduced line height */}
                  <p className="text-gray-600 font-normal text-sm sm:text-base leading-tight">AI Training Expert & Founder, Dot Projects.</p>
                  {/* Reduced line height & ensured bold */}
                  <p className="text-gray-600 font-semibold text-sm sm:text-base mt-1 leading-tight">100+ Sessions experienced.</p>
                  <div className="text-yellow-500 text-lg mt-1">
                    ⭐⭐⭐⭐⭐
                  </div>
                </div>
              </div>

              {/* Course Details */}
              <div className="p-6 bg-white rounded-xl">
                <h3 className="text-xl font-bold text-[#0d7cb9] mb-4 text-center border-b-2 border-gray-200 pb-2">Course Details</h3>
                <div className="text-gray-700 text-base space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-1">
                    <span className="font-thin">Course Name:</span>
                    <span className="font-bold text-left sm:text-left">AI For Smart Teacher Course</span>
                  </div>
                  <div className="border-t border-gray-100 my-1"></div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-1">
                    <span className="font-thin">For:</span>
                    <span className="font-bold text-left sm:text-left">All Teachers & Aspirants</span>
                  </div>
                  <div className="border-t border-gray-100 my-1"></div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-1">
                    <span className="font-thin">Mode:</span>
                    {/* Updated Mode Text */}
                    <span className="font-bold text-left sm:text-left">1 day Offline Practical Workshop</span>
                  </div>
                  <div className="border-t border-gray-100 my-1"></div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-1">
                    <span className="font-thin">Date and Time:</span>
                    {/* Responsive Date/Time Span */}
                    <span className="font-bold text-left sm:text-left text-[#0d7cb9]">
                      <span className="sm:hidden"> {/* Mobile View */}
                        01<sup className="text-xs">st</sup> November 2025 Saturday<br/>(10:00 AM - 4:30 PM)
                      </span>
                      <span className="hidden sm:inline"> {/* Desktop View */}
                        01<sup className="text-xs">st</sup> November 2025 (10:00 AM - 4:30 PM)
                      </span>
                    </span>
                  </div>
                  <div className="border-t border-gray-100 my-1"></div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-1">
                    <span className="font-thin">Place:</span>
                    {/* Updated Place Name */}
                    <span className="font-bold text-left sm:text-left">Alumni Center, Angadippuram, Perinthalmanna</span>
                  </div>
                </div>
                {/* --- Removed Requirements Text from here --- */}
                {/* --- Location & Calendar Buttons --- */}
                {/* Changed back to flex-col on mobile (default), sm:flex-row */}
                <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <a
                    href="https://maps.app.goo.gl/JfUsTbZCaeJ5PwDX6?g_st=ac"
                    target="_blank"
                    rel="noopener noreferrer"
                    /* Changed back to w-full on mobile, sm:w-auto */
                    className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-800 rounded-full font-semibold text-sm hover:bg-gray-200 transition-all duration-300"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    Location
                  </a>
                  <a
                    href={getCalendarLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                     /* Changed back to w-full on mobile, sm:w-auto */
                    className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-800 rounded-full font-semibold text-sm hover:bg-gray-200 transition-all duration-300"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    Add to Calendar
                  </a>
                </div>
              </div>

              {/* Course Contents */}
              <div style={{ backgroundColor: '#0da6b6' }} className="text-white p-6 rounded-xl">
                <h3 className="text-xl font-bold mb-4 text-center border-b-2 border-cyan-200 pb-2">Course Contents</h3>
                <ul className="space-y-3 text-base">
                  <li className="flex items-start">
                    <svg className="flex-shrink-0 w-4 h-4 mr-3 mt-1 text-yellow-300" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                    <span className="flex-grow">Lesson Plan & Activities</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="flex-shrink-0 w-4 h-4 mr-3 mt-1 text-yellow-300" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                    <span className="flex-grow">Simplify Tough Concepts</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="flex-shrink-0 w-4 h-4 mr-3 mt-1 text-yellow-300" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                    <span className="flex-grow">Memory Codes & Stories</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="flex-shrink-0 w-4 h-4 mr-3 mt-1 text-yellow-300" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                    <span className="flex-grow">Students Data Managing</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="flex-shrink-0 w-4 h-4 mr-3 mt-1 text-yellow-300" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                    <span className="flex-grow">Tables & Mind Map Notes</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="flex-shrink-0 w-4 h-4 mr-3 mt-1 text-yellow-300" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                    <span className="flex-grow">PDF & Picture Analysis</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="flex-shrink-0 w-4 h-4 mr-3 mt-1 text-yellow-300" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                    <span className="flex-grow">Question Making & PYQ Practice</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="flex-shrink-0 w-4 h-4 mr-3 mt-1 text-yellow-300" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                    <span className="flex-grow">Slide Presentation</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="flex-shrink-0 w-4 h-4 mr-3 mt-1 text-yellow-300" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                    <span className="flex-grow">Educational Website Making</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="flex-shrink-0 w-4 h-4 mr-3 mt-1 text-yellow-300" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                    <span className="flex-grow">Timetable & Mark List Creation</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="flex-shrink-0 w-4 h-4 mr-3 mt-1 text-yellow-300" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                    <span className="flex-grow">Images, Animation & Videos</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="flex-shrink-0 w-4 h-4 mr-3 mt-1 text-yellow-300" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                    <span className="flex-grow">Study with Songs, Quiz Making</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="flex-shrink-0 w-4 h-4 mr-3 mt-1 text-yellow-300" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                    <span className="flex-grow">Speak & Video Chat with AI</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="flex-shrink-0 w-4 h-4 mr-3 mt-1 text-yellow-300" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                    <span className="flex-grow">AI in Google Workspace</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="flex-shrink-0 w-4 h-4 mr-3 mt-1 text-yellow-300" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                    <span className="flex-grow">Interactive Lectures</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="flex-shrink-0 w-4 h-4 mr-3 mt-1 text-yellow-300" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                    <span className="flex-grow">Story Books & Edu Games</span>
                  </li>
                  <li className="mt-4 font-semibold text-gray-100">And many more smart AI hacks for your teaching career...</li>
                </ul>
              </div>

              {/* Why AI For Smart Teachers? */}
              <div className="bg-white p-6 rounded-xl">
                <h3 className="text-xl font-bold text-[#0d7cb9] mb-4 text-center border-b-2 border-gray-200 pb-2">Why AI For Smart Teachers?</h3>
                <ul className="space-y-2 text-gray-800 font-noto-serif-malayalam text-base">
                  <li className="flex items-start">
                    <svg className="flex-shrink-0 w-4 h-4 mr-2 mt-1 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                    <span className="text-left flex-grow">അധ്യാപനം കൂടുതൽ വേഗത്തിലും ഫലപ്രദവുമാക്കാം.</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="flex-shrink-0 w-4 h-4 mr-2 mt-1 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                    <span className="text-left flex-grow">ബുദ്ധിമുട്ടുള്ള പാഠഭാഗങ്ങൾ സിമ്പിളായി പഠിപ്പിക്കാം.</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="flex-shrink-0 w-4 h-4 mr-2 mt-1 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                    {/* Updated Text */}
                    <span className="text-left flex-grow">ആക്റ്റീവ് ലേണിംഗിലൂടെ ബോറടിപ്പിക്കാതെ ക്ലാസെടുക്കാം.</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="flex-shrink-0 w-4 h-4 mr-2 mt-1 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                    <span className="text-left flex-grow">Marksheet Making, Question Paper making, Valuation, Time Table Scheduling തുടങ്ങിയവ നിമിഷനേരങ്ങൾ കൊണ്ട് തീർത്ത് സമയം ലാഭിക്കാം.</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="flex-shrink-0 w-4 h-4 mr-2 mt-1 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                    <span className="text-left flex-grow">മാറുന്ന ലോകത്ത് ഏറ്റവും മികച്ച കരിയർ ഉയർച്ച.</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-8">
              {/* Changed background color to blue */}
              <button
                onClick={() => navigateTo('form')}
                style={{ backgroundColor: '#0d7cb9' }} 
                className="w-full text-white py-3 px-8 rounded-full font-semibold text-lg shadow-lg hover:opacity-90 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                Register Now ✨
              </button>
            </div>
          </div>
        )}

        {currentPage === 'form' && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Enrollment Details Heading with black color */}
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Enrollment Details</h2>

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Your Full Name"
                required
              />
            </div>

            {/* Age */}
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                Age <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Your Age"
                min="1"
                required
              />
            </div>

            {/* Phone Number - Responsive Country Code */}
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="flex rounded-lg shadow-sm">
                <select
                  name="phoneCode"
                  value={formData.phoneCode}
                  onChange={handleChange}
                  className="w-1/4 sm:w-auto px-2 sm:px-3 py-2 border border-gray-300 rounded-l-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  {countryCodes.map((country) => (
                    <option key={`${country.code}-${country.name}-phone`} value={country.code}>
                      {country.code} ({country.name})
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="flex-1 w-3/4 sm:w-auto block px-4 py-2 border border-gray-300 rounded-r-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g., 9876543210"
                  required
                />
              </div>
            </div>

            {/* WhatsApp Number - Responsive Country Code & Same as Mobile Checkbox */}
            <div>
              <label htmlFor="whatsappNumber" className="block text-sm font-medium text-gray-700 mb-1">
                WhatsApp Number <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center space-x-2 mb-2">
                <input
                  type="checkbox"
                  id="sameAsMobile"
                  checked={sameAsMobile}
                  onChange={handleSameAsMobileChange}
                  className="form-checkbox h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="sameAsMobile" className="text-sm text-gray-700">Same as Mobile Number</label>
              </div>
              <div className="flex rounded-lg shadow-sm">
                <select
                  name="whatsappCode"
                  value={formData.whatsappCode}
                  onChange={handleChange}
                  disabled={sameAsMobile}
                  className="w-1/4 sm:w-auto px-2 sm:px-3 py-2 border border-gray-300 rounded-l-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-200"
                >
                  {countryCodes.map((country) => (
                    <option key={`${country.code}-${country.name}-whatsapp`} value={country.code}>
                      {country.code} ({country.name})
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  id="whatsappNumber"
                  name="whatsappNumber"
                  value={formData.whatsappNumber}
                  onChange={handleChange}
                  disabled={sameAsMobile}
                  className="flex-1 w-3/4 sm:w-auto block px-4 py-2 border border-gray-300 rounded-r-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-200"
                  placeholder="e.g., 9876543210"
                  required
                />
              </div>
            </div>

            {/* Email ID */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email ID <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="your.email@example.com"
                required
              />
            </div>

            {/* Place */}
            <div>
              <label htmlFor="place" className="block text-sm font-medium text-gray-700 mb-1">
                Place
              </label>
              <input
                type="text"
                id="place"
                name="place"
                value={formData.place}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Your City/Town"
              />
            </div>

            {/* District */}
            <div>
              <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1">
                District
              </label>
              <input
                type="text"
                id="district"
                name="district"
                value={formData.district}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Your District"
              />
            </div>

            {/* Course Fee Section (Enhanced with Logo Colors) - UPDATED */}
            <div className="bg-gradient-to-br from-[#0da6b6] to-[#0d7cb9] p-4 rounded-xl shadow-inner">
              <h3 className="text-xl font-bold text-white mb-3">💰 Course & Payment Summary</h3>
              <div className="bg-white p-3 rounded-lg border border-gray-200 text-sm sm:text-base">
                <p className="text-gray-700 mb-1">
                  <span className="font-semibold">Course Name:</span> <span className="block sm:inline">AI For Smart Teacher Course</span>
                </p>
                <p className="text-gray-700 mb-3">
                  <span className="font-semibold">Fee:</span> ₹ {originalAmount} <span className="font-thin">(included AC hall, lunch, tea and snacks etc..)</span>
                </p>

                <div className="border-t border-gray-200 pt-2">
                  <div className="border-t border-blue-200 pt-2">
                    <p className="flex justify-between text-lg sm:text-xl font-bold text-[#0d7cb9]">
                      <span>Total Payable:</span> <span>₹ {payableAmount}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button with logo blue gradient */}
            <button
              type="submit"
              style={{ backgroundColor: '#d72e12' }}
              className="w-full text-white py-3 px-4 sm:px-6 rounded-full font-semibold text-base sm:text-lg shadow-lg hover:opacity-90 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                'Submit and Proceed to Payment'
              )}
            </button>

            {/* WhatsApp Button on Form Page */}
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setShowNamePromptModal(true)}
                className="inline-flex items-center justify-center bg-green-500 text-white py-3 px-4 sm:px-6 rounded-full font-semibold text-base sm:text-lg shadow-md hover:bg-green-600 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 whitespace-nowrap"
              >
                <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.72.45 3.38 1.22 4.85L2 22l5.09-1.34c1.42.78 3.02 1.25 4.85 1.25C17.5 21.91 22 17.46 22 11.91S17.5 2 12.04 2zM17.16 16.12c-.2.55-.7.83-1.07.83-.37 0-.7-.12-1.04-.25-.33-.12-1.55-.64-1.79-.73-.24-.09-.43-.13-.6-.13-.17 0-.36.06-.55.25-.19.19-.73.7-.89.85-.16.16-.32.18-.59.07-.26-.1-.97-.36-1.85-.92-.69-.44-1.15-.81-1.52-1.28-.37-.47-.39-.44-.66-.89-.27-.45-.03-.41.19-.64.22-.22.49-.51.66-.68.17-.17.23-.29.3-.47.07-.19.03-.36-.01-.52-.04-.15-.36-.86-.5-1.17-.14-.3-.28-.26-.48-.27-.2-.01-.43-.01-.66-.01-.23 0-.6.06-.92.35-.32.29-.97.94-.97 2.29 0 1.35 1 2.63 1.14 2.81.14.18 1.95 2.98 4.75 4.14 2.8.99 3.49.92 4.14.82.65-.09 1.4-.58 1.6-1.17.2-.59.2-1.09.14-1.19-.06-.1-.24-.15-.5-.25z"/>
                </svg>
                WhatsApp Fee Screenshot
              </button>
            </div>
          </form>
        )}

        {currentPage === 'paymentOptions' && (
          <div className="space-y-6 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Choose Payment Method</h2>
            <p className="text-lg font-semibold text-[#0d7cb9] mb-4">
              Amount Payable: ₹ {payableAmount}
            </p>

            <p className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-4 rounded-lg mb-6 text-sm">
              <span className="font-bold">Important Note:</span> The screenshot of payment should be sent to the WhatsApp number +918590319881. If not, the application may not be considered.
            </p>

            <button
              onClick={() => {
                window.location.href = `upi://pay?pa=shameelmalayamma13@oksbi&pn=Shameel&am=${payableAmount}&cu=INR&tn=Fee for AI For Smart Teacher Course`;
              }}
              className="w-full block bg-[#0d7cb9] text-white py-3 px-6 rounded-full font-semibold text-lg shadow-lg hover:bg-opacity-90 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 mb-4"
            >
              Pay with UPI
            </button>
            
            <div className="w-full">
              <button
                onClick={() => setShowBankDetails(!showBankDetails)}
                className="w-full flex justify-center items-center bg-[#0d7cb9] text-white py-3 px-6 rounded-full font-semibold text-lg shadow-lg hover:bg-opacity-90 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                Bank Transfer
                <svg className={`w-5 h-5 ml-2 transition-transform duration-300 ${showBankDetails ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </button>
              <div
                className={`transition-all duration-500 ease-in-out overflow-hidden ${showBankDetails ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}
              >
                <div className="bg-blue-50 p-6 rounded-xl shadow-inner border border-blue-200 text-left">
                  <h3 className="text-xl font-bold text-blue-800 mb-4">GPay Details:</h3>
                  <p className="text-gray-700 mb-2">
                    <span className="font-semibold">GPay No:</span> 7559865389
                    <button onClick={() => copyToClipboard('7559865389', 'GPay Number copied!')} className="ml-3 bg-[#0da6b6] text-white px-3 py-1 rounded-lg hover:bg-opacity-90 transition duration-300 ease-in-out text-xs">Copy</button>
                  </p>
                  <p className="text-gray-700 mb-4">
                    <span className="font-semibold">GPay Name:</span> MSK Gallery
                    <button onClick={() => copyToClipboard('MSK Gallery', 'GPay Name copied!')} className="ml-3 bg-[#0da6b6] text-white px-3 py-1 rounded-lg hover:bg-opacity-90 transition duration-300 ease-in-out text-xs">Copy</button>
                  </p>

                  <h3 className="text-xl font-bold text-blue-800 mb-4">Bank Account Details:</h3>
                  <p className="text-gray-700 mb-2">
                    <span className="font-semibold">Bank:</span> State Bank of India
                    <button onClick={() => copyToClipboard('State Bank of India', 'Bank Name copied!')} className="ml-3 bg-[#0da6b6] text-white px-3 py-1 rounded-lg hover:bg-opacity-90 transition duration-300 ease-in-out text-xs">Copy</button>
                  </p>
                  <p className="text-gray-700 mb-2">
                    <span className="font-semibold">Account Name:</span> Muhammad Shameel
                    <button onClick={() => copyToClipboard('Muhammad Shameel', 'Account Name copied!')} className="ml-3 bg-[#0da6b6] text-white px-3 py-1 rounded-lg hover:bg-opacity-90 transition duration-300 ease-in-out text-xs">Copy</button>
                  </p>
                  <p className="text-gray-700 mb-2">
                    <span className="font-semibold">Account No:</span> 32865807717
                    <button onClick={() => copyToClipboard('32865807717', 'Account Number copied!')} className="ml-3 bg-[#0da6b6] text-white px-3 py-1 rounded-lg hover:bg-opacity-90 transition duration-300 ease-in-out text-xs">Copy</button>
                  </p>
                  <p className="text-gray-700 mb-4">
                    <span className="font-semibold">IFSC:</span> SBIN0002207
                    <button onClick={() => copyToClipboard('SBIN0002207', 'IFSC copied!')} className="ml-3 bg-[#0da6b6] text-white px-3 py-1 rounded-lg hover:bg-opacity-90 transition duration-300 ease-in-out text-xs">Copy</button>
                  </p>
                  <button onClick={() => copyToClipboard(`GPay No: 7559865389\nGPay Name: MSK Gallery\n\nBank: State Bank of India\nAccount Name: Muhammad Shameel\nAccount No: 32865807717\nIFSC: SBIN0002207`, 'All Bank Details copied!')} className="w-full bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition duration-300 ease-in-out text-sm mt-4">Copy All Details</button>
                </div>
              </div>
            </div>

            <p className="bg-red-50 border-l-4 border-red-400 text-red-800 p-4 rounded-lg mt-6 text-sm">
              <span className="font-bold">Warning:</span> Please come back to this screen or the home screen after payment completion and take a screenshot. Then, send the screenshot to the WhatsApp number by clicking the button below.
            </p>

            <div className="mt-6">
                <button
                type="button"
                onClick={() => setShowNamePromptModal(true)}
                className="inline-flex items-center justify-center bg-green-500 text-white py-3 px-4 sm:px-6 rounded-full font-semibold text-base sm:text-lg shadow-md hover:bg-green-600 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 whitespace-nowrap"
              >
                <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.72.45 3.38 1.22 4.85L2 22l5.09-1.34c1.42.78 3.02 1.25 4.85 1.25C17.5 21.91 22 17.46 22 11.91S17.5 2 12.04 2zM17.16 16.12c-.2.55-.7.83-1.07.83-.37 0-.7-.12-1.04-.25-.33-.12-1.55-.64-1.79-.73-.24-.09-.43-.13-.6-.13-.17 0-.36.06-.55.25-.19.19-.73.7-.89.85-.16.16-.32.18-.59.07-.26-.1-.97-.36-1.85-.92-.69-.44-1.15-.81-1.52-1.28-.37-.47-.39-.44-.66-.89-.27-.45-.03-.41.19-.64.22-.22.49-.51.66-.68.17-.17.23-.29.3-.47.07-.19.03-.36-.01-.52-.04-.15-.36-.86-.5-1.17-.14-.3-.28-.26-.48-.27-.2-.01-.43-.01-.66-.01-.23 0-.6.06-.92.35-.32.29-.97.94-.97 2.29 0 1.35 1 2.63 1.14 2.81.14.18 1.95 2.98 4.75 4.14 2.8.99 3.49.92 4.14.82.65-.09 1.4-.58 1.6-1.17.2-.59.2-1.09.14-1.19-.06-.1-.24-.15-.5-.25z"/>
                </svg>
                WhatsApp Fee Screenshot
              </button>
            </div>
            <button
              onClick={() => navigateTo('form')}
              className="mt-4 text-blue-600 hover:underline"
            >
              Back to Form
            </button>
          </div>
        )}

        {showModal && <Modal message={modalMessage} onClose={() => setShowModal(false)} />}
        {showWhatsAppModal && <WhatsAppModal onClose={() => setShowWhatsAppModal(false)} />}
        {showNamePromptModal && <NamePromptModal onClose={() => setShowNamePromptModal(false)} onSubmit={handleNameSubmitForScreenshot} />}
      </div>
    </div>
  );
};

export default App;

