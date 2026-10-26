import type { OrderStatus, PaymentStatus, ProductStatus } from "@/lib/types";
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS, PRODUCT_STATUS_LABELS } from "@/lib/types";
import { orderStatusTone, paymentStatusTone, statusTone } from "@/lib/utils";

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <span className={`badge ${orderStatusTone(status)}`}>{ORDER_STATUS_LABELS[status] ?? status}</span>;
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <span className={`badge ${paymentStatusTone(status)}`}>{PAYMENT_STATUS_LABELS[status] ?? status}</span>;
}

export function ProductStatusBadge({ status }: { status: ProductStatus }) {
  return <span className={`badge ${statusTone(status)}`}>{PRODUCT_STATUS_LABELS[status] ?? status}</span>;
}
