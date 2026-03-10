import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Menu, X, Instagram, MessageCircle, 
  User, Plus, Trash2, Save, Loader2, Search, Check, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';

// --- CONFIGURAÇÃO SEGURA PARA AMBIENTE VITE ---
// Nota: O erro de compilação na pré-visualização deste chat pode ocorrer se o ambiente
// não suportar o pacote externo, mas no seu VS Code (local) funcionará perfeitamente.
const getEnvVar = (key) => {
  try {
    // Acesso seguro às variáveis do Vite
    return import.meta.env[key] || "";
  } catch (e) {
    return "";
  }
};

const SUPABASE_URL = getEnvVar('VITE_SUPABASE_URL');
const SUPABASE_ANON_KEY = getEnvVar('VITE_SUPABASE_ANON_KEY');

// Inicializa o cliente Supabase de forma condicional para evitar erros se as chaves faltarem
const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY) 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// --- COMPONENTES ---

const Navbar = ({ view, setView }) => (
  <nav className="fixed top-0 w-full z-[80] bg-[#F9F8F6]/90 backdrop-blur-md border-b border-[#C5A059]/10">
    <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <button className="p-2 -ml-2 text-[#121212] lg:hidden">
          <Menu size={20} strokeWidth={1.5} />
        </button>
        <div className="hidden lg:flex gap-8 text-[10px] uppercase tracking-[0.25em] font-medium text-[#8E8E8E]">
          <a href="#" className="hover:text-[#C5A059] transition-colors">Coleções</a>
          <a href="#" className="hover:text-[#C5A059] transition-colors">Curadoria</a>
        </div>
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 cursor-pointer" onClick={() => setView('store')}>
        <h1 className="text-2xl font-serif tracking-[0.2em] text-[#121212] uppercase italic font-light">
          Monamour
        </h1>
      </div>

      <div className="flex items-center gap-6">
        <button 
          className={`p-2 rounded-full transition-all ${view === 'admin' ? 'bg-[#C5A059] text-white' : 'text-[#121212] hover:bg-black/5'}`} 
          onClick={() => setView(view === 'admin' ? 'store' : 'admin')}
        >
          <User size={18} strokeWidth={1.5} />
        </button>
        <button className="relative text-[#121212]">
          <ShoppingBag size={18} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  </nav>
);

const ProductModal = ({ product, onClose }) => {
  if (!product) return null;
  const handleWhatsApp = () => {
    const msg = encodeURIComponent(`Olá! Estou no site da MONAMOUR e gostaria de um atendimento exclusivo para a peça: ${product.name}.`);
    window.open(`https://wa.me/5531992497317?text=${msg}`, '_blank');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#121212]/80 backdrop-blur-lg" onClick={onClose} />
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }} 
        exit={{ scale: 0.95, opacity: 0, y: 20 }} 
        className="relative bg-[#F9F8F6] w-full max-w-5xl h-[85vh] overflow-hidden rounded-sm shadow-2xl flex flex-col md:flex-row"
      >
        <button onClick={onClose} className="absolute top-8 right-8 z-20 text-black hover:rotate-90 transition-transform duration-500"><X size={24} strokeWidth={1} /></button>
        <div className="w-full md:w-1/2 h-1/2 md:h-auto overflow-hidden bg-[#F0EFED]">
          <img src={product.image} className="w-full h-full object-cover" alt={product.name} />
        </div>
        <div className="w-full md:w-1/2 p-12 flex flex-col justify-center bg-white text-[#121212]">
          <span className="text-[10px] uppercase tracking-[0.5em] text-[#C5A059] mb-4 font-bold">Curadoria Exclusiva</span>
          <h2 className="text-5xl font-serif mb-8 italic tracking-tight">{product.name}</h2>
          <p className="text-[#8E8E8E] text-sm leading-relaxed mb-12 font-light">{product.description}</p>
          <button onClick={handleWhatsApp} className="w-full py-6 bg-[#121212] text-white text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-[#C5A059] transition-all duration-500 flex items-center justify-center gap-4 group">
            <MessageCircle size={18} className="group-hover:scale-110 transition-transform" /> 
            Agendar Consultoria VIP
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const AddProductModal = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', category: 'Vestidos', price: 'Sob Consulta', image: '', description: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!supabase) return alert("Erro: Supabase não configurado no arquivo .env!");
    setLoading(true);
    try {
      const { error } = await supabase.from('products').insert([formData]);
      if (error) throw error;
      onClose();
      setFormData({ name: '', category: 'Vestidos', price: 'Sob Consulta', image: '', description: '' });
    } catch (err) { 
      console.error("Erro Supabase:", err.message);
      alert("Erro ao salvar: " + err.message);
    } finally { setLoading(false); }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative bg-white w-full max-w-lg p-10 rounded-sm shadow-2xl text-[#121212]">
        <h3 className="text-2xl font-serif italic mb-8">Novo Item no Acervo</h3>
        <form onSubmit={handleSubmit} className="space-y-5">
          <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-4 bg-[#F9F8F6] border-b border-[#F0EFED] outline-none focus:border-[#C5A059] transition-all" placeholder="Nome da Peça" />
          <div className="grid grid-cols-2 gap-4">
            <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="p-4 bg-[#F9F8F6] border-b border-[#F0EFED] outline-none">
              <option>Vestidos</option><option>Alfaiataria</option><option>Acessórios</option><option>Exclusive</option>
            </select>
            <input value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="p-4 bg-[#F9F8F6] border-b border-[#F0EFED] outline-none" placeholder="Preço" />
          </div>
          <input required value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full p-4 bg-[#F9F8F6] border-b border-[#F0EFED] outline-none" placeholder="URL da Imagem" />
          <textarea rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-4 bg-[#F9F8F6] border-b border-[#F0EFED] outline-none" placeholder="Descrição técnica..." />
          <button disabled={loading} className="w-full py-5 bg-[#121212] text-white text-[10px] uppercase tracking-widest font-bold flex items-center justify-center gap-2 hover:bg-[#C5A059] transition-all">
            {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} 
            Confirmar Curadoria
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const AdminDashboard = ({ products }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const deleteProduct = async (id) => {
    if (!confirm("Confirmar exclusão desta peça?")) return;
    if (supabase) {
      await supabase.from('products').delete().eq('id', id);
    }
  };

  return (
    <div className="pt-32 min-h-screen bg-[#F0EFED] p-8 lg:p-16 text-[#121212]">
      <AddProductModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16">
          <div>
            <h2 className="text-5xl font-serif italic mb-2 tracking-tight">Dashboard Monamour</h2>
            <p className="text-[10px] uppercase tracking-[0.4em] text-[#8E8E8E] font-medium">Gestão de Ativos Digitais</p>
          </div>
          <button onClick={() => setIsFormOpen(true)} className="px-12 py-5 bg-[#121212] text-white text-[10px] uppercase tracking-widest font-bold hover:bg-[#C5A059] transition-all shadow-xl flex items-center gap-3">
            <Plus size={18} /> Adicionar Nova Peça
          </button>
        </header>
        <div className="bg-white shadow-sm overflow-hidden rounded-sm border border-[#C5A059]/10">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b bg-[#F9F8F6] text-[9px] uppercase tracking-widest text-[#8E8E8E] font-bold">
                <th className="px-10 py-8">Acervo</th>
                <th className="px-10 py-8">Categoria</th>
                <th className="px-10 py-8 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr><td colSpan="3" className="px-10 py-32 text-center opacity-40 uppercase text-[10px] tracking-[0.5em] font-serif italic">Nenhum item cadastrado no momento.</td></tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="border-b hover:bg-[#F9F8F6] transition-all group">
                    <td className="px-10 py-6 flex items-center gap-8">
                      <div className="w-16 h-20 bg-[#F0EFED] overflow-hidden rounded-sm">
                        <img src={p.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" alt={p.name} />
                      </div>
                      <span className="font-serif text-2xl italic tracking-tight">{p.name}</span>
                    </td>
                    <td className="px-10 py-6 text-[11px] uppercase tracking-widest text-[#8E8E8E]">{p.category}</td>
                    <td className="px-10 py-6 text-right">
                      <button onClick={() => deleteProduct(p.id)} className="p-3 text-[#8E8E8E] hover:text-red-500 transition-colors"><Trash2 size={20} strokeWidth={1.5} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [view, setView] = useState('store');
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    if (!supabase) return;

    const fetchProducts = async () => {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (data) setProducts(data);
    };

    fetchProducts();
    const channel = supabase.channel('public:products').on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => fetchProducts()).subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  return (
    <div className="min-h-screen bg-[#F9F8F6] font-sans text-[#121212] selection:bg-[#C5A059]/20">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Inter:wght@200;300;400;500;600&display=swap');
        .font-serif { font-family: 'Cormorant Garamond', serif; }
        body { margin: 0; padding: 0; overflow-x: hidden; }
      `}</style>
      <Navbar view={view} setView={setView} />
      <AnimatePresence mode="wait">
        {view === 'store' ? (
          <motion.div key="store" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }}>
            <section className="relative h-screen flex items-center justify-center bg-black overflow-hidden">
              <motion.img 
                initial={{ scale: 1.25, opacity: 0 }} 
                animate={{ scale: 1, opacity: 0.6 }} 
                transition={{ duration: 6, ease: "easeOut" }} 
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=2000" 
                className="absolute inset-0 w-full h-full object-cover grayscale" 
                alt="Banner Principal" 
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/20" />
              <div className="relative z-10 text-center px-6">
                <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }} className="text-[11px] uppercase tracking-[1.2em] text-[#C5A059] mb-14 block font-bold">Monamour Private Curator</motion.span>
                <div className="overflow-hidden mb-16">
                  <motion.h2 initial={{ y: "100%" }} animate={{ y: 0 }} transition={{ delay: 1.3, duration: 1.8, ease: [0.16, 1, 0.3, 1] }} className="text-7xl md:text-[150px] font-serif text-[#F9F8F6] italic leading-[0.85] tracking-tight">Excelência <br /> Atemporal</motion.h2>
                </div>
                <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }} className="px-24 py-8 bg-white text-black text-[11px] uppercase tracking-[0.6em] font-bold hover:bg-[#C5A059] hover:text-white transition-all duration-700 shadow-2xl">Explorar Acervo</motion.button>
              </div>
            </section>
            
            <section className="max-w-7xl mx-auto px-6 py-56">
              <div className="max-w-3xl mb-40">
                <h3 className="text-6xl font-serif text-[#121212] italic mb-10 tracking-tight leading-tight">A Essência do Incomparável</h3>
                <div className="w-20 h-[1px] bg-[#C5A059] mb-10" />
                <p className="text-[12px] uppercase tracking-[0.4em] text-[#8E8E8E] leading-loose max-w-lg font-medium">
                  Curadoria rigorosa de tecidos nobres e design de vanguarda. 
                  Para aqueles que compreendem que o luxo reside no silêncio dos detalhes.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-20 gap-y-40">
                {products.length === 0 ? (
                  <div className="col-span-full text-center py-56 border-y border-[#F0EFED] opacity-20 uppercase text-[11px] tracking-[1em] font-serif italic">Sincronizando Curadoria Digital...</div>
                ) : (
                  products.map((p) => (
                    <motion.div key={p.id} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, ease: "easeOut" }} viewport={{ once: true }} onClick={() => setSelectedProduct(p)} className="group cursor-pointer">
                      <div className="aspect-[3/4] overflow-hidden bg-[#F0EFED] mb-12 relative shadow-md">
                        <img src={p.image} className="w-full h-full object-cover grayscale-[30%] transition-all duration-[2.5s] group-hover:grayscale-0 group-hover:scale-105" alt={p.name} />
                      </div>
                      <div className="text-center px-4">
                        <p className="text-[10px] uppercase tracking-[0.7em] text-[#C5A059] mb-4 font-bold">{p.category}</p>
                        <h4 className="text-3xl font-serif italic mb-4 tracking-tight leading-none text-[#121212]">{p.name}</h4>
                        <p className="text-[12px] text-[#8E8E8E] uppercase tracking-[0.3em] font-medium italic">{p.price}</p>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </section>
          </motion.div>
        ) : (
          <motion.div key="admin" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} transition={{ duration: 0.6 }}>
            <AdminDashboard products={products} />
          </motion.div>
        )}
      </AnimatePresence>
      <footer className="bg-[#121212] text-white py-56 text-center border-t border-white/5 relative overflow-hidden">
        <h1 className="text-6xl font-serif italic tracking-[0.6em] uppercase opacity-90 relative z-10">Monamour</h1>
        <div className="space-y-8 relative z-10 mt-10">
          <p className="text-[11px] uppercase tracking-[0.7em] text-[#C5A059] font-bold">Belo Horizonte | São Paulo | Paris</p>
        </div>
      </footer>
      <AnimatePresence>{selectedProduct && <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />}</AnimatePresence>
    </div>
  );
}