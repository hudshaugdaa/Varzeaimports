import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { TrendingUp, DollarSign, Link, Eye, EyeOff, LogOut, RefreshCw, CheckCircle, AlertCircle, CreditCard, BarChart2 } from "lucide-react";

const API = "/api";

type Section = "resumo" | "pix";

interface Sale {
  id: number;
  customer_name: string;
  order_total: string;
  commission: string;
  order_date: string;
  order_status: string;
}

interface AffiliateInfo {
  id: number;
  name: string;
  email: string;
  refCode: string;
  percentage: number;
  balance: number;
  hasPixConfigured: boolean;
}

export default function AfiliadosDashboard() {
  const [, navigate] = useLocation();
  const [authed, setAuthed] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [section, setSection] = useState<Section>("resumo");

  const [affiliate, setAffiliate] = useState<AffiliateInfo | null>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [totalSales, setTotalSales] = useState(0);
  const [totalCommission, setTotalCommission] = useState(0);
  const [balance, setBalance] = useState(0);
  const [salesLoading, setSalesLoading] = useState(false);

  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawMsg, setWithdrawMsg] = useState("");
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  const [pixKey, setPixKey] = useState("");
  const [pixName, setPixName] = useState("");
  const [pixCpf, setPixCpf] = useState("");
  const [pixMsg, setPixMsg] = useState("");
  const [pixLoading, setPixLoading] = useState(false);
  const [hasPixConfigured, setHasPixConfigured] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("affiliate_token");
    const storedInfo = localStorage.getItem("affiliate_info");
    if (stored && storedInfo) {
      try {
        const info = JSON.parse(storedInfo);
        setAffiliate(info);
        setHasPixConfigured(info.hasPixConfigured || false);
        setAuthed(true);
      } catch {}
    }
  }, []);

  const handleLogin = async () => {
    if (!email || !password) { setLoginError("Preencha email e senha"); return; }
    setLoginLoading(true);
    setLoginError("");
    try {
      const res = await fetch(`${API}/afiliados/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setLoginError(data.error || "Email ou senha incorretos"); return; }
      localStorage.setItem("affiliate_token", data.token);
      localStorage.setItem("affiliate_info", JSON.stringify(data.affiliate));
      setAffiliate(data.affiliate);
      setHasPixConfigured(data.affiliate.hasPixConfigured || false);
      setBalance(Number(data.affiliate.balance || 0));
      setAuthed(true);
    } catch {
      setLoginError("Erro de conexão com o servidor.");
    } finally {
      setLoginLoading(false);
    }
  };

  const loadSales = useCallback(async () => {
    if (!affiliate) return;
    setSalesLoading(true);
    try {
      const res = await fetch(`${API}/afiliados/sales?affiliateId=${affiliate.id}`);
      const data = await res.json();
      setSales(data.sales || []);
      setTotalSales(data.totalSales || 0);
      setTotalCommission(Number(data.totalCommission || 0));
      setBalance(Number(data.balance || 0));
      setHasPixConfigured(!!data.hasPixConfigured);
    } catch {}
    setSalesLoading(false);
  }, [affiliate]);

  const loadPix = useCallback(async () => {
    if (!affiliate) return;
    try {
      const res = await fetch(`${API}/afiliados/pix?affiliateId=${affiliate.id}`);
      const data = await res.json();
      if (data.pix) {
        setPixKey(data.pix.pix_key || "");
        setPixName(data.pix.pix_name || "");
        setPixCpf(data.pix.pix_cpf || "");
        setHasPixConfigured(!!data.pix.pix_key);
      }
    } catch {}
  }, [affiliate]);

  useEffect(() => {
    if (!authed || !affiliate) return;
    if (section === "resumo") loadSales();
    if (section === "pix") loadPix();
  }, [authed, section, affiliate, loadSales, loadPix]);

  const handleRequestWithdrawal = async () => {
    if (!affiliate) return;
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) { setWithdrawMsg("Digite um valor válido"); return; }
    if (!hasPixConfigured) {
      setWithdrawMsg("Configure sua chave PIX antes de solicitar saque.");
      return;
    }
    setWithdrawLoading(true);
    setWithdrawMsg("");
    try {
      const res = await fetch(`${API}/afiliados/withdrawal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ affiliateId: affiliate.id, amount }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.code === "PIX_NOT_CONFIGURED") {
          setWithdrawMsg("Configure sua chave PIX primeiro (aba PIX).");
        } else {
          setWithdrawMsg(data.error || "Erro ao solicitar saque");
        }
        return;
      }
      setWithdrawMsg(data.message || "Solicitação enviada!");
      setWithdrawAmount("");
      loadSales();
    } catch { setWithdrawMsg("Erro de conexão."); }
    setWithdrawLoading(false);
  };

  const handleSavePix = async () => {
    if (!affiliate) return;
    if (!pixKey || !pixName || !pixCpf) { setPixMsg("Preencha todos os campos"); return; }
    setPixLoading(true);
    setPixMsg("");
    try {
      const res = await fetch(`${API}/afiliados/pix`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ affiliateId: affiliate.id, pixKey, pixName, pixCpf }),
      });
      const data = await res.json();
      if (!res.ok) { setPixMsg(data.error || "Erro ao salvar"); return; }
      setPixMsg(data.message || "PIX salvo com sucesso!");
      setHasPixConfigured(true);
      const updated = { ...affiliate, hasPixConfigured: true };
      setAffiliate(updated);
      localStorage.setItem("affiliate_info", JSON.stringify(updated));
    } catch { setPixMsg("Erro de conexão."); }
    setPixLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("affiliate_token");
    localStorage.removeItem("affiliate_info");
    setAuthed(false);
    navigate("/");
  };

  const affiliateLink = affiliate ? `https://varzeaimports.online/ref=${affiliate.refCode}` : "";

  if (!authed) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-sm p-8 shadow-2xl">
          <div className="mb-8">
            <h1 className="text-xl font-black uppercase tracking-tight">Dashboard de Afiliados</h1>
            <p className="text-xs text-gray-500 mt-1">Varzea Imports</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide mb-1">Email</label>
              <input
                type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                className="w-full border border-gray-300 py-3 px-4 text-sm focus:outline-none focus:border-black"
                placeholder="seu@email.com"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide mb-1">Senha</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"} value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleLogin()}
                  className="w-full border border-gray-300 py-3 px-4 pr-10 text-sm focus:outline-none focus:border-black"
                  placeholder="••••••••"
                />
                <button onClick={() => setShowPass(p => !p)} className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {loginError && <p className="text-red-500 text-xs font-medium">{loginError}</p>}
            <button
              onClick={handleLogin} disabled={loginLoading}
              className="w-full bg-black text-white py-3 text-sm font-bold uppercase tracking-wide hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {loginLoading ? "Entrando..." : "Entrar"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-black text-white">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-black text-sm uppercase tracking-tight">Dashboard de Afiliados</h1>
            <p className="text-xs text-gray-400 mt-0.5">{affiliate?.name}</p>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors">
            <LogOut className="w-3.5 h-3.5" /> Sair
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setSection("resumo")}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded transition-colors ${section === "resumo" ? "bg-black text-white" : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"}`}
          >
            <BarChart2 className="w-4 h-4" /> Resumo
          </button>
          <button
            onClick={() => setSection("pix")}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded transition-colors ${section === "pix" ? "bg-black text-white" : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"}`}
          >
            <CreditCard className="w-4 h-4" /> {hasPixConfigured ? "PIX Configurado ✓" : "Registrar PIX"}
          </button>
        </div>

        {section === "resumo" && (
          <div>
            <div className="bg-white border rounded p-4 mb-4 shadow-sm">
              <p className="text-xs text-gray-500 mb-1 font-medium uppercase">Seu Link de Afiliado</p>
              <div className="flex items-center gap-2 bg-gray-50 border rounded p-2.5">
                <Link className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="text-sm font-mono text-gray-700 break-all">{affiliateLink}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white border rounded p-4 shadow-sm">
                <p className="text-xs font-medium text-gray-500 uppercase mb-1 flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" /> Vendas</p>
                <p className="text-2xl font-black">{totalSales}</p>
                <p className="text-xs text-gray-400 mt-0.5">via seu link</p>
              </div>
              <div className="bg-white border rounded p-4 shadow-sm">
                <p className="text-xs font-medium text-gray-500 uppercase mb-1 flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> Comissão Total</p>
                <p className="text-2xl font-black text-green-600">R$ {totalCommission.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                <p className="text-xs text-gray-400 mt-0.5">{affiliate?.percentage}% por venda</p>
              </div>
              <div className="bg-white border rounded p-4 shadow-sm">
                <p className="text-xs font-medium text-gray-500 uppercase mb-1 flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> Saldo Disponível</p>
                <p className="text-2xl font-black text-black">R$ {balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                <p className="text-xs text-gray-400 mt-0.5">para saque</p>
              </div>
            </div>

            <div className="bg-white border rounded p-5 mb-6 shadow-sm">
              <h3 className="font-bold text-sm uppercase mb-4">Solicitar Saque</h3>
              {!hasPixConfigured && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  Configure sua chave PIX antes de solicitar um saque.
                  <button onClick={() => setSection("pix")} className="underline font-medium ml-1">Configurar agora</button>
                </div>
              )}
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <label className="text-xs font-bold uppercase mb-1 block">Valor do saque (R$)</label>
                  <input
                    type="number" step="0.01" min="1" value={withdrawAmount}
                    onChange={e => setWithdrawAmount(e.target.value)}
                    placeholder="0,00"
                    disabled={!hasPixConfigured}
                    className="w-full border border-gray-300 py-2.5 px-3 text-sm rounded focus:outline-none focus:border-black disabled:bg-gray-50 disabled:text-gray-400"
                  />
                </div>
                <button
                  onClick={handleRequestWithdrawal} disabled={withdrawLoading || !hasPixConfigured}
                  className="bg-black text-white text-sm px-5 py-2.5 rounded hover:bg-gray-800 disabled:opacity-50 whitespace-nowrap"
                >
                  {withdrawLoading ? "Enviando..." : "Solicitar Saque"}
                </button>
              </div>
              {withdrawMsg && (
                <div className={`mt-3 p-2.5 text-xs rounded flex items-center gap-2 ${withdrawMsg.includes("enviada") || withdrawMsg.includes("sucesso") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                  {withdrawMsg.includes("enviada") || withdrawMsg.includes("sucesso") ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                  {withdrawMsg}
                </div>
              )}
            </div>

            <div className="bg-white border rounded shadow-sm overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                <h3 className="font-bold text-sm uppercase">Histórico de Vendas</h3>
                <button onClick={loadSales} disabled={salesLoading} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700">
                  <RefreshCw className={`w-3 h-3 ${salesLoading ? "animate-spin" : ""}`} /> Atualizar
                </button>
              </div>
              {sales.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">{salesLoading ? "Carregando..." : "Nenhuma venda ainda. Compartilhe seu link!"}</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left p-3 font-semibold text-gray-600">Cliente</th>
                      <th className="text-left p-3 font-semibold text-gray-600">Valor Venda</th>
                      <th className="text-left p-3 font-semibold text-gray-600">Comissão</th>
                      <th className="text-left p-3 font-semibold text-gray-600">Status</th>
                      <th className="text-left p-3 font-semibold text-gray-600">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.map(s => (
                      <tr key={s.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium">{s.customer_name}</td>
                        <td className="p-3">R$ {Number(s.order_total).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                        <td className="p-3 font-bold text-green-600">R$ {Number(s.commission).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                        <td className="p-3">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${s.order_status === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                            {s.order_status === "paid" ? "PAGO" : "PENDENTE"}
                          </span>
                        </td>
                        <td className="p-3 text-xs text-gray-500">{new Date(s.order_date).toLocaleDateString("pt-BR")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {section === "pix" && (
          <div>
            <div className="bg-white border rounded p-6 shadow-sm max-w-md">
              <h3 className="font-bold text-sm uppercase mb-1">Registrar Chave PIX</h3>
              <p className="text-xs text-gray-500 mb-5">Informe sua chave PIX para receber saques aprovados.</p>
              <div className="space-y-4 mb-5">
                <div>
                  <label className="text-xs font-bold uppercase mb-1 block">Chave PIX *</label>
                  <input
                    value={pixKey} onChange={e => setPixKey(e.target.value)}
                    placeholder="CPF, email, telefone ou chave aleatória"
                    className="w-full border border-gray-300 py-2.5 px-3 text-sm rounded focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase mb-1 block">Nome completo (dono da conta) *</label>
                  <input
                    value={pixName} onChange={e => setPixName(e.target.value)}
                    placeholder="João da Silva"
                    className="w-full border border-gray-300 py-2.5 px-3 text-sm rounded focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase mb-1 block">CPF *</label>
                  <input
                    value={pixCpf} onChange={e => setPixCpf(e.target.value)}
                    placeholder="000.000.000-00"
                    className="w-full border border-gray-300 py-2.5 px-3 text-sm rounded focus:outline-none focus:border-black"
                  />
                </div>
              </div>
              {pixMsg && (
                <div className={`mb-4 p-2.5 text-xs rounded flex items-center gap-2 ${pixMsg.includes("sucesso") || pixMsg.includes("salva") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                  {pixMsg.includes("sucesso") || pixMsg.includes("salva") ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                  {pixMsg}
                </div>
              )}
              <button
                onClick={handleSavePix} disabled={pixLoading}
                className="w-full bg-black text-white py-2.5 text-sm font-bold uppercase tracking-wide hover:bg-gray-800 transition-colors rounded disabled:opacity-50"
              >
                {pixLoading ? "Salvando..." : hasPixConfigured ? "Atualizar PIX" : "Salvar PIX"}
              </button>
              {hasPixConfigured && (
                <p className="text-center text-xs text-green-600 mt-3 flex items-center justify-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> PIX configurado
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
