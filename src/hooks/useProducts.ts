import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Product, ProductCategory, ProductVariant } from '@/types/pos';

const db = (table: string) => (supabase as any).from(table);

export const useProducts = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [prodRes, catRes, varRes] = await Promise.all([
      db('products').select('*').eq('user_id', user.id).eq('is_active', true).order('name'),
      db('product_categories').select('*').eq('user_id', user.id).eq('is_active', true).order('name'),
      db('product_variants').select('*').eq('user_id', user.id).eq('is_active', true).order('name'),
    ]);

    const cats = (catRes.data || []) as ProductCategory[];
    const variants = (varRes.data || []) as ProductVariant[];
    const prods = ((prodRes.data || []) as Product[]).map(p => ({
      ...p,
      category: cats.find(c => c.id === p.category_id),
      variants: variants.filter(v => v.product_id === p.id),
    }));

    setCategories(cats);
    setProducts(prods);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const addProduct = async (data: Partial<Product>, variants?: Partial<ProductVariant>[]): Promise<boolean> => {
    if (!user) return false;
    const { data: inserted, error } = await db('products')
      .insert({ ...data, user_id: user.id })
      .select('id')
      .single();
    if (error) return false;

    if (variants?.length) {
      await db('product_variants').insert(
        variants.map(v => ({ ...v, product_id: inserted.id, user_id: user.id }))
      );
    } else {
      // Create a default variant
      await db('product_variants').insert({
        product_id: inserted.id,
        user_id: user.id,
        name: 'Default',
        stock_quantity: 0,
        min_stock_level: 5,
      });
    }
    await fetchAll();
    return true;
  };

  const updateProduct = async (id: string, data: Partial<Product>): Promise<boolean> => {
    if (!user) return false;
    const { error } = await db('products').update(data).eq('id', id).eq('user_id', user.id);
    if (!error) await fetchAll();
    return !error;
  };

  const deleteProduct = async (id: string): Promise<boolean> => {
    if (!user) return false;
    const { error } = await db('products').update({ is_active: false }).eq('id', id).eq('user_id', user.id);
    if (!error) await fetchAll();
    return !error;
  };

  const addCategory = async (name: string, color?: string): Promise<boolean> => {
    if (!user) return false;
    const { error } = await db('product_categories').insert({ user_id: user.id, name, color: color || '#6366f1' });
    if (!error) await fetchAll();
    return !error;
  };

  const deleteCategory = async (id: string): Promise<boolean> => {
    if (!user) return false;
    const { error } = await db('product_categories').update({ is_active: false }).eq('id', id);
    if (!error) await fetchAll();
    return !error;
  };

  const updateVariantStock = async (variantId: string, newQuantity: number): Promise<boolean> => {
    if (!user) return false;
    const { error } = await db('product_variants').update({ stock_quantity: newQuantity }).eq('id', variantId);
    if (!error) await fetchAll();
    return !error;
  };

  const addStockMovement = async (
    productId: string, variantId: string, type: string, quantity: number, reference?: string, notes?: string
  ): Promise<boolean> => {
    if (!user) return false;

    // Get current stock
    const { data: variant } = await db('product_variants').select('stock_quantity').eq('id', variantId).single();
    if (!variant) return false;

    const currentStock = variant.stock_quantity || 0;
    const newStock = type === 'IN' ? currentStock + quantity : type === 'OUT' ? currentStock - quantity : quantity;

    const [movRes, stockRes] = await Promise.all([
      db('stock_movements').insert({ user_id: user.id, product_id: productId, variant_id: variantId, movement_type: type, quantity, reference, notes }),
      db('product_variants').update({ stock_quantity: newStock }).eq('id', variantId),
    ]);

    if (!movRes.error && !stockRes.error) { await fetchAll(); return true; }
    return false;
  };

  const getLowStockProducts = useCallback(() => {
    return products.filter(p =>
      p.variants?.some(v => v.stock_quantity <= v.min_stock_level)
    );
  }, [products]);

  return {
    products, categories, loading,
    addProduct, updateProduct, deleteProduct,
    addCategory, deleteCategory,
    updateVariantStock, addStockMovement,
    getLowStockProducts, refetch: fetchAll,
  };
};
