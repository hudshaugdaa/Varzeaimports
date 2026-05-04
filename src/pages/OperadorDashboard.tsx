import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import {
  LayoutDashboard, Package, Users, Settings, LogOut,
  TrendingUp, ShoppingBag, Plus, Trash2, Edit2, Star,
  Ban, Shield, Eye, EyeOff, CheckCircle, XCircle,
  DollarSign, Link, UserPlus, RefreshCw, X, Save, AlertCircle,
  ClipboardList, MapPin, Phone, Mail, CreditCard, ChevronDown, ChevronUp, Search
} from "lucide-react";

const API = "/api";

type Section = "resumo" | "pedidos" | "produtos" | "afiliados-gerar" | "afiliados-saques" | "conta";

interface Sale {
  id: number;
  customer_name: string;
  customer_email: string;
  total: string;
  status: string;
  affiliate_ref: string | null;
  created_at: string;
}

interface Product {
  id: string;
  slug: string;
  name: string;
  price: string;
  category: string;
  subcategory?: string;
  images: string[];
  brand: string;
  in_stock: boolean;
  badge?: string;
  description: string;
  sizes: string[];
}

interface Affiliate {
  id: number;
  name: string;
  email: string;
  ref_code: string;
  percentage: string;
  balance: string;
  total_sales: string;
  active: boolean;
}

interface Withdrawal {
  id: number;
  affiliate_name: string;
  affiliate_email: string;
  ref_code: string;
  amount: string;
  pix_key: string;
  pix_name: string;
  pix_cpf: string;
  status: string;
  requested_at: string;
}

interface Session {
  id: number;
  ip: string;
  device_info: string;
  location: string;
  last_seen: string;
}

interface Review {
  id: number;
  product_id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
}

interface OrderItem {
  id: string;
  name: string;
  price: number;
  size?: string;
  quantity: number;
  image?: string;
}

interface OrderAddress {
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
}

interface Order {
  id: number;
  customer_name: string;
  customer_email: string;
  customer_cpf: string;
  customer_phone: string;
  items: OrderItem[];
  address: OrderAddress | null;
  total: string;
  status: string;
  affiliate_ref: string | null;
  pix_transaction_id: string | null;
  created_at: string;
  updated_at: string;
}

export default function OperadorDashboard() {
  const [, navigate] = useLocation();
  const [authed, setAuthed] = useState(false);
  const [ipBlocked, setIpBlocked] = useState(false);
  const [checking, setChecking] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [section, setSection] = useState<Section>("resumo");

  const [sales, setSales] = useState<Sale[]>([]);
  const [balance, setBalance] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [salesLoading, setSalesLoading] = useState(false);

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersStats, setOrdersStats] = useState({ total: 0, paid: 0, pending: 0, revenue: 0 });
  const [ordersFilter, setOrdersFilter] = useState("all");
  const [ordersSearch, setOrdersSearch] = useState("");
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Array<{ id: number; label: string; slug: string; parent_id: number | null }>>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [prodLoading, setProdLoading] = useState(false);
  const [showAddProd, setShowAddProd] = useState(false);
  const [editProd, setEditProd] = useState<Product | null>(null);
  const [showAddCat, setShowAddCat] = useState(false);
  const [newCat, setNewCat] = useState({ label: "", slug: "", parentId: "" });
  const [prodForm, setProdForm] = useState({
    name: "", description: "", price: "", category: "", subcategory: "",
    brand: "", badge: "", sizes: "P,M,G,GG,XGG", inStock: true,
    img1: "", img2: "", img3: "", img4: "", img5: "",
  });
  const [prodMsg, setProdMsg] = useState("");

  const [showAddReview, setShowAddReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({ productId: "", author: "", rating: 5, comment: "", date: "" });
  const [reviewMsg, setReviewMsg] = useState("");
  const [editReview, setEditReview] = useState<Review | null>(null);

  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [affForm, setAffForm] = useState({ name: "", email: "", password: "", percentage: "5" });
  const [affMsg, setAffMsg] = useState("");
  const [affLoading, setAffLoading] = useState(false);
  const [newAffResult, setNewAffResult] = useState<{ refCode: string; affiliateLink: string } | null>(null);

  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [wdrLoading, setWdrLoading] = useState(false);
  const [wdrMsg, setWdrMsg] = useState("");

  const [sessions, setSessions] = useState<Session[]>([]);
  const [bannedIps, setBannedIps] = useState<Array<{ id: number; ip: string; created_at: string }>>([]);
  const [accountMsg, setAccountMsg] = useState("");
  const [newAdminUser, setNewAdminUser] = useState("");
  const [newAdminPass, setNewAdminPass] = useState("");
  const [showNewPass, setShowNewPass] = useState(false);

  useEffect(() => {
    async function checkIp() {
      try {
        const r = await fetch("https://ipapi.co/json/");
        const d = await r.json();
        const city = (d.city || "").toLowerCase();
        const region = (d.region || "").toLowerCase();
        if (!city.includes("maceió") && !city.includes("maceio") && !region.includes("alagoas")) {
          setIpBlocked(true);
          setTimeout(() => navigate("/"), 3000);
        }
      } catch {
      } finally {
        setChecking(false);
      }
    }
    checkIp();
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (token) setAuthed(true);
  }, []);

  const handleLogin = async () => {
    if (!username || !password) { setLoginError("Preencha todos os campos"); return; }
    setLoginLoading(true);
    setLoginError("");
    try {
      let ipInfo = {};
      try {
        const r = await fetch("https://ipapi.co/json/");
        const d = await r.json();
        ipInfo = { ip: d.ip, location: `${d.city}, ${d.region}`, deviceInfo: navigator.userAgent };
      } catch {}
      const res = await fetch(`${API}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, ...ipInfo }),
      });
      const data = await res.json();
      if (!res.ok) { setLoginError(data.error || "Erro ao fazer login"); return; }
      localStorage.setItem("admin_token", data.token);
      setAuthed(true);
    } catch {
      if (username === "admin2000" && password === "pecúnia2000") {
        localStorage.setItem("admin_token", "local-admin-token");
        setAuthed(true);
      } else {
        setLoginError("Usuário ou senha incorretos");
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const loadSales = useCallback(async () => {
    setSalesLoading(true);
    try {
      const res = await fetch(`${API}/admin/sales`);
      const data = await res.json();
      setSales(data.sales || []);
      setBalance(data.balance || 0);
      setTotalOrders(data.totalOrders || 0);
    } catch {}
    setSalesLoading(false);
  }, []);

  const loadOrders = useCallback(async (filter = ordersFilter, search = "") => {
    setOrdersLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== "all") params.set("status", filter);
      if (search) params.set("search", search);
      params.set("limit", "200");
      const res = await fetch(`${API}/admin/orders?${params}`);
      const data = await res.json();
      setOrders(data.orders || []);
      if (data.stats) {
        setOrdersStats({
          total: Number(data.stats.total || 0),
          paid: Number(data.stats.paid || 0),
          pending: Number(data.stats.pending || 0),
          revenue: Number(data.stats.revenue || 0),
        });
      }
    } catch {}
    setOrdersLoading(false);
  }, [ordersFilter]);

  const loadProducts = useCallback(async () => {
    setProdLoading(true);
    try {
      const res = await fetch(`${API}/admin/products`);
      const data = await res.json();
      setProducts(data.products || []);
      setReviews(data.reviews || []);
    } catch {}
    const catRes = await fetch(`${API}/admin/categories`).catch(() => null);
    if (catRes?.ok) {
      const catData = await catRes.json();
      setCategories(catData.categories || []);
    }
    setProdLoading(false);
  }, []);

  const loadAffiliates = useCallback(async () => {
    setAffLoading(true);
    try {
      const res = await fetch(`${API}/admin/affiliates`);
      const data = await res.json();
      setAffiliates(data.affiliates || []);
    } catch {}
    setAffLoading(false);
  }, []);

  const loadWithdrawals = useCallback(async () => {
    setWdrLoading(true);
    try {
      const res = await fetch(`${API}/admin/withdrawals`);
      const data = await res.json();
      setWithdrawals(data.withdrawals || []);
    } catch {}
    setWdrLoading(false);
  }, []);

  const loadAccount = useCallback(async () => {
    try {
      const res = await fetch(`${API}/admin/account`);
      const data = await res.json();
      setSessions(data.sessions || []);
      setBannedIps(data.bannedIps || []);
    } catch {}
  }, []);

  useEffect(() => {
    if (!authed) return;
    if (section === "resumo") loadSales();
    if (section === "pedidos") loadOrders("all", "");
    if (section === "produtos") loadProducts();
    if (section === "afiliados-gerar") loadAffiliates();
    if (section === "afiliados-saques") loadWithdrawals();
    if (section === "conta") loadAccount();
  }, [authed, section, loadSales, loadOrders, loadProducts, loadAffiliates, loadWithdrawals, loadAccount]);

  const handleAddProduct = async () => {
    const images = [prodForm.img1, prodForm.img2, prodForm.img3, prodForm.img4, prodForm.img5].filter(Boolean);
    if (images.length < 3) { setProdMsg("Mínimo 3 imagens obrigatórias"); return; }
    if (!prodForm.name || !prodForm.price || !prodForm.category) { setProdMsg("Nome, preço e categoria são obrigatórios"); return; }
    try {
      const method = editProd ? "PUT" : "POST";
      const body = {
        ...(editProd ? { id: editProd.id } : {}),
        name: prodForm.name, description: prodForm.description,
        price: parseFloat(prodForm.price), category: prodForm.category,
        subcategory: prodForm.subcategory || null, brand: prodForm.brand,
        badge: prodForm.badge || null, sizes: prodForm.sizes.split(",").map(s => s.trim()).filter(Boolean),
        inStock: prodForm.inStock, images,
      };
      const res = await fetch(`${API}/admin/products`, {
        method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setProdMsg(data.error || "Erro ao salvar produto"); return; }
      setProdMsg("Produto salvo com sucesso!");
      setShowAddProd(false);
      setEditProd(null);
      setProdForm({ name: "", description: "", price: "", category: "", subcategory: "", brand: "", badge: "", sizes: "P,M,G,GG,XGG", inStock: true, img1: "", img2: "", img3: "", img4: "", img5: "" });
      loadProducts();
    } catch { setProdMsg("Erro de conexão. Configure o banco de dados."); }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Remover este produto?")) return;
    try {
      await fetch(`${API}/admin/products?id=${id}`, { method: "DELETE" });
      loadProducts();
    } catch {}
  };

  const handleAddCategory = async () => {
    if (!newCat.label || !newCat.slug) return;
    try {
      await fetch(`${API}/admin/categories`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: newCat.label, slug: newCat.slug, parentId: newCat.parentId ? Number(newCat.parentId) : null }),
      });
      setNewCat({ label: "", slug: "", parentId: "" });
      setShowAddCat(false);
      loadProducts();
    } catch {}
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm("Remover esta categoria?")) return;
    await fetch(`${API}/admin/categories?id=${id}`, { method: "DELETE" }).catch(() => {});
    loadProducts();
  };

  const handleAddReview = async () => {
    if (!reviewForm.productId || !reviewForm.author || !reviewForm.rating) { setReviewMsg("Preencha todos os campos obrigatórios"); return; }
    try {
      const method = editReview ? "PUT" : "POST";
      const body = editReview ? { id: editReview.id, ...reviewForm } : reviewForm;
      const res = await fetch(`${API}/admin/reviews`, {
        method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setReviewMsg(data.error || "Erro"); return; }
      setReviewMsg("Avaliação salva!");
      setShowAddReview(false);
      setEditReview(null);
      setReviewForm({ productId: "", author: "", rating: 5, comment: "", date: "" });
      loadProducts();
    } catch { setReviewMsg("Erro de conexão."); }
  };

  const handleDeleteReview = async (id: number) => {
    await fetch(`${API}/admin/reviews?id=${id}`, { method: "DELETE" }).catch(() => {});
    loadProducts();
  };

  const handleCreateAffiliate = async () => {
    if (!affForm.name || !affForm.email || !affForm.password) { setAffMsg("Todos os campos são obrigatórios"); return; }
    try {
      const res = await fetch(`${API}/admin/affiliates`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(affForm),
      });
      const data = await res.json();
      if (!res.ok) { setAffMsg(data.error || "Erro"); return; }
      setNewAffResult({ refCode: data.refCode, affiliateLink: data.affiliateLink });
      setAffMsg(data.message || "Afiliado criado!");
      setAffForm({ name: "", email: "", password: "", percentage: "5" });
      loadAffiliates();
    } catch { setAffMsg("Erro de conexão."); }
  };

  const handleRemoveAffiliate = async (id: number) => {
    if (!confirm("Remover este afiliado?")) return;
    await fetch(`${API}/admin/affiliates?id=${id}`, { method: "DELETE" }).catch(() => {});
    loadAffiliates();
  };

  const handleWithdrawalAction = async (id: number, action: "approve" | "reject") => {
    setWdrMsg("");
    try {
      const res = await fetch(`${API}/admin/withdrawals`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action }),
      });
      const data = await res.json();
      setWdrMsg(data.message || (data.success ? "Ação realizada!" : data.error));
      loadWithdrawals();
    } catch { setWdrMsg("Erro de conexão."); }
  };

  const handleUpdateAdmin = async () => {
    if (!newAdminUser || !newAdminPass) { setAccountMsg("Preencha novo usuário e senha"); return; }
    try {
      const res = await fetch(`${API}/admin/account`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newUsername: newAdminUser, newPassword: newAdminPass }),
      });
      const data = await res.json();
      setAccountMsg(data.message || (data.success ? "Login atualizado!" : data.error));
    } catch { setAccountMsg("Erro de conexão."); }
  };

  const handleRemoveSession = async (id: number) => {
    await fetch(`${API}/admin/account`, {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "remove_session", sessionId: id }),
    }).catch(() => {});
    loadAccount();
  };

  const handleBanIp = async (ip: string) => {
    if (!confirm(`Banir o IP ${ip}?`)) return;
    try {
      const res = await fetch(`${API}/admin/account`, {
        method: "DELETE", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ban_ip", ip }),
      });
      const data = await res.json();
      setAccountMsg(data.message || "IP banido!");
      loadAccount();
    } catch {}
  };

  const handleUnbanIp = async (ip: string) => {
    await fetch(`${API}/admin/account`, {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "unban_ip", ip }),
    }).catch(() => {});
    loadAccount();
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    setAuthed(false);
    navigate("/");
  };

  const openEditProd = (prod: Product) => {
    setEditProd(prod);
    const imgs = prod.images || [];
    setProdForm({
      name: prod.name, description: prod.description || "", price: prod.price,
      category: prod.category, subcategory: prod.subcategory || "",
      brand: prod.brand || "", badge: prod.badge || "",
      sizes: (prod.sizes || []).join(","), inStock: prod.in_stock,
      img1: imgs[0] || "", img2: imgs[1] || "", img3: imgs[2] || "",
      img4: imgs[3] || "", img5: imgs[4] || "",
    });
    setShowAddProd(true);
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4" />
          <p>Verificando acesso...</p>
        </div>
      </div>
    );
  }

  if (ipBlocked) {
    return (
      <div className="min-h-screen bg-red-900 flex items-center justify-center">
        <div className="text-white text-center p-8">
          <Ban className="w-16 h-16 mx-auto mb-4 text-red-300" />
          <h1 className="text-2xl font-bold mb-2">Acesso Negado</h1>
          <p className="text-red-200">Este painel é restrito a IPs de Maceió, Alagoas.</p>
          <p className="text-red-300 text-sm mt-2">Redirecionando...</p>
        </div>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-sm p-8 shadow-2xl">
          <div className="flex items-center gap-2 mb-8">
            <Shield className="w-6 h-6 text-black" />
            <h1 className="text-xl font-black uppercase tracking-tight">Operador Dashboard</h1>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide mb-1">Usuário</label>
              <input
                type="text" value={username}
                onChange={e => setUsername(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                className="w-full border border-gray-300 py-3 px-4 text-sm focus:outline-none focus:border-black"
                placeholder="admin2000"
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
          <p className="text-xs text-gray-400 text-center mt-6">Acesso restrito — Maceió, AL</p>
        </div>
      </div>
    );
  }

  const navItems: Array<{ id: Section; label: string; icon: React.ReactNode }> = [
    { id: "resumo", label: "Resumo", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "pedidos", label: "Pedidos", icon: <ClipboardList className="w-4 h-4" /> },
    { id: "produtos", label: "Produtos", icon: <Package className="w-4 h-4" /> },
    { id: "afiliados-gerar", label: "Afiliados", icon: <UserPlus className="w-4 h-4" /> },
    { id: "afiliados-saques", label: "Saques", icon: <DollarSign className="w-4 h-4" /> },
    { id: "conta", label: "Conta", icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-56 bg-gray-900 text-white flex flex-col shrink-0">
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-400" />
            <span className="font-black text-sm uppercase tracking-tight">Operador</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">admin2000</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setSection(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded transition-colors text-left ${section === item.id ? "bg-white text-black" : "text-gray-300 hover:bg-gray-800"}`}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-700">
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-gray-800 rounded transition-colors">
            <LogOut className="w-4 h-4" /> Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-5xl mx-auto">

          {section === "resumo" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black uppercase">Resumo</h2>
                <button onClick={loadSales} disabled={salesLoading} className="flex items-center gap-1.5 text-sm border border-gray-300 px-3 py-1.5 hover:bg-gray-50 rounded">
                  <RefreshCw className={`w-3.5 h-3.5 ${salesLoading ? "animate-spin" : ""}`} /> Atualizar
                </button>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-5 shadow-sm rounded">
                  <div className="flex items-center gap-2 text-gray-500 text-xs font-medium uppercase mb-2"><TrendingUp className="w-4 h-4" /> Saldo Total</div>
                  <p className="text-2xl font-black text-green-600">R$ {balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="bg-white p-5 shadow-sm rounded">
                  <div className="flex items-center gap-2 text-gray-500 text-xs font-medium uppercase mb-2"><ShoppingBag className="w-4 h-4" /> Pedidos Pagos</div>
                  <p className="text-2xl font-black">{totalOrders}</p>
                </div>
                <div className="bg-white p-5 shadow-sm rounded">
                  <div className="flex items-center gap-2 text-gray-500 text-xs font-medium uppercase mb-2"><Users className="w-4 h-4" /> Últimos 50</div>
                  <p className="text-2xl font-black">{sales.length}</p>
                </div>
              </div>
              <div className="bg-white shadow-sm rounded overflow-hidden">
                <div className="p-4 border-b"><h3 className="font-bold text-sm uppercase">Últimas Vendas</h3></div>
                {sales.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">
                    <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">{salesLoading ? "Carregando..." : "Nenhuma venda ainda. Configure o banco de dados."}</p>
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left p-3 font-semibold text-gray-600">Cliente</th>
                        <th className="text-left p-3 font-semibold text-gray-600">Total</th>
                        <th className="text-left p-3 font-semibold text-gray-600">Status</th>
                        <th className="text-left p-3 font-semibold text-gray-600">Afiliado</th>
                        <th className="text-left p-3 font-semibold text-gray-600">Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sales.map(s => (
                        <tr key={s.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">
                            <p className="font-medium">{s.customer_name}</p>
                            <p className="text-xs text-gray-500">{s.customer_email}</p>
                          </td>
                          <td className="p-3 font-bold text-green-600">R$ {Number(s.total).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                          <td className="p-3">
                            <span className={`text-xs font-bold px-2 py-1 rounded ${s.status === "paid" ? "bg-green-100 text-green-700" : s.status === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-600"}`}>
                              {s.status === "paid" ? "PAGO" : s.status === "pending" ? "PENDENTE" : s.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-3 text-xs text-gray-500">{s.affiliate_ref || "-"}</td>
                          <td className="p-3 text-xs text-gray-500">{new Date(s.created_at).toLocaleDateString("pt-BR")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {section === "pedidos" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black uppercase">Pedidos</h2>
                <button onClick={() => loadOrders(ordersFilter, ordersSearch)} disabled={ordersLoading} className="flex items-center gap-1.5 text-sm border border-gray-300 px-3 py-1.5 hover:bg-gray-50 rounded">
                  <RefreshCw className={`w-3.5 h-3.5 ${ordersLoading ? "animate-spin" : ""}`} /> Atualizar
                </button>
              </div>

              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 shadow-sm rounded">
                  <p className="text-xs font-medium uppercase text-gray-500 mb-1">Total de Pedidos</p>
                  <p className="text-2xl font-black">{ordersStats.total}</p>
                </div>
                <div className="bg-white p-4 shadow-sm rounded">
                  <p className="text-xs font-medium uppercase text-gray-500 mb-1">Pagos</p>
                  <p className="text-2xl font-black text-green-600">{ordersStats.paid}</p>
                </div>
                <div className="bg-white p-4 shadow-sm rounded">
                  <p className="text-xs font-medium uppercase text-gray-500 mb-1">Pendentes</p>
                  <p className="text-2xl font-black text-yellow-600">{ordersStats.pending}</p>
                </div>
                <div className="bg-white p-4 shadow-sm rounded">
                  <p className="text-xs font-medium uppercase text-gray-500 mb-1">Receita Total</p>
                  <p className="text-2xl font-black text-green-600">R$ {ordersStats.revenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                </div>
              </div>

              <div className="bg-white shadow-sm rounded overflow-hidden mb-4">
                <div className="p-4 border-b flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar por nome, email ou CPF..."
                      value={ordersSearch}
                      onChange={e => setOrdersSearch(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && loadOrders(ordersFilter, ordersSearch)}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-black"
                    />
                  </div>
                  <div className="flex gap-2">
                    {["all", "paid", "pending"].map(f => (
                      <button
                        key={f}
                        onClick={() => { setOrdersFilter(f); loadOrders(f, ordersSearch); }}
                        className={`px-3 py-2 text-xs font-bold uppercase rounded border transition-colors ${ordersFilter === f ? "bg-black text-white border-black" : "border-gray-300 hover:bg-gray-50"}`}
                      >
                        {f === "all" ? "Todos" : f === "paid" ? "Pagos" : "Pendentes"}
                      </button>
                    ))}
                    <button
                      onClick={() => loadOrders(ordersFilter, ordersSearch)}
                      className="px-3 py-2 text-xs font-bold uppercase rounded border border-gray-300 hover:bg-gray-50"
                    >
                      Buscar
                    </button>
                  </div>
                </div>

                {ordersLoading ? (
                  <div className="p-8 text-center text-gray-400">
                    <RefreshCw className="w-6 h-6 mx-auto mb-2 animate-spin opacity-40" />
                    <p className="text-sm">Carregando pedidos...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">
                    <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">Nenhum pedido encontrado.</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {orders.map(order => (
                      <div key={order.id} className="p-4">
                        <div
                          className="flex items-start justify-between cursor-pointer"
                          onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${order.status === "paid" ? "bg-green-100 text-green-700" : order.status === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-600"}`}>
                                {order.status === "paid" ? "PAGO" : order.status === "pending" ? "PENDENTE" : order.status.toUpperCase()}
                              </span>
                              <span className="font-bold text-sm">#{order.id}</span>
                              <span className="text-sm font-semibold truncate">{order.customer_name}</span>
                              <span className="text-xs text-gray-500">{new Date(order.created_at).toLocaleString("pt-BR")}</span>
                            </div>
                            <div className="flex items-center gap-4 mt-1 flex-wrap">
                              <span className="flex items-center gap-1 text-xs text-gray-500"><Mail className="w-3 h-3" />{order.customer_email}</span>
                              <span className="flex items-center gap-1 text-xs text-gray-500"><Phone className="w-3 h-3" />{order.customer_phone}</span>
                              <span className="flex items-center gap-1 text-xs text-gray-500"><CreditCard className="w-3 h-3" />{order.customer_cpf}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 ml-4 shrink-0">
                            <span className="font-black text-green-700">R$ {Number(order.total).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                            {expandedOrder === order.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                          </div>
                        </div>

                        {expandedOrder === order.id && (
                          <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-xs font-bold uppercase text-gray-500 mb-2 flex items-center gap-1"><ShoppingBag className="w-3.5 h-3.5" /> Produtos do Pedido</h4>
                              {Array.isArray(order.items) && order.items.length > 0 ? (
                                <div className="space-y-2">
                                  {order.items.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-3 bg-gray-50 p-2 rounded">
                                      {item.image && (
                                        <img
                                          src={item.image}
                                          alt={item.name}
                                          className="w-12 h-12 object-contain bg-white rounded border flex-shrink-0"
                                          onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                                        />
                                      )}
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold truncate">{item.name}</p>
                                        <p className="text-xs text-gray-500">
                                          {item.size && `Tam: ${item.size} · `}Qtd: {item.quantity} · R$ {Number(item.price).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                        </p>
                                      </div>
                                      <p className="text-sm font-black shrink-0">R$ {(Number(item.price) * item.quantity).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                                    </div>
                                  ))}
                                  <div className="flex justify-between text-sm font-black pt-1 border-t">
                                    <span>Total</span>
                                    <span className="text-green-700">R$ {Number(order.total).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-xs text-gray-400 italic">Itens não registrados neste pedido.</p>
                              )}
                            </div>

                            <div className="space-y-4">
                              <div>
                                <h4 className="text-xs font-bold uppercase text-gray-500 mb-2 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Endereço de Entrega</h4>
                                {order.address ? (
                                  <div className="bg-gray-50 p-3 rounded text-sm space-y-0.5">
                                    <p className="font-medium">{order.address.logradouro}, {order.address.numero}{order.address.complemento ? `, ${order.address.complemento}` : ""}</p>
                                    <p className="text-gray-600">{order.address.bairro}</p>
                                    <p className="text-gray-600">{order.address.cidade} – {order.address.estado}</p>
                                    <p className="text-gray-500 text-xs">CEP: {order.address.cep}</p>
                                  </div>
                                ) : (
                                  <p className="text-xs text-gray-400 italic">Endereço não registrado.</p>
                                )}
                              </div>

                              <div>
                                <h4 className="text-xs font-bold uppercase text-gray-500 mb-2">Dados do Pedido</h4>
                                <div className="bg-gray-50 p-3 rounded text-xs space-y-1">
                                  <p><span className="text-gray-500">PIX ID:</span> <span className="font-mono break-all">{order.pix_transaction_id || "—"}</span></p>
                                  {order.affiliate_ref && <p><span className="text-gray-500">Afiliado:</span> {order.affiliate_ref}</p>}
                                  <p><span className="text-gray-500">Criado em:</span> {new Date(order.created_at).toLocaleString("pt-BR")}</p>
                                  <p><span className="text-gray-500">Atualizado:</span> {new Date(order.updated_at).toLocaleString("pt-BR")}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {section === "produtos" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black uppercase">Produtos</h2>
                <div className="flex gap-2">
                  <button onClick={() => setShowAddCat(true)} className="flex items-center gap-1.5 text-sm border border-gray-300 px-3 py-1.5 hover:bg-gray-50 rounded">
                    <Plus className="w-3.5 h-3.5" /> Categoria
                  </button>
                  <button onClick={() => { setEditProd(null); setProdForm({ name: "", description: "", price: "", category: "", subcategory: "", brand: "", badge: "", sizes: "P,M,G,GG,XGG", inStock: true, img1: "", img2: "", img3: "", img4: "", img5: "" }); setShowAddProd(true); }} className="flex items-center gap-1.5 text-sm bg-black text-white px-3 py-1.5 hover:bg-gray-800 rounded">
                    <Plus className="w-3.5 h-3.5" /> Produto
                  </button>
                </div>
              </div>

              {prodMsg && (
                <div className={`mb-4 p-3 text-sm rounded flex items-center gap-2 ${prodMsg.includes("sucesso") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                  <AlertCircle className="w-4 h-4 flex-shrink-0" /> {prodMsg}
                </div>
              )}

              {showAddCat && (
                <div className="bg-white p-4 border rounded mb-4 shadow-sm">
                  <h3 className="font-bold text-sm uppercase mb-3">Nova Categoria</h3>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <input value={newCat.label} onChange={e => setNewCat(c => ({ ...c, label: e.target.value }))} placeholder="Nome (ex: Tênis)" className="border border-gray-300 py-2 px-3 text-sm rounded focus:outline-none focus:border-black" />
                    <input value={newCat.slug} onChange={e => setNewCat(c => ({ ...c, slug: e.target.value }))} placeholder="Slug (ex: tenis)" className="border border-gray-300 py-2 px-3 text-sm rounded focus:outline-none focus:border-black" />
                    <select value={newCat.parentId} onChange={e => setNewCat(c => ({ ...c, parentId: e.target.value }))} className="border border-gray-300 py-2 px-3 text-sm rounded focus:outline-none focus:border-black">
                      <option value="">Categoria raiz</option>
                      {categories.filter(c => !c.parent_id).map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleAddCategory} className="bg-black text-white text-sm px-4 py-2 rounded hover:bg-gray-800">Criar</button>
                    <button onClick={() => setShowAddCat(false)} className="border border-gray-300 text-sm px-4 py-2 rounded hover:bg-gray-50">Cancelar</button>
                  </div>
                </div>
              )}

              {categories.length > 0 && (
                <div className="bg-white border rounded mb-4 overflow-hidden shadow-sm">
                  <div className="p-3 border-b bg-gray-50"><h3 className="text-xs font-bold uppercase text-gray-600">Categorias</h3></div>
                  <div className="divide-y">
                    {categories.map(cat => (
                      <div key={cat.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                        <span>{cat.parent_id ? "└ " : ""}<span className="font-medium">{cat.label}</span> <span className="text-gray-400 text-xs">/{cat.slug}</span></span>
                        <button onClick={() => handleDeleteCategory(cat.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {showAddProd && (
                <div className="bg-white border rounded mb-4 p-4 shadow-sm">
                  <h3 className="font-bold text-sm uppercase mb-4">{editProd ? "Editar Produto" : "Novo Produto"}</h3>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="col-span-2">
                      <label className="text-xs font-bold uppercase mb-1 block">Nome *</label>
                      <input value={prodForm.name} onChange={e => setProdForm(f => ({ ...f, name: e.target.value }))} className="w-full border border-gray-300 py-2 px-3 text-sm rounded focus:outline-none focus:border-black" />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase mb-1 block">Preço *</label>
                      <input type="number" step="0.01" value={prodForm.price} onChange={e => setProdForm(f => ({ ...f, price: e.target.value }))} placeholder="89.90" className="w-full border border-gray-300 py-2 px-3 text-sm rounded focus:outline-none focus:border-black" />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase mb-1 block">Marca</label>
                      <input value={prodForm.brand} onChange={e => setProdForm(f => ({ ...f, brand: e.target.value }))} placeholder="Nike, Adidas..." className="w-full border border-gray-300 py-2 px-3 text-sm rounded focus:outline-none focus:border-black" />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase mb-1 block">Categoria *</label>
                      <input value={prodForm.category} onChange={e => setProdForm(f => ({ ...f, category: e.target.value }))} placeholder="camisas" className="w-full border border-gray-300 py-2 px-3 text-sm rounded focus:outline-none focus:border-black" />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase mb-1 block">Subcategoria</label>
                      <input value={prodForm.subcategory} onChange={e => setProdForm(f => ({ ...f, subcategory: e.target.value }))} placeholder="copa-do-mundo" className="w-full border border-gray-300 py-2 px-3 text-sm rounded focus:outline-none focus:border-black" />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase mb-1 block">Badge</label>
                      <input value={prodForm.badge} onChange={e => setProdForm(f => ({ ...f, badge: e.target.value }))} placeholder="COPA 2026, OFERTA..." className="w-full border border-gray-300 py-2 px-3 text-sm rounded focus:outline-none focus:border-black" />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase mb-1 block">Tamanhos (separados por vírgula)</label>
                      <input value={prodForm.sizes} onChange={e => setProdForm(f => ({ ...f, sizes: e.target.value }))} placeholder="P,M,G,GG,XGG" className="w-full border border-gray-300 py-2 px-3 text-sm rounded focus:outline-none focus:border-black" />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs font-bold uppercase mb-1 block">Descrição</label>
                      <textarea value={prodForm.description} onChange={e => setProdForm(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full border border-gray-300 py-2 px-3 text-sm rounded focus:outline-none focus:border-black resize-none" />
                    </div>
                    {[1,2,3,4,5].map(n => (
                      <div key={n} className={n <= 3 ? "" : ""}>
                        <label className="text-xs font-bold uppercase mb-1 block">Imagem {n} {n <= 3 ? "*" : "(opcional)"} (URL)</label>
                        <input
                          value={prodForm[`img${n}` as keyof typeof prodForm] as string}
                          onChange={e => setProdForm(f => ({ ...f, [`img${n}`]: e.target.value }))}
                          placeholder={`https://...imagem${n}.jpg`}
                          className="w-full border border-gray-300 py-2 px-3 text-sm rounded focus:outline-none focus:border-black"
                        />
                      </div>
                    ))}
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="inStock" checked={prodForm.inStock} onChange={e => setProdForm(f => ({ ...f, inStock: e.target.checked }))} />
                      <label htmlFor="inStock" className="text-sm font-medium">Em estoque</label>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleAddProduct} className="flex items-center gap-1.5 bg-black text-white text-sm px-4 py-2 rounded hover:bg-gray-800">
                      <Save className="w-3.5 h-3.5" /> {editProd ? "Salvar" : "Adicionar"}
                    </button>
                    <button onClick={() => { setShowAddProd(false); setEditProd(null); }} className="border border-gray-300 text-sm px-4 py-2 rounded hover:bg-gray-50">Cancelar</button>
                  </div>
                </div>
              )}

              {prodLoading ? (
                <p className="text-center text-gray-400 py-8">Carregando...</p>
              ) : products.length === 0 ? (
                <div className="bg-white border rounded p-8 text-center text-gray-400 shadow-sm">
                  <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Nenhum produto no banco. Adicione produtos acima.</p>
                </div>
              ) : (
                <div className="bg-white border rounded overflow-hidden shadow-sm">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left p-3 font-semibold text-gray-600">Produto</th>
                        <th className="text-left p-3 font-semibold text-gray-600">Preço</th>
                        <th className="text-left p-3 font-semibold text-gray-600">Categoria</th>
                        <th className="text-right p-3 font-semibold text-gray-600">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(prod => (
                        <tr key={prod.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-medium">{prod.name}</td>
                          <td className="p-3">R$ {Number(prod.price).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                          <td className="p-3 text-gray-500 text-xs">{prod.category}{prod.subcategory ? ` / ${prod.subcategory}` : ""}</td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => openEditProd(prod)} className="text-blue-500 hover:text-blue-700"><Edit2 className="w-4 h-4" /></button>
                              <button onClick={() => handleDeleteProduct(prod.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-sm uppercase">Avaliações</h3>
                  <button onClick={() => { setEditReview(null); setReviewForm({ productId: "", author: "", rating: 5, comment: "", date: "" }); setShowAddReview(true); }} className="flex items-center gap-1.5 text-sm bg-black text-white px-3 py-1.5 rounded hover:bg-gray-800">
                    <Star className="w-3.5 h-3.5" /> Adicionar
                  </button>
                </div>
                {reviewMsg && <p className="mb-3 text-sm text-green-600">{reviewMsg}</p>}
                {showAddReview && (
                  <div className="bg-white border rounded p-4 mb-3 shadow-sm">
                    <h4 className="font-bold text-xs uppercase mb-3">{editReview ? "Editar Avaliação" : "Nova Avaliação"}</h4>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="text-xs font-bold uppercase mb-1 block">Produto (ID) *</label>
                        <input value={reviewForm.productId} onChange={e => setReviewForm(f => ({ ...f, productId: e.target.value }))} placeholder="ID do produto" className="w-full border border-gray-300 py-2 px-3 text-sm rounded focus:outline-none focus:border-black" />
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase mb-1 block">Autor *</label>
                        <input value={reviewForm.author} onChange={e => setReviewForm(f => ({ ...f, author: e.target.value }))} placeholder="Nome do cliente" className="w-full border border-gray-300 py-2 px-3 text-sm rounded focus:outline-none focus:border-black" />
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase mb-1 block">Nota *</label>
                        <select value={reviewForm.rating} onChange={e => setReviewForm(f => ({ ...f, rating: Number(e.target.value) }))} className="w-full border border-gray-300 py-2 px-3 text-sm rounded focus:outline-none focus:border-black">
                          {[5,4,3,2,1].map(n => <option key={n} value={n}>{"⭐".repeat(n)} ({n})</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase mb-1 block">Data</label>
                        <input type="date" value={reviewForm.date} onChange={e => setReviewForm(f => ({ ...f, date: e.target.value }))} className="w-full border border-gray-300 py-2 px-3 text-sm rounded focus:outline-none focus:border-black" />
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs font-bold uppercase mb-1 block">Comentário</label>
                        <textarea value={reviewForm.comment} onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))} rows={2} className="w-full border border-gray-300 py-2 px-3 text-sm rounded focus:outline-none focus:border-black resize-none" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleAddReview} className="bg-black text-white text-sm px-4 py-2 rounded hover:bg-gray-800">Salvar</button>
                      <button onClick={() => setShowAddReview(false)} className="border border-gray-300 text-sm px-4 py-2 rounded hover:bg-gray-50">Cancelar</button>
                    </div>
                  </div>
                )}
                {reviews.length > 0 && (
                  <div className="bg-white border rounded overflow-hidden shadow-sm">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-left p-3 font-semibold text-gray-600">Produto</th>
                          <th className="text-left p-3 font-semibold text-gray-600">Autor</th>
                          <th className="text-left p-3 font-semibold text-gray-600">Nota</th>
                          <th className="text-left p-3 font-semibold text-gray-600">Comentário</th>
                          <th className="text-right p-3"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {reviews.map(r => (
                          <tr key={r.id} className="border-b hover:bg-gray-50">
                            <td className="p-3 text-xs text-gray-500">{r.product_id}</td>
                            <td className="p-3 font-medium">{r.author}</td>
                            <td className="p-3">{"⭐".repeat(r.rating)}</td>
                            <td className="p-3 text-xs text-gray-600 max-w-xs truncate">{r.comment}</td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button onClick={() => { setEditReview(r); setReviewForm({ productId: r.product_id, author: r.author, rating: r.rating, comment: r.comment, date: r.date }); setShowAddReview(true); }} className="text-blue-500 hover:text-blue-700"><Edit2 className="w-3.5 h-3.5" /></button>
                                <button onClick={() => handleDeleteReview(r.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {section === "afiliados-gerar" && (
            <div>
              <h2 className="text-2xl font-black uppercase mb-6">Afiliados</h2>
              <div className="bg-white border rounded p-4 mb-6 shadow-sm">
                <h3 className="font-bold text-sm uppercase mb-4">Gerar Novo Afiliado</h3>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-xs font-bold uppercase mb-1 block">Nome do Influencer *</label>
                    <input value={affForm.name} onChange={e => setAffForm(f => ({ ...f, name: e.target.value }))} placeholder="João Silva" className="w-full border border-gray-300 py-2 px-3 text-sm rounded focus:outline-none focus:border-black" />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase mb-1 block">Email *</label>
                    <input type="email" value={affForm.email} onChange={e => setAffForm(f => ({ ...f, email: e.target.value }))} placeholder="joao@email.com" className="w-full border border-gray-300 py-2 px-3 text-sm rounded focus:outline-none focus:border-black" />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase mb-1 block">Senha para Dashboard *</label>
                    <input type="text" value={affForm.password} onChange={e => setAffForm(f => ({ ...f, password: e.target.value }))} placeholder="senha123" className="w-full border border-gray-300 py-2 px-3 text-sm rounded focus:outline-none focus:border-black" />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase mb-1 block">Porcentagem sobre a venda (%)</label>
                    <input type="number" min="1" max="50" value={affForm.percentage} onChange={e => setAffForm(f => ({ ...f, percentage: e.target.value }))} placeholder="5" className="w-full border border-gray-300 py-2 px-3 text-sm rounded focus:outline-none focus:border-black" />
                  </div>
                </div>
                {affMsg && <p className={`mb-3 text-sm ${affMsg.includes("Erro") || affMsg.includes("obrigatório") || affMsg.includes("cadastrado") ? "text-red-600" : "text-green-600"}`}>{affMsg}</p>}
                <button onClick={handleCreateAffiliate} disabled={affLoading} className="bg-black text-white text-sm px-4 py-2 rounded hover:bg-gray-800 disabled:opacity-50">
                  {affLoading ? "Gerando..." : "Gerar Afiliado"}
                </button>
              </div>

              {newAffResult && (
                <div className="bg-green-50 border border-green-200 rounded p-4 mb-6">
                  <h4 className="font-bold text-green-800 text-sm mb-2 flex items-center gap-1.5"><CheckCircle className="w-4 h-4" /> Afiliado criado com sucesso!</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Código:</span> <code className="bg-green-100 px-1.5 py-0.5 rounded">{newAffResult.refCode}</code></p>
                    <p className="flex items-center gap-2"><Link className="w-3.5 h-3.5 text-green-600" /><span className="font-medium">Link:</span> <span className="text-green-700 break-all">{newAffResult.affiliateLink}</span></p>
                  </div>
                  <button onClick={() => setNewAffResult(null)} className="mt-2 text-xs text-green-600 hover:underline">Fechar</button>
                </div>
              )}

              {affiliates.length > 0 && (
                <div className="bg-white border rounded overflow-hidden shadow-sm">
                  <div className="p-3 border-b bg-gray-50"><h3 className="text-xs font-bold uppercase text-gray-600">Afiliados Cadastrados</h3></div>
                  <table className="w-full text-sm">
                    <thead className="border-b">
                      <tr>
                        <th className="text-left p-3 font-semibold text-gray-600">Nome</th>
                        <th className="text-left p-3 font-semibold text-gray-600">Email</th>
                        <th className="text-left p-3 font-semibold text-gray-600">Código</th>
                        <th className="text-left p-3 font-semibold text-gray-600">%</th>
                        <th className="text-left p-3 font-semibold text-gray-600">Vendas</th>
                        <th className="text-left p-3 font-semibold text-gray-600">Saldo</th>
                        <th className="text-right p-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {affiliates.map(a => (
                        <tr key={a.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-medium">{a.name}</td>
                          <td className="p-3 text-gray-500 text-xs">{a.email}</td>
                          <td className="p-3"><code className="bg-gray-100 text-xs px-1.5 py-0.5 rounded">{a.ref_code}</code></td>
                          <td className="p-3">{a.percentage}%</td>
                          <td className="p-3">{a.total_sales}</td>
                          <td className="p-3 font-bold text-green-600">R$ {Number(a.balance || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                          <td className="p-3 text-right">
                            <button onClick={() => handleRemoveAffiliate(a.id)} className="text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {section === "afiliados-saques" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black uppercase">Saques Solicitados</h2>
                <button onClick={loadWithdrawals} className="flex items-center gap-1.5 text-sm border border-gray-300 px-3 py-1.5 hover:bg-gray-50 rounded">
                  <RefreshCw className="w-3.5 h-3.5" /> Atualizar
                </button>
              </div>
              {wdrMsg && (
                <div className="mb-4 p-3 text-sm rounded bg-green-50 text-green-700 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> {wdrMsg}
                </div>
              )}
              {wdrLoading ? <p className="text-center text-gray-400 py-8">Carregando...</p> : withdrawals.length === 0 ? (
                <div className="bg-white border rounded p-8 text-center text-gray-400 shadow-sm">
                  <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Nenhuma solicitação de saque.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {withdrawals.map(w => (
                    <div key={w.id} className="bg-white border rounded p-4 shadow-sm">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-bold text-sm">{w.affiliate_name}</p>
                          <p className="text-xs text-gray-500">{w.affiliate_email} · Ref: {w.ref_code}</p>
                          <p className="text-xs text-gray-500 mt-1">Chave PIX: <span className="font-medium">{w.pix_key}</span></p>
                          <p className="text-xs text-gray-500">Nome: {w.pix_name} · CPF: {w.pix_cpf}</p>
                          <p className="text-xs text-gray-400 mt-1">{new Date(w.requested_at).toLocaleString("pt-BR")}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-black text-black">R$ {Number(w.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded mt-1 inline-block ${w.status === "approved" ? "bg-green-100 text-green-700" : w.status === "rejected" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                            {w.status === "approved" ? "APROVADO" : w.status === "rejected" ? "REPROVADO" : "PENDENTE"}
                          </span>
                          {w.status === "pending" && (
                            <div className="flex gap-2 mt-2 justify-end">
                              <button onClick={() => handleWithdrawalAction(w.id, "approve")} className="flex items-center gap-1 text-xs bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700">
                                <CheckCircle className="w-3.5 h-3.5" /> Aprovar
                              </button>
                              <button onClick={() => handleWithdrawalAction(w.id, "reject")} className="flex items-center gap-1 text-xs bg-red-500 text-white px-3 py-1.5 rounded hover:bg-red-600">
                                <XCircle className="w-3.5 h-3.5" /> Reprovar
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {section === "conta" && (
            <div>
              <h2 className="text-2xl font-black uppercase mb-6">Conta</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border rounded p-5 shadow-sm">
                  <h3 className="font-bold text-sm uppercase mb-4">Alterar Login de Admin</h3>
                  <div className="space-y-3 mb-4">
                    <div>
                      <label className="text-xs font-bold uppercase mb-1 block">Novo usuário</label>
                      <input value={newAdminUser} onChange={e => setNewAdminUser(e.target.value)} className="w-full border border-gray-300 py-2 px-3 text-sm rounded focus:outline-none focus:border-black" />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase mb-1 block">Nova senha</label>
                      <div className="relative">
                        <input type={showNewPass ? "text" : "password"} value={newAdminPass} onChange={e => setNewAdminPass(e.target.value)} className="w-full border border-gray-300 py-2 px-3 pr-9 text-sm rounded focus:outline-none focus:border-black" />
                        <button onClick={() => setShowNewPass(p => !p)} className="absolute right-2.5 top-2.5 text-gray-400">
                          {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  {accountMsg && <p className="mb-3 text-sm text-green-600">{accountMsg}</p>}
                  <button onClick={handleUpdateAdmin} className="bg-black text-white text-sm px-4 py-2 rounded hover:bg-gray-800">Salvar alterações</button>
                </div>

                <div className="bg-white border rounded p-5 shadow-sm">
                  <h3 className="font-bold text-sm uppercase mb-4">IPs Banidos</h3>
                  {bannedIps.length === 0 ? (
                    <p className="text-sm text-gray-400">Nenhum IP banido.</p>
                  ) : (
                    <div className="space-y-2">
                      {bannedIps.map(b => (
                        <div key={b.id} className="flex items-center justify-between text-sm border-b pb-2">
                          <span className="font-mono">{b.ip}</span>
                          <button onClick={() => handleUnbanIp(b.ip)} className="text-xs text-blue-500 hover:underline">Desbanir</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white border rounded mt-6 overflow-hidden shadow-sm">
                <div className="p-4 border-b bg-gray-50"><h3 className="font-bold text-sm uppercase">Dispositivos Conectados</h3></div>
                {sessions.length === 0 ? (
                  <p className="p-4 text-sm text-gray-400">Nenhuma sessão registrada.</p>
                ) : (
                  <div className="divide-y">
                    {sessions.map(s => (
                      <div key={s.id} className="flex items-center justify-between p-4">
                        <div>
                          <p className="text-sm font-medium">{s.ip} <span className="text-gray-400 text-xs">· {s.location}</span></p>
                          <p className="text-xs text-gray-500 truncate max-w-md">{s.device_info}</p>
                          <p className="text-xs text-gray-400 mt-0.5">Último acesso: {new Date(s.last_seen).toLocaleString("pt-BR")}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleBanIp(s.ip)} className="flex items-center gap-1 text-xs border border-red-300 text-red-500 px-2.5 py-1.5 rounded hover:bg-red-50">
                            <Ban className="w-3.5 h-3.5" /> Banir IP
                          </button>
                          <button onClick={() => handleRemoveSession(s.id)} className="text-xs border border-gray-300 px-2.5 py-1.5 rounded hover:bg-gray-50">
                            Remover
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
