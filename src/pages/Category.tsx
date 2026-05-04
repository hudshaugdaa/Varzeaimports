import { useParams } from "wouter";
import { ChevronRight, PackageX } from "lucide-react";
import { useLocation } from "wouter";
import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";

export default function Category() {
  const params = useParams<{ category: string; subcategory?: string }>();
  const [, navigate] = useLocation();

  const { category, subcategory } = params;

  let filtered = products;
  let title = "";
  let breadcrumb: { label: string; href?: string }[] = [{ label: "Início", href: "/" }];

  if (subcategory) {
    filtered = products.filter(
      (p) => p.category === category && p.subcategory === subcategory
    );
    const subLabel = subcategory === "copa-do-mundo" ? "Copa do Mundo" : subcategory;
    const catLabel = category === "lancamentos" ? "Lançamentos" : category;
    title = subLabel;
    breadcrumb = [
      { label: "Início", href: "/" },
      { label: catLabel, href: `/categoria/${category}` },
      { label: subLabel },
    ];
  } else {
    filtered = products.filter((p) => p.category === category);
    const catLabel =
      category === "camisas"
        ? "Camisas"
        : category === "lancamentos"
        ? "Lançamentos"
        : category;
    title = catLabel;
    breadcrumb = [
      { label: "Início", href: "/" },
      { label: catLabel },
    ];
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <nav className="flex items-center gap-1 text-xs text-gray-500 mb-6">
        {breadcrumb.map((b, i) => (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="w-3 h-3" />}
            {b.href ? (
              <button onClick={() => navigate(b.href!)} className="hover:text-black transition-colors">
                {b.label}
              </button>
            ) : (
              <span className="text-black font-medium">{b.label}</span>
            )}
          </span>
        ))}
      </nav>

      <div className="mb-8 border-b border-gray-200 pb-6">
        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter">{title}</h1>
        <p className="text-gray-500 text-sm mt-2">
          {filtered.length} produto{filtered.length !== 1 ? "s" : ""} encontrado
          {filtered.length !== 1 ? "s" : ""}
          {category === "camisas" && " — todos por R$ 89,90"}
        </p>
      </div>

      {category === "lancamentos" && !subcategory && (
        <div className="flex gap-3 mb-8 flex-wrap">
          <button
            onClick={() => navigate("/categoria/lancamentos/copa-do-mundo")}
            className="border border-black px-4 py-2 text-sm font-semibold uppercase tracking-wide hover:bg-black hover:text-white transition-colors"
          >
            Copa do Mundo
          </button>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <PackageX className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">Nenhum produto encontrado nesta categoria.</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 bg-black text-white px-6 py-2 text-sm font-bold uppercase tracking-wide hover:bg-gray-800 transition-colors"
          >
            Voltar ao início
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </main>
  );
}
