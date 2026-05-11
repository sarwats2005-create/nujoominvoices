import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type {
  Supplier, PurchaseOrder, PurchaseOrderItem, POSReturn, POSReturnItem,
  HeldSale, LoyaltySettings, LoyaltyTransaction, POSSettings,
} from '@/types/retail';

const db = (table: string) => (supabase as any).from(table);

/* ---------------- Realtime helper ---------------- */
function useRealtimeRefetch(channelName: string, tables: string[], refetch: () => void, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const channel = supabase.channel(channelName);
    tables.forEach(t => channel.on('postgres_changes' as any, { event: '*', schema: 'public', table: t }, refetch));
    channel.subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [channelName, tables.join(','), enabled]);
}

/* ---------------- Suppliers ---------------- */
export const useSuppliers = () => {
  const { user } = useAuth();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await db('suppliers').select('*').eq('user_id', user.id).eq('is_active', true).order('name');
    if (data) setSuppliers(data as Supplier[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  useRealtimeRefetch('suppliers-rt', ['suppliers'], fetchAll, !!user);

  const addSupplier = async (data: Partial<Supplier>) => {
    if (!user) return null;
    const { data: row } = await db('suppliers').insert({ ...data, user_id: user.id }).select().single();
    await fetchAll();
    return row as Supplier;
  };
  const updateSupplier = async (id: string, data: Partial<Supplier>) => {
    if (!user) return false;
    const { error } = await db('suppliers').update(data).eq('id', id).eq('user_id', user.id);
    if (!error) await fetchAll();
    return !error;
  };
  const deleteSupplier = async (id: string) => {
    if (!user) return false;
    const { error } = await db('suppliers').update({ is_active: false }).eq('id', id);
    if (!error) await fetchAll();
    return !error;
  };

  return { suppliers, loading, addSupplier, updateSupplier, deleteSupplier, refetch: fetchAll };
};

/* ---------------- Purchase Orders ---------------- */
export const usePurchaseOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [poRes, itemsRes, supRes] = await Promise.all([
      db('purchase_orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      db('purchase_order_items').select('*'),
      db('suppliers').select('*').eq('user_id', user.id),
    ]);
    const items = (itemsRes.data || []) as PurchaseOrderItem[];
    const suppliers = (supRes.data || []) as Supplier[];
    const list = ((poRes.data || []) as PurchaseOrder[]).map(po => ({
      ...po,
      items: items.filter(i => i.po_id === po.id),
      supplier: suppliers.find(s => s.id === po.supplier_id),
    }));
    setOrders(list);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  useRealtimeRefetch('po-rt', ['purchase_orders', 'purchase_order_items'], fetchAll, !!user);

  const generatePoNumber = () => {
    const d = new Date();
    return `PO-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}-${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}${String(d.getSeconds()).padStart(2, '0')}`;
  };

  const createPO = async (po: Partial<PurchaseOrder>, items: Partial<PurchaseOrderItem>[]) => {
    if (!user) return null;
    const subtotal = items.reduce((s, i) => s + (Number(i.quantity_ordered) || 0) * (Number(i.unit_cost) || 0), 0);
    const tax = Number(po.tax) || 0;
    const { data: row, error } = await db('purchase_orders').insert({
      ...po,
      user_id: user.id,
      po_number: po.po_number || generatePoNumber(),
      subtotal, tax, total: subtotal + tax,
    }).select().single();
    if (error || !row) return null;

    if (items.length) {
      await db('purchase_order_items').insert(
        items.map(i => ({
          po_id: row.id,
          product_id: i.product_id || null,
          variant_id: i.variant_id || null,
          product_name: i.product_name || 'Item',
          quantity_ordered: Number(i.quantity_ordered) || 0,
          unit_cost: Number(i.unit_cost) || 0,
          total: (Number(i.quantity_ordered) || 0) * (Number(i.unit_cost) || 0),
        }))
      );
    }
    await fetchAll();
    return row as PurchaseOrder;
  };

  const updatePOStatus = async (id: string, status: string, receivedDate?: string) => {
    if (!user) return false;
    const update: any = { status };
    if (receivedDate) update.received_date = receivedDate;
    const { error } = await db('purchase_orders').update(update).eq('id', id);
    if (!error) await fetchAll();
    return !error;
  };

  const receivePO = async (po: PurchaseOrder) => {
    if (!user || !po.items) return false;
    // Apply stock IN for every item that has variant_id
    for (const item of po.items) {
      const remaining = item.quantity_ordered - item.quantity_received;
      if (remaining <= 0 || !item.variant_id) continue;
      const { data: variant } = await db('product_variants').select('stock_quantity').eq('id', item.variant_id).single();
      const newQty = (variant?.stock_quantity || 0) + remaining;
      await db('product_variants').update({ stock_quantity: newQty }).eq('id', item.variant_id);
      await db('stock_movements').insert({
        user_id: user.id,
        product_id: item.product_id,
        variant_id: item.variant_id,
        movement_type: 'IN',
        quantity: remaining,
        cost_price: item.unit_cost,
        reference: po.po_number,
        notes: 'PO Received',
      });
      await db('purchase_order_items').update({ quantity_received: item.quantity_ordered }).eq('id', item.id);
    }
    await db('purchase_orders').update({
      status: 'received',
      received_date: new Date().toISOString().slice(0, 10),
    }).eq('id', po.id);
    await fetchAll();
    return true;
  };

  const deletePO = async (id: string) => {
    if (!user) return false;
    const { error } = await db('purchase_orders').delete().eq('id', id);
    if (!error) await fetchAll();
    return !error;
  };

  return { orders, loading, createPO, updatePOStatus, receivePO, deletePO, refetch: fetchAll };
};

/* ---------------- Returns ---------------- */
export const useReturns = () => {
  const { user } = useAuth();
  const [returns, setReturns] = useState<POSReturn[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [retRes, itemsRes] = await Promise.all([
      db('pos_returns').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      db('pos_return_items').select('*'),
    ]);
    const items = (itemsRes.data || []) as POSReturnItem[];
    setReturns(((retRes.data || []) as POSReturn[]).map(r => ({ ...r, items: items.filter(i => i.return_id === r.id) })));
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  useRealtimeRefetch('returns-rt', ['pos_returns', 'pos_return_items'], fetchAll, !!user);

  const generateReturnNumber = () => {
    const d = new Date();
    return `RET-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}-${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}${String(d.getSeconds()).padStart(2, '0')}`;
  };

  const createReturn = async (
    saleId: string,
    customerId: string | null,
    items: Array<Partial<POSReturnItem>>,
    refundMethod: 'cash' | 'store_credit' | 'original',
    reason?: string
  ) => {
    if (!user) return null;
    const refundAmount = items.reduce((s, i) => s + (Number(i.refund_total) || 0), 0);

    const { data: ret, error } = await db('pos_returns').insert({
      user_id: user.id,
      original_sale_id: saleId,
      return_number: generateReturnNumber(),
      customer_id: customerId,
      refund_amount: refundAmount,
      refund_method: refundMethod,
      reason: reason || null,
    }).select().single();
    if (error || !ret) return null;

    await db('pos_return_items').insert(
      items.map(i => ({
        return_id: ret.id,
        sale_item_id: i.sale_item_id || null,
        product_id: i.product_id || null,
        variant_id: i.variant_id || null,
        product_name: i.product_name || 'Item',
        quantity: Number(i.quantity) || 0,
        unit_price: Number(i.unit_price) || 0,
        refund_total: Number(i.refund_total) || 0,
        restock: i.restock !== false,
      }))
    );

    // Restock variants
    for (const item of items) {
      if (item.restock !== false && item.variant_id && (item.quantity || 0) > 0) {
        const { data: v } = await db('product_variants').select('stock_quantity').eq('id', item.variant_id).single();
        const newQty = (v?.stock_quantity || 0) + Number(item.quantity);
        await db('product_variants').update({ stock_quantity: newQty }).eq('id', item.variant_id);
        await db('stock_movements').insert({
          user_id: user.id,
          product_id: item.product_id,
          variant_id: item.variant_id,
          movement_type: 'IN',
          quantity: Number(item.quantity),
          reference: ret.return_number,
          notes: 'Return restock',
        });
      }
    }

    // Apply store credit
    if (refundMethod === 'store_credit' && customerId) {
      const { data: c } = await db('customers').select('store_credit').eq('id', customerId).single();
      const newCredit = (Number(c?.store_credit) || 0) + refundAmount;
      await db('customers').update({ store_credit: newCredit }).eq('id', customerId);
    }

    // Mark original sale as refunded/partial
    const { data: sale } = await db('pos_sales').select('total, refunded_amount').eq('id', saleId).single();
    const newRefunded = (Number(sale?.refunded_amount) || 0) + refundAmount;
    const newStatus = newRefunded >= Number(sale?.total) ? 'refunded' : 'partial_refund';
    await db('pos_sales').update({ refunded_amount: newRefunded, status: newStatus }).eq('id', saleId);

    await fetchAll();
    return ret as POSReturn;
  };

  return { returns, loading, createReturn, refetch: fetchAll };
};

/* ---------------- Held Sales ---------------- */
export const useHeldSales = () => {
  const { user } = useAuth();
  const [held, setHeld] = useState<HeldSale[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await db('held_sales').select('*').eq('user_id', user.id).order('held_at', { ascending: false });
    if (data) setHeld(data as HeldSale[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  useRealtimeRefetch('held-rt', ['held_sales'], fetchAll, !!user);

  const holdSale = async (cart: any, customerId: string | null, label?: string, notes?: string) => {
    if (!user) return null;
    const { data } = await db('held_sales').insert({
      user_id: user.id,
      customer_id: customerId,
      hold_label: label || null,
      cart_snapshot: cart,
      notes: notes || null,
    }).select().single();
    await fetchAll();
    return data as HeldSale;
  };

  const removeHeld = async (id: string) => {
    if (!user) return false;
    const { error } = await db('held_sales').delete().eq('id', id);
    if (!error) await fetchAll();
    return !error;
  };

  return { held, loading, holdSale, removeHeld, refetch: fetchAll };
};

/* ---------------- Loyalty ---------------- */
export const useLoyalty = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<LoyaltySettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await db('loyalty_settings').select('*').eq('user_id', user.id).maybeSingle();
    setSettings(data as LoyaltySettings | null);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);
  useRealtimeRefetch('loyalty-rt', ['loyalty_settings'], fetchSettings, !!user);

  const upsertSettings = async (s: Partial<LoyaltySettings>) => {
    if (!user) return false;
    const payload = { user_id: user.id, ...s };
    const { error } = await db('loyalty_settings').upsert(payload, { onConflict: 'user_id' });
    if (!error) await fetchSettings();
    return !error;
  };

  return { settings, loading, upsertSettings, refetch: fetchSettings };
};

/* ---------------- POS Settings ---------------- */
export const usePOSSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<POSSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await db('pos_settings').select('*').eq('user_id', user.id).maybeSingle();
    setSettings(data as POSSettings | null);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetch(); }, [fetch]);
  useRealtimeRefetch('possettings-rt', ['pos_settings'], fetch, !!user);

  const upsert = async (s: Partial<POSSettings>) => {
    if (!user) return false;
    const payload = { user_id: user.id, ...s };
    const { error } = await db('pos_settings').upsert(payload, { onConflict: 'user_id' });
    if (!error) await fetch();
    return !error;
  };

  return { settings, loading, upsert, refetch: fetch };
};

/* ---------------- Sales History (with items + customer) ---------------- */
export const useSalesHistory = (limit = 100) => {
  const { user } = useAuth();
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [salesRes, itemsRes, custRes] = await Promise.all([
      db('pos_sales').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(limit),
      db('pos_sale_items').select('*'),
      db('customers').select('id,name'),
    ]);
    const items = itemsRes.data || [];
    const custs = custRes.data || [];
    const list = (salesRes.data || []).map((s: any) => ({
      ...s,
      items: items.filter((i: any) => i.sale_id === s.id),
      customer: custs.find((c: any) => c.id === s.customer_id),
    }));
    setSales(list);
    setLoading(false);
  }, [user, limit]);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  useRealtimeRefetch('sales-history-rt', ['pos_sales', 'pos_sale_items'], fetchAll, !!user);

  return { sales, loading, refetch: fetchAll };
};
