import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Menu, X, Instagram, MessageCircle, 
  User, Plus, Trash2, Save, Loader2, ChevronLeft, ChevronRight, Pencil
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- TRATAMENTO PARA COMPILAÇÃO NO PREVIEW ---
// Ale, este bloco permite que o código compile no preview do chat mesmo sem o Supabase instalado aqui.
// No seu VS Code local, ele usará a biblioteca real normalmente.
let createClient;
try {
  // Tentativa de importação dinâmica para evitar erro de build no ambiente de demonstração
  const supabaseJS = await import('@supabase/supabase-js');
  createClient = supabaseJS.createClient;
} catch (e) {
  // Mock para o preview não travar
  createClient = () => ({
    from: () => ({
      select: () => ({ order: () => ({ data: [], error: null }) }),
      on: () => ({ subscribe: () => ({}) }),
      channel: () => ({ on: () => ({ subscribe: () => ({}) }) }),
      removeChannel: () => {}
    }),
    channel: () => ({ on: () => ({ subscribe: () => ({}) }) }),
    removeChannel: () => {}
  });
}

// --- CONFIGURAÇÃO SUPABASE ---
const getEnvVar = (key) => {
  try { return import.meta.env[key] || ""; } 
  catch (e) { return ""; }
};

const SUPABASE_URL = getEnvVar('VITE_SUPABASE_URL');
const SUPABASE_ANON_KEY = getEnvVar('VITE_SUPABASE_ANON_KEY');

const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY) 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// --- UTILS: TRATAMENTO DE IMAGEM ---
const formatImageUrl = (url) => {
  if (!url) return "";
  let cleanUrl = url.trim();
  if (cleanUrl.includes('drive.google.com') && cleanUrl.includes('/file/d/')) {
    const id = cleanUrl.split('/file/d/')[1]?.split('/')[0];
    return `https://drive.google.com/uc?export=view&id=${id}`;
  }
  return cleanUrl;
};

const getImagesArray = (imagesString) => {
  if (!imagesString) return [];
  // Ale, aqui garantimos que a separação por vírgula limpe espaços extras
  return imagesString.split(',')
    .map(img => formatImageUrl(img.trim()))
    .filter(url => url !== "" && url !== null);
};

// --- COMPONENTE: GALERIA DO MODAL (ESTILO EDITORIAL) ---
const ModalGallery = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const imageList = getImagesArray(images);

  if (imageList.length <= 1) {
    return <img src={imageList[0] || 'https://placehold.co/600x800/F9F8F6/121212?text=Curadoria'} className="w-full h-full object-cover" alt="Produto" />;
  }

  return (
    <div className="relative w-full h-full group bg-[#F0EFED] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.img 
          key={currentIndex}
          src={imageList[currentIndex]} 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full h-full object-cover" 
          alt={`Ângulo ${currentIndex + 1}`} 
        />
      </AnimatePresence>
      
      {/* Navegação Invisível nas laterais */}
      <div className="absolute inset-y-0 left-0 w-1/4 z-10 cursor-pointer" onClick={() => setCurrentIndex((prev) => (prev - 1 + imageList.length) % imageList.length)} />
      <div className="absolute inset-y-0 right-0 w-1/4 z-10 cursor-pointer" onClick={() => setCurrentIndex((prev) => (prev + 1) % imageList.length)} />

      {/* Setas Minimalistas no Hover */}
      <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-20">
        <button className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white border border-white/20 pointer-events-auto"><ChevronLeft size={20} /></button>
        <button className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white border border-white/20 pointer-events-auto"><ChevronRight size={20} /></button>
      </div>

      {/* Indicadores de Progresso em Linhas */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {imageList.map((_, idx) => (
          <button 
            key={idx} 
            onClick={() => setCurrentIndex(idx)}
            className={`h-[2px] transition-all duration-500 ${idx === currentIndex ? 'bg-white w-10' : 'bg-white/30 w-4'}`} 
          />
        ))}
      </div>
    </div>
  );
};

// --- COMPONENTE: ITEM DA GRELHA COM EFEITO HOVER (EXCELÊNCIA VISUAL) ---
const ProductCard = ({ product, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const imageList = getImagesArray(product.image);
  
  // Ale, na página inicial, mostramos a primeira imagem e trocamos para a segunda no hover.
  const displayImage = (isHovered && imageList.length > 1) ? imageList[1] : imageList[0];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }} 
      whileInView={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick(product)} 
      className="group cursor-pointer text-center"
    >
      <div className="aspect-[3/4] overflow-hidden bg-[#F0EFED] mb-10 relative shadow-lg">
        <AnimatePresence mode="wait">
          <motion.img 
            key={displayImage}
            src={displayImage} 
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0.8 }}
            transition={{ duration: 0.4 }}
            className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-[1.5s]" 
            alt={product.name} 
          />
        </AnimatePresence>
        
        {/* Badge Elegante indicando múltiplas fotos */}
        {imageList.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1.5 text-[8px] uppercase tracking-widest text-white border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
            +{imageList.length - 1} Ângulos
          </div>
        )}
      </div>
      <p className="text-[10px] uppercase tracking-[0.8em] text-[#C5A059] mb-4 font-bold">{product.category}</p>
      <h4 className="text-3xl font-serif italic mb-4 tracking-tight leading-none text-[#121212]">{product.name}</h4>
      <p className="text-[12px] text-[#8E8E8E] uppercase tracking-[0.3em] font-medium italic">{product.price}</p>
    </motion.div>
  );
};

// --- MODAL DE FORMULÁRIO (ADICIONAR/EDITAR) ---
const ProductFormModal = ({ isOpen, onClose, initialData = null }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', category: 'Vestidos', price: 'Sob Consulta', image: '', description: '' });

  useEffect(() => {
    if (initialData) setFormData(initialData);
    else setFormData({ name: '', category: 'Vestidos', price: 'Sob Consulta', image: '', description: '' });
  }, [initialData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (initialData?.id) await supabase.from('products').update(formData).eq('id', initialData.id);
      else await supabase.from('products').insert([formData]);
      onClose();
    } catch (err) { alert("Erro: " + err.message); }
    finally { setLoading(false); }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative bg-[#F9F8F6] w-full max-w-xl p-12 shadow-2xl rounded-sm">
        <h3 className="text-4xl font-serif italic mb-10 text-center">{initialData ? 'Refinar Curadoria' : 'Novo Ativo Digital'}</h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-4 bg-transparent border-b border-black/10 outline-none focus:border-[#C5A059] transition-all font-serif text-xl" placeholder="Nome da Peça" />
          <div className="space-y-1">
            <label className="text-[9px] uppercase tracking-widest text-[#8E8E8E] font-bold">Links das Imagens (Separados por vírgula)</label>
            <textarea required value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full p-4 bg-transparent border-b border-black/10 outline-none focus:border-[#C5A059] transition-all min-h-[100px] text-xs font-mono" placeholder="URL1, URL2, URL3..." />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="p-4 bg-transparent border-b border-black/10 outline-none">
              <option>Vestidos</option><option>Alfaiataria</option><option>Exclusive</option><option>Acessórios</option>
            </select>
            <input value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="p-4 bg-transparent border-b border-black/10 outline-none focus:border-[#C5A059]" placeholder="Preço" />
          </div>
          <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-4 bg-transparent border-b border-black/10 outline-none focus:border-[#C5A059]" placeholder="Narrativa de Luxo..." rows="3" />
          <button disabled={loading} className="w-full py-6 bg-[#121212] text-white text-[10px] uppercase tracking-widest font-bold hover:bg-[#C5A059] transition-all flex items-center justify-center gap-3">
            {loading ? <Loader2 className="animate-spin" /> : <Save size={18} />} Guardar no Acervo
          </button>
        </form>
      </motion.div>
    </div>
  );
};

// --- APP PRINCIPAL ---
export default function App() {
  const [view, setView] = useState('store');
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adminModal, setAdminModal] = useState({ isOpen: false, product: null });

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (data) setProducts(data);
  };

  useEffect(() => {
    if (!supabase) return;
    fetchProducts();
    const sub = supabase.channel('products').on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, fetchProducts).subscribe();
    return () => supabase.removeChannel(sub);
  }, []);

  return (
    <div className="min-h-screen bg-[#F9F8F6] font-sans text-[#121212] selection:bg-[#C5A059]/20">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Inter:wght@200;300;400;500;600&display=swap');
        .font-serif { font-family: 'Cormorant Garamond', serif; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #F9F8F6; }
        ::-webkit-scrollbar-thumb { background: #C5A059; }
      `}</style>
      
      {/* Navbar Minimalista */}
      <nav className="fixed top-0 w-full z-[80] bg-[#F9F8F6]/90 backdrop-blur-md border-b border-[#C5A059]/10 h-24">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between relative">
          <div className="hidden lg:flex gap-12 text-[10px] uppercase tracking-[0.4em] font-bold text-[#8E8E8E]">
            <a href="#" className="hover:text-[#C5A059] transition-colors">Coleções</a>
            <a href="#" className="hover:text-[#C5A059] transition-colors">Curadoria</a>
          </div>
          <div className="absolute left-1/2 -translate-x-1/2 cursor-pointer" onClick={() => setView('store')}>
            <h1 className="text-3xl font-serif tracking-[0.3em] uppercase italic font-light">Monamour</h1>
          </div>
          <div className="flex items-center gap-8">
            <button className={`p-2 transition-all rounded-full ${view === 'admin' ? 'bg-[#C5A059] text-white' : 'hover:text-[#C5A059]'}`} onClick={() => setView(view === 'admin' ? 'store' : 'admin')}>
              <User size={20} strokeWidth={1.5} />
            </button>
            <button className="text-[#121212] p-2 hover:text-[#C5A059] transition-all"><ShoppingBag size={20} strokeWidth={1.5} /></button>
          </div>
        </div>
      </nav>

      <AnimatePresence mode="wait">
        {view === 'store' ? (
          <motion.div key="store" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Hero Section */}
            <section className="relative h-[95vh] flex items-center justify-center bg-[#121212] overflow-hidden pt-24">
              <motion.img initial={{ scale: 1.1, opacity: 0 }} animate={{ scale: 1, opacity: 0.5 }} transition={{ duration: 7 }} src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=2000" className="absolute inset-0 w-full h-full object-cover grayscale" />
              <div className="relative z-10 text-center px-6">
                <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="text-[12px] uppercase tracking-[1.5em] text-[#C5A059] mb-14 block font-bold">Monamour Private Curator</motion.span>
                <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 1.5 }} className="text-7xl md:text-[160px] font-serif text-[#F9F8F6] italic leading-[0.85] tracking-tighter">Excelência <br /> Atemporal</motion.h2>
              </div>
            </section>

            {/* Grid Section */}
            <section className="max-w-7xl mx-auto px-6 py-64">
              <div className="max-w-3xl mb-48">
                <h3 className="text-7xl font-serif text-[#121212] italic mb-12 tracking-tight leading-none">A Essência do Incomparável</h3>
                <div className="w-24 h-[1px] bg-[#C5A059] mb-12 opacity-40" />
                <p className="text-[13px] uppercase tracking-[0.5em] text-[#8E8E8E] leading-loose font-medium">
                  Curadoria rigorosa de tecidos nobres e design de vanguarda.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-24 gap-y-56">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} onClick={setSelectedProduct} />
                ))}
              </div>
            </section>
          </motion.div>
        ) : (
          <div className="pt-48 pb-64 px-8 max-w-7xl mx-auto">
            <ProductFormModal isOpen={adminModal.isOpen} onClose={() => { setAdminModal({ isOpen: false, product: null }); fetchProducts(); }} initialData={adminModal.product} />
            <div className="flex justify-between items-end mb-16">
              <div>
                <h2 className="text-5xl font-serif italic mb-2">Gestão de Acervo</h2>
                <p className="text-[10px] uppercase tracking-[0.4em] text-[#8E8E8E] font-bold">Sistema Operacional de Luxo</p>
              </div>
              <button onClick={() => setAdminModal({ isOpen: true, product: null })} className="bg-[#121212] text-white px-10 py-5 text-[11px] uppercase tracking-widest font-bold flex items-center gap-3 hover:bg-[#C5A059] transition-all">
                <Plus size={18} /> Novo Item
              </button>
            </div>
            <div className="bg-white border border-black/5 rounded-sm overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-[#F9F8F6] text-[10px] uppercase tracking-widest text-[#8E8E8E] font-bold">
                  <tr>
                    <th className="p-8">Peça</th>
                    <th className="p-8 text-center">Ângulos</th>
                    <th className="p-8">Categoria</th>
                    <th className="p-8 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id} className="border-b border-black/5 hover:bg-[#F9F8F6] transition-colors group">
                      <td className="p-8 flex items-center gap-6">
                        <img src={formatImageUrl(p.image.split(',')[0])} className="w-16 h-20 object-cover grayscale group-hover:grayscale-0 transition-all duration-500 rounded-sm" />
                        <span className="font-serif text-2xl italic tracking-tight">{p.name}</span>
                      </td>
                      <td className="p-8 text-center">
                        <span className="px-3 py-1 bg-black/5 rounded-full text-[11px] font-bold">{p.image.split(',').length}</span>
                      </td>
                      <td className="p-8 text-[10px] uppercase tracking-widest opacity-40 font-semibold">{p.category}</td>
                      <td className="p-8 text-right space-x-4">
                        <button onClick={() => setAdminModal({ isOpen: true, product: p })} className="text-[#8E8E8E] hover:text-[#C5A059] transition-colors"><Pencil size={18} /></button>
                        <button onClick={async () => { if(confirm("Eliminar peça permanentemente?")) await supabase.from('products').delete().eq('id', p.id); fetchProducts(); }} className="text-[#8E8E8E] hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </AnimatePresence>

      <footer className="bg-[#121212] text-white py-64 text-center border-t border-white/5 relative overflow-hidden">
        <h1 className="text-8xl font-serif italic tracking-[0.5em] uppercase opacity-95">Monamour</h1>
        <div className="mt-20 text-[12px] uppercase tracking-[1em] text-[#C5A059] font-bold">BH | SP | PARIS</div>
      </footer>

      {/* Modal de Detalhes (A Galeria Completa) */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#121212]/95 backdrop-blur-lg" onClick={() => setSelectedProduct(null)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative bg-[#F9F8F6] w-full max-w-7xl h-[85vh] flex flex-col md:flex-row shadow-2xl overflow-hidden rounded-sm">
              <button onClick={() => setSelectedProduct(null)} className="absolute top-8 right-8 z-30 text-black hover:rotate-90 transition-all duration-500"><X size={28} strokeWidth={1} /></button>
              <div className="w-full md:w-[65%] h-1/2 md:h-auto overflow-hidden bg-[#F0EFED]">
                <ModalGallery images={selectedProduct.image} />
              </div>
              <div className="w-full md:w-[35%] p-16 flex flex-col justify-center bg-white">
                <span className="text-[11px] uppercase tracking-[0.8em] text-[#C5A059] mb-8 font-bold italic">Private Curatorship</span>
                <h2 className="text-5xl font-serif italic mb-10 leading-[0.9] tracking-tighter">{selectedProduct.name}</h2>
                <div className="w-16 h-[1px] bg-[#C5A059] mb-12 opacity-30" />
                <p className="text-[#8E8E8E] text-[14px] leading-relaxed mb-16 font-light">{selectedProduct.description}</p>
                <button onClick={() => window.open(`https://wa.me/5531992497317?text=Quero detalhes VIP da peça: ${selectedProduct.name}`, '_blank')} className="w-full py-7 bg-[#121212] text-white text-[11px] uppercase tracking-[0.6em] font-bold hover:bg-[#C5A059] transition-all flex items-center justify-center gap-4 group">
                  <MessageCircle size={20} className="group-hover:scale-110 transition-transform" /> Agendar Atendimento
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}