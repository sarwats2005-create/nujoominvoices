import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { POSSale, POSSaleItem, CartItem, Customer } from '@/types/pos';

const db = (table: string) => (supabase as any).from(table);

export const usePOS = () => {
  const { user } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [recentSales, setRecentSales] = useState<POSSale[]>([]);

  const generateSaleNumber = () => {
    const now = new Date();
    return `POS-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
  };

  const completeSale = async (
    cart: CartItem[],
    paymentMethod: string,
    discountAmount: number,
    discountType: string,
    customer?: Customer | null,
    notes?: string
  ): Promise<POSSale | null> => {
    if (!user || cart.length === 0) return null;
    setProcessing(true);

    const subtotal = cart.reduce((sum, item) => sum + item.unit_price * item.quantity - item.discount, 0);
    const taxAmount = cart.reduce((sum, item) => sum + item.tax, 0);
    const discountApplied = discountType === 'percentage' ? subtotal * (discountAmount / 100) : discountAmount;
    const total = subtotal - discountApplied + taxAmount;

    const saleNumber = generateSaleNumber();

    const { data: sale, error: saleErr } = await db('pos_sales')
      .insert({
        user_id: user.id,
        customer_id: customer?.id || null,
        sale_number: saleNumber,
        subtotal,
        discount_amount: discountApplied,
        discount_type: discountType,
        tax_amount: taxAmount,
        total,
        payment_method: paymentMethod,
        payment_status: 'paid',
        notes: notes || null,
      })
      .select()
      .single();

    if (saleErr || !sale) { setProcessing(false); return null; }

    // Insert sale items
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

    // Deduct stock
    for (const item of cart) {
      if (item.variant) {
        const newStock = Math.max(0, item.variant.stock_quantity - item.quantity);
        await db('product_variants').update({ stock_quantity: newStock }).eq('id', item.variant.id);
        await db('stock_movements').insert({
          user_id: user.id,
          product_id: item.product.id,
          variant_id: item.variant.id,
          movement_type: 'OUT',
          quantity: item.quantity,
          reference: saleNumber,
          notes: 'POS Sale',
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

  return { completeSale, processing, recentSales, fetchRecentSales };
};
