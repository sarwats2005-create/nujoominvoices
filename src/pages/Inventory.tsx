import React, { useState, useMemo } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Package, Plus, Search, Edit, Trash2, AlertTriangle, ArrowDownToLine, ArrowUpFromLine,
  Tags, Boxes, BarChart3, TrendingDown
} from 'lucide-react';
import type { Product, ProductVariant } from '@/types/pos';

const Inventory: React.FC = () => {
  const {
    products, categories, loading,
    addProduct, updateProduct, deleteProduct,
    addCategory, deleteCategory,
    addStockMovement, getLowStockProducts,
  } = useProducts();
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [stockDialogOpen, setStockDialogOpen] = useState(false);
  const [stockProduct, setStockProduct] = useState<{ product: Product; variant: ProductVariant } | null>(null);
  const [stockType, setStockType] = useState<'IN' | 'OUT'>('IN');
  const [stockQty, setStockQty] = useState('');
  const [stockRef, setStockRef] = useState('');
  const [stockNotes, setStockNotes] = useState('');
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#6366f1');

  // Product form state
  const [formName, setFormName] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formBarcode, setFormBarcode] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formCostPrice, setFormCostPrice] = useState('');
  const [formTaxRate, setFormTaxRate] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formStock, setFormStock] = useState('0');
  const [formMinStock, setFormMinStock] = useState('5');

  const lowStockProducts = useMemo(() => getLowStockProducts(), [getLowStockProducts]);

  const filtered = useMemo(() => {
    let result = products;
    if (catFilter !== 'all') result = result.filter(p => p.category_id === catFilter);
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(s) ||
        p.sku?.toLowerCase().includes(s) ||
        p.barcode?.toLowerCase().includes(s)
      );
    }
    return result;
  }, [products, search, catFilter]);

  const totalProducts = products.length;
  const totalStock = products.reduce((s, p) => s + (p.variants?.[0]?.stock_quantity || 0), 0);
  const totalValue = products.reduce((s, p) => s + p.price * (p.variants?.[0]?.stock_quantity || 0), 0);

  const resetForm = () => {
    setFormName(''); setFormSku(''); setFormBarcode(''); setFormDesc('');
    setFormPrice(''); setFormCostPrice(''); setFormTaxRate('');
    setFormCategory(''); setFormStock('0'); setFormMinStock('5');
    setEditingProduct(null);
  };

  const openAddProduct = () => { resetForm(); setProductDialogOpen(true); };
  const openEditProduct = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormSku(p.sku || '');
    setFormBarcode(p.barcode || '');
    setFormDesc(p.description || '');
    setFormPrice(p.price.toString());
    setFormCostPrice(p.cost_price?.toString() || '');
    setFormTaxRate(p.tax_rate?.toString() || '');
    setFormCategory(p.category_id || '');
    setFormStock(p.variants?.[0]?.stock_quantity?.toString() || '0');
    setFormMinStock(p.variants?.[0]?.min_stock_level?.toString() || '5');
    setProductDialogOpen(true);
  };

  const handleSaveProduct = async () => {
    if (!formName.trim() || !formPrice) return;
    const data: any = {
      name: formName.trim(),
      sku: formSku.trim() || null,
      barcode: formBarcode.trim() || null,
      description: formDesc.trim() || null,
      price: parseFloat(formPrice),
      cost_price: formCostPrice ? parseFloat(formCostPrice) : 0,
      tax_rate: formTaxRate ? parseFloat(formTaxRate) : 0,
      category_id: formCategory || null,
    };

    if (editingProduct) {
      await updateProduct(editingProduct.id, data);
      toast({ title: 'Product updated' });
    } else {
      await addProduct(data, [{
        name: 'Default',
        stock_quantity: parseInt(formStock) || 0,
        min_stock_level: parseInt(formMinStock) || 5,
      }]);
      toast({ title: 'Product added' });
    }
    setProductDialogOpen(false);
    resetForm();
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await deleteProduct(id);
    toast({ title: 'Product deleted' });
  };

  const openStockDialog = (product: Product, variant: ProductVariant, type: 'IN' | 'OUT') => {
    setStockProduct({ product, variant });
    setStockType(type);
    setStockQty('');
    setStockRef('');
    setStockNotes('');
    setStockDialogOpen(true);
  };

  const handleStockMovement = async () => {
    if (!stockProduct || !stockQty || parseInt(stockQty) <= 0) return;
    await addStockMovement(
      stockProduct.product.id, stockProduct.variant.id,
      stockType, parseInt(stockQty), stockRef || undefined, stockNotes || undefined
    );
    toast({ title: `Stock ${stockType === 'IN' ? 'added' : 'deducted'}` });
    setStockDialogOpen(false);
  };

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    await addCategory(newCatName.trim(), newCatColor);
    toast({ title: 'Category added' });
    setCategoryDialogOpen(false);
    setNewCatName('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Boxes className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Inventory</h1>
            <p className="text-sm text-muted-foreground">Manage products, stock & categories</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCategoryDialogOpen(true)} className="gap-2">
            <Tags className="h-4 w-4" /> Categories
          </Button>
          <Button onClick={openAddProduct} className="gap-2">
            <Plus className="h-4 w-4" /> Add Product
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10"><Package className="h-5 w-5 text-primary" /></div>
            <div><p className="text-2xl font-bold text-foreground">{totalProducts}</p><p className="text-sm text-muted-foreground">Products</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10"><Boxes className="h-5 w-5 text-accent-foreground" /></div>
            <div><p className="text-2xl font-bold text-foreground">{totalStock}</p><p className="text-sm text-muted-foreground">Total Stock</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10"><BarChart3 className="h-5 w-5 text-success" /></div>
            <div><p className="text-2xl font-bold text-foreground">${totalValue.toLocaleString()}</p><p className="text-sm text-muted-foreground">Stock Value</p></div>
          </CardContent>
        </Card>
        <Card className={lowStockProducts.length > 0 ? 'border-destructive/50' : ''}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/10"><TrendingDown className="h-5 w-5 text-destructive" /></div>
            <div><p className="text-2xl font-bold text-foreground">{lowStockProducts.length}</p><p className="text-sm text-muted-foreground">Low Stock</p></div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="font-semibold text-sm text-destructive">Low Stock Alert</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {lowStockProducts.map(p => (
                <Badge key={p.id} variant="destructive" className="text-xs">
                  {p.name} ({p.variants?.[0]?.stock_quantity || 0} left)
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="pl-10" />
        </div>
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Categories" /></SelectTrigger>
          <SelectContent className="bg-popover">
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-right">Tax %</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No products found</TableCell></TableRow>
                ) : filtered.map(product => {
                  const variant = product.variants?.[0];
                  const stock = variant?.stock_quantity ?? 0;
                  const isLow = stock <= (variant?.min_stock_level ?? 5);
                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{product.name}</p>
                          {product.barcode && <p className="text-xs text-muted-foreground font-mono">{product.barcode}</p>}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-mono">{product.sku || '—'}</TableCell>
                      <TableCell>
                        {product.category ? (
                          <Badge variant="secondary" className="text-xs" style={{ borderColor: product.category.color }}>
                            {product.category.name}
                          </Badge>
                        ) : '—'}
                      </TableCell>
                      <TableCell className="text-right font-semibold">${product.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right text-muted-foreground">${(product.cost_price || 0).toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={isLow ? 'destructive' : 'secondary'} className="text-xs">
                          {stock}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{product.tax_rate}%</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {variant && (
                            <>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-success" onClick={() => openStockDialog(product, variant, 'IN')} title="Stock In">
                                <ArrowDownToLine className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-orange-500" onClick={() => openStockDialog(product, variant, 'OUT')} title="Stock Out">
                                <ArrowUpFromLine className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          )}
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditProduct(product)}>
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDeleteProduct(product.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Product Dialog */}
      <Dialog open={productDialogOpen} onOpenChange={v => { if (!v) resetForm(); setProductDialogOpen(v); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Name <span className="text-destructive">*</span></Label>
              <Input value={formName} onChange={e => setFormName(e.target.value)} placeholder="Product name" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>SKU</Label>
                <Input value={formSku} onChange={e => setFormSku(e.target.value)} placeholder="SKU-001" />
              </div>
              <div className="space-y-1.5">
                <Label>Barcode</Label>
                <Input value={formBarcode} onChange={e => setFormBarcode(e.target.value)} placeholder="Barcode" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea value={formDesc} onChange={e => setFormDesc(e.target.value)} rows={2} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Price <span className="text-destructive">*</span></Label>
                <Input type="number" step="0.01" value={formPrice} onChange={e => setFormPrice(e.target.value)} placeholder="0.00" />
              </div>
              <div className="space-y-1.5">
                <Label>Cost Price</Label>
                <Input type="number" step="0.01" value={formCostPrice} onChange={e => setFormCostPrice(e.target.value)} placeholder="0.00" />
              </div>
              <div className="space-y-1.5">
                <Label>Tax %</Label>
                <Input type="number" step="0.01" value={formTaxRate} onChange={e => setFormTaxRate(e.target.value)} placeholder="0" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={formCategory} onValueChange={setFormCategory}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent className="bg-popover">
                  {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {!editingProduct && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Initial Stock</Label>
                  <Input type="number" value={formStock} onChange={e => setFormStock(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Min Stock Level</Label>
                  <Input type="number" value={formMinStock} onChange={e => setFormMinStock(e.target.value)} />
                </div>
              </div>
            )}
            <Button className="w-full" onClick={handleSaveProduct} disabled={!formName.trim() || !formPrice}>
              {editingProduct ? 'Save Changes' : 'Add Product'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stock Movement Dialog */}
      <Dialog open={stockDialogOpen} onOpenChange={setStockDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {stockType === 'IN' ? <ArrowDownToLine className="h-5 w-5 text-success" /> : <ArrowUpFromLine className="h-5 w-5 text-orange-500" />}
              Stock {stockType === 'IN' ? 'In' : 'Out'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted/30 rounded-lg p-3">
              <p className="font-medium text-sm">{stockProduct?.product.name}</p>
              <p className="text-xs text-muted-foreground">Current stock: {stockProduct?.variant.stock_quantity}</p>
            </div>
            <div className="space-y-1.5">
              <Label>Quantity <span className="text-destructive">*</span></Label>
              <Input type="number" min={1} value={stockQty} onChange={e => setStockQty(e.target.value)} placeholder="0" />
            </div>
            <div className="space-y-1.5">
              <Label>Reference</Label>
              <Input value={stockRef} onChange={e => setStockRef(e.target.value)} placeholder="PO number, etc." />
            </div>
            <div className="space-y-1.5">
              <Label>Notes</Label>
              <Input value={stockNotes} onChange={e => setStockNotes(e.target.value)} placeholder="Optional notes" />
            </div>
            <Button className="w-full" onClick={handleStockMovement} disabled={!stockQty || parseInt(stockQty) <= 0}>
              Confirm Stock {stockType === 'IN' ? 'In' : 'Out'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Category Dialog */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Categories</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="Category name" className="flex-1" />
              <Input type="color" value={newCatColor} onChange={e => setNewCatColor(e.target.value)} className="w-12 p-1 h-10" />
              <Button onClick={handleAddCategory} disabled={!newCatName.trim()}><Plus className="h-4 w-4" /></Button>
            </div>
            <Separator />
            <div className="space-y-2">
              {categories.map(cat => (
                <div key={cat.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-sm font-medium">{cat.name}</span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteCategory(cat.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
              {categories.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No categories yet</p>}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Inventory;
