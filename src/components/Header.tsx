import { useState } from "react";
import { useLocation } from "wouter";
import { ShoppingCart, Search, Menu, X, ChevronDown, Truck } from "lucide-react";
import { useCart } from "@/lib/cart";

export default function Header() {
  const [, navigate] = useLocation();
  const { totalItems } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lancamentosOpen, setLancamentosOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/busca?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileOpen(false);
    }
  };

  return (
    <>
      <div className="bg-green-600 text-white text-center text-xs sm:text-sm py-2 px-4 font-medium tracking-wide flex items-center justify-center gap-2">
        <Truck className="w-4 h-4 flex-shrink-0" />
        FRETE GRATIS para todo o Brasil em todos os pedidos!
      </div>

      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between gap-4 py-3">
            <button onClick={() => navigate("/")} className="flex items-center gap-2 flex-shrink-0">
              <div className="flex flex-col leading-tight">
                <span className="text-xl sm:text-2xl font-black tracking-tighter text-black uppercase">VARZEA</span>
                <span className="text-xs font-semibold tracking-widest text-gray-500 uppercase -mt-1">IMPORTS</span>
              </div>
            </button>

            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl relative">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar camisas, albums, produtos..."
                className="w-full border border-gray-300 rounded-sm py-2 pl-4 pr-12 text-sm focus:outline-none focus:border-black transition-colors"
              />
              <button type="submit" className="absolute right-0 top-0 h-full px-4 bg-black text-white rounded-r-sm hover:bg-gray-800 transition-colors">
                <Search className="w-4 h-4" />
              </button>
            </form>

            <div className="flex items-center gap-2">
              <button onClick={() => navigate("/carrinho")} className="relative p-2 hover:bg-gray-100 rounded-sm transition-colors">
                <ShoppingCart className="w-6 h-6" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {totalItems > 9 ? "9+" : totalItems}
                  </span>
                )}
              </button>
              <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 hover:bg-gray-100 rounded-sm">
                {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          <div className="md:hidden pb-3">
            <form onSubmit={handleSearch} className="flex relative">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar produtos..."
                className="w-full border border-gray-300 rounded-sm py-2 pl-4 pr-12 text-sm focus:outline-none focus:border-black"
              />
              <button type="submit" className="absolute right-0 top-0 h-full px-4 bg-black text-white rounded-r-sm">
                <Search className="w-4 h-4" />
              </button>
            </form>
          </div>

          <nav className="hidden md:flex items-center gap-6 pb-3 border-t border-gray-100 pt-2">
            <button
              onClick={() => navigate("/categoria/camisas")}
              className="text-sm font-semibold uppercase tracking-wide hover:text-gray-500 transition-colors"
            >
              Camisas
            </button>
            <div className="relative group">
              <button className="flex items-center gap-1 text-sm font-semibold uppercase tracking-wide hover:text-gray-500 transition-colors">
                Lançamentos <ChevronDown className="w-3 h-3" />
              </button>
              <div className="absolute top-full left-0 bg-white border border-gray-200 shadow-lg py-2 min-w-48 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <button
                  onClick={() => navigate("/categoria/lancamentos/copa-do-mundo")}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                >
                  Copa do Mundo
                </button>
              </div>
            </div>
          </nav>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-3 space-y-1">
              <button
                onClick={() => { navigate("/categoria/camisas"); setMobileOpen(false); }}
                className="block w-full text-left py-2 text-sm font-semibold uppercase tracking-wide border-b border-gray-100"
              >
                Camisas
              </button>
              <div>
                <button
                  onClick={() => setLancamentosOpen(!lancamentosOpen)}
                  className="flex items-center justify-between w-full py-2 text-sm font-semibold uppercase tracking-wide border-b border-gray-100"
                >
                  Lançamentos
                  <ChevronDown className={`w-4 h-4 transition-transform ${lancamentosOpen ? "rotate-180" : ""}`} />
                </button>
                {lancamentosOpen && (
                  <button
                    onClick={() => { navigate("/categoria/lancamentos/copa-do-mundo"); setMobileOpen(false); }}
                    className="block w-full text-left py-2 pl-4 text-sm text-gray-600 border-b border-gray-100"
                  >
                    Copa do Mundo
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
