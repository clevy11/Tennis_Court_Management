import React, { useEffect } from "react";
import NavBar from "../components/navbar";

const About: React.FC = () => {
  useEffect(() => {
    const handleScroll = () => {
      const elements = document.querySelectorAll(".fade-in");
      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight - 100) {
          el.classList.add("visible");
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Trigger on load

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div>
      {/* Navigation Bar */}
      

      <section
        className="relative bg-cover bg-center h-screen"
        style={{
          backgroundImage:
            "url('https://storage.googleapis.com/a1aa/image/hySxpV9NmaLJPRGQciBMo37190JJBH5C1VcAi1IWzGHoit9E.jpg')",
        }}
      >
        
        <div className="absolute inset-0 bg-black opacity-50">
       
        </div>
        <div className="container mx-auto h-full flex items-center justify-center text-center relative z-10">
        <NavBar />
          <div className="text-white max-w-2xl bg-black bg-opacity-70 p-6 rounded-lg">
            <h2 className="text-4xl font-bold mb-4">About Us</h2>
            <p className="text-lg mb-8">
              Tennis Courts With the quality of our courts and their beautiful
              setting offers an impressive team of teaching professionals. Our
              Trainers are always there and always ready to help you to improve
              your game and have fun at the same time. There is a programme to
              match your needs such as inter-members as well as Club
              competitions and tremendous social events to pull our broad
              roster of players together.
            </p>
            <a
              href="#content"
              className="bg-green-700 hover:bg-green-800 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="container mx-auto p-4" id="content">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 fade-in">
          {featureData.map((feature, index) => (
            <FeatureBox key={index} {...feature} />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-green-700 text-white p-4 mt-8 text-center">
        <p>© 2023 Tennis Club. All rights reserved.</p>
      </footer>
    </div>
  );
};

interface FeatureProps {
  imgSrc: string;
  title: string;
  description: string;
}

const FeatureBox: React.FC<FeatureProps> = ({ imgSrc, title, description }) => {
  return (
    <div className="bg-white p-4 rounded shadow">
      <img
        src={imgSrc}
        alt={title}
        className="w-full h-48 object-cover rounded mb-4"
      />
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p>{description}</p>
    </div>
  );
};

const featureData: FeatureProps[] = [
  {
    imgSrc:
      "https://storage.googleapis.com/a1aa/image/hySxpV9NmaLJPRGQciBMo37190JJBH5C1VcAi1IWzGHoit9E.jpg",
    title: "Beautiful Setting",
    description:
      "Our courts are set in a beautiful environment, providing a serene and inspiring atmosphere for your games.",
  },
  {
    imgSrc:
      "https://storage.googleapis.com/a1aa/image/1Jao1W5zAeUbPycl8elTcGB9dRaILU98Ozmmr0ZL2ePjkqtnA.jpg",
    title: "Expert Coaching",
    description:
      "Learn from our certified professional coaches who are dedicated to improving your game at any skill level.",
  },
  {
    imgSrc:
      "https://storage.googleapis.com/a1aa/image/azWv0rDj9mahLdhe4eBRAqF3xQICiSLb96ss2V2uffDuJVbPB.jpg",
    title: "Premium Facilities",
    description:
      "Enjoy our world-class amenities and modern facilities designed for both practice and competition.",
  },
];

export default About;
