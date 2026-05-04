const IRONPAY_TOKEN = "CAVG8R53p3HA7q2o8pBpD9oNDVH9QO6DuRxhmK1kLprPLIPngdQCNIwhEIRn";
const IRONPAY_BASE = "https://api.ironpayapp.com.br/v1";

export interface IronPayCustomer {
  name: string;
  cpf: string;
  email: string;
  phone: string;
}

export interface IronPayTransaction {
  id: string;
  status: "pending" | "paid" | "expired" | "cancelled";
  pix_qr_code?: string;
  pix_copy_paste?: string;
  amount: number;
  expires_at?: string;
}

export interface CreateTransactionParams {
  amount: number;
  customer: IronPayCustomer;
}

export async function createPixTransaction(params: CreateTransactionParams): Promise<IronPayTransaction> {
  const amountInCents = Math.round(params.amount * 100);
  const cpfClean = params.customer.cpf.replace(/\D/g, "");
  const phoneClean = params.customer.phone.replace(/\D/g, "");

  const body = {
    amount: amountInCents,
    payment_method: "pix",
    customer: {
      name: params.customer.name,
      document: cpfClean,
      document_type: "cpf",
      email: params.customer.email,
      phone: phoneClean,
    },
    expires_in: 3600,
  };

  const res = await fetch(`${IRONPAY_BASE}/transactions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${IRONPAY_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`IronPay error: ${res.status} ${err}`);
  }

  const data = await res.json();
  return {
    id: data.id || data.transaction_id || data.uuid,
    status: data.status || "pending",
    pix_qr_code: data.pix_qr_code || data.qr_code || data.pix?.qr_code,
    pix_copy_paste: data.pix_copy_paste || data.copy_paste || data.pix?.copy_paste || data.pix?.qr_code_text || data.qr_code_text,
    amount: params.amount,
    expires_at: data.expires_at || data.expiration_date,
  };
}

export async function getTransaction(id: string): Promise<IronPayTransaction> {
  const res = await fetch(`${IRONPAY_BASE}/transactions/${id}`, {
    headers: {
      Authorization: `Bearer ${IRONPAY_TOKEN}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) throw new Error(`IronPay error: ${res.status}`);

  const data = await res.json();
  return {
    id: data.id || data.transaction_id || id,
    status: data.status,
    pix_qr_code: data.pix_qr_code || data.qr_code || data.pix?.qr_code,
    pix_copy_paste: data.pix_copy_paste || data.copy_paste || data.pix?.copy_paste || data.pix?.qr_code_text || data.qr_code_text,
    amount: data.amount / 100,
    expires_at: data.expires_at,
  };
}
