import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Farmer from "./pages/Farmer";
import Logistics from "./pages/Logistics";
import Retailer from "./pages/Retailer";
import Consumer from "./pages/Consumer";

const navItems = [
  { to: "/", label: "🧑‍🌾 Farmer" },
  { to: "/logistics", label: "🚚 Logistics" },
  { to: "/retailer", label: "🏪 Retailer" },
  { to: "/consumer", label: "🔍 Consumer" },
];

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <header className="bg-green-700 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <h1 className="text-xl font-bold">🌿 GreenFarm Traceability</h1>
            <span className="text-xs bg-green-800 px-2 py-1 rounded">Blockchain + IPFS</span>
          </div>
          <nav className="max-w-7xl mx-auto px-4 pb-2 flex gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-t text-sm font-medium transition ${
                    isActive ? "bg-white text-green-700" : "text-green-100 hover:bg-green-600"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </header>

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<Farmer />} />
            <Route path="/logistics" element={<Logistics />} />
            <Route path="/retailer" element={<Retailer />} />
            <Route path="/consumer" element={<Consumer />} />
          </Routes>
        </main>

        <footer className="bg-gray-100 border-t text-center text-xs text-gray-500 py-3">
          GreenFarm Food Traceability | Ethereum & IPFS | Demo 2026
        </footer>
      </div>
    </BrowserRouter>
  );
}