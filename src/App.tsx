/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Instagram, 
  MessageCircle, 
  MapPin, 
  Search, 
  Filter,
  ShoppingBag,
  ExternalLink,
  Plus,
  X,
  FolderPlus,
  Download,
  Folder,
  Edit2,
  Trash2,
  ChevronRight,
  Palette,
  Settings2
} from 'lucide-react';

// Types
interface CardConfig {
  borderRadius: number;
  padding: number;
  backgroundColor: string;
  backgroundOpacity: number;
  accentColor: string;
  logoBorderColor: string;
  logoBorderWidth: number;
  showLogoRings: boolean;
  fontFamily: 'font-sans' | 'font-mono' | 'font-display';
  showIcons: boolean;
}

interface Supplier {
  id: string;
  name: string;
  handle: string;
  category: string;
  address: string;
  whatsapp: string;
  instagram: string;
  logo: string;
}

// Mock Data
const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: '1',
    name: 'Lumiere Boutique',
    handle: '@lumiereboutique',
    category: 'Moda Feminina',
    address: 'Rua das Oportunidades, 123 - São Paulo/SP',
    whatsapp: '5511999999999',
    instagram: 'lumiereboutique',
    logo: 'L'
  },
  {
    id: '2',
    name: 'Aurum Calçados',
    handle: '@aurumshoes',
    category: 'Calçados',
    address: 'Av. Paulista, 1000 - São Paulo/SP',
    whatsapp: '5511988888888',
    instagram: 'aurumshoes',
    logo: 'A'
  },
  {
    id: '3',
    name: 'Velvet Acessórios',
    handle: '@velvetacessories',
    category: 'Acessórios',
    address: 'Rua Oscar Freire, 500 - São Paulo/SP',
    whatsapp: '5511977777777',
    instagram: 'velvetacessories',
    logo: 'V'
  },
  {
    id: '4',
    name: 'Noir Menswear',
    handle: '@noirmenswear',
    category: 'Moda Masculina',
    address: 'Rua Augusta, 1200 - São Paulo/SP',
    whatsapp: '5511966666666',
    instagram: 'noirmenswear',
    logo: 'N'
  },
  {
    id: '5',
    name: 'Stela Kids',
    handle: '@stelakids',
    category: 'Moda Infantil',
    address: 'Shopping Iguatemi - São Paulo/SP',
    whatsapp: '5511955555555',
    instagram: 'stelakids',
    logo: 'S'
  },
  {
    id: '6',
    name: 'Infinite Gym',
    handle: '@infinitegym',
    category: 'Moda Fitness',
    address: 'Rua Haddock Lobo, 300 - São Paulo/SP',
    whatsapp: '5511944444444',
    instagram: 'infinitegym',
    logo: 'I'
  }
];

const hexToRgba = (hex: string, opacity: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
};

const SupplierCard: React.FC<{ 
  supplier: Supplier; 
  onDelete: (id: string) => void; 
  onEdit: (supplier: Supplier) => void; 
  config: CardConfig;
}> = ({ 
  supplier, 
  onDelete, 
  onEdit,
  config
}) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className={`relative group h-full ${config.fontFamily}`}
      id={`supplier-${supplier.id}`}
    >
      {/* Dynamic Glow */}
      <div 
        className="absolute -inset-[1px] blur-[2px] opacity-20 group-hover:opacity-40 transition-opacity duration-500"
        style={{ 
          borderRadius: `${config.borderRadius + 2}px`,
          background: `linear-gradient(to bottom, ${config.accentColor}66, ${config.accentColor}1a, ${config.accentColor}66)`
        }}
      />
      
      <div 
        className="relative h-full border border-white/5 flex flex-col items-center justify-between overflow-hidden"
        style={{
          backgroundColor: hexToRgba(config.backgroundColor, config.backgroundOpacity),
          borderRadius: `${config.borderRadius}px`,
          padding: `${config.padding}px`
        }}
      >
        {/* Actions Overlay */}
        <div className="absolute top-6 right-6 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => onEdit(supplier)}
            className="p-2 rounded-full bg-black/50 border border-white/10 text-white/60 hover:text-gold transition-colors"
          >
            <Edit2 size={14} />
          </button>
          <button 
            onClick={() => onDelete(supplier.id)}
            className="p-2 rounded-full bg-black/50 border border-white/10 text-white/60 hover:text-red-400 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>

        {/* Subtle Texture/Gradient Overlay */}
        <div 
          className="absolute inset-0 bg-radial-[at_50%_0%] pointer-events-none"
          style={{ backgroundImage: `radial-gradient(at 50% 0%, ${config.accentColor}0d, transparent)` }}
        />
        
        {/* Logo Section */}
        <div className="relative z-10 w-28 h-28 mb-6">
          <div 
            className="absolute inset-0 rounded-full flex items-center justify-center transition-all"
            style={{ 
              border: `${config.logoBorderWidth}px solid ${config.logoBorderColor}`,
              padding: config.showLogoRings ? '8px' : '0'
            }}
          >
            <div 
              className="w-full h-full rounded-full border flex items-center justify-center bg-black overflow-hidden"
              style={{ 
                borderColor: config.showLogoRings ? `${config.accentColor}80` : 'transparent',
                boxShadow: config.showLogoRings ? `0 0 20px ${config.accentColor}26` : 'none'
              }}
            >
              <span 
                className="text-4xl font-display font-light tracking-widest"
                style={{ color: config.accentColor }}
              >{supplier.logo}</span>
            </div>
          </div>
          {/* Decorative Ring */}
          {config.showLogoRings && (
            <div 
              className="absolute -inset-2 rounded-full border border-dashed animate-[spin_20s_linear_infinite]"
              style={{ borderColor: `${config.accentColor}1a` }}
            />
          )}
        </div>

        {/* Info */}
        <div className="text-center z-10 w-full mb-6">
          <h3 className="text-xl font-display font-medium text-white/90 mb-1">{supplier.handle}</h3>
          <p className="text-xs text-white/40 uppercase tracking-[0.2em] mb-4">{supplier.name}</p>
          
          <div 
            className="h-px w-24 mx-auto mb-6"
            style={{ background: `linear-gradient(to right, transparent, ${config.accentColor}66, transparent)` }}
          />
          
          {/* Social Icons */}
          {config.showIcons && (
            <div className="flex justify-center gap-6 mb-8">
              <a 
                href={`https://wa.me/${supplier.whatsapp}`}
                target="_blank"
                className="p-3 rounded-full border transition-all duration-300"
                style={{ 
                  borderColor: `${config.accentColor}4d`,
                  color: `${config.accentColor}b3`,
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = `${config.accentColor}1a`;
                  (e.currentTarget as HTMLElement).style.color = config.accentColor;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = `${config.accentColor}b3`;
                }}
                title="WhatsApp"
              >
                <MessageCircle size={22} />
              </a>
              <a 
                href={`https://instagram.com/${supplier.instagram}`}
                target="_blank"
                className="p-3 rounded-full border transition-all duration-300"
                style={{ 
                  borderColor: `${config.accentColor}4d`,
                  color: `${config.accentColor}b3`,
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = `${config.accentColor}1a`;
                  (e.currentTarget as HTMLElement).style.color = config.accentColor;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = `${config.accentColor}b3`;
                }}
                title="Instagram"
              >
                <Instagram size={22} />
              </a>
            </div>
          )}

          {/* Category Pill */}
          <div 
            className="inline-block px-6 py-2 rounded-full border bg-gold/5 mb-6"
            style={{ borderColor: `${config.accentColor}33`, backgroundColor: `${config.accentColor}0d` }}
          >
            <span 
              className="text-[10px] uppercase font-medium tracking-[0.15em] italic"
              style={{ color: `${config.accentColor}cc` }}
            >
              {supplier.category}
            </span>
          </div>

          {/* Address */}
          <div className="flex items-start justify-center gap-2 px-2">
            <MapPin size={14} className="mt-0.5 shrink-0" style={{ color: `${config.accentColor}99` }} />
            <p className="text-[11px] text-white/50 leading-relaxed max-w-[200px]">
              {supplier.address}
            </p>
          </div>
        </div>

        {/* Footer Accent */}
        <div className="relative z-10 w-full pt-4 mt-auto">
          <div 
            className="h-px w-full mb-4"
            style={{ background: `linear-gradient(to right, transparent, ${config.accentColor}33, transparent)` }}
          />
          <div className="flex justify-center">
            <ShoppingBag size={18} style={{ color: `${config.accentColor}66` }} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function App() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [activeTab, setActiveTab] = useState<'directory' | 'customization'>('directory');
  const [cardConfig, setCardConfig] = useState<CardConfig>({
    borderRadius: 32,
    padding: 32,
    backgroundColor: '#121212',
    backgroundOpacity: 100,
    accentColor: '#D4AF37',
    logoBorderColor: '#D4AF37',
    logoBorderWidth: 2,
    showLogoRings: false,
    fontFamily: 'font-sans',
    showIcons: true,
  });
  const [categories, setCategories] = useState<string[]>(['Moda Feminina', 'Moda Masculina', 'Calçados', 'Acessórios', 'Moda Fitness']);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    handle: '',
    category: 'Moda Feminina',
    address: '',
    whatsapp: '',
    instagram: '',
  });

  const allCategories = ['Todos', ...categories];

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategoryName && !categories.includes(newCategoryName)) {
      setCategories([...categories, newCategoryName]);
      setNewCategoryName('');
      setIsAddingCategory(false);
    }
  };

  const handleExport = () => {
    const suppliersToExport = filteredSuppliers;
    if (suppliersToExport.length === 0) return;

    const fontStack = cardConfig.fontFamily === 'font-mono' ? 'monospace' : 
                     cardConfig.fontFamily === 'font-display' ? "'Playfair Display', serif" : "'Inter', sans-serif";

    const cardsHtml = suppliersToExport.map(s => `
      <div class="card">
        <div class="logo-container">
          <div class="logo-inner">
            <span class="logo-text">${s.logo}</span>
          </div>
        </div>
        <div class="info">
          <h3 class="handle">${s.handle}</h3>
          <p class="name">${s.name}</p>
          <div class="divider"></div>
          ${cardConfig.showIcons ? `
          <div class="social-icons">
            <div class="icon-circle">
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-13.4 8.38 8.38 0 0 1 3.8.9L21 3z"></path></svg>
            </div>
            <div class="icon-circle">
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </div>
          </div>
          ` : ''}
          <div class="category-pill">${s.category}</div>
          <div class="address">
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            <span>${s.address}</span>
          </div>
        </div>
        <div class="footer">
          <div class="divider-full"></div>
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><path d="M3 6h18"></path><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
        </div>
      </div>
    `).join('');

    const hexToRgbaCSS = (hex: string, opacity: number) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
    };

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Custom Directory - ${selectedCategory}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:wght@400;500&display=swap" rel="stylesheet">
  <style>
    body {
      background-color: #050505;
      color: #FFFFFF;
      font-family: ${fontStack};
      padding: 40px;
      margin: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 32px;
      width: 100%;
      max-width: 1200px;
    }
    .card {
      background: ${hexToRgbaCSS(cardConfig.backgroundColor, cardConfig.backgroundOpacity)};
      border: 1px solid rgba(255,255,255,0.05);
      border-radius: ${cardConfig.borderRadius}px;
      padding: ${cardConfig.padding}px;
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
    }
    .logo-container {
      width: 112px;
      height: 112px;
      border-radius: 50%;
      border: ${cardConfig.logoBorderWidth}px solid ${cardConfig.logoBorderColor};
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 24px;
      padding: ${cardConfig.showLogoRings ? '8px' : '0'};
      box-sizing: border-box;
    }
    .logo-inner {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      border: ${cardConfig.showLogoRings ? `1px solid ${cardConfig.accentColor}80` : 'none'};
      background: black;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: ${cardConfig.showLogoRings ? `0 0 20px ${cardConfig.accentColor}26` : 'none'};
      overflow: hidden;
    }
    .logo-text {
      color: ${cardConfig.accentColor};
      font-size: 36px;
      font-weight: 300;
      letter-spacing: 2px;
    }
    .handle {
      font-size: 20px;
      margin-bottom: 4px;
      text-align: center;
      color: rgba(255,255,255,0.9);
    }
    .name {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: rgba(255,255,255,0.4);
      margin-bottom: 16px;
      text-align: center;
    }
    .divider {
      height: 1px;
      width: 96px;
      background: linear-gradient(to right, transparent, ${cardConfig.accentColor}66, transparent);
      margin-bottom: 24px;
    }
    .social-icons {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
    }
    .icon-circle {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 1px solid ${cardConfig.accentColor}4d;
      display: flex;
      align-items: center;
      justify-content: center;
      color: ${cardConfig.accentColor}b3;
    }
    .category-pill {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      padding: 8px 24px;
      border-radius: 99px;
      border: 1px solid ${cardConfig.accentColor}33;
      background: ${cardConfig.accentColor}0d;
      color: ${cardConfig.accentColor}cc;
      margin-bottom: 24px;
      font-style: italic;
    }
    .address {
      display: flex;
      gap: 8px;
      font-size: 11px;
      color: rgba(255,255,255,0.5);
      text-align: center;
      max-width: 200px;
    }
    .footer {
      width: 100%;
      margin-top: auto;
      padding-top: 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .divider-full {
      height: 1px;
      width: 100%;
      background: linear-gradient(to right, transparent, ${cardConfig.accentColor}33, transparent);
      margin-bottom: 16px;
    }
    svg {
      color: ${cardConfig.accentColor}66;
    }
  </style>
</head>
<body>
  <div class="grid">
    ${cardsHtml}
  </div>
</body>
</html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `catalogo-${selectedCategory.toLowerCase().replace(/\s+/g, '-')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setSuppliers(suppliers.map(s => s.id === editingId ? { ...s, ...formData, logo: formData.handle.charAt(1).toUpperCase() || 'S' } : s));
      setEditingId(null);
    } else {
      const newSupplier: Supplier = {
        id: Date.now().toString(),
        ...formData,
        logo: formData.handle.charAt(1).toUpperCase() || 'S'
      };
      setSuppliers([newSupplier, ...suppliers]);
    }
    setIsModalOpen(false);
    setFormData({
      name: '',
      handle: '',
      category: categories[0] || 'Moda Feminina',
      address: '',
      whatsapp: '',
      instagram: '',
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Deseja realmente excluir este fornecedor?')) {
      setSuppliers(suppliers.filter(s => s.id !== id));
    }
  };

  const handleEdit = (supplier: Supplier) => {
    setFormData({
      name: supplier.name,
      handle: supplier.handle,
      category: supplier.category,
      address: supplier.address,
      whatsapp: supplier.whatsapp,
      instagram: supplier.instagram,
    });
    setEditingId(supplier.id);
    setIsModalOpen(true);
  };

  const toggleRegister = () => {
    if (isModalOpen) {
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({
        name: '',
        handle: '',
        category: categories[0] || 'Moda Feminina',
        address: '',
        whatsapp: '',
        instagram: '',
      });
    } else {
      setIsModalOpen(true);
    }
  };

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           s.handle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           s.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'Todos' || s.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [suppliers, searchTerm, selectedCategory]);

  return (
    <div className="min-h-screen bg-[#050505] font-sans selection:bg-gold/30 selection:text-white">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 md:py-12">
        
        {/* Navigation Tabs */}
        <nav className="flex justify-center gap-8 mb-16 border-b border-white/5">
          <button 
            onClick={() => setActiveTab('directory')}
            className={`flex items-center gap-2 py-4 px-4 text-xs font-bold uppercase tracking-[0.2em] transition-all relative ${
              activeTab === 'directory' ? 'text-gold' : 'text-white/20 hover:text-white/50'
            }`}
          >
            <Folder size={16} />
            Diretório
            {activeTab === 'directory' && (
              <motion.div layoutId="nav-active" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold" />
            )}
          </button>
          <button 
            onClick={() => setActiveTab('customization')}
            className={`flex items-center gap-2 py-4 px-4 text-xs font-bold uppercase tracking-[0.2em] transition-all relative ${
              activeTab === 'customization' ? 'text-gold' : 'text-white/20 hover:text-white/50'
            }`}
          >
            <Palette size={16} />
            Personalizar Card
            {activeTab === 'customization' && (
              <motion.div layoutId="nav-active" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold" />
            )}
          </button>
        </nav>

        {activeTab === 'directory' ? (
          <>
            {/* Categories / Folders Section */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-white/40 text-[10px] uppercase tracking-[0.4em] font-semibold">Categorias</h2>
            <button 
              onClick={() => setIsAddingCategory(!isAddingCategory)}
              className="p-2 rounded-full hover:bg-white/5 text-gold/60 hover:text-gold transition-colors"
              title="Nova Categoria"
            >
              <FolderPlus size={20} />
            </button>
          </div>

          <AnimatePresence>
            {isAddingCategory && (
              <motion.form 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onSubmit={handleAddCategory}
                className="mb-8 flex gap-3"
              >
                <input 
                  autoFocus
                  type="text" 
                  placeholder="Nome da categoria..."
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-gold/50 grow"
                />
                <button type="submit" className="px-4 py-2 bg-gold text-black rounded-xl text-xs font-bold uppercase tracking-widest">
                  Criar
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {allCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`group relative flex flex-col items-center p-6 rounded-2xl border transition-all duration-300 ${
                  selectedCategory === cat 
                    ? 'bg-gold/10 border-gold/50 shadow-gold' 
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <div className={`mb-3 p-3 rounded-xl transition-colors ${
                  selectedCategory === cat ? 'bg-gold text-black' : 'bg-white/5 text-white/40 group-hover:text-gold'
                }`}>
                  <Folder size={24} />
                </div>
                <span className={`text-[10px] uppercase tracking-widest font-medium text-center ${
                  selectedCategory === cat ? 'text-gold' : 'text-white/40'
                }`}>
                  {cat}
                </span>
                {selectedCategory === cat && (
                  <motion.div 
                    layoutId="folder-active"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gold rounded-full"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
        
        {/* Top Header Section - Minimal */}
        <div className="flex justify-end gap-4 mb-12">
          {filteredSuppliers.length > 0 && (
            <button 
              onClick={handleExport}
              className="flex items-center gap-2 px-6 py-3 rounded-full border border-gold/30 text-gold text-xs font-semibold tracking-widest uppercase hover:bg-gold/5 transition-all"
            >
              <Download size={16} />
              Exportar HTML
            </button>
          )}
          
          <button 
            onClick={toggleRegister}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-gold text-black text-xs font-semibold tracking-widest uppercase hover:scale-105 transition-transform shadow-gold"
          >
            <Plus size={16} />
            Cadastrar Fornecedor
          </button>
        </div>

        {/* Modal Overlay */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={toggleRegister}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              />
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-2xl bg-[#121212] border border-gold/30 rounded-[2.5rem] p-8 md:p-12 overflow-y-auto max-h-[90vh] shadow-gold"
              >
                <button 
                  onClick={toggleRegister}
                  className="absolute top-8 right-8 p-2 rounded-full hover:bg-white/5 text-white/40 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>

                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                  {editingId ? <Edit2 size={160} className="text-gold" /> : <Plus size={160} className="text-gold" />}
                </div>
                
                <h2 className="text-3xl font-display text-white mb-10">{editingId ? 'Editar Fornecedor' : 'Novo Cadastro'}</h2>
                
                <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/40 ml-4">Nome da Empresa</label>
                    <input 
                      required
                      type="text" 
                      placeholder="Ex: Lumiere Boutique"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-gold/50 text-white placeholder:text-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/40 ml-4"> @ Instagram (Ex: @lumiere)</label>
                    <input 
                      required
                      type="text" 
                      placeholder="@handle"
                      value={formData.handle}
                      onChange={e => setFormData({...formData, handle: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-gold/50 text-white placeholder:text-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/40 ml-4">Categoria</label>
                    <div className="relative">
                      <select 
                        value={formData.category}
                        onChange={e => setFormData({...formData, category: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-gold/50 text-white appearance-none cursor-pointer"
                      >
                        {categories.map(cat => (
                          <option key={cat} className="bg-[#121212]" value={cat}>{cat}</option>
                        ))}
                      </select>
                      <ChevronRight size={16} className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 rotate-90 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/40 ml-4">Endereço</label>
                    <input 
                      required
                      type="text" 
                      placeholder="Rua, Número - Cidade/UF"
                      value={formData.address}
                      onChange={e => setFormData({...formData, address: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-gold/50 text-white placeholder:text-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/40 ml-4">WhatsApp (Apenas números)</label>
                    <input 
                      required
                      type="text" 
                      placeholder="5511999999999"
                      value={formData.whatsapp}
                      onChange={e => setFormData({...formData, whatsapp: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-gold/50 text-white placeholder:text-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/40 ml-4">Instagram User</label>
                    <input 
                      required
                      type="text" 
                      placeholder="lumiereboutique"
                      value={formData.instagram}
                      onChange={e => setFormData({...formData, instagram: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-gold/50 text-white placeholder:text-white/10"
                    />
                  </div>
                  
                  <div className="md:col-span-2 pt-8">
                    <button 
                      type="submit"
                      className="w-full bg-gold text-black py-5 rounded-2xl font-bold uppercase tracking-[0.2em] hover:brightness-110 transition-all shadow-gold"
                    >
                      {editingId ? 'Salvar Alterações' : 'Confirmar Cadastro'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Results Info */}
        <div className="mb-8 flex items-center justify-between">
          <p className="text-xs text-white/30 tracking-widest uppercase">
            Catálogo de Fornecedores
          </p>
          <div className="h-px grow mx-6 bg-gradient-to-r from-gold/20 to-transparent" />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredSuppliers.map((supplier) => (
              <SupplierCard 
                key={supplier.id} 
                supplier={supplier} 
                onDelete={handleDelete}
                onEdit={handleEdit}
                config={cardConfig}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredSuppliers.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-32 text-center"
          >
            <div className="inline-flex p-6 rounded-full bg-white/5 border border-white/10 mb-6">
              <Filter className="text-gold/40" size={32} />
            </div>
            <h3 className="text-xl font-display text-white mb-2">Nenhum fornecedor encontrado</h3>
            <p className="text-white/30 text-sm">Tente ajustar sua busca ou filtros.</p>
          </motion.div>
        )}
      </>
    ) : (
      <div className="flex flex-col md:flex-row gap-12">
        {/* Customization Controls */}
        <div className="w-full md:w-80 shrink-0 space-y-10">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Settings2 size={16} className="text-gold" />
              <h2 className="text-white text-xs font-bold uppercase tracking-widest">Aparência</h2>
            </div>
            
            <div className="space-y-8">
              {/* Border Radius */}
              <div className="space-y-4">
                <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-white/40">
                  <label>Arredondamento</label>
                  <span>{cardConfig.borderRadius}px</span>
                </div>
                <input 
                  type="range" min="0" max="64" 
                  value={cardConfig.borderRadius}
                  onChange={e => setCardConfig({...cardConfig, borderRadius: parseInt(e.target.value)})}
                  className="w-full accent-gold bg-white/5 h-1 rounded-full appearance-none"
                />
              </div>

              {/* Padding */}
              <div className="space-y-4">
                <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-white/40">
                  <label>Margem Interna</label>
                  <span>{cardConfig.padding}px</span>
                </div>
                <input 
                  type="range" min="16" max="64" 
                  value={cardConfig.padding}
                  onChange={e => setCardConfig({...cardConfig, padding: parseInt(e.target.value)})}
                  className="w-full accent-gold bg-white/5 h-1 rounded-full appearance-none"
                />
              </div>

              {/* Background Opacity */}
              <div className="space-y-4">
                <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-white/40">
                  <label>Transparência</label>
                  <span>{cardConfig.backgroundOpacity}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" 
                  value={cardConfig.backgroundOpacity}
                  onChange={e => setCardConfig({...cardConfig, backgroundOpacity: parseInt(e.target.value)})}
                  className="w-full accent-gold bg-white/5 h-1 rounded-full appearance-none"
                />
              </div>

              {/* Colors */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/40">Fundo</label>
                  <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3">
                    <input 
                      type="color" 
                      value={cardConfig.backgroundColor}
                      onChange={e => setCardConfig({...cardConfig, backgroundColor: e.target.value})}
                      className="w-6 h-6 bg-transparent border-none cursor-pointer"
                    />
                    <span className="text-[10px] text-white/60 font-mono">{cardConfig.backgroundColor}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/40">Destaque</label>
                  <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3">
                    <input 
                      type="color" 
                      value={cardConfig.accentColor}
                      onChange={e => setCardConfig({...cardConfig, accentColor: e.target.value})}
                      className="w-6 h-6 bg-transparent border-none cursor-pointer"
                    />
                    <span className="text-[10px] text-white/60 font-mono">{cardConfig.accentColor}</span>
                  </div>
                </div>
              </div>

              {/* Logo Customization */}
              <div className="space-y-6 pt-4 border-t border-white/5">
                <h3 className="text-[10px] uppercase tracking-[0.2em] text-gold font-bold">Logo / Foto</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-white/40">
                    <label>Borda da Foto</label>
                    <span>{cardConfig.logoBorderWidth}px</span>
                  </div>
                  <input 
                    type="range" min="0" max="12" 
                    value={cardConfig.logoBorderWidth}
                    onChange={e => setCardConfig({...cardConfig, logoBorderWidth: parseInt(e.target.value)})}
                    className="w-full accent-gold bg-white/5 h-1 rounded-full appearance-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/40">Cor da Borda</label>
                  <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3">
                    <input 
                      type="color" 
                      value={cardConfig.logoBorderColor}
                      onChange={e => setCardConfig({...cardConfig, logoBorderColor: e.target.value})}
                      className="w-6 h-6 bg-transparent border-none cursor-pointer"
                    />
                    <span className="text-[10px] text-white/60 font-mono">{cardConfig.logoBorderColor}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-[10px] uppercase tracking-widest text-white/40">Efeito de Anéis</label>
                  <button 
                    onClick={() => setCardConfig({...cardConfig, showLogoRings: !cardConfig.showLogoRings})}
                    className={`w-10 h-5 rounded-full transition-all relative ${cardConfig.showLogoRings ? 'bg-gold' : 'bg-white/10'}`}
                  >
                    <motion.div 
                      animate={{ x: cardConfig.showLogoRings ? 22 : 4 }}
                      className="absolute top-1 w-3 h-3 rounded-full bg-white"
                    />
                  </button>
                </div>
              </div>

              {/* Font Family */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/40">Fonte</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['font-sans', 'font-mono', 'font-display'] as const).map(font => (
                    <button
                      key={font}
                      onClick={() => setCardConfig({...cardConfig, fontFamily: font})}
                      className={`py-2 text-[9px] uppercase tracking-widest rounded-lg border transition-all ${
                        cardConfig.fontFamily === font 
                          ? 'border-gold text-gold bg-gold/5' 
                          : 'border-white/10 text-white/40 hover:border-white/30'
                      }`}
                    >
                      {font.replace('font-', '')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Show Icons */}
              <div className="flex items-center justify-between">
                <label className="text-[10px] uppercase tracking-widest text-white/40">Exibir Ícones</label>
                <button 
                  onClick={() => setCardConfig({...cardConfig, showIcons: !cardConfig.showIcons})}
                  className={`w-10 h-5 rounded-full transition-all relative ${cardConfig.showIcons ? 'bg-gold' : 'bg-white/10'}`}
                >
                  <motion.div 
                    animate={{ x: cardConfig.showIcons ? 22 : 4 }}
                    className="absolute top-1 w-3 h-3 rounded-full bg-white"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Live Preview */}
        <div className="grow">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-white text-xs font-bold uppercase tracking-widest">Prévia em Tempo Real</h2>
            <div className="h-px grow mx-6 bg-gradient-to-r from-gold/20 to-transparent" />
          </div>
          
          <div className="max-w-md mx-auto">
            <SupplierCard 
              supplier={{
                id: 'preview',
                name: 'Nome da Sua Empresa',
                handle: '@seuhandle',
                category: 'Categoria Exemplo',
                address: 'Seu Endereço Completo Aqui',
                whatsapp: '5511999999999',
                instagram: 'seuprevisualizacao',
                logo: 'P'
              }}
              onDelete={() => {}}
              onEdit={() => {}}
              config={cardConfig}
            />
          </div>
          
          <div className="mt-12 p-8 rounded-3xl bg-gold/5 border border-gold/10">
            <div className="flex gap-4 items-start">
              <div className="mt-1 p-2 rounded-lg bg-gold/20 text-gold">
                <Palette size={16} />
              </div>
              <div>
                <h4 className="text-white text-sm font-bold mb-2 uppercase tracking-widest">Instruções</h4>
                <p className="text-white/40 text-xs leading-relaxed">
                  As alterações feitas aqui serão aplicadas instantaneamente a todos os cartões do seu diretório. 
                  Você pode personalizar o design para combinar com a identidade visual da sua marca.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
  </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-16 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-gold/30 flex items-center justify-center bg-gold/5">
              <span className="text-gold font-display font-bold">L</span>
            </div>
            <span className="font-display text-white tracking-[0.2em] font-light">LUXE DIRECTORY</span>
          </div>
          
          <div className="flex gap-8">
            <a href="#" className="text-white/30 hover:text-gold transition-colors text-xs tracking-widest font-light">SOBRE</a>
            <a href="#" className="text-white/30 hover:text-gold transition-colors text-xs tracking-widest font-light">CONTATO</a>
            <a href="#" className="text-white/30 hover:text-gold transition-colors text-xs tracking-widest font-light">TERMOS</a>
          </div>

          <p className="text-[10px] text-white/20 tracking-widest">
            © 2026 LUXE DIRECTORY. TODOS OS DIREITOS RESERVADOS.
          </p>
        </div>
      </footer>
    </div>
  );
}
