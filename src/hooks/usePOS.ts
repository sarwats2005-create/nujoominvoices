import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { POSSale, CartItem, Customer } from '@/types/pos';

const db = (table: string) => (supabase as any).from(table);

export interface CompleteSaleOptions {
  paymentMethod: string;
  discountAmount: number;
  discountType: string;
  customer?: Customer | null;
  notes?: string;
  currency?: string;
  loyaltyRedeemed?: number;
  storeCreditUsed?: number;
  loyaltyEarnedPoints?: number;
  warehouseId?: string | null;
  vaultId?: string | null;
}

export const usePOS = () => {
  const { user } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [recentSales, setRecentSales] = useState<POSSale[]>([]);

  const generateSaleNumber = () => {
    const now = new Date();
    return `POS-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
  };

  const completeSale = async (cart: CartItem[], opts: CompleteSaleOptions): Promise<POSSale | null> => {
    if (!user || cart.length === 0) return null;
    setProcessing(true);

    const subtotal = cart.reduce((sum, item) => sum + item.unit_price * item.quantity - item.discount, 0);
    const taxAmount = cart.reduce((sum, item) => sum + item.tax, 0);
    const discountApplied = opts.discountType === 'percentage' ? subtotal * (opts.discountAmount / 100) : opts.discountAmount;
    const loyaltyRedeemed = opts.loyaltyRedeemed || 0;
    const storeCreditUsed = opts.storeCreditUsed || 0;
    const total = Math.max(0, subtotal - discountApplied + taxAmount - loyaltyRedeemed - storeCreditUsed);

    const saleNumber = generateSaleNumber();

    const { data: sale, error: saleErr } = await db('pos_sales')
      .insert({
        user_id: user.id,
        customer_id: opts.customer?.id || null,
        sale_number: saleNumber,
        subtotal,
        discount_amount: discountApplied,
        discount_type: opts.discountType,
        tax_amount: taxAmount,
        total,
        payment_method: opts.paymentMethod,
        payment_status: 'paid',
        notes: opts.notes || null,
        currency: opts.currency || 'USD',
        loyalty_earned: opts.loyaltyEarnedPoints || 0,
        loyalty_redeemed: loyaltyRedeemed,
        store_credit_used: storeCreditUsed,
        status: 'completed',
        warehouse_id: opts.warehouseId || null,
        vault_id: opts.vaultId || null,
      })
      .select()
      .single();

    if (saleErr || !sale) { setProcessing(false); return null; }

    const items = cart.map(item => ({
      sale_id: (sale as any).id,
      product_id: item.product.id,
      variant_id: item.variant?.id || null,
      product_name: item.product.name,
      variant_name: item.variant?.name || null,
      quantity: item.quantity,
      unit_price: item.unit_price,
      discount: item.discount,
      tax: item.tax,
      total: item.unit_price * item.quantity - item.discount + item.tax,
    }));
    await db('pos_sale_items').insert(items);

    // Deduct stock + cost snapshot
    for (const item of cart) {
      if (item.variant && item.product.track_stock !== false) {
        const newStock = item.product.allow_negative_stock
          ? item.variant.stock_quantity - item.quantity
          : Math.max(0, item.variant.stock_quantity - item.quantity);
        await db('product_variants').update({ stock_quantity: newStock }).eq('id', item.variant.id);
        await db('stock_movements').insert({
          user_id: user.id,
          product_id: item.product.id,
          variant_id: item.variant.id,
          movement_type: 'OUT',
          quantity: item.quantity,
          cost_price: item.product.cost_price || 0,
          reference: saleNumber,
          notes: 'POS Sale',
        });
      }
    }

    // Customer balances: store credit + loyalty
    if (opts.customer) {
      const updates: any = {};
      if (storeCreditUsed > 0) {
        updates.store_credit = Math.max(0, (opts.customer as any).store_credit - storeCreditUsed);
      }
      let newPoints = (opts.customer as any).loyalty_points || 0;
      if (opts.loyaltyEarnedPoints) newPoints += opts.loyaltyEarnedPoints;
      if (loyaltyRedeemed > 0) {
        // redeemedPoints inferred from currency * inverse not available here; redeemed as points stored separately
      }
      updates.loyalty_points = newPoints;

      await db('customers').update(updates).eq('id', opts.customer.id);

      if (opts.loyaltyEarnedPoints && opts.loyaltyEarnedPoints > 0) {
        await db('loyalty_transactions').insert({
          user_id: user.id,
          customer_id: opts.customer.id,
          sale_id: (sale as any).id,
          type: 'earn',
          points: opts.loyaltyEarnedPoints,
          balance_after: newPoints,
          notes: `Sale ${saleNumber}`,
        });
      }
    }

    setProcessing(false);
    return sale as any as POSSale;
  };

  const fetchRecentSales = useCallback(async (limit = 20) => {
    if (!user) return;
    const { data } = await db('pos_sales')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (data) setRecentSales(data as POSSale[]);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('pos-sales-realtime')
      .on('postgres_changes' as any, { event: '*', schema: 'public', table: 'pos_sales' }, () => fetchRecentSales())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, fetchRecentSales]);

  return { completeSale, processing, recentSales, fetchRecentSales };
};
