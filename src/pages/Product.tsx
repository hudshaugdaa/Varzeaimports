import { useState, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { ChevronRight, ChevronLeft, ShoppingCart, Zap, Truck, Shield, RotateCcw, ShirtIcon, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getProductBySlug } from "@/data/products";
import { useCart } from "@/lib/cart";

export default function ProductPage() {
  const params = useParams<{ slug: string }>();
  const [, navigate] = useLocation();
  const { addItem } = useCart();
  const product = getProductBySlug(params.slug);

  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedImg, setSelectedImg] = useState(0);
  const [direction, setDirection] = useState(1);
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});
  const [sizeError, setSizeError] = useState(false);
  const [added, setAdded] = useState(false);

  const goTo = useCallback((idx: number) => {
    if (!product) return;
    setDirection(idx > selectedImg ? 1 : -1);
    setSelectedImg(idx);
  }, [selectedImg, product]);

  const goPrev = useCallback(() => {
    if (!product) return;
    const next = selectedImg === 0 ? product.images.length - 1 : selectedImg - 1;
    setDirection(-1);
    setSelectedImg(next);
  }, [selectedImg, product]);

  const goNext = useCallback(() => {
    if (!product) return;
    const next = (selectedImg + 1) % product.images.length;
    setDirection(1);
    setSelectedImg(next);
  }, [selectedImg, product]);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold mb-4">Produto não encontrado</h1>
        <motion.button
          onClick={() => navigate("/")}
          whileTap={{ scale: 0.96 }}
          className="bg-black text-white px-6 py-3 font-bold uppercase text-sm hover:bg-gray-800 transition-colors"
        >
          Voltar ao início
        </motion.button>
      </div>
    );
  }

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const handleAddToCart = () => {
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      setSizeError(true);
      return;
    }
    addItem(product, selectedSize || undefined);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      setSizeError(true);
      return;
    }
    addItem(product, selectedSize || undefined);
    navigate("/carrinho");
  };

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? "100%" : "-100%", opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? "-100%" : "100%", opacity: 0 }),
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <nav className="flex items-center gap-1 text-xs text-gray-500 mb-6 flex-wrap">
        <button onClick={() => navigate("/")} className="hover:text-black transition-colors">Início</button>
        <ChevronRight className="w-3 h-3 flex-shrink-0" />
        <button onClick={() => navigate(`/categoria/${product.category}`)} className="hover:text-black transition-colors capitalize">
          {product.category === "camisas" ? "Camisas" : "Lançamentos"}
        </button>
        {product.subcategory && (
          <>
            <ChevronRight className="w-3 h-3 flex-shrink-0" />
            <button onClick={() => navigate(`/categoria/${product.category}/${product.subcategory}`)} className="hover:text-black transition-colors">
              Copa do Mundo
            </button>
          </>
        )}
        <ChevronRight className="w-3 h-3 flex-shrink-0" />
        <span className="text-black font-medium line-clamp-1">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        <div>
          {/* Main image carousel */}
          <div className="relative aspect-square bg-gray-50 border border-gray-200 mb-3 overflow-hidden">
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
              <motion.div
                key={selectedImg}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="absolute inset-0 flex items-center justify-center"
              >
                {imgErrors[selectedImg] ? (
                  <div className="flex flex-col items-center text-gray-300">
                    {product.category === "camisas"
                      ? <ShirtIcon className="w-24 h-24 text-gray-200" />
                      : <Package className="w-24 h-24 text-gray-200" />
                    }
                    <span className="text-sm mt-3 text-gray-400">{product.brand}</span>
                  </div>
                ) : (
                  <img
                    src={product.images[selectedImg]}
                    alt={`${product.name} — imagem ${selectedImg + 1}`}
                    onError={() => setImgErrors(e => ({ ...e, [selectedImg]: true }))}
                    className="w-full h-full object-contain p-4"
                    draggable={false}
                  />
                )}
              </motion.div>
            </AnimatePresence>

            {/* Prev / Next arrows (only when multiple images) */}
            {product.images.length > 1 && (
              <>
                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={goPrev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white border border-gray-300 shadow-sm flex items-center justify-center hover:bg-gray-100 transition-colors"
                  aria-label="Imagem anterior"
                >
                  <ChevronLeft className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={goNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white border border-gray-300 shadow-sm flex items-center justify-center hover:bg-gray-100 transition-colors"
                  aria-label="Próxima imagem"
                >
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
                {/* Dot indicators */}
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
                  {product.images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => goTo(i)}
                      className={`w-2 h-2 rounded-full transition-all duration-200 ${
                        i === selectedImg ? "bg-black w-5" : "bg-gray-400 hover:bg-gray-600"
                      }`}
                      aria-label={`Ver imagem ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Image counter */}
            {product.images.length > 1 && (
              <div className="absolute top-3 right-3 bg-black/60 text-white text-xs font-medium px-2 py-0.5 rounded-full z-10">
                {selectedImg + 1}/{product.images.length}
              </div>
            )}
          </div>

          {/* Thumbnail strip */}
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <motion.button
                  key={idx}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => goTo(idx)}
                  className={`flex-shrink-0 w-16 h-16 border-2 bg-gray-50 overflow-hidden transition-all duration-200 ${
                    selectedImg === idx ? "border-black" : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  {imgErrors[idx] ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <ShirtIcon className="w-6 h-6 text-gray-300" />
                    </div>
                  ) : (
                    <img
                      src={img}
                      alt={`Miniatura ${idx + 1}`}
                      onError={() => setImgErrors(e => ({ ...e, [idx]: true }))}
                      className="w-full h-full object-contain p-1"
                    />
                  )}
                </motion.button>
              ))}
            </div>
          )}
        </div>

        <div>
          {product.badge && (
            <div className="inline-block bg-black text-white text-xs font-bold px-2 py-0.5 uppercase tracking-wide mb-3">
              {product.badge}
            </div>
          )}
          <p className="text-sm text-gray-500 uppercase font-medium mb-1">{product.brand}</p>
          <h1 className="text-xl sm:text-2xl font-black leading-tight mb-4">{product.name}</h1>

          <div className="mb-6">
            {product.originalPrice && (
              <div className="flex items-center gap-2 mb-1">
                <span className="text-gray-400 line-through text-sm">
                  R$ {product.originalPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
                {discount && (
                  <span className="bg-green-600 text-white text-xs font-bold px-1.5 py-0.5">-{discount}%</span>
                )}
              </div>
            )}
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black">
                R$ {product.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <p className="text-gray-500 text-sm mt-1">no PIX — sem juros</p>
            {product.originalPrice && (
              <p className="text-green-600 font-semibold text-sm mt-1">
                Você economiza R$ {(product.originalPrice - product.price).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            )}
          </div>

          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm uppercase tracking-wide">Tamanho</span>
                {sizeError && <span className="text-red-500 text-xs font-medium">Selecione um tamanho</span>}
              </div>
              <div className="flex gap-2 flex-wrap">
                {product.sizes.map((size) => (
                  <motion.button
                    key={size}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => { setSelectedSize(size); setSizeError(false); }}
                    className={`min-w-[44px] h-11 px-3 border-2 text-sm font-bold transition-all duration-200 ${
                      selectedSize === size
                        ? "border-black bg-black text-white"
                        : sizeError
                        ? "border-red-300 hover:border-black"
                        : "border-gray-300 hover:border-black"
                    }`}
                  >
                    {size}
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3 mb-8">
            <motion.button
              onClick={handleBuyNow}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="w-full flex items-center justify-center gap-2 bg-black text-white py-4 font-bold uppercase tracking-wide text-sm hover:bg-gray-800 transition-colors"
            >
              <Zap className="w-4 h-4" />
              Comprar agora
            </motion.button>
            <motion.button
              onClick={handleAddToCart}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className={`w-full flex items-center justify-center gap-2 border-2 py-4 font-bold uppercase tracking-wide text-sm transition-all duration-300 ${
                added ? "border-green-600 bg-green-600 text-white" : "border-black text-black hover:bg-gray-100"
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              {added ? "Adicionado ao carrinho!" : "Adicionar ao carrinho"}
            </motion.button>
          </div>

          <div className="border border-gray-200 divide-y divide-gray-200">
            {[
              { icon: Truck, text: "Frete grátis para todo o Brasil" },
              { icon: Shield, text: "Pagamento seguro via PIX" },
              { icon: RotateCcw, text: "Entrega em até 3 dias úteis" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 px-4 py-3">
                <Icon className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span className="text-sm text-gray-700">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-12 border-t border-gray-200 pt-8">
        <h2 className="text-lg font-black uppercase tracking-tight mb-4">Descrição do Produto</h2>
        <p className="text-gray-600 leading-relaxed">{product.description}</p>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between border-b border-gray-100 py-2">
            <span className="text-gray-500">Marca</span>
            <span className="font-medium">{product.brand}</span>
          </div>
          <div className="flex justify-between border-b border-gray-100 py-2">
            <span className="text-gray-500">Categoria</span>
            <span className="font-medium capitalize">
              {product.category === "camisas" ? "Camisas" : "Lançamentos"}
            </span>
          </div>
          {product.subcategory && (
            <div className="flex justify-between border-b border-gray-100 py-2">
              <span className="text-gray-500">Subcategoria</span>
              <span className="font-medium">Copa do Mundo 2026</span>
            </div>
          )}
          <div className="flex justify-between border-b border-gray-100 py-2">
            <span className="text-gray-500">Disponibilidade</span>
            <span className="font-medium text-green-600">Em estoque</span>
          </div>
        </div>
      </div>
    </main>
  );
}
