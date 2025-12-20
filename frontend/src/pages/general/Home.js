import React, { useEffect, useState } from "react";
import { FaBuilding, FaRobot, FaRocket, FaCheckCircle, FaClipboardList, FaHandsHelping } from "react-icons/fa";

const HomePage = () => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Trigger fade-in animation
    const timeout = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-tr from-blue-50 to-white flex flex-col">
      

      <main className={`flex-grow max-w-7xl mx-auto px-6 pb-16 transition-opacity duration-700 ${loaded ? "opacity-100" : "opacity-0"}`}>
        {/* Hero Section */}
        <section className="flex flex-col-reverse md:flex-row items-center gap-12 md:gap-24 my-12">
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-5xl font-extrabold text-blue-900 mb-6 leading-tight">
              Semplifica la burocrazia italiana con <span className="text-blue-600">intelligenza artificiale</span>
            </h1>
            <p className="text-lg text-gray-700 mb-8 max-w-xl mx-auto md:mx-0">
              Questa piattaforma demo ti mostra come l'AI può prendersi cura delle parti più noiose delle pratiche edilizie,
              velocizzando il lavoro e lasciandoti concentrarti su ciò che conta davvero.
            </p>
            <a
              href="/modelli"
              className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-full shadow-lg transition"
            >
              Prova Ora <FaRocket className="ml-3" size={24} />
            </a>
          </div>

          <div className="flex-1">
            <img
              src="/output-onlinetools.png"
              alt="Edilizia e AI"
              className="rounded-xl  mx-auto"
              loading="lazy"
            />
          </div>
        </section>

        {/* Features Section */}
        <section className="mt-20 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <FeatureCard
            icon={<FaClipboardList className="text-blue-600 mx-auto mb-4" size={48} />}
            title="Gestione semplificata"
            description="Automatizza e organizza facilmente tutte le pratiche edilizie in un unico posto, senza errori."
          />
          <FeatureCard
            icon={<FaRobot className="text-blue-600 mx-auto mb-4" size={48} />}
            title="Intelligenza Artificiale"
            description="Lascia che l'AI si occupi delle attività ripetitive, riducendo i tempi e aumentando l’efficienza."
          />
          <FeatureCard
            icon={<FaHandsHelping className="text-blue-600 mx-auto mb-4" size={48} />}
            title="Supporto affidabile"
            description="Un sistema sempre aggiornato che ti guida e ti assiste durante tutto il processo burocratico."
          />
        </section>

        {/* Why Choose Us */}
        <section className="mt-28 bg-blue-600 text-white rounded-2xl p-12 max-w-5xl mx-auto shadow-lg">
          <h2 className="text-3xl font-bold mb-8 text-center">Perché sceglierci?</h2>
          <ul className="space-y-6 max-w-3xl mx-auto text-lg">
            <li className="flex items-center gap-4">
              <FaCheckCircle size={28} className="text-green-300" />
              <span>Soluzioni innovative per semplificare il tuo lavoro</span>
            </li>
            <li className="flex items-center gap-4">
              <FaCheckCircle size={28} className="text-green-300" />
              <span>Interfaccia intuitiva e facile da usare</span>
            </li>
            <li className="flex items-center gap-4">
              <FaCheckCircle size={28} className="text-green-300" />
              <span>Affidabilità e precisione garantite</span>
            </li>
          </ul>
        </section>
      </main>


    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center">
    {icon}
    <h3 className="font-semibold text-xl mb-3">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

export default HomePage;
