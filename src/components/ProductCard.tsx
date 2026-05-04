import { useState } from "react";
import { useLocation } from "wouter";
import { ShoppingCart, ShirtIcon, Package, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Product } from "@/data/products";
import { useCart } from "@/lib/cart";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [, navigate] = useLocation();
  const { addItem } = useCart();
  const [imgError, setImgError] = useState(false);
  const [added, setAdded] = useState(false);

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product, product.sizes?.[2]);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <motion.div
      onClick={() => navigate(`/produto/${product.slug}`)}
      className="group cursor-pointer bg-white border border-gray-200 hover:border-black transition-colors duration-300 flex flex-col"
      whileHover={{ y: -3, boxShadow: "0 8px 24px rgba(0,0,0,0.10)" }}
      transition={{ duration: 0.25 }}
    >
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        {product.badge && (
          <div className="absolute top-2 left-2 z-10 bg-black text-white text-xs font-bold px-2 py-0.5 uppercase tracking-wide">
            {product.badge}
          </div>
        )}
        {discount && (
          <div className="absolute top-2 right-2 z-10 bg-green-600 text-white text-xs font-bold px-2 py-0.5">
            -{discount}%
          </div>
        )}
        {imgError ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-200">
            {product.category === "camisas"
              ? <ShirtIcon className="w-16 h-16" />
              : <Package className="w-16 h-16" />
            }
            <span className="text-xs mt-2 text-gray-400">{product.brand}</span>
          </div>
        ) : (
          <img
            src={product.image}
            alt={product.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 p-2"
            loading="lazy"
          />
        )}
      </div>

      <div className="p-3 flex flex-col flex-1">
        <p className="text-xs text-gray-400 uppercase font-medium mb-1">{product.brand}</p>
        <h3 className="text-sm font-semibold leading-tight line-clamp-2 mb-2 flex-1">{product.name}</h3>

        <div className="mt-auto">
          {product.originalPrice && (
            <p className="text-xs text-gray-400 line-through mb-0.5">
              R$ {product.originalPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          )}
          <p className="text-lg font-black text-black">
            R$ {product.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-500 mb-3">no PIX</p>

          <motion.button
            onClick={handleAddToCart}
            whileTap={{ scale: 0.94 }}
            transition={{ duration: 0.15 }}
            className={`w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold uppercase tracking-wide transition-colors duration-300 ${
              added ? "bg-green-600 text-white" : "bg-black text-white hover:bg-gray-800"
            }`}
          >
            {added ? (
              <>
                <CheckCircle className="w-3.5 h-3.5" />
                Adicionado!
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                Adicionar ao carrinho
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
