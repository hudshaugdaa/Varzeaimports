import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import {
  Check,
  Copy,
  Loader2,
  ChevronRight,
  Clock,
  Truck,
  User,
  MapPin,
  QrCode,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/lib/cart";
import {
  formatCPF,
  formatPhone,
  formatCEP,
  validateCPF,
  validateEmail,
  validateName,
  validatePhone,
} from "@/lib/validators";
import { fetchCEP } from "@/lib/viacep";
import { createPixTransaction, getTransaction, PushinPayTransaction } from "@/lib/pushinpay";

type Step = 1 | 2 | 3 | 4;

interface PersonalData {
  name: string;
  phone: string;
  cpf: string;
  email: string;
}

interface AddressData {
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
}

const STEPS = [
  { id: 1, label: "Produtos", icon: ShieldCheck },
  { id: 2, label: "Dados", icon: User },
  { id: 3, label: "Endereço", icon: MapPin },
  { id: 4, label: "Pagamento", icon: QrCode },
];

const stepVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
};

export default function Checkout() {
  const [, navigate] = useLocation();
  const { items, totalPrice, clearCart } = useCart();
  const [step, setStep] = useState<Step>(1);
  const [direction, setDirection] = useState(1);

  const [personal, setPersonal] = useState<PersonalData>({ name: "", phone: "", cpf: "", email: "" });
  const [personalErrors, setPersonalErrors] = useState<Partial<PersonalData>>({});

  const [address, setAddress] = useState<AddressData>({
    cep: "", logradouro: "", numero: "", complemento: "", bairro: "", cidade: "", estado: "",
  });
  const [addressErrors, setAddressErrors] = useState<Partial<AddressData>>({});
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState("");
  const [cepFilled, setCepFilled] = useState(false);

  const [transaction, setTransaction] = useState<PushinPayTransaction | null>(null);
  const [pixLoading, setPixLoading] = useState(false);
  const [pixError, setPixError] = useState("");
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3600);
  const [checking, setChecking] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const checkRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (items.length === 0) navigate("/");
  }, [items]);

  useEffect(() => {
    if (step === 4 && transaction) {
      timerRef.current = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
      checkRef.current = setInterval(async () => {
        try {
          const updated = await getTransaction(transaction.id);
          setTransaction(updated);
          if (updated.status === "paid") {
            if (timerRef.current) clearInterval(timerRef.current);
            if (checkRef.current) clearInterval(checkRef.current);
            clearCart();
            navigate("/sucesso");
          }
        } catch {}
      }, 10000);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (checkRef.current) clearInterval(checkRef.current);
      };
    }
    return undefined;
  }, [step, transaction]);

  const goToStep = (next: Step) => {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const validatePersonal = () => {
    const errors: Partial<PersonalData> = {};
    if (!validateName(personal.name)) errors.name = "Digite nome e sobrenome completos";
    if (!validatePhone(personal.phone)) errors.phone = "Telefone inválido";
    if (!validateCPF(personal.cpf)) errors.cpf = "CPF inválido";
    if (!validateEmail(personal.email)) errors.email = "Email inválido";
    setPersonalErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateAddress = () => {
    const errors: Partial<AddressData> = {};
    const cleanedCep = address.cep.replace(/\D/g, "");
    if (cleanedCep.length !== 8) errors.cep = "CEP inválido";
    if (!address.logradouro) errors.logradouro = "Endereço obrigatório";
    if (!address.numero) errors.numero = "Número obrigatório";
    if (!address.cidade) errors.cidade = "Cidade obrigatória";
    if (!address.estado) errors.estado = "Estado obrigatório";
    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCepChange = async (value: string) => {
    const formatted = formatCEP(value);
    setAddress((a) => ({ ...a, cep: formatted }));
    const cleaned = formatted.replace(/\D/g, "");
    if (cleaned.length === 8) {
      setCepLoading(true);
      setCepError("");
      setCepFilled(false);
      const result = await fetchCEP(cleaned);
      setCepLoading(false);
      if (result) {
        setCepFilled(true);
        setAddress((a) => ({
          ...a,
          logradouro: result.logradouro,
          bairro: result.bairro,
          cidade: result.localidade,
          estado: result.uf,
          complemento: result.complemento || a.complemento,
        }));
      } else {
        setCepError("CEP não encontrado. Preencha manualmente.");
      }
    }
  };

  const PIX_MAX = 150;
  const pixLimitExceeded = totalPrice > PIX_MAX;

  const handleGeneratePix = async () => {
    if (pixLimitExceeded) {
      setPixError(`Valor máximo por pedido via PIX é R$ ${PIX_MAX.toFixed(2).replace(".", ",")}. Volte ao carrinho e remova alguns itens para prosseguir.`);
      return;
    }
    setPixLoading(true);
    setPixError("");
    try {
      const ref = typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("ref") || sessionStorage.getItem("affiliateRef") || undefined
        : undefined;
      const tx = await createPixTransaction({
        amount: totalPrice,
        customer: { name: personal.name, cpf: personal.cpf, email: personal.email, phone: personal.phone },
        items: items.map(i => ({
          id: i.product.id,
          name: i.product.name,
          price: i.product.price,
          size: i.size,
          quantity: i.quantity,
          image: i.product.image,
        })),
        address: {
          cep: address.cep,
          logradouro: address.logradouro,
          numero: address.numero,
          complemento: address.complemento,
          bairro: address.bairro,
          cidade: address.cidade,
          estado: address.estado,
        },
        affiliateRef: ref,
      });
      setTransaction(tx);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro ao gerar PIX";
      if (msg.startsWith("LIMIT_EXCEEDED:")) {
        setPixError(msg.replace("LIMIT_EXCEEDED:", ""));
      } else {
        setPixError(msg + ". Tente novamente.");
      }
    } finally {
      setPixLoading(false);
    }
  };

  const handleCopy = () => {
    if (transaction?.qr_code) {
      navigator.clipboard.writeText(transaction.qr_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCheckPayment = async () => {
    if (!transaction) return;
    setChecking(true);
    try {
      const updated = await getTransaction(transaction.id);
      setTransaction(updated);
      if (updated.status === "paid") { clearCart(); navigate("/sucesso"); }
    } catch {}
    setChecking(false);
  };

  const cpfValid = validateCPF(personal.cpf);
  const cpfHasContent = personal.cpf.replace(/\D/g, "").length >= 11;

  if (items.length === 0) return null;

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter mb-8">Finalizar Compra</h1>

      <div className="flex items-center mb-10 overflow-x-auto">
        {STEPS.map((s, idx) => (
          <div key={s.id} className="flex items-center flex-shrink-0">
            <div className="flex flex-col items-center">
              <motion.div
                animate={{
                  backgroundColor: step > s.id ? "#16a34a" : step === s.id ? "#000000" : "#e5e7eb",
                  scale: step === s.id ? 1.1 : 1,
                }}
                transition={{ duration: 0.3 }}
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                style={{ color: step >= s.id ? "#fff" : "#6b7280" }}
              >
                {step > s.id ? <Check className="w-4 h-4" /> : s.id}
              </motion.div>
              <span className={`text-xs mt-1 whitespace-nowrap transition-all ${step === s.id ? "font-bold" : "text-gray-500"}`}>
                {s.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <motion.div
                animate={{ backgroundColor: step > s.id ? "#16a34a" : "#e5e7eb" }}
                transition={{ duration: 0.4 }}
                className="h-0.5 w-8 sm:w-16 mx-1 mb-4"
              />
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.45, ease: "easeInOut" }}
            >

              {step === 1 && (
                <div>
                  <h2 className="text-xl font-black uppercase mb-4">Seus produtos</h2>
                  <div className="space-y-3 mb-6">
                    {items.map((item) => (
                      <motion.div
                        key={`${item.product.id}-${item.size}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-3 border border-gray-200 p-3"
                      >
                        <div className="w-16 h-16 bg-gray-50 flex-shrink-0">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-full h-full object-contain p-1"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold line-clamp-2">{item.product.name}</p>
                          {item.size && <p className="text-xs text-gray-500">Tam: {item.size}</p>}
                          <p className="text-sm font-black mt-1">
                            {item.quantity}x R$ {item.product.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                        <p className="font-black text-sm flex-shrink-0">
                          R$ {(item.product.price * item.quantity).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => navigate("/carrinho")} className="flex-1 border border-gray-300 py-3 text-sm font-bold uppercase tracking-wide hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                      <ArrowLeft className="w-4 h-4" /> Carrinho
                    </button>
                    <button onClick={() => goToStep(2)} className="flex-1 bg-black text-white py-3 text-sm font-bold uppercase tracking-wide hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
                      Continuar <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h2 className="text-xl font-black uppercase mb-4">Seus dados</h2>
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wide mb-1">Nome completo *</label>
                      <input
                        type="text"
                        value={personal.name}
                        onChange={(e) => setPersonal((p) => ({ ...p, name: e.target.value }))}
                        placeholder="João da Silva"
                        className={`w-full border py-3 px-4 text-sm focus:outline-none focus:border-black transition-colors ${personalErrors.name ? "border-red-500" : "border-gray-300"}`}
                      />
                      {personalErrors.name && (
                        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-xs mt-1">
                          {personalErrors.name}
                        </motion.p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wide mb-1">WhatsApp *</label>
                        <input
                          type="tel"
                          value={personal.phone}
                          onChange={(e) => setPersonal((p) => ({ ...p, phone: formatPhone(e.target.value) }))}
                          placeholder="(11) 99999-9999"
                          className={`w-full border py-3 px-4 text-sm focus:outline-none focus:border-black transition-colors ${personalErrors.phone ? "border-red-500" : "border-gray-300"}`}
                        />
                        {personalErrors.phone && (
                          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-xs mt-1">
                            {personalErrors.phone}
                          </motion.p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wide mb-1">CPF *</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={personal.cpf}
                            onChange={(e) => setPersonal((p) => ({ ...p, cpf: formatCPF(e.target.value) }))}
                            placeholder="000.000.000-00"
                            className={`w-full border py-3 px-4 pr-10 text-sm focus:outline-none transition-all duration-300 ${
                              personalErrors.cpf
                                ? "border-red-500 focus:border-red-500"
                                : cpfHasContent && cpfValid
                                ? "border-green-500 focus:border-green-500 bg-green-50"
                                : "border-gray-300 focus:border-black"
                            }`}
                          />
                          <AnimatePresence>
                            {cpfHasContent && cpfValid && (
                              <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                className="absolute right-3 top-3.5"
                              >
                                <Check className="w-4 h-4 text-green-500" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        {personalErrors.cpf && (
                          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-xs mt-1">
                            {personalErrors.cpf}
                          </motion.p>
                        )}
                        {cpfHasContent && cpfValid && !personalErrors.cpf && (
                          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-green-600 text-xs mt-1 font-medium">
                            CPF válido
                          </motion.p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wide mb-1">E-mail *</label>
                      <input
                        type="email"
                        value={personal.email}
                        onChange={(e) => setPersonal((p) => ({ ...p, email: e.target.value }))}
                        placeholder="seu@email.com"
                        className={`w-full border py-3 px-4 text-sm focus:outline-none focus:border-black transition-colors ${personalErrors.email ? "border-red-500" : "border-gray-300"}`}
                      />
                      {personalErrors.email && (
                        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-xs mt-1">
                          {personalErrors.email}
                        </motion.p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => goToStep(1)} className="flex-1 border border-gray-300 py-3 text-sm font-bold uppercase tracking-wide hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                      <ArrowLeft className="w-4 h-4" /> Voltar
                    </button>
                    <button
                      onClick={() => { if (validatePersonal()) goToStep(3); }}
                      className="flex-1 bg-black text-white py-3 text-sm font-bold uppercase tracking-wide hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                    >
                      Continuar <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <h2 className="text-xl font-black uppercase mb-4">Endereço de entrega</h2>
                  <div className="bg-green-50 border border-green-200 p-3 mb-4 flex items-center gap-2 text-sm text-green-700">
                    <Truck className="w-4 h-4 flex-shrink-0" />
                    Frete GRATIS — entrega em até 3 dias úteis
                  </div>
                  <div className="space-y-4 mb-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-1">
                        <label className="block text-xs font-bold uppercase tracking-wide mb-1">CEP *</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={address.cep}
                            onChange={(e) => handleCepChange(e.target.value)}
                            placeholder="00000-000"
                            maxLength={9}
                            className={`w-full border py-3 px-4 pr-10 text-sm focus:outline-none transition-all duration-300 ${
                              addressErrors.cep
                                ? "border-red-500 focus:border-red-500"
                                : cepFilled
                                ? "border-green-500 focus:border-green-500 bg-green-50"
                                : "border-gray-300 focus:border-black"
                            }`}
                          />
                          {cepLoading && <Loader2 className="absolute right-3 top-3.5 w-4 h-4 animate-spin text-gray-400" />}
                          {!cepLoading && cepFilled && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute right-3 top-3.5">
                              <Check className="w-4 h-4 text-green-500" />
                            </motion.div>
                          )}
                        </div>
                        {cepError && <p className="text-amber-600 text-xs mt-1">{cepError}</p>}
                        {addressErrors.cep && <p className="text-red-500 text-xs mt-1">{addressErrors.cep}</p>}
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold uppercase tracking-wide mb-1">Logradouro *</label>
                        <input
                          type="text"
                          value={address.logradouro}
                          onChange={(e) => setAddress((a) => ({ ...a, logradouro: e.target.value }))}
                          placeholder="Rua, Av, etc."
                          className={`w-full border py-3 px-4 text-sm focus:outline-none focus:border-black transition-colors ${addressErrors.logradouro ? "border-red-500" : "border-gray-300"}`}
                        />
                        {addressErrors.logradouro && <p className="text-red-500 text-xs mt-1">{addressErrors.logradouro}</p>}
                      </div>
                    </div>

                    <AnimatePresence>
                      {cepFilled && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <p className="text-green-600 text-xs font-medium mb-3 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Endereço preenchido automaticamente
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wide mb-1">Número *</label>
                        <input
                          type="text"
                          value={address.numero}
                          onChange={(e) => setAddress((a) => ({ ...a, numero: e.target.value }))}
                          placeholder="123"
                          className={`w-full border py-3 px-4 text-sm focus:outline-none focus:border-black transition-colors ${addressErrors.numero ? "border-red-500" : "border-gray-300"}`}
                        />
                        {addressErrors.numero && <p className="text-red-500 text-xs mt-1">{addressErrors.numero}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wide mb-1">Complemento</label>
                        <input
                          type="text"
                          value={address.complemento}
                          onChange={(e) => setAddress((a) => ({ ...a, complemento: e.target.value }))}
                          placeholder="Ap, Bloco..."
                          className="w-full border border-gray-300 py-3 px-4 text-sm focus:outline-none focus:border-black transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wide mb-1">Bairro</label>
                        <input
                          type="text"
                          value={address.bairro}
                          onChange={(e) => setAddress((a) => ({ ...a, bairro: e.target.value }))}
                          placeholder="Centro"
                          className="w-full border border-gray-300 py-3 px-4 text-sm focus:outline-none focus:border-black transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wide mb-1">Cidade *</label>
                        <input
                          type="text"
                          value={address.cidade}
                          onChange={(e) => setAddress((a) => ({ ...a, cidade: e.target.value }))}
                          placeholder="São Paulo"
                          className={`w-full border py-3 px-4 text-sm focus:outline-none focus:border-black transition-colors ${addressErrors.cidade ? "border-red-500" : "border-gray-300"}`}
                        />
                        {addressErrors.cidade && <p className="text-red-500 text-xs mt-1">{addressErrors.cidade}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wide mb-1">Estado *</label>
                        <input
                          type="text"
                          value={address.estado}
                          onChange={(e) => setAddress((a) => ({ ...a, estado: e.target.value.toUpperCase().slice(0, 2) }))}
                          placeholder="SP"
                          maxLength={2}
                          className={`w-full border py-3 px-4 text-sm focus:outline-none focus:border-black transition-colors ${addressErrors.estado ? "border-red-500" : "border-gray-300"}`}
                        />
                        {addressErrors.estado && <p className="text-red-500 text-xs mt-1">{addressErrors.estado}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => goToStep(2)} className="flex-1 border border-gray-300 py-3 text-sm font-bold uppercase tracking-wide hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                      <ArrowLeft className="w-4 h-4" /> Voltar
                    </button>
                    <button
                      onClick={() => {
                        if (validateAddress()) {
                          goToStep(4);
                          handleGeneratePix();
                        }
                      }}
                      className="flex-1 bg-black text-white py-3 text-sm font-bold uppercase tracking-wide hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                    >
                      Ir para pagamento <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div>
                  <h2 className="text-xl font-black uppercase mb-4">Pagamento via PIX</h2>

                  {pixLoading && !transaction && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center py-16 gap-4"
                    >
                      <Loader2 className="w-10 h-10 animate-spin text-gray-400" />
                      <p className="text-gray-500 text-sm">Gerando seu PIX...</p>
                    </motion.div>
                  )}

                  {pixError && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 border border-red-200 p-4 mb-4">
                      <p className="text-red-700 text-sm font-medium">{pixError}</p>
                      <button
                        onClick={handleGeneratePix}
                        disabled={pixLoading}
                        className="mt-3 bg-black text-white px-4 py-2 text-sm font-bold uppercase hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {pixLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                        Tentar novamente
                      </button>
                    </motion.div>
                  )}

                  {transaction && (
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-4">
                      <div className="bg-amber-50 border border-amber-200 p-3 flex items-center gap-2 text-sm text-amber-700">
                        <Clock className="w-4 h-4 flex-shrink-0" />
                        <span>PIX válido por <strong>{formatTime(timeLeft)}</strong>. Pague antes de expirar!</span>
                      </div>

                      {transaction.qr_code_base64 && (
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }} className="border border-gray-200 p-4 text-center">
                          <p className="text-sm font-bold uppercase tracking-wide mb-3 flex items-center justify-center gap-2">
                            <QrCode className="w-4 h-4" /> QR Code PIX
                          </p>
                          <img
                            src={transaction.qr_code_base64}
                            alt="QR Code PIX"
                            className="mx-auto max-w-48 w-full"
                          />
                        </motion.div>
                      )}

                      {transaction.qr_code && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="border border-gray-200 p-4">
                          <p className="text-sm font-bold uppercase tracking-wide mb-2">PIX Copia e Cola</p>
                          <p className="text-xs text-gray-500 mb-3">
                            Total: <strong className="text-black">R$ {totalPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
                          </p>
                          <div className="bg-gray-50 border border-gray-200 p-3 mb-3 font-mono text-xs break-all text-gray-700">
                            {transaction.qr_code}
                          </div>
                          <button
                            onClick={handleCopy}
                            className={`w-full flex items-center justify-center gap-2 py-3 font-bold uppercase tracking-wide text-sm transition-all duration-300 ${
                              copied ? "bg-green-600 text-white" : "bg-black text-white hover:bg-gray-800"
                            }`}
                          >
                            {copied ? <><Check className="w-4 h-4" /> Copiado!</> : <><Copy className="w-4 h-4" /> Copiar código PIX</>}
                          </button>
                        </motion.div>
                      )}

                      <div className="bg-gray-50 border border-gray-200 p-4 text-sm">
                        <p className="font-bold mb-2">Como pagar com PIX:</p>
                        <ol className="space-y-1 text-gray-600 list-decimal list-inside">
                          <li>Abra o app do seu banco</li>
                          <li>Escolha pagar via PIX Copia e Cola</li>
                          <li>Cole o código acima e confirme</li>
                          <li>O pagamento é confirmado na hora!</li>
                        </ol>
                      </div>

                      <button
                        onClick={handleCheckPayment}
                        disabled={checking}
                        className="w-full border-2 border-black py-3 text-sm font-bold uppercase tracking-wide hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                      >
                        {checking ? <><Loader2 className="w-4 h-4 animate-spin" /> Verificando...</> : "Ja paguei — Verificar pagamento"}
                      </button>
                    </motion.div>
                  )}

                  <button onClick={() => goToStep(3)} className="mt-4 text-sm text-gray-500 hover:text-black transition-colors flex items-center gap-1">
                    <ArrowLeft className="w-3 h-3" /> Voltar
                  </button>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

        <div>
          <div className="border border-gray-200 p-5 sticky top-24">
            <h3 className="font-black text-sm uppercase tracking-tight mb-4">Resumo</h3>
            <div className="space-y-2 text-sm mb-4">
              {items.map((item) => (
                <div key={`${item.product.id}-${item.size}`} className="flex justify-between gap-2">
                  <span className="text-gray-600 line-clamp-1 flex-1">
                    {item.product.name.split(" ").slice(0, 3).join(" ")} x{item.quantity}
                  </span>
                  <span className="font-medium flex-shrink-0">
                    R$ {(item.product.price * item.quantity).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-green-600 font-medium">
                <span className="flex items-center gap-1"><Truck className="w-3 h-3" /> Frete</span>
                <span>GRATIS</span>
              </div>
              <div className="flex justify-between font-black text-base">
                <span>Total</span>
                <span>R$ {totalPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
              </div>
              <p className="text-xs text-gray-500">no PIX</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
