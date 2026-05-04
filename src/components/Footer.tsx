import { useLocation } from "wouter";
import { CheckCircle } from "lucide-react";

export default function Footer() {
  const [, navigate] = useLocation();

  return (
    <footer className="bg-black text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          <div>
            <div className="flex flex-col leading-tight mb-4">
              <span className="text-2xl font-black tracking-tighter uppercase">VARZEA</span>
              <span className="text-xs font-semibold tracking-widest text-gray-400 uppercase -mt-1">IMPORTS</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Os melhores produtos do futebol mundial com entrega rápida e segura para todo o Brasil.
            </p>
          </div>

          <div>
            <h3 className="font-bold uppercase text-xs tracking-widest mb-4 text-gray-300">Categorias</h3>
            <ul className="space-y-2">
              <li>
                <button onClick={() => navigate("/categoria/camisas")} className="text-gray-400 hover:text-white text-sm transition-colors">
                  Camisas
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/categoria/lancamentos/copa-do-mundo")} className="text-gray-400 hover:text-white text-sm transition-colors">
                  Copa do Mundo 2026
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold uppercase text-xs tracking-widest mb-4 text-gray-300">Informações</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />Frete Grátis para Todo o Brasil</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />Entrega em até 3 dias úteis</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />Pagamento via PIX</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />Produtos Originais</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 text-center text-gray-500 text-xs">
          © {new Date().getFullYear()} Varzea Imports. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
