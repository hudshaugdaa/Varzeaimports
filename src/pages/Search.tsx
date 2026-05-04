import { useSearch } from "wouter";
import { ChevronRight, SearchX } from "lucide-react";
import { useLocation } from "wouter";
import ProductCard from "@/components/ProductCard";
import { searchProducts } from "@/data/products";

export default function SearchPage() {
  const search = useSearch();
  const [, navigate] = useLocation();
  const params = new URLSearchParams(search);
  const query = params.get("q") || "";

  const results = query ? searchProducts(query) : [];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <nav className="flex items-center gap-1 text-xs text-gray-500 mb-6">
        <button onClick={() => navigate("/")} className="hover:text-black">Início</button>
        <ChevronRight className="w-3 h-3" />
        <span className="text-black font-medium">Busca</span>
      </nav>

      <div className="mb-8 border-b border-gray-200 pb-6">
        <h1 className="text-3xl font-black uppercase tracking-tighter">Busca: "{query}"</h1>
        <p className="text-gray-500 text-sm mt-2">
          {results.length} resultado{results.length !== 1 ? "s" : ""} encontrado{results.length !== 1 ? "s" : ""}
        </p>
      </div>

      {results.length === 0 ? (
        <div className="text-center py-20">
          <SearchX className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 mb-2">Nenhum resultado para "{query}"</p>
          <p className="text-gray-400 text-sm mb-6">Tente buscar por "camisa", "brasil", "album" ou "bola"</p>
          <button
            onClick={() => navigate("/")}
            className="bg-black text-white px-6 py-2 text-sm font-bold uppercase tracking-wide hover:bg-gray-800 transition-colors"
          >
            Ver todos os produtos
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {results.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </main>
  );
}
