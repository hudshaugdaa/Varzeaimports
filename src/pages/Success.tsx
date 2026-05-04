import { useLocation } from "wouter";
import { CheckCircle, Package, Truck, Home } from "lucide-react";

export default function Success() {
  const [, navigate] = useLocation();

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
      </div>

      <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter mb-3">
        Pagamento Confirmado!
      </h1>
      <p className="text-gray-600 mb-8 text-sm sm:text-base">
        Obrigado pela sua compra na Varzea Imports!<br />
        Seu pedido foi confirmado e está sendo preparado.
      </p>

      <div className="bg-gray-50 border border-gray-200 p-6 mb-8 text-left">
        <h2 className="font-black uppercase text-sm tracking-wide mb-5 text-center">Acompanhe seu pedido</h2>
        <div className="space-y-4">
          {[
            { icon: CheckCircle, label: "Pedido confirmado", desc: "Seu pagamento PIX foi processado com sucesso.", done: true },
            { icon: Package, label: "Em preparação", desc: "Seu pedido está sendo separado e embalado.", done: true },
            { icon: Truck, label: "A caminho", desc: "Enviaremos o código de rastreio por e-mail.", done: false },
            { icon: Home, label: "Entregue em até 5 dias", desc: "Chega direto na sua porta, com frete grátis!", done: false },
          ].map((item, idx) => (
            <div key={idx} className="flex gap-4 items-start">
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${item.done ? "bg-green-600" : "bg-gray-200"}`}>
                <item.icon className={`w-4 h-4 ${item.done ? "text-white" : "text-gray-400"}`} />
              </div>
              <div>
                <p className={`font-semibold text-sm ${item.done ? "text-black" : "text-gray-500"}`}>{item.label}</p>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 p-4 mb-8 text-sm text-green-700">
        <div className="flex items-center justify-center gap-2 font-bold mb-1">
          <Truck className="w-4 h-4" /> Frete Grátis incluso!
        </div>
        <p>Você receberá um e-mail com o rastreamento do pedido.</p>
      </div>

      <button
        onClick={() => navigate("/")}
        className="bg-black text-white px-8 py-3 font-bold uppercase tracking-wide text-sm hover:bg-gray-800 transition-colors"
      >
        Continuar comprando
      </button>
    </main>
  );
}
