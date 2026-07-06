import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';
import { useCustomers } from '@/hooks/useCustomers';
import { usePOS } from '@/hooks/usePOS';
import { useHeldSales, useLoyalty, usePOSSettings } from '@/hooks/useRetail';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ShoppingCart, Search, Plus, Minus, Trash2, Receipt, CreditCard,
  Banknote, Wallet, User, Percent, DollarSign, X, CheckCircle, Tag, ScanBarcode,
  Printer, FolderOpen, Download, PauseCircle, PlayCircle, RotateCcw, Star, Coins,
} from 'lucide-react';
import BarcodeScanner from '@/components/pos/BarcodeScanner';
import VaultSidebar from '@/components/pos/VaultSidebar';
import { useWarehouse } from '@/contexts/WarehouseContext';
import { useVaults } from '@/hooks/useVaults';
import type { CartItem, Customer, Product, ProductVariant } from '@/types/pos';
import jsPDF from 'jspdf';
import { ensureUnicodeFontSync } from '@/lib/pdfFont';
import { format } from 'date-fns';

const openReceiptDB = (): Promise<IDBDatabase> => new Promise((resolve, reject) => {
  const req = indexedDB.open('pos-receipts', 1);
  req.onupgradeneeded = () => req.result.createObjectStore('handles', { keyPath: 'key' });
  req.onsuccess = () => resolve(req.result);
  req.onerror = () => reject(req.error);
});

const saveHandleToDB = async (handle: FileSystemDirectoryHandle) => {
  const db = await openReceiptDB();
  const tx = db.transaction('handles', 'readwrite');
  tx.objectStore('handles').put({ key: 'receiptDir', handle });
};

const POS: React.FC = () => {
  const navigate = useNavigate();
  const { activeWarehouseId, warehouses, loading: whLoading } = useWarehouse();
  const { vaults } = useVaults(activeWarehouseId);
  const { products, categories, loading } = useProducts();
  const { customers, addCustomer } = useCustomers();
  const { completeSale, processing } = usePOS();
  const { held, holdSale, removeHeld } = useHeldSales();
  const { settings: loyalty } = useLoyalty();
  const { settings: posSettings } = usePOSSettings();
  const { toast } = useToast();

  const [selectedVaultId, setSelectedVaultId] = useState<string | null>(null);
  useEffect(() => {
    if (!selectedVaultId || !vaults.find(v => v.id === selectedVaultId && v.is_open)) {
      const firstOpen = vaults.find(v => v.is_open);
      setSelectedVaultId(firstOpen?.id || null);
    }
  }, [vaults, selectedVaultId]);

  // Redirect to warehouse picker if none is active
  useEffect(() => {
    if (!whLoading && !activeWarehouseId && warehouses.length > 1) navigate('/warehouses');
  }, [whLoading, activeWarehouseId, warehouses.length, navigate]);


  const currency = posSettings?.currency || 'USD';
  const currencySym = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'IQD' ? 'د.ع' : currency + ' ';

  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountType, setDiscountType] = useState<'fixed' | 'percentage'>('fixed');
  const [notes, setNotes] = useState('');
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [holdDialogOpen, setHoldDialogOpen] = useState(false);
  const [recallOpen, setRecallOpen] = useState(false);
  const [holdLabel, setHoldLabel] = useState('');
  const [redeemPoints, setRedeemPoints] = useState(0);
  const [useStoreCredit, setUseStoreCredit] = useState(false);
  const [receiptDirHandle, setReceiptDirHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [savingReceipt, setSavingReceipt] = useState(false);

  useEffect(() => {
    const restore = async () => {
      try {
        const db = await openReceiptDB();
        const tx = db.transaction('handles', 'readonly');
        const store = tx.objectStore('handles');
        const req = store.get('receiptDir');
        req.onsuccess = () => { if (req.result?.handle) setReceiptDirHandle(req.result.handle); };
      } catch {}
    };
    restore();
  }, []);

  const handleBarcodeScan = (code: string) => {
    const product = products.find(p =>
      p.barcode === code || p.sku === code ||
      p.variants?.some(v => v.barcode === code || v.sku === code)
    );
    if (product) {
      const variant = product.variants?.find(v => v.barcode === code || v.sku === code) || product.variants?.[0];
      addToCart(product, variant);
      toast({ title: `Added: ${product.name}` });
    } else {
      setSearch(code);
      toast({ title: 'Product not found', description: `No product with barcode "${code}"`, variant: 'destructive' });
    }
  };

  const filteredProducts = useMemo(() => {
    let result = products;
    if (categoryFilter !== 'all') result = result.filter(p => p.category_id === categoryFilter);
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(s) ||
        p.sku?.toLowerCase().includes(s) ||
        p.barcode?.toLowerCase().includes(s)
      );
    }
    return result;
  }, [products, search, categoryFilter]);

  const addToCart = (product: Product, variant?: ProductVariant) => {
    const v = variant || product.variants?.[0];
    const price = v?.price_override ?? product.price;
    const taxRate = product.tax_rate || 0;
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id && i.variant?.id === v?.id);
      if (existing) {
        return prev.map(i =>
          i.product.id === product.id && i.variant?.id === v?.id
            ? { ...i, quantity: i.quantity + 1, tax: (i.quantity + 1) * price * (taxRate / 100) }
            : i
        );
      }
      return [...prev, { product, variant: v, quantity: 1, unit_price: price, discount: 0, tax: price * (taxRate / 100) }];
    });
  };

  const updateQuantity = (index: number, delta: number) => {
    setCart(prev => prev.map((item, i) => {
      if (i !== index) return item;
      const newQty = Math.max(1, item.quantity + delta);
      const taxRate = item.product.tax_rate || 0;
      return { ...item, quantity: newQty, tax: newQty * item.unit_price * (taxRate / 100) };
    }));
  };

  const removeFromCart = (index: number) => setCart(prev => prev.filter((_, i) => i !== index));

  const subtotal = cart.reduce((s, i) => s + i.unit_price * i.quantity - i.discount, 0);
  const taxTotal = cart.reduce((s, i) => s + i.tax, 0);
  const discountApplied = discountType === 'percentage' ? subtotal * (discountAmount / 100) : discountAmount;

  // Loyalty redemption value
  const redeemValue = loyalty?.enabled && redeemPoints > 0
    ? Math.min(redeemPoints * (loyalty.redemption_value || 0.01), subtotal - discountApplied + taxTotal)
    : 0;
  const availableStoreCredit = (selectedCustomer as any)?.store_credit || 0;
  const storeCreditApplied = useStoreCredit
    ? Math.min(availableStoreCredit, subtotal - discountApplied + taxTotal - redeemValue)
    : 0;

  const grandTotal = Math.max(0, subtotal - discountApplied + taxTotal - redeemValue - storeCreditApplied);
  const earnedPoints = loyalty?.enabled && selectedCustomer
    ? Math.floor(grandTotal * (loyalty.points_per_unit_currency || 0))
    : 0;

  const lastSaleCartRef = useRef<any>(null);

  const handleCheckout = async () => {
    const snapshot = { items: [...cart], subtotal, taxTotal, discountApplied, redeemValue, storeCreditApplied, grandTotal };
    const sale = await completeSale(cart, {
      paymentMethod,
      discountAmount,
      discountType,
      customer: selectedCustomer,
      notes,
      currency,
      loyaltyRedeemed: redeemValue,
      storeCreditUsed: storeCreditApplied,
      loyaltyEarnedPoints: earnedPoints,
    });
    if (sale) {
      lastSaleCartRef.current = snapshot;
      setReceiptData({ ...sale, items: snapshot.items, customer: selectedCustomer });
      setCart([]); setDiscountAmount(0); setNotes(''); setSelectedCustomer(null);
      setRedeemPoints(0); setUseStoreCredit(false);
      setCheckoutOpen(false);
      toast({ title: 'Sale completed!', description: `Total: ${currencySym}${snapshot.grandTotal.toFixed(2)}` });
    } else {
      toast({ title: 'Sale failed', variant: 'destructive' });
    }
  };

  const handleHold = async () => {
    if (cart.length === 0) return;
    const snap = { cart, paymentMethod, discountAmount, discountType, notes };
    await holdSale(snap, selectedCustomer?.id || null, holdLabel || undefined, notes);
    toast({ title: 'Sale held', description: holdLabel || 'Saved to held sales' });
    setCart([]); setHoldLabel(''); setHoldDialogOpen(false); setSelectedCustomer(null);
  };

  const handleRecall = (h: any) => {
    setCart(h.cart_snapshot.cart || []);
    setPaymentMethod(h.cart_snapshot.paymentMethod || 'cash');
    setDiscountAmount(h.cart_snapshot.discountAmount || 0);
    setDiscountType(h.cart_snapshot.discountType || 'fixed');
    setNotes(h.cart_snapshot.notes || '');
    if (h.customer_id) {
      const c = customers.find(c => c.id === h.customer_id);
      if (c) setSelectedCustomer(c);
    }
    removeHeld(h.id);
    setRecallOpen(false);
    toast({ title: 'Sale recalled' });
  };

  const buildReceiptPDF = (data: any): jsPDF => {
    const snap = lastSaleCartRef.current;
    const doc = new jsPDF({ unit: 'mm', format: [80, 220] });
    const fontName = ensureUnicodeFontSync(doc);
    doc.setFont(fontName, 'normal');
    let y = 8;
    doc.setFontSize(11);
    if (posSettings?.store_name) { doc.text(posSettings.store_name, 40, y, { align: 'center' }); y += 5; }
    doc.setFontSize(10); doc.text('RECEIPT', 40, y, { align: 'center' }); y += 5;
    if (posSettings?.receipt_header) { doc.setFontSize(7); doc.text(posSettings.receipt_header, 40, y, { align: 'center' }); y += 4; }
    doc.setFontSize(8);
    doc.text(format(new Date(), 'dd/MM/yyyy HH:mm'), 40, y, { align: 'center' }); y += 4;
    doc.text(`#${data.sale_number || ''}`, 40, y, { align: 'center' }); y += 5;
    if (data.customer) { doc.text(`Customer: ${data.customer.name}`, 5, y); y += 4; }
    doc.line(5, y, 75, y); y += 4;

    (data.items || []).forEach((item: CartItem) => {
      doc.text(`${item.product.name}${item.variant?.name && item.variant.name !== 'Default' ? ` (${item.variant.name})` : ''}`, 5, y);
      doc.text(`${currencySym}${(item.unit_price * item.quantity).toFixed(2)}`, 75, y, { align: 'right' });
      y += 3; doc.setFontSize(7);
      doc.text(`  ${item.quantity} x ${currencySym}${item.unit_price.toFixed(2)}`, 5, y);
      doc.setFontSize(8); y += 4;
    });

    const st = snap?.subtotal ?? data.subtotal ?? 0;
    const da = snap?.discountApplied ?? data.discount_amount ?? 0;
    const tx = snap?.taxTotal ?? data.tax_amount ?? 0;
    const rd = snap?.redeemValue ?? data.loyalty_redeemed ?? 0;
    const sc = snap?.storeCreditApplied ?? data.store_credit_used ?? 0;
    const gt = snap?.grandTotal ?? data.total ?? 0;

    doc.line(5, y, 75, y); y += 4;
    doc.text(`Subtotal:`, 5, y); doc.text(`${currencySym}${st.toFixed(2)}`, 75, y, { align: 'right' }); y += 4;
    if (da > 0) { doc.text(`Discount:`, 5, y); doc.text(`-${currencySym}${da.toFixed(2)}`, 75, y, { align: 'right' }); y += 4; }
    if (tx > 0) { doc.text(`Tax:`, 5, y); doc.text(`${currencySym}${tx.toFixed(2)}`, 75, y, { align: 'right' }); y += 4; }
    if (rd > 0) { doc.text(`Loyalty:`, 5, y); doc.text(`-${currencySym}${rd.toFixed(2)}`, 75, y, { align: 'right' }); y += 4; }
    if (sc > 0) { doc.text(`Store Credit:`, 5, y); doc.text(`-${currencySym}${sc.toFixed(2)}`, 75, y, { align: 'right' }); y += 4; }
    doc.setFontSize(10);
    doc.text(`TOTAL:`, 5, y); doc.text(`${currencySym}${gt.toFixed(2)}`, 75, y, { align: 'right' }); y += 6;
    doc.setFontSize(8);
    doc.text(`Payment: ${data.payment_method || paymentMethod}`, 5, y); y += 5;
    if (data.loyalty_earned > 0) { doc.text(`Points earned: +${data.loyalty_earned}`, 5, y); y += 5; }
    if (posSettings?.receipt_footer) { doc.setFontSize(7); doc.text(posSettings.receipt_footer, 40, y, { align: 'center' }); y += 4; }
    doc.text('Thank you!', 40, y, { align: 'center' });
    return doc;
  };

  const exportReceipt = (data: any) => { const doc = buildReceiptPDF(data); doc.save(`${data.sale_number || 'receipt'}.pdf`); };
  const pickReceiptFolder = async () => {
    try {
      const handle = await (window as any).showDirectoryPicker({ mode: 'readwrite' });
      setReceiptDirHandle(handle); await saveHandleToDB(handle);
      toast({ title: 'Folder selected' });
      return handle;
    } catch { return null; }
  };
  const saveReceiptToFolder = async (data: any) => {
    setSavingReceipt(true); let handle = receiptDirHandle;
    if (handle) { try { const perm = await (handle as any).requestPermission({ mode: 'readwrite' }); if (perm !== 'granted') handle = null; } catch { handle = null; } }
    if (!handle) { handle = await pickReceiptFolder(); if (!handle) { setSavingReceipt(false); return; } }
    try {
      const doc = buildReceiptPDF(data); const blob = doc.output('blob');
      const fileName = `${data.sale_number || 'receipt'}.pdf`;
      const fh = await handle.getFileHandle(fileName, { create: true });
      const writable = await (fh as any).createWritable();
      await writable.write(blob); await writable.close();
      toast({ title: 'Saved!', description: fileName });
    } catch (err: any) { toast({ title: 'Save failed', description: err?.message, variant: 'destructive' }); }
    setSavingReceipt(false);
  };
  const printReceipt = (data: any) => {
    const doc = buildReceiptPDF(data); const url = doc.output('bloburl');
    const w = window.open(url as unknown as string);
    if (w) w.addEventListener('load', () => w.print());
  };

  const handleAddCustomer = async () => {
    if (!newCustomerName.trim()) return;
    const c = await addCustomer({ name: newCustomerName.trim(), phone: newCustomerPhone.trim() || null });
    if (c) { setSelectedCustomer(c); setCustomerDialogOpen(false); setNewCustomerName(''); setNewCustomerPhone(''); }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-4 animate-fade-in">
      {/* Left: Product Grid */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products, SKU, barcode..." className="pl-10" />
          </div>
          <Button variant="outline" onClick={() => setScannerOpen(true)} className="gap-2 shrink-0">
            <ScanBarcode className="h-4 w-4" /> Scan
          </Button>
          <Button variant="outline" onClick={() => setRecallOpen(true)} className="gap-2 shrink-0 relative">
            <PlayCircle className="h-4 w-4" /> Recall
            {held.length > 0 && <Badge className="absolute -top-2 -right-2 h-5 min-w-5 text-[10px] px-1">{held.length}</Badge>}
          </Button>
          <Button variant="outline" onClick={() => navigate('/returns')} className="gap-2 shrink-0">
            <RotateCcw className="h-4 w-4" /> Returns
          </Button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <Badge variant={categoryFilter === 'all' ? 'default' : 'outline'} className="cursor-pointer text-xs px-3 py-1" onClick={() => setCategoryFilter('all')}>All</Badge>
          {categories.map(cat => (
            <Badge key={cat.id} variant={categoryFilter === cat.id ? 'default' : 'outline'} className="cursor-pointer text-xs px-3 py-1"
              style={categoryFilter === cat.id ? { backgroundColor: cat.color } : {}}
              onClick={() => setCategoryFilter(categoryFilter === cat.id ? 'all' : cat.id)}>
              {cat.name}
            </Badge>
          ))}
        </div>

        <ScrollArea className="flex-1">
          {loading ? (
            <div className="flex items-center justify-center h-40"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <Tag className="h-8 w-8 mb-2" /><p>No products found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {filteredProducts.map(product => {
                const mainVariant = product.variants?.[0];
                const stock = mainVariant?.stock_quantity ?? 0;
                const isLowStock = stock <= (mainVariant?.min_stock_level ?? 5);
                return (
                  <Card key={product.id} className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-md group" onClick={() => addToCart(product)}>
                    <CardContent className="p-3 space-y-2">
                      <div className="aspect-square rounded-lg bg-muted/50 flex items-center justify-center text-3xl font-bold text-muted-foreground/30 group-hover:bg-primary/5 transition-colors">
                        {product.image_url ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover rounded-lg" /> : product.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-sm truncate text-foreground">{product.name}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-primary font-bold text-sm">{currencySym}{product.price.toFixed(2)}</span>
                          <Badge variant={isLowStock ? 'destructive' : 'secondary'} className="text-[10px]">{stock} left</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Right: Cart */}
      <Card className="w-full lg:w-[400px] flex flex-col shrink-0">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />Cart
              {cart.length > 0 && <Badge className="text-xs">{cart.length}</Badge>}
            </div>
            <div className="flex items-center gap-1">
              {cart.length > 0 && (
                <Button variant="ghost" size="sm" className="h-7 gap-1" onClick={() => setHoldDialogOpen(true)}>
                  <PauseCircle className="h-3.5 w-3.5" />Hold
                </Button>
              )}
              {cart.length > 0 && <Button variant="ghost" size="sm" className="text-destructive h-7" onClick={() => setCart([])}>Clear</Button>}
            </div>
          </CardTitle>
        </CardHeader>
        <Separator />

        <div className="px-4 py-2 flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground shrink-0" />
          <Select value={selectedCustomer?.id || 'walk-in'} onValueChange={v => {
            if (v === 'walk-in') setSelectedCustomer(null);
            else if (v === 'new') setCustomerDialogOpen(true);
            else setSelectedCustomer(customers.find(c => c.id === v) || null);
          }}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value="walk-in">Walk-in Customer</SelectItem>
              {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              <SelectItem value="new">+ Add Customer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {selectedCustomer && (
          <div className="px-4 pb-2 flex flex-wrap gap-2 text-xs">
            {availableStoreCredit > 0 && (
              <Badge variant="outline" className="gap-1"><Coins className="h-3 w-3" />Credit: {currencySym}{availableStoreCredit.toFixed(2)}</Badge>
            )}
            {(selectedCustomer as any).loyalty_points > 0 && (
              <Badge variant="outline" className="gap-1"><Star className="h-3 w-3" />Points: {(selectedCustomer as any).loyalty_points}</Badge>
            )}
          </div>
        )}

        <Separator />

        <ScrollArea className="flex-1 min-h-0">
          <div className="p-4 space-y-3">
            {cart.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-8">Cart is empty</p>
            ) : cart.map((item, i) => (
              <div key={i} className="flex items-start gap-2 bg-muted/30 rounded-lg p-2.5">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{item.product.name}</p>
                  {item.variant && item.variant.name !== 'Default' && <p className="text-xs text-muted-foreground">{item.variant.name}</p>}
                  <p className="text-xs text-muted-foreground">{currencySym}{item.unit_price.toFixed(2)} each</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(i, -1)}><Minus className="h-3 w-3" /></Button>
                  <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                  <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(i, 1)}><Plus className="h-3 w-3" /></Button>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm">{currencySym}{(item.unit_price * item.quantity).toFixed(2)}</p>
                  <Button variant="ghost" size="icon" className="h-5 w-5 text-destructive" onClick={() => removeFromCart(i)}><Trash2 className="h-3 w-3" /></Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <Separator />

        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Percent className="h-4 w-4 text-muted-foreground" />
            <Input type="number" min={0} value={discountAmount || ''} onChange={e => setDiscountAmount(Number(e.target.value))} placeholder="Discount" className="h-8 text-xs flex-1" />
            <Select value={discountType} onValueChange={v => setDiscountType(v as any)}>
              <SelectTrigger className="w-16 h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-popover"><SelectItem value="fixed">{currencySym}</SelectItem><SelectItem value="percentage">%</SelectItem></SelectContent>
            </Select>
          </div>

          {selectedCustomer && loyalty?.enabled && (selectedCustomer as any).loyalty_points > 0 && (
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <Input type="number" min={0} max={(selectedCustomer as any).loyalty_points}
                value={redeemPoints || ''} onChange={e => setRedeemPoints(Math.min((selectedCustomer as any).loyalty_points, Math.max(0, Number(e.target.value))))}
                placeholder="Redeem points" className="h-8 text-xs flex-1" />
              <span className="text-xs text-muted-foreground">= {currencySym}{redeemValue.toFixed(2)}</span>
            </div>
          )}

          {selectedCustomer && availableStoreCredit > 0 && (
            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <input type="checkbox" checked={useStoreCredit} onChange={e => setUseStoreCredit(e.target.checked)} className="h-3.5 w-3.5" />
              <Coins className="h-3.5 w-3.5 text-amber-500" />
              Apply store credit ({currencySym}{availableStoreCredit.toFixed(2)})
            </label>
          )}

          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>{currencySym}{subtotal.toFixed(2)}</span></div>
            {discountApplied > 0 && <div className="flex justify-between text-destructive"><span>Discount</span><span>-{currencySym}{discountApplied.toFixed(2)}</span></div>}
            {taxTotal > 0 && <div className="flex justify-between text-muted-foreground"><span>Tax</span><span>{currencySym}{taxTotal.toFixed(2)}</span></div>}
            {redeemValue > 0 && <div className="flex justify-between text-yellow-500"><span>Loyalty</span><span>-{currencySym}{redeemValue.toFixed(2)}</span></div>}
            {storeCreditApplied > 0 && <div className="flex justify-between text-amber-500"><span>Store Credit</span><span>-{currencySym}{storeCreditApplied.toFixed(2)}</span></div>}
            <Separator />
            <div className="flex justify-between font-bold text-lg"><span>Total</span><span className="text-primary">{currencySym}{grandTotal.toFixed(2)}</span></div>
            {earnedPoints > 0 && <p className="text-xs text-yellow-600 text-right">Will earn +{earnedPoints} pts</p>}
          </div>

          <Button className="w-full gap-2" size="lg" disabled={cart.length === 0 || processing} onClick={() => setCheckoutOpen(true)}>
            <CreditCard className="h-4 w-4" /> Checkout
          </Button>
        </div>
      </Card>

      {/* Checkout Dialog */}
      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Receipt className="h-5 w-5" /> Complete Payment</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{currencySym}{grandTotal.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">{cart.length} items</p>
            </div>
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <div className="grid grid-cols-2 gap-2">
                {[{ value: 'cash', label: 'Cash', icon: Banknote }, { value: 'card', label: 'Card', icon: CreditCard }, { value: 'credit', label: 'Credit', icon: Wallet }, { value: 'split', label: 'Split', icon: DollarSign }].map(m => (
                  <Button key={m.value} variant={paymentMethod === m.value ? 'default' : 'outline'} className="gap-2 h-12" onClick={() => setPaymentMethod(m.value)}>
                    <m.icon className="h-4 w-4" /> {m.label}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5"><Label>Notes (optional)</Label><Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Sale notes..." /></div>
            <Button className="w-full gap-2" size="lg" onClick={handleCheckout} disabled={processing}>
              <CheckCircle className="h-4 w-4" />{processing ? 'Processing...' : `Pay ${currencySym}${grandTotal.toFixed(2)}`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog open={!!receiptData} onOpenChange={() => setReceiptData(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="flex items-center gap-2 text-success"><CheckCircle className="h-5 w-5" /> Sale Complete!</DialogTitle></DialogHeader>
          <div className="space-y-4 text-center">
            <p className="text-3xl font-bold text-primary">{currencySym}{receiptData?.total?.toFixed(2) || '0.00'}</p>
            <p className="text-sm text-muted-foreground">#{receiptData?.sale_number}</p>
            <Separator />
            <div className="grid grid-cols-1 gap-2">
              <Button variant="outline" onClick={() => printReceipt(receiptData)} className="gap-2 w-full"><Printer className="h-4 w-4" /> Print Receipt</Button>
              {'showDirectoryPicker' in window && (
                <Button variant="outline" onClick={() => saveReceiptToFolder(receiptData)} disabled={savingReceipt} className="gap-2 w-full">
                  <FolderOpen className="h-4 w-4" />{receiptDirHandle ? (savingReceipt ? 'Saving...' : 'Save to Folder') : 'Choose Folder & Save'}
                </Button>
              )}
              <Button variant="outline" onClick={() => exportReceipt(receiptData)} className="gap-2 w-full"><Download className="h-4 w-4" /> Download PDF</Button>
            </div>
            <Separator />
            <Button className="w-full" onClick={() => setReceiptData(null)}>Start New Sale</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Customer Dialog */}
      <Dialog open={customerDialogOpen} onOpenChange={setCustomerDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Add Customer</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>Name *</Label><Input value={newCustomerName} onChange={e => setNewCustomerName(e.target.value)} placeholder="Customer name" /></div>
            <div className="space-y-1.5"><Label>Phone</Label><Input value={newCustomerPhone} onChange={e => setNewCustomerPhone(e.target.value)} placeholder="Phone number" /></div>
            <Button className="w-full" onClick={handleAddCustomer} disabled={!newCustomerName.trim()}>Add Customer</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hold Sale Dialog */}
      <Dialog open={holdDialogOpen} onOpenChange={setHoldDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><PauseCircle className="h-5 w-5" /> Hold Sale</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>Label (optional)</Label><Input value={holdLabel} onChange={e => setHoldLabel(e.target.value)} placeholder="e.g., Table 4, John's order" /></div>
            <Button className="w-full" onClick={handleHold}>Hold Sale</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Recall Dialog */}
      <Dialog open={recallOpen} onOpenChange={setRecallOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><PlayCircle className="h-5 w-5" /> Held Sales ({held.length})</DialogTitle></DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-2">
              {held.length === 0 ? <p className="text-sm text-muted-foreground text-center py-6">No held sales</p> :
                held.map(h => {
                  const items = h.cart_snapshot?.cart || [];
                  const total = items.reduce((s: number, i: any) => s + (i.unit_price * i.quantity), 0);
                  return (
                    <Card key={h.id} className="cursor-pointer hover:border-primary/50" onClick={() => handleRecall(h)}>
                      <CardContent className="p-3 flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{h.hold_label || `Held #${h.id.slice(0, 6)}`}</p>
                          <p className="text-xs text-muted-foreground">{items.length} items · {currencySym}{total.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">{format(new Date(h.held_at), 'dd/MM HH:mm')}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={(e) => { e.stopPropagation(); removeHeld(h.id); }}>
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <BarcodeScanner open={scannerOpen} onOpenChange={setScannerOpen} onScan={handleBarcodeScan} />
    </div>
  );
};

export default POS;
