import React from "react";
import NavBar from "./components/navbar"; // Import NavBar component
import "./index.css";

function App() {
  return (
    <div
      className="relative h-screen bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0')",
      }}
    >
      <NavBar /> {/* Using the NavBar component */}

      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center h-full text-center text-white px-5">
        <h1 className="text-5xl font-bold">
          Welcome to <span className="text-yellow-400">TennisCourt</span>
        </h1>
        <p className="mt-4 text-lg">
          Experience the perfect blend of sport and luxury. Book your court today and elevate your game.
        </p>

        {/* Buttons */}
        <div className="mt-6 flex space-x-4">
          <button className="bg-yellow-500 text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-600">
            Book Now
          </button>
          <button className="bg-green-600 px-6 py-2 rounded-lg font-semibold hover:bg-green-700">
            Learn More
          </button>
        </div>

        {/* Features */}
        <div className="absolute bottom-10 flex space-x-10 bg-black bg-opacity-50 p-4 rounded-lg">
          <div className="text-center">
            <h2 className="text-3xl font-bold">10+</h2>
            <p>Professional Courts</p>
          </div>
          <div className="text-center">
            <h2 className="text-3xl font-bold">24/7</h2>
            <p>Booking Available</p>
          </div>
          <div className="text-center flex items-center">
            <h2 className="text-3xl font-bold">5</h2>
            <span className="text-yellow-400 text-3xl ml-2">⭐</span>
            <p className="ml-2">Customer Rating</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
