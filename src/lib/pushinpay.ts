export interface PushinPayTransaction {
  id: string;
  status: "pending" | "paid" | "expired" | "cancelled" | "created" | "completed";
  qr_code?: string;
  qr_code_base64?: string;
  value: number;
}

export const PIX_LIMIT = 150;

export interface PixItem {
  id: string;
  name: string;
  price: number;
  size?: string;
  quantity: number;
  image?: string;
}

export interface PixAddress {
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
}

export async function createPixTransaction(params: {
  amount: number;
  customer: { name: string; cpf: string; email: string; phone: string };
  items?: PixItem[];
  address?: PixAddress;
  affiliateRef?: string;
}): Promise<PushinPayTransaction> {
  if (params.amount > PIX_LIMIT) {
    throw new Error(`LIMIT_EXCEEDED:O valor máximo por pedido via PIX é R$ ${PIX_LIMIT.toFixed(2).replace(".", ",")}. Remova alguns itens do carrinho e faça um novo pedido.`);
  }

  const res = await fetch("/api/pix/create", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      amount: params.amount,
      customer: params.customer,
      items: params.items || [],
      address: params.address || null,
      affiliateRef: params.affiliateRef,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Erro desconhecido" }));
    if (err.code === "LIMIT_EXCEEDED") {
      throw new Error(`LIMIT_EXCEEDED:${err.message}`);
    }
    throw new Error(err.error || `Erro: ${res.status}`);
  }

  return res.json();
}

export async function getTransaction(id: string): Promise<PushinPayTransaction> {
  const res = await fetch(`/api/pix/status?id=${id}`, {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Erro desconhecido" }));
    throw new Error(err.error || `Erro: ${res.status}`);
  }

  return res.json();
}
