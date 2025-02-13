import React from "react";
const courts = [
  {
    name: "Center Court",
    location: "Downtown Tennis Club",
    surface: "Hard Court",
    price: "$45/hr",
    image: "https://storage.googleapis.com/a1aa/image/1Jao1W5zAeUbPycl8elTcGB9dRaILU98Ozmmr0ZL2ePjkqtnA.jpg",
  },
  {
    name: "Clay Master",
    location: "Tennis Academy",
    surface: "Clay Court",
    price: "$55/hr",
    image: "https://storage.googleapis.com/a1aa/image/azWv0rDj9mahLdhe4eBRAqF3xQICiSLb96ss2V2uffDuJVbPB.jpg",
  },
  {
    name: "Indoor Court",
    location: "City Sports Complex",
    surface: "Indoor Court",
    price: "$60/hr",
    image: "https://storage.googleapis.com/a1aa/image/RlAErfmKw92pCybFstopG0JhSuTpBWVtbbCptLffzgbqkqtnA.jpg",
  },
  {
    name: "Beach Court",
    location: "Seaside Resort",
    surface: "Sand Court",
    price: "$40/hr",
    image: "https://storage.googleapis.com/a1aa/image/D3dsftWeI3jrEU94ugyidQL1RLOIXjZG2BSVNOSBmRLYS12TA.jpg",
  },
  {
    name: "Rooftop Court",
    location: "Skyline Club",
    surface: "Hard Court",
    price: "$70/hr",
    image: "https://storage.googleapis.com/a1aa/image/KjNJsrz3e4R8KSjA0amrNM6Ne3n949EE0nIOEUSD8L1XS12TA.jpg",
  },
  {
    name: "Community Court",
    location: "Local Park",
    surface: "Hard Court",
    price: "$30/hr",
    image: "https://storage.googleapis.com/a1aa/image/fv8uhe11dcn3Dkq0fh0hWoR3N5nFJ1JqznsPjfJiIOkLJVbPB.jpg",
  },
];

const Courts: React.FC = () => {
  return (
    <>
      <div className="pt-24 container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courts.map((court, index) => (
            <div
              key={index}
              className="rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1 bg-white"
            >
              <div className="relative h-48">
                <img
                  src={court.image}
                  alt={`${court.name} at ${court.location} with a ${court.surface.toLowerCase()} surface`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4 space-y-3">
                <h3 className="text-xl font-semibold text-gray-800">{court.name}</h3>
                <div className="flex items-center text-gray-600">
                  <span className="text-sm">{court.location}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm text-gray-500">{court.surface}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-800">{court.price}</span>
                    <a
                      href="/Login"
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors"
                    >
                      Book Now
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Courts;