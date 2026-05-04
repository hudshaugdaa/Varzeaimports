import { useLocation } from "wouter";
import { ChevronRight, Truck, Zap, Lock, BadgeCheck } from "lucide-react";
import { motion } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";

export default function Home() {
  const [, navigate] = useLocation();

  const camisas = products.filter((p) => p.category === "camisas");
  const lancamentos = products.filter((p) => p.category === "lancamentos");

  return (
    <main>
      <section className="bg-black text-white py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block bg-green-600 text-white text-xs font-bold px-3 py-1 uppercase tracking-widest mb-4">
              Copa do Mundo 2026
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter mb-4 leading-none">
              Vista as Cores<br />do Mundo
            </h1>
            <p className="text-gray-400 text-sm sm:text-base mb-8 max-w-lg mx-auto">
              Camisas das seleções e produtos oficiais com frete grátis para todo o Brasil.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <motion.button
              onClick={() => navigate("/categoria/camisas")}
              whileTap={{ scale: 0.96 }}
              className="bg-white text-black font-bold px-8 py-3 uppercase tracking-wide hover:bg-gray-200 transition-colors text-sm"
            >
              Ver Camisas
            </motion.button>
            <motion.button
              onClick={() => navigate("/categoria/lancamentos/copa-do-mundo")}
              whileTap={{ scale: 0.96 }}
              className="border border-white text-white font-bold px-8 py-3 uppercase tracking-wide hover:bg-white hover:text-black transition-colors text-sm"
            >
              Lancamentos Copa 2026
            </motion.button>
          </motion.div>
        </div>
      </section>

      <section className="border-b border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 divide-x divide-gray-200">
            <motion.button
              onClick={() => navigate("/categoria/camisas")}
              whileTap={{ scale: 0.98, backgroundColor: "#fff" }}
              className="flex items-center justify-between py-4 px-4 hover:bg-white transition-colors group"
            >
              <span className="font-bold uppercase text-sm tracking-wide">Camisas das Seleções</span>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform duration-300" />
            </motion.button>
            <motion.button
              onClick={() => navigate("/categoria/lancamentos/copa-do-mundo")}
              whileTap={{ scale: 0.98, backgroundColor: "#fff" }}
              className="flex items-center justify-between py-4 px-4 hover:bg-white transition-colors group"
            >
              <span className="font-bold uppercase text-sm tracking-wide">Copa do Mundo 2026</span>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform duration-300" />
            </motion.button>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter">Camisas</h2>
            <p className="text-gray-500 text-sm mt-1">Seleções oficiais — R$ 89,90 cada</p>
          </div>
          <motion.button
            onClick={() => navigate("/categoria/camisas")}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1 text-sm font-semibold uppercase tracking-wide hover:text-gray-500 transition-colors"
          >
            Ver todas <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {camisas.slice(0, 4).map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <ProductCard product={p} />
            </motion.div>
          ))}
        </div>
      </section>

      <section className="bg-black text-white py-12 sm:py-16 my-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <span className="text-green-400 font-bold text-xs uppercase tracking-widest">Novidade</span>
          <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tighter mt-2 mb-4">
            Lancamentos Copa do Mundo 2026
          </h2>
          <p className="text-gray-400 text-sm mb-6">
            Albums, envelopes, bolas e muito mais com os melhores precos.
          </p>
          <motion.button
            onClick={() => navigate("/categoria/lancamentos/copa-do-mundo")}
            whileTap={{ scale: 0.96 }}
            className="bg-white text-black font-bold px-8 py-3 uppercase tracking-wide hover:bg-gray-200 transition-colors text-sm"
          >
            Ver Lancamentos
          </motion.button>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter">Lancamentos</h2>
            <p className="text-gray-500 text-sm mt-1">Copa do Mundo 2026</p>
          </div>
          <motion.button
            onClick={() => navigate("/categoria/lancamentos/copa-do-mundo")}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1 text-sm font-semibold uppercase tracking-wide hover:text-gray-500 transition-colors"
          >
            Ver todos <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {lancamentos.slice(0, 4).map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <ProductCard product={p} />
            </motion.div>
          ))}
        </div>
      </section>

      <section className="border-t border-gray-200 bg-gray-50 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { icon: Truck, title: "Frete Grátis", desc: "Para todo o Brasil" },
              { icon: Zap, title: "Entrega Rápida", desc: "Chega em até 3 dias" },
              { icon: Lock, title: "Pagamento Seguro", desc: "PIX protegido" },
              { icon: BadgeCheck, title: "100% Original", desc: "Produtos oficiais" },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                className="flex flex-col items-center gap-2"
              >
                <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center">
                  <item.icon className="w-5 h-5" />
                </div>
                <p className="font-bold text-sm uppercase tracking-wide">{item.title}</p>
                <p className="text-gray-500 text-xs">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
