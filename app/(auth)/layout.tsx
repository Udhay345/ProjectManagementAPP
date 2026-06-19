import React from 'react';
import Image from 'next/image';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row">
      {/* Left Side - Blue Branding Panel */}
      <div className="hidden md:flex flex-col justify-between w-1/2 bg-gradient-to-br from-blue-600 via-[#2A37E3] to-[#141DB5] pt-12 px-12 pb-0 text-white relative overflow-hidden">
          
          {/* Abstract background shapes/blobs simulating the fluid texture */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-40 pointer-events-none z-0">
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
            <div className="absolute top-1/4 -right-24 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob" style={{ animationDelay: '2000ms' }}></div>
            <div className="absolute -bottom-24 left-1/4 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob" style={{ animationDelay: '4000ms' }}></div>
          </div>

          {/* Top Text Content */}
          <div className="relative z-10 pt-4 mt-8">
            <h1 className="text-4xl lg:text-5xl font-bold leading-[1.15] tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200">
              Manage your work<br />
              with our Web App
            </h1>
            <p className="text-blue-100/80 max-w-md text-base leading-relaxed">
              Streamline your workflow, collaborate seamlessly with your team, and deliver projects faster than ever before.
            </p>
          </div>
          
          <div className="relative z-10 mt-auto w-full flex justify-center">
            <Image 
              src="/img1.png" 
              alt="Application interface" 
              width={900} 
              height={700} 
              className="w-[110%] max-w-none h-auto object-cover object-top drop-shadow-2xl translate-y-4"
              priority
            />
          </div>

        </div>

        {/* Right Side - Form Container */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-16 relative">
          <div className="w-full max-w-[400px]">
            {children}
          </div>
        </div>
    </div>
  );
}
