import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Menu, X, Instagram, MessageCircle, 
  User, Plus, Trash2, Save, Loader2, ChevronLeft, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';

// --- CONFIGURAÇÃO SEGURA ---
const getEnvVar = (key) => {
  try { return import.meta.env[key] || ""; } 
  catch (e) { return ""; }
};

const SUPABASE_URL = getEnvVar('VITE_SUPABASE_URL');
const SUPABASE_ANON_KEY = getEnvVar('VITE_SUPABASE_ANON_KEY');

const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY) 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// --- FORMATADOR DE IMAGENS (SUPORTE GOOGLE DRIVE E MÚLTIPLOS LINKS) ---
const formatImageUrl = (url) => {
  if (!url) return "";
  let cleanUrl = url.trim();
  // Se for um link de visualização do Google Drive, transforma em link direto
  if (cleanUrl.includes('drive.google.com') && cleanUrl.includes('/file/d/')) {
    const id = cleanUrl.split('/file/d/')[1]?.split('/')[0];
    return `https://drive.google.com/uc?export=view&id=${id}`;
  }
  return cleanUrl;
};

// --- COMPONENTE DE NAVEGAÇÃO DE IMAGENS (GALERIA EDITORIAL) ---
const ImageGallery = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Transforma a string de links (separada por vírgula) em um array real
  const imageList = images ? images.split(',').map(img => formatImageUrl(img.trim())) : [];

  if (imageList.length <= 1) {
    return (
      <div className="w-full h-full bg-[#F0EFED]">
        <img src={imageList[0] || 'https://placehold.co/600x800/F0EFED/121212?text=Sem+Imagem'} className="w-full h-full object-cover" alt="Produto" />
      </div>
    );
  }

  const next = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % imageList.length);
  };
  
  const prev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + imageList.length) % imageList.length);
  };

  return (
    <div className="relative w-full h-full group bg-[#F0EFED] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.img 
          key={currentIndex}
          src={imageList[currentIndex]} 
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="w-full h-full object-cover" 
          alt={`Visualização ${currentIndex + 1}`} 
        />
      </AnimatePresence>
      
      {/* Setas de Navegação Minimalistas */}
      <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-all duration-500 z-10">
        <button onClick={prev} className="p-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-white hover:bg-white hover:text-black transition-all">
          <ChevronLeft size={20} strokeWidth={1.5} />
        </button>
        <button onClick={next} className="p-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-white hover:bg-white hover:text-black transition-all">
          <ChevronRight size={20} strokeWidth={1.5} />
        </button>
      </div>

      {/* Indicadores de Progresso (Dots) */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
        {imageList.map((_, idx) => (
          <button 
            key={idx} 
            onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
            className={`h-[2px] transition-all duration-500 ${idx === currentIndex ? 'bg-white w-8' : 'bg-white/30 w-4'}`} 
          />
        ))}
      </div>
    </div>
  );
};

// --- COMPONENTES DA INTERFACE ---

const Navbar = ({ view, setView }) => (
  <nav className="fixed top-0 w-full z-[80] bg-[#F9F8F6]/90 backdrop-blur-md border-b border-[#C5A059]/10">
    <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
      <div className="flex items-center gap-6 cursor-pointer" onClick={() => setView('store')}>
        <h1 className="text-2xl font-serif tracking-[0.2em] text-[#121212] uppercase italic font-light">Monamour</h1>
      </div>
      <div className="flex items-center gap-6">
        <button 
          className={`p-2 transition-all rounded-full ${view === 'admin' ? 'bg-[#C5A059] text-white shadow-lg shadow-[#C5A059]/30' : 'text-[#121212] hover:bg-black/5'}`} 
          onClick={() => setView(view === 'admin' ? 'store' : 'admin')}
        >
          <User size={18} strokeWidth={1.5} />
        </button>
        <button className="relative text-[#121212] p-2 hover:bg-black/5 rounded-full transition-all">
          <ShoppingBag size={18} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  </nav>
);

const ProductModal = ({ product, onClose }) => {
  if (!product) return null;
  const handleWhatsApp = () => {
    const msg = encodeURIComponent(`Olá! Gostaria de um atendimento VIP para a peça: ${product.name}.`);
    window.open(`https://wa.me/5531992497317?text=${msg}`, '_blank');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#121212]/90 backdrop-blur-sm" onClick={onClose} />
      <motion.div 
        initial={{ scale: 0.98, opacity: 0, y: 20 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }} 
        exit={{ scale: 0.98, opacity: 0, y: 20 }}
        className="relative bg-[#F9F8F6] w-full max-w-6xl h-[85vh] overflow-hidden rounded-sm shadow-2xl flex flex-col md:flex-row"
      >
        <button onClick={onClose} className="absolute top-8 right-8 z-30 text-black hover:rotate-90 transition-transform duration-500"><X size={24} strokeWidth={1} /></button>
        <div className="w-full md:w-3/5 h-1/2 md:h-auto overflow-hidden relative">
          <ImageGallery images={product.image} />
        </div>
        <div className="w-full md:w-2/5 p-16 flex flex-col justify-center bg-white text-[#121212]">
          <span className="text-[10px] uppercase tracking-[0.6em] text-[#C5A059] mb-6 font-bold">Curadoria Exclusiva</span>
          <h2 className="text-5xl font-serif mb-8 italic tracking-tight leading-[0.9]">{product.name}</h2>
          <div className="w-12 h-[1px] bg-[#C5A059] mb-10 opacity-30" />
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
    if (!supabase) return alert("Erro: Conexão com banco de dados falhou!");
    setLoading(true);
    try {
      const { error } = await supabase.from('products').insert([formData]);
      if (error) throw error;
      onClose();
      setFormData({ name: '', category: 'Vestidos', price: 'Sob Consulta', image: '', description: '' });
    } catch (err) { 
      alert("Erro ao salvar: " + err.message);
    } finally { setLoading(false); }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={onClose} />
      <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative bg-white w-full max-w-lg p-12 rounded-sm shadow-2xl">
        <h3 className="text-3xl font-serif italic mb-8">Novo Item no Acervo</h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="text-[9px] uppercase tracking-widest text-[#8E8E8E] font-bold">Nome do Produto</label>
            <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-4 bg-[#F9F8F6] border-b border-[#F0EFED] outline-none focus:border-[#C5A059] transition-all" placeholder="Ex: Vestido Seda Paris" />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] uppercase tracking-widest text-[#8E8E8E] font-bold">URLs das Imagens (Separe com vírgula)</label>
            <input required value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full p-4 bg-[#F9F8F6] border-b border-[#F0EFED] outline-none focus:border-[#C5A059] transition-all" placeholder="link1.jpg, link2.jpg..." />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-widest text-[#8E8E8E] font-bold">Categoria</label>
              <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full p-4 bg-[#F9F8F6] border-b border-[#F0EFED] outline-none appearance-none">
                <option>Vestidos</option><option>Alfaiataria</option><option>Acessórios</option><option>Exclusive</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-widest text-[#8E8E8E] font-bold">Preço / Status</label>
              <input value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full p-4 bg-[#F9F8F6] border-b border-[#F0EFED] outline-none focus:border-[#C5A059]" placeholder="Sob Consulta" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[9px] uppercase tracking-widest text-[#8E8E8E] font-bold">Descrição Narrativa</label>
            <textarea rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-4 bg-[#F9F8F6] border-b border-[#F0EFED] outline-none focus:border-[#C5A059]" placeholder="Conte a história da peça..." />
          </div>
          <button disabled={loading} className="w-full py-6 bg-[#121212] text-white text-[11px] uppercase tracking-[0.3em] font-bold flex items-center justify-center gap-3 hover:bg-[#C5A059] transition-all shadow-xl shadow-black/10">
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} 
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
    if (!confirm("Remover permanentemente esta peça do acervo?")) return;
    await supabase.from('products').delete().eq('id', id);
  };

  return (
    <div className="pt-24 min-h-screen bg-[#F0EFED] p-8 lg:p-16">
      <AddProductModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16">
          <div>
            <h2 className="text-5xl font-serif italic tracking-tight leading-none mb-3">Gestão de Acervo</h2>
            <p className="text-[10px] uppercase tracking-[0.4em] text-[#8E8E8E] font-bold">Sistema Operacional Monamour</p>
          </div>
          <button onClick={() => setIsFormOpen(true)} className="px-12 py-5 bg-[#121212] text-white text-[10px] uppercase tracking-widest font-bold flex items-center gap-3 shadow-2xl hover:bg-[#C5A059] transition-all">
            <Plus size={20} /> Novo Ativo
          </button>
        </div>
        <div className="bg-white shadow-sm overflow-hidden border border-[#C5A059]/10 rounded-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b bg-[#F9F8F6] text-[9px] uppercase tracking-[0.5em] text-[#8E8E8E] font-bold italic">
                <th className="px-10 py-8">Peça Curada</th>
                <th className="px-10 py-8">Fotos</th>
                <th className="px-10 py-8">Categoria</th>
                <th className="px-10 py-8 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b hover:bg-[#F9F8F6] transition-all group">
                  <td className="px-10 py-6 flex items-center gap-8">
                    <div className="w-16 h-20 bg-[#F0EFED] overflow-hidden rounded-sm shadow-sm">
                      <img src={formatImageUrl(p.image.split(',')[0])} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt={p.name} />
                    </div>
                    <span className="font-serif text-2xl italic tracking-tight">{p.name}</span>
                  </td>
                  <td className="px-10 py-6">
                    <span className="px-3 py-1 bg-[#F0EFED] text-[10px] font-bold rounded-full">
                      {p.image.split(',').length}
                    </span>
                  </td>
                  <td className="px-10 py-6 text-[10px] uppercase tracking-widest font-semibold text-[#8E8E8E]">{p.category}</td>
                  <td className="px-10 py-6 text-right">
                    <button onClick={() => deleteProduct(p.id)} className="p-4 text-[#8E8E8E] hover:text-red-500 transition-colors">
                      <Trash2 size={20} strokeWidth={1.5} />
                    </button>
                  </td>
                </tr>
              ))}
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
      const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (data) setProducts(data);
    };
    fetchProducts();
    const channel = supabase.channel('products').on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, fetchProducts).subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  return (
    <div className="min-h-screen bg-[#F9F8F6] font-sans text-[#121212] selection:bg-[#C5A059]/20">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Inter:wght@200;300;400;500;600&display=swap');
        .font-serif { font-family: 'Cormorant Garamond', serif; }
      `}</style>
      <Navbar view={view} setView={setView} />
      <AnimatePresence mode="wait">
        {view === 'store' ? (
          <motion.div key="store" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }}>
            <section className="relative h-[90vh] flex items-center justify-center bg-black overflow-hidden">
              <motion.img initial={{ scale: 1.15, opacity: 0 }} animate={{ scale: 1, opacity: 0.6 }} transition={{ duration: 6, ease: "easeOut" }} src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=2000" className="absolute inset-0 w-full h-full object-cover grayscale" alt="Hero" />
              <div className="relative z-10 text-center px-6">
                <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="text-[12px] uppercase tracking-[1.2em] text-[#C5A059] mb-14 block font-bold">Monamour Private Curator</motion.span>
                <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2, duration: 1.8 }} className="text-7xl md:text-[150px] font-serif text-[#F9F8F6] italic leading-[0.8] tracking-tighter">Excelência <br /> Atemporal</motion.h2>
              </div>
              <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce opacity-20">
                 <div className="w-[1px] h-20 bg-white" />
              </div>
            </section>
            
            <section className="max-w-7xl mx-auto px-6 py-56">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-24 gap-y-56">
                {products.length === 0 ? (
                  <div className="col-span-full text-center py-64 border-y border-[#C5A059]/10 opacity-20 uppercase text-[12px] tracking-[1.2em] font-serif italic font-bold">Iniciando Curadoria Digital...</div>
                ) : (
                  products.map((p) => (
                    <motion.div key={p.id} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 1.2 }} viewport={{ once: true }} onClick={() => setSelectedProduct(p)} className="group cursor-pointer">
                      <div className="aspect-[3/4] overflow-hidden bg-[#F0EFED] mb-12 relative shadow-lg">
                        <img src={formatImageUrl(p.image.split(',')[0])} className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-[2.5s]" alt={p.name} />
                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                      </div>
                      <div className="text-center px-4">
                        <p className="text-[10px] uppercase tracking-[0.8em] text-[#C5A059] mb-5 font-bold">{p.category}</p>
                        <h4 className="text-3xl font-serif italic mb-5 leading-none text-[#121212] tracking-tight">{p.name}</h4>
                        <p className="text-[12px] text-[#8E8E8E] uppercase tracking-[0.4em] font-medium italic">{p.price}</p>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </section>
          </motion.div>
        ) : (
          <AdminDashboard products={products} />
        )}
      </AnimatePresence>
      <footer className="bg-[#121212] text-white py-64 text-center border-t border-white/5 relative overflow-hidden">
        <h1 className="text-7xl font-serif italic tracking-[0.6em] uppercase opacity-95 relative z-10">Monamour</h1>
        <div className="space-y-12 relative z-10 mt-20">
          <p className="text-[13px] uppercase tracking-[0.8em] text-[#C5A059] font-bold">Belo Horizonte | São Paulo | Paris</p>
          <p className="text-[9px] uppercase tracking-[0.5em] opacity-20 font-light">© 2024 Monamour Luxury Experience. All Rights Reserved.</p>
        </div>
        <div className="absolute -bottom-48 left-1/2 -translate-x-1/2 text-[550px] font-serif italic opacity-[0.02] pointer-events-none select-none">M</div>
      </footer>
      <AnimatePresence>{selectedProduct && <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />}</AnimatePresence>
    </div>
  );
}