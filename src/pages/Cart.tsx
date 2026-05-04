import { useState } from "react";
import { useLocation } from "wouter";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Truck, ShieldCheck, ShirtIcon, Package } from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "@/lib/cart";

export default function Cart() {
  const [, navigate] = useLocation();
  const { items, removeItem, updateQuantity, totalPrice, totalItems } = useCart();
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  if (items.length === 0) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center">
        <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h1 className="text-2xl font-black uppercase tracking-tighter mb-2">Carrinho vazio</h1>
        <p className="text-gray-500 mb-8">Você ainda não adicionou nenhum produto.</p>
        <motion.button
          onClick={() => navigate("/")}
          whileTap={{ scale: 0.96 }}
          className="bg-black text-white px-8 py-3 font-bold uppercase tracking-wide text-sm hover:bg-gray-800 transition-colors"
        >
          Continuar comprando
        </motion.button>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter mb-8">
        Carrinho ({totalItems} {totalItems === 1 ? "item" : "itens"})
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item, i) => {
            const key = `${item.product.id}-${item.size || ""}`;
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.35, delay: i * 0.06 }}
                className="flex gap-4 border border-gray-200 p-4"
              >
                <div
                  className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-50 flex-shrink-0 border border-gray-100 cursor-pointer overflow-hidden"
                  onClick={() => navigate(`/produto/${item.product.slug}`)}
                >
                  {imgErrors[key] ? (
                    <div className="w-full h-full flex items-center justify-center">
                      {item.product.category === "camisas"
                        ? <ShirtIcon className="w-10 h-10 text-gray-200" />
                        : <Package className="w-10 h-10 text-gray-200" />
                      }
                    </div>
                  ) : (
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      onError={() => setImgErrors((e) => ({ ...e, [key]: true }))}
                      className="w-full h-full object-contain p-1 hover:scale-105 transition-transform duration-300"
                    />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3
                    className="font-semibold text-sm leading-tight mb-1 cursor-pointer hover:underline line-clamp-2"
                    onClick={() => navigate(`/produto/${item.product.slug}`)}
                  >
                    {item.product.name}
                  </h3>
                  <p className="text-xs text-gray-500 mb-1">{item.product.brand}</p>
                  {item.size && (
                    <p className="text-xs text-gray-500 mb-2">Tamanho: <span className="font-semibold">{item.size}</span></p>
                  )}
                  <p className="font-black text-base">
                    R$ {item.product.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>

                <div className="flex flex-col items-end justify-between">
                  <motion.button
                    onClick={() => removeItem(item.product.id, item.size)}
                    whileTap={{ scale: 0.85 }}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                  <div className="flex items-center border border-gray-300">
                    <motion.button
                      whileTap={{ scale: 0.85, backgroundColor: "#f3f4f6" }}
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.size)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </motion.button>
                    <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                    <motion.button
                      whileTap={{ scale: 0.85, backgroundColor: "#f3f4f6" }}
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.size)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </motion.button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Total: R$ {(item.product.price * item.quantity).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </motion.div>
            );
          })}

          <motion.button
            onClick={() => navigate("/")}
            whileTap={{ scale: 0.97 }}
            className="text-sm font-semibold uppercase tracking-wide flex items-center gap-1 text-gray-600 hover:text-black transition-colors pt-2"
          >
            Continuar comprando
          </motion.button>
        </div>

        <div>
          <div className="border border-gray-200 p-6 sticky top-24">
            <h2 className="font-black text-lg uppercase tracking-tight mb-4">Resumo do pedido</h2>
            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div key={`${item.product.id}-${item.size}`} className="flex justify-between text-sm">
                  <span className="text-gray-600 line-clamp-1 flex-1 mr-2">
                    {item.product.name.split(" ").slice(0, 3).join(" ")}
                    {item.size ? ` (${item.size})` : ""} x{item.quantity}
                  </span>
                  <span className="font-medium flex-shrink-0">
                    R$ {(item.product.price * item.quantity).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span>R$ {totalPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-sm text-green-600 font-medium">
                <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5" />Frete</span>
                <span>GRATIS</span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between font-black text-lg">
                <span>Total</span>
                <span>R$ {totalPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
              </div>
              <p className="text-xs text-gray-500">no PIX</p>
            </div>
            <motion.button
              onClick={() => navigate("/checkout")}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="w-full mt-6 bg-black text-white py-4 font-bold uppercase tracking-wide text-sm flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
            >
              Comprar agora <ArrowRight className="w-4 h-4" />
            </motion.button>
            <div className="mt-4 flex items-center gap-2 justify-center text-xs text-gray-500">
              <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
              Pagamento 100% seguro via PIX
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
