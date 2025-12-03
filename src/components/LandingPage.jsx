import React from 'react';
// import { Link } from 'react-router-dom'; // No longer needed

// --- Icon Components ---
const ReportIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-white"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg>
);

const AiIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-white"><path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 0 0 1.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 0 0-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 0 0 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14z"></path><path d="M5 14H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><path d="M15 4h2a2 2 0 0 1 2 2v2"></path><path d="M19 14v2a2 2 0 0 1-2 2h-2"></path></svg>
);

const UpdateIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-white"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path><path d="M21 2H3v6h18V2z"></path></svg>
);

function LandingPage() {
  return (
    <div className="text-gray-800 font-sans">
      
      {/* --- Header & Hero Section --- */}
      {/* This section now has its own specific background image */}
      <div
        className="relative bg-cover bg-center text-white"
        style={{ backgroundImage: "url('/Gemini_Generated_Image_s05m65s05m65s05m.png')" }} // Ensure 'back.png' is in your /public folder
      >
        {/* A subtle gradient overlay to ensure text is readable over the image */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
        
        {/* Header */}
        <header className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20">
          <div className="text-2xl font-bold tracking-wider">LocalGov Connect</div>
          <nav className="hidden md:flex space-x-2">
            <a href="/login" className="px-5 py-2 bg-white/20 backdrop-blur-lg text-white font-semibold rounded-lg hover:bg-white/30 transition-colors">Citizen Login</a>
            <a href="/official-login" className="px-5 py-2 bg-gray-900/50 backdrop-blur-lg text-white font-semibold rounded-lg hover:bg-gray-900/70 transition-colors">Official Login</a>
          </nav>
        </header>

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen pt-24 pb-32 text-center px-4">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight drop-shadow-lg">Connecting Citizens. Empowering Communities.</h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8 drop-shadow-md">The smartest way to report civic issues, track their resolution, and build a better neighborhood, together.</p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <a href="/signup" className="px-8 py-3 bg-white text-blue-700 font-bold rounded-lg text-lg shadow-lg hover:bg-gray-200 transform hover:scale-105 transition-all">Get Started for Free</a>
            <a href="#how-it-works" className="px-8 py-3 bg-transparent border-2 border-white font-semibold rounded-lg text-lg hover:bg-white hover:text-blue-700 transition-all">How It Works</a>
          </div>
        </div>
      </div>

      {/* --- Features Section --- */}
      <div className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">A Modern Solution for Civic Engagement</h2>
          <p className="text-lg text-gray-600 mb-16 max-w-3xl mx-auto">LocalGov Connect streamlines communication between you and your local authorities, ensuring transparency and faster solutions.</p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 bg-white rounded-xl shadow-lg border border-gray-100 transform hover:-translate-y-2 transition-transform">
              <div className="inline-block p-4 bg-blue-600 rounded-full mb-4 shadow-lg"><ReportIcon /></div>
              <h3 className="text-2xl font-bold mb-3">Effortless Reporting</h3>
              <p className="text-gray-600">Quickly report issues like potholes or water leaks with precise location mapping and photo uploads.</p>
            </div>
            <div className="p-8 bg-white rounded-xl shadow-lg border border-gray-100 transform hover:-translate-y-2 transition-transform">
              <div className="inline-block p-4 bg-blue-600 rounded-full mb-4 shadow-lg"><AiIcon /></div>
              <h3 className="text-2xl font-bold mb-3">AI-Powered Categorization</h3>
              <p className="text-gray-600">Our smart system automatically routes your issue to the correct government department, saving time.</p>
            </div>
            <div className="p-8 bg-white rounded-xl shadow-lg border border-gray-100 transform hover:-translate-y-2 transition-transform">
              <div className="inline-block p-4 bg-blue-600 rounded-full mb-4 shadow-lg"><UpdateIcon /></div>
              <h3 className="text-2xl font-bold mb-3">Real-Time Tracking</h3>
              <p className="text-gray-600">Receive live updates and notifications as officials work on resolving your complaint.</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- How It Works Section --- */}
      <div id="how-it-works" className="py-24 px-6 bg-white">
        <h2 className="text-4xl font-bold text-center mb-16">Get Your Issue Resolved in 3 Simple Steps</h2>
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-10 text-center relative">
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 border-t-2 border-dashed border-gray-300 transform -translate-y-1/2" style={{ marginTop: '-40px'}}></div>
          
          <div className="relative">
              <div className="mx-auto w-24 h-24 flex items-center justify-center bg-blue-100 text-blue-600 text-3xl font-bold rounded-full border-4 border-white shadow-lg mb-4">1</div>
              <h3 className="text-2xl font-bold mb-2">Snap & Report</h3>
              <p className="text-gray-600">Submit a photo, describe the issue, and pin the location on the map.</p>
          </div>
          <div className="relative">
              <div className="mx-auto w-24 h-24 flex items-center justify-center bg-blue-100 text-blue-600 text-3xl font-bold rounded-full border-4 border-white shadow-lg mb-4">2</div>
              <h3 className="text-2xl font-bold mb-2">AI Routes It</h3>
              <p className="text-gray-600">Our smart algorithm analyzes and assigns your report to the right department.</p>
          </div>
          <div className="relative">
              <div className="mx-auto w-24 h-24 flex items-center justify-center bg-blue-100 text-blue-600 text-3xl font-bold rounded-full border-4 border-white shadow-lg mb-4">3</div>
              <h3 className="text-2xl font-bold mb-2">Track to Resolution</h3>
              <p className="text-gray-600">Get notified of the progress and see the positive change in your community.</p>
          </div>
        </div>
      </div>
      
      {/* --- Testimonials Section --- */}
      <div className="py-24 px-6 bg-gray-50">
        <h2 className="text-4xl font-bold text-center mb-12">Trusted by Communities and Officials</h2>
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
            <div className="p-8 bg-white rounded-xl shadow-md text-center">
                <img src="https://i.pravatar.cc/100?u=a" alt="Citizen avatar" className="w-20 h-20 rounded-full mx-auto -mt-16 mb-4 border-4 border-white shadow-lg"/>
                <p className="text-lg italic text-gray-700 mb-4">"Reporting potholes used to be a nightmare. With this platform, my complaint was acknowledged the same day and resolved in under 48 hours. Incredible!"</p>
                <p className="font-semibold text-gray-800">- Priya S., Citizen</p>
            </div>
            <div className="p-8 bg-white rounded-xl shadow-md text-center">
                <img src="https://i.pravatar.cc/100?u=b" alt="Official avatar" className="w-20 h-20 rounded-full mx-auto -mt-16 mb-4 border-4 border-white shadow-lg"/>
                <p className="text-lg italic text-gray-700 mb-4">"The AI categorization is a game-changer. We spend less time on administrative tasks and more time actually solving problems on the ground."</p>
                <p className="font-semibold text-gray-800">- Mr. Sharma, Municipal Official</p>
            </div>
        </div>
      </div>

      {/* --- Final CTA Section --- */}
      <div className="py-24 px-6 bg-blue-600 text-white text-center bg-cover" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/az-subtle.png')"}}>
        <h2 className="text-4xl font-bold mb-6">Ready to Make a Difference?</h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">Join thousands of citizens and officials working together to build smarter, better communities.</p>
        <a href="/signup" className="px-10 py-4 bg-white text-blue-600 font-bold rounded-lg hover:bg-gray-200 text-lg shadow-2xl transform hover:scale-105 transition-transform">
          Sign Up for Free
        </a>
      </div>

      {/* --- Footer --- */}
      <footer className="bg-gray-900 text-gray-400 text-center p-8">
        <div className="text-xl font-bold mb-4">LocalGov Connect</div>
        <p>&copy; {new Date().getFullYear()} LocalGov Connect. All rights reserved.</p>
        <p className="text-sm mt-2">A new way to engage with your local government.</p>
      </footer>
    </div>
  );
}

export default LandingPage;

