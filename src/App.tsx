/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef, useEffect, useCallback, memo, startTransition } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';
import { supabase, uploadLogo, dataUrlToStorageUrl, type DbSupplier, type DbCardConfig } from './lib/supabase';
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
  Settings2,
  Store,
  Package,
  Gift,
  Truck,
  CreditCard,
  Globe,
  Link,
  Map as MapIcon,
  Phone,
  MessageSquare,
  Send,
  Camera,
  Link2,
  User,
  AlertTriangle,
  Upload,
  Image as ImageIcon
} from 'lucide-react';

// Custom WhatsApp brand logo (filled style; color follows currentColor)
const WHATSAPP_LOGO_PATH = "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z";

const Whatsapp = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d={WHATSAPP_LOGO_PATH}/>
  </svg>
);

const ICON_COMPONENTS = {
  ShoppingBag, Store, Package, Gift, Truck, CreditCard, Globe, Link, MapIcon,
  MessageCircle, Phone, MessageSquare, Send, Whatsapp,
  Instagram, Camera, Link2, User
};

const FOOTER_ICONS = ['ShoppingBag', 'Store', 'Package', 'Gift', 'Truck', 'CreditCard', 'Globe', 'Link', 'MapIcon'];
const WHATSAPP_ICONS = ['MessageCircle', 'Phone', 'MessageSquare', 'Send', 'Whatsapp'];
const INSTAGRAM_ICONS = ['Instagram', 'Camera', 'Link2', 'User'];

const DEFAULT_CARD_CONFIG: CardConfig = {
  borderRadius: 32,
  padding: 32,
  backgroundColor: '#121212',
  backgroundOpacity: 100,
  accentColor: '#C89A62',
  iconColor: '#C89A62',
  logoBorderColor: '#C89A62',
  logoBorderWidth: 2,
  showLogoRings: false,
  fontFamily: 'font-sans',
  showIcons: true,
  pageBackgroundColor: '#050505',
  footerIcon: 'ShoppingBag',
  whatsappIcon: 'MessageCircle',
  instagramIcon: 'Instagram',
  footerBrandName: 'Luxe Directory',
  socialIconSize: 22,
  footerIconSize: 18,
  codeSize: 10,
};

// Types
interface CardConfig {
  borderRadius: number;
  padding: number;
  backgroundColor: string;
  backgroundOpacity: number;
  accentColor: string;
  iconColor: string;
  logoBorderColor: string;
  logoBorderWidth: number;
  showLogoRings: boolean;
  fontFamily: 'font-sans' | 'font-mono' | 'font-display';
  showIcons: boolean;
  pageBackgroundColor: string;
  footerIcon: string;
  whatsappIcon: string;
  instagramIcon: string;
  whatsappIconUrl?: string;
  instagramIconUrl?: string;
  footerIconUrl?: string;
  footerLogoUrl?: string;
  footerBrandName?: string;
  socialIconSize: number;
  footerIconSize: number;
  codeSize: number;
}

interface Supplier {
  id: string;
  numericId: number;
  name: string;
  handle: string;
  category: string;
  address: string;
  whatsapp: string;
  instagram: string;
  logo: string;
  logoUrl?: string;
}

// Mock Data
const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: '1',
    numericId: 101,
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
    numericId: 102,
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
    numericId: 103,
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
    numericId: 104,
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
    numericId: 105,
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
    numericId: 106,
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

const SupplierCard = memo(function SupplierCard({
  supplier,
  onDelete,
  onEdit,
  config
}: {
  supplier: Supplier;
  onDelete: (id: string) => void;
  onEdit: (supplier: Supplier) => void;
  config: CardConfig;
}) {
  const WhatsAppIcon = (ICON_COMPONENTS as any)[config.whatsappIcon] || MessageCircle;
  const InstaIcon = (ICON_COMPONENTS as any)[config.instagramIcon] || Instagram;
  const FooterIcon = (ICON_COMPONENTS as any)[config.footerIcon] || ShoppingBag;

  const renderIcon = (iconName: string, iconUrl?: string, size = 22) => {
    if (iconUrl) {
      return (
        <img 
          src={iconUrl} 
          alt="icon" 
          style={{ width: size, height: size, objectFit: 'contain' }} 
        />
      );
    }
    const IconComp = (ICON_COMPONENTS as any)[iconName];
    if (!IconComp) return null;
    return <IconComp size={size} />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
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
        <div className="relative z-10 w-[120px] h-[120px] mb-8">
          <div 
            className="absolute inset-0 rounded-full flex items-center justify-center transition-all"
            style={{ 
              border: `${config.logoBorderWidth}px solid ${config.logoBorderColor}`,
              padding: config.showLogoRings ? '10px' : '0'
            }}
          >
            <div 
              className="w-full h-full rounded-full border flex items-center justify-center bg-black overflow-hidden"
              style={{ 
                borderColor: config.showLogoRings ? `${config.iconColor}80` : 'transparent',
                boxShadow: config.showLogoRings ? `0 0 20px ${config.iconColor}26` : 'none'
              }}
            >
              {supplier.logoUrl ? (
                <img
                  src={supplier.logoUrl}
                  alt={supplier.name}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span 
                  className="text-4xl font-display font-light tracking-widest"
                  style={{ color: config.iconColor }}
                >{supplier.logo}</span>
              )}
            </div>
          </div>
          {/* Decorative Ring */}
          {config.showLogoRings && (
            <div 
              className="absolute -inset-2 rounded-full border border-dashed animate-[spin_30s_linear_infinite]"
              style={{ borderColor: `${config.iconColor}1a` }}
            />
          )}
        </div>

        {/* Info */}
        <div className="text-center z-10 w-full mb-6 flex flex-col items-center">
          <span 
            className="text-[10px] uppercase font-bold tracking-[0.3em] mb-2 block"
            style={{ color: `${config.iconColor}80` }}
          >
            {supplier.handle}
          </span>
          <h3 className="text-2xl font-display font-normal text-white mb-4 tracking-tight leading-tight text-center">
            {supplier.name}
          </h3>
          
          <div 
            className="h-px w-24 mx-auto mb-6"
            style={{ background: `linear-gradient(to right, transparent, ${config.iconColor}66, transparent)` }}
          />
          
          {/* Social Icons */}
          {config.showIcons && (
            <div className="flex justify-center gap-6 mb-8 w-full">
              <a 
                href={`https://wa.me/${supplier.whatsapp}`}
                target="_blank"
                className="p-3 rounded-full border transition-all duration-300"
                style={{ 
                  borderColor: `${config.iconColor}4d`,
                  color: `${config.iconColor}b3`,
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = `${config.iconColor}1a`;
                  (e.currentTarget as HTMLElement).style.color = config.iconColor;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = `${config.iconColor}b3`;
                }}
                title="WhatsApp"
              >
                {renderIcon(config.whatsappIcon, config.whatsappIconUrl, config.socialIconSize)}
              </a>
              <a 
                href={`https://instagram.com/${supplier.instagram}`}
                target="_blank"
                className="p-3 rounded-full border transition-all duration-300"
                style={{ 
                  borderColor: `${config.iconColor}4d`,
                  color: `${config.iconColor}b3`,
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = `${config.iconColor}1a`;
                  (e.currentTarget as HTMLElement).style.color = config.iconColor;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = `${config.iconColor}b3`;
                }}
                title="Instagram"
              >
                {renderIcon(config.instagramIcon, config.instagramIconUrl, config.socialIconSize)}
              </a>
            </div>
          )}

          {/* Category Pill */}
          <div 
            className="inline-block px-6 py-2 rounded-full border bg-gold/5 mb-6"
            style={{ borderColor: `${config.iconColor}33`, backgroundColor: `${config.iconColor}0d` }}
          >
            <span 
              className="text-[10px] uppercase font-medium tracking-[0.15em] italic"
              style={{ color: `${config.iconColor}cc` }}
            >
              {supplier.category}
            </span>
          </div>

          {/* Address */}
          <div className="flex items-start justify-center gap-2 px-2 w-full">
            <MapPin size={14} className="mt-1 shrink-0" style={{ color: `${config.iconColor}99` }} />
            <p className="text-[11px] text-white/50 leading-relaxed max-w-[200px] text-center">
              {supplier.address}
            </p>
          </div>
        </div>

        {/* Footer Accent */}
        <div className="relative z-10 w-full pt-4 mt-auto">
          <div 
            className="h-px w-full mb-4"
            style={{ background: `linear-gradient(to right, transparent, ${config.iconColor}33, transparent)` }}
          />
          <div className="flex justify-center items-center gap-3 w-full" style={{ color: `${config.iconColor}66` }}>
            <span className="font-bold tracking-tight text-white/30" style={{ fontFamily: 'Arial, sans-serif', fontSize: `${config.codeSize}px` }}>{supplier.numericId}</span>
            <div className="w-1 h-1 rounded-full bg-white/10" />
            {renderIcon(config.footerIcon, config.footerIconUrl, config.footerIconSize)}
          </div>
        </div>
      </div>
    </motion.div>
  );
});

function dbToSupplier(row: DbSupplier): Supplier {
  return {
    id: row.id,
    numericId: row.numeric_id,
    name: row.name,
    handle: row.handle,
    category: row.category,
    address: row.address,
    whatsapp: row.whatsapp,
    instagram: row.instagram,
    logo: row.logo,
    logoUrl: row.logo_url || undefined,
  }
}

function dbToCardConfig(row: DbCardConfig): CardConfig {
  return {
    borderRadius: row.border_radius,
    padding: row.padding,
    backgroundColor: row.background_color,
    backgroundOpacity: row.background_opacity,
    accentColor: row.accent_color,
    iconColor: row.icon_color,
    logoBorderColor: row.logo_border_color,
    logoBorderWidth: row.logo_border_width,
    showLogoRings: row.show_logo_rings,
    fontFamily: row.font_family as CardConfig['fontFamily'],
    showIcons: row.show_icons,
    pageBackgroundColor: row.page_background_color,
    footerIcon: row.footer_icon,
    whatsappIcon: row.whatsapp_icon,
    instagramIcon: row.instagram_icon,
    whatsappIconUrl: row.whatsapp_icon_url || undefined,
    instagramIconUrl: row.instagram_icon_url || undefined,
    footerIconUrl: row.footer_icon_url || undefined,
    footerLogoUrl: row.footer_logo_url || undefined,
    footerBrandName: row.footer_brand_name,
    socialIconSize: row.social_icon_size,
    footerIconSize: row.footer_icon_size,
    codeSize: row.code_size,
  }
}

function cardConfigToDb(config: CardConfig): Omit<DbCardConfig, 'id' | 'updated_at'> {
  return {
    border_radius: config.borderRadius,
    padding: config.padding,
    background_color: config.backgroundColor,
    background_opacity: config.backgroundOpacity,
    accent_color: config.accentColor,
    icon_color: config.iconColor,
    logo_border_color: config.logoBorderColor,
    logo_border_width: config.logoBorderWidth,
    show_logo_rings: config.showLogoRings,
    font_family: config.fontFamily,
    show_icons: config.showIcons,
    page_background_color: config.pageBackgroundColor,
    footer_icon: config.footerIcon,
    whatsapp_icon: config.whatsappIcon,
    instagram_icon: config.instagramIcon,
    whatsapp_icon_url: config.whatsappIconUrl ?? '',
    instagram_icon_url: config.instagramIconUrl ?? '',
    footer_icon_url: config.footerIconUrl ?? '',
    footer_logo_url: config.footerLogoUrl ?? '',
    footer_brand_name: config.footerBrandName ?? 'Luxe Directory',
    social_icon_size: config.socialIconSize,
    footer_icon_size: config.footerIconSize,
    code_size: config.codeSize,
  }
}

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [configId, setConfigId] = useState<string | null>(null);
  const configSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'directory' | 'customization' | 'configuration'>('directory');
  const [cardConfig, setCardConfig] = useState<CardConfig>(DEFAULT_CARD_CONFIG);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<{ count: number, names: string[], type: 'import' | 'export' } | null>(null);
  const [importResult, setImportResult] = useState<{
    imported: number;
    duplicates: number;
    duplicateNames: string[];
    failed: number;
    failedRows: Array<{ name: string; reason: string }>;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bulkImageInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    handle: '',
    category: 'Moda Feminina',
    address: '',
    whatsapp: '',
    instagram: '',
    logoUrl: '' as string | undefined,
  });

  // Auth state listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Close category dropdown when clicking outside
  useEffect(() => {
    if (!isCategoryDropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target as Node)) {
        setIsCategoryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isCategoryDropdownOpen]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
    if (error) setLoginError('E-mail ou senha incorretos.');
    setLoginLoading(false);
  };

  // Batched config update with startTransition — keeps sliders/pickers 60fps
  const updateConfig = useCallback((updates: Partial<CardConfig>) => {
    startTransition(() => setCardConfig(prev => ({ ...prev, ...updates })));
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSuppliers([]);
    setCategories([]);
    setCardConfig(DEFAULT_CARD_CONFIG);
    setLoading(true);
    isFirstRender.current = true;
  };

  // Load all data from Supabase on mount
  useEffect(() => {
    if (!session) return;
    async function loadData() {
      const [suppliersRes, categoriesRes, configRes] = await Promise.all([
        supabase.from('suppliers').select('*').order('numeric_id', { ascending: false }),
        supabase.from('categories').select('name').order('name'),
        supabase.from('card_config').select('*').single(),
      ]);

      if (suppliersRes.data) setSuppliers(suppliersRes.data.map(dbToSupplier));
      if (categoriesRes.data) setCategories(categoriesRes.data.map((r: { name: string }) => r.name));
      if (configRes.data) {
        setCardConfig(dbToCardConfig(configRes.data));
        setConfigId(configRes.data.id);
      } else {
        // No config row yet — create one with defaults
        const { data: newConfig } = await supabase
          .from('card_config')
          .insert(cardConfigToDb(DEFAULT_CARD_CONFIG))
          .select()
          .single();
        if (newConfig) setConfigId(newConfig.id);
      }
      setLoading(false);
    }
    loadData();
  }, [session]);

  // Keep refs in sync so the timer callback always reads latest values
  const cardConfigRef = useRef(cardConfig);
  const configIdRef = useRef(configId);
  useEffect(() => { cardConfigRef.current = cardConfig; }, [cardConfig]);
  useEffect(() => { configIdRef.current = configId; }, [configId]);

  // Debounced save of card_config to DB (500ms after last change)
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    if (!configId) return;
    if (configSaveTimerRef.current) clearTimeout(configSaveTimerRef.current);
    configSaveTimerRef.current = setTimeout(async () => {
      const id = configIdRef.current;
      if (!id) return;
      const { error } = await supabase
        .from('card_config')
        .update(cardConfigToDb(cardConfigRef.current))
        .eq('id', id);
      if (error) console.error('[card_config save]', error);
    }, 500);
  }, [cardConfig, configId]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfigImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'whatsappIconUrl' | 'instagramIconUrl' | 'footerIconUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop() || 'png';
    const url = await uploadLogo(file, `icons/${field}-${Date.now()}.${ext}`);
    if (url) setCardConfig(prev => ({ ...prev, [field]: url }));
  };

  const handleBulkImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const updatedSuppliers = [...suppliers];
    const dbUpdates: Promise<void>[] = [];
    let updatedCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const nameWithoutExt = file.name.split('.').slice(0, -1).join('.');
      const match = nameWithoutExt.match(/\d+/);
      if (!match) continue;

      const idFromFileName = parseInt(match[0]);
      const idx = updatedSuppliers.findIndex(s => s.numericId === idFromFileName);
      if (idx === -1) continue;

      const supplier = updatedSuppliers[idx];
      const ext = file.name.split('.').pop() || 'jpg';
      const url = await uploadLogo(file, `${supplier.id}.${ext}`);
      if (url) {
        updatedSuppliers[idx] = { ...supplier, logoUrl: url };
        dbUpdates.push(
          supabase.from('suppliers').update({ logo_url: url }).eq('id', supplier.id).then(() => {})
        );
        updatedCount++;
      }
    }

    if (updatedCount > 0) {
      setSuppliers(updatedSuppliers);
      await Promise.all(dbUpdates);
    }

    if (bulkImageInputRef.current) bulkImageInputRef.current.value = '';
  };

  const allCategories = ['Todos', ...categories];

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategoryName && !categories.includes(newCategoryName)) {
      setCategories(prev => [...prev, newCategoryName]);
      setNewCategoryName('');
      setIsAddingCategory(false);
      await supabase.from('categories').insert({ name: newCategoryName });
    }
  };

  // Extracts Instagram username — handles raw username, @username, or full instagram.com URL
  const normalizeInstagram = (raw: any): string => {
    let v = (raw ?? '').toString().trim();
    const urlMatch = v.match(/instagram\.com\/([^/?#\s]+)/i);
    if (urlMatch) v = urlMatch[1];
    return v.replace(/^@+/, '').toLowerCase().trim();
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        const existingNames = new Set(suppliers.map(s => s.name.toLowerCase().trim()));
        const existingHandles = new Set(suppliers.map(s => s.instagram?.toLowerCase().trim()).filter(Boolean));

        const duplicates: string[] = [];
        const rowsToInsert: Array<Omit<DbSupplier, 'id' | 'numeric_id' | 'created_at' | 'updated_at'>> = [];

        data.forEach((row: any) => {
          const name = (row['Nome da Loja'] || row['Nome'] || '').toString().trim();
          const instagram = normalizeInstagram(row['Instagram']);
          const whatsapp = (row['WhatsApp'] || row['Whats'] || row['whats'] || '').toString().replace(/\D/g, '');
          const address = (row['Endereço'] || row['Endereco'] || '').toString();
          const category = (row['Categoria'] || 'Importado').toString();
          const logo_url = (row['Logo URL'] || row['URL Imagem'] || '').toString();

          if (!name) return;

          const isDuplicate = existingNames.has(name.toLowerCase()) || (instagram && existingHandles.has(instagram));
          if (isDuplicate) { duplicates.push(name); return; }

          // Get the first GRAPHEME (full code point) so SMP chars (e.g. 𝓛𝓸𝓿𝓮) don't
          // leave a lone surrogate in `logo` and break JSON serialization.
          const firstChar = (Array.from(name.normalize('NFKD'))[0] || 'S').toUpperCase();
          rowsToInsert.push({
            name,
            handle: instagram ? `@${instagram}` : '',
            category,
            address,
            whatsapp,
            instagram,
            logo: firstChar,
            logo_url,
          });
          existingNames.add(name.toLowerCase());
          if (instagram) existingHandles.add(instagram);
        });

        let imported = 0;
        let failed = 0;
        const failedRows: Array<{ name: string; reason: string }> = [];
        const insertedRows: DbSupplier[] = [];

        if (rowsToInsert.length > 0) {
          // Try batch insert first (fast path)
          const batch = await supabase.from('suppliers').insert(rowsToInsert).select();

          if (!batch.error && batch.data) {
            imported = batch.data.length;
            insertedRows.push(...batch.data);
          } else {
            // Batch failed — fall back to one-by-one to isolate bad rows
            console.error('[import batch failed, retrying row-by-row]', batch.error);
            for (const row of rowsToInsert) {
              const single = await supabase.from('suppliers').insert(row).select().single();
              if (single.error) {
                failed++;
                failedRows.push({ name: row.name, reason: single.error.message });
                console.error('[import row failed]', row.name, single.error);
              } else if (single.data) {
                imported++;
                insertedRows.push(single.data);
              }
            }
          }

          if (insertedRows.length > 0) {
            setSuppliers(prev => [...insertedRows.map(dbToSupplier), ...prev]);

            const newCatsFound = Array.from(new Set(insertedRows.map(r => r.category)));
            const brandNewCats = newCatsFound.filter(c => !categories.includes(c));
            if (brandNewCats.length > 0) {
              const { error: catError } = await supabase.from('categories')
                .upsert(brandNewCats.map(name => ({ name })), { onConflict: 'name' });
              if (catError) console.error('[import categories]', catError);
              else setCategories(prev => Array.from(new Set([...prev, ...brandNewCats])));
            }
          }
        }

        setImportResult({
          imported,
          duplicates: duplicates.length,
          duplicateNames: duplicates.slice(0, 5),
          failed,
          failedRows,
        });
      } catch (err: any) {
        console.error('[import excel]', err);
        setImportResult({
          imported: 0,
          duplicates: 0,
          duplicateNames: [],
          failed: 1,
          failedRows: [{ name: 'Arquivo', reason: err?.message || 'Erro ao ler o arquivo Excel' }],
        });
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleExcelExport = () => {
    const exportData = filteredSuppliers.map(s => ({
      'Nome da Loja': s.name,
      'Instagram': s.instagram,
      'WhatsApp': s.whatsapp,
      'Endereço': s.address,
      'Categoria': s.category
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Fornecedores");
    XLSX.writeFile(wb, `fornecedores-${selectedCategory.toLowerCase()}.xlsx`);
  };

  const handleDownloadExample = () => {
    const exampleData = [
      {
        'Nome da Loja': '24K Folheados',
        'Instagram': '24k_folheados',
        'WhatsApp': '+55 11 95796-2868',
        'Endereço': 'Rua 25 de Março, 807',
        'Categoria': 'Acessórios'
      },
      {
        'Nome da Loja': 'Cereja Folheados',
        'Instagram': 'cerejafolheados_',
        'WhatsApp': '+55 11 97582-6780',
        'Endereço': 'Rua Tiers, 558 - Loja 159 - Térreo',
        'Categoria': 'Acessórios'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(exampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Exemplo");
    XLSX.writeFile(wb, "exemplo_fornecedores.xlsx");
  };

  const handleExport = () => {
    const suppliersToExport = filteredSuppliers;
    if (suppliersToExport.length === 0) return;

    // Check for internal duplicates in the current filter
    const seen = new Set();
    const exportDuplicates: string[] = [];
    suppliersToExport.forEach(s => {
      const key = `${s.name.toLowerCase()}-${s.instagram?.toLowerCase()}`;
      if (seen.has(key)) {
        exportDuplicates.push(s.name);
      }
      seen.add(key);
    });

    if (exportDuplicates.length > 0) {
      setDuplicateWarning({ count: exportDuplicates.length, names: exportDuplicates.slice(0, 5), type: 'export' });
      return; // Block export if there are duplicates
    }

    const fontStack = cardConfig.fontFamily === 'font-mono' ? 'monospace' : 
                     cardConfig.fontFamily === 'font-display' ? "'Playfair Display', serif" : "'Inter', sans-serif";

    // Paths sourced from lucide-react v0.546.0 — must match the live React preview 1:1
    const getIconPaths = (name: string) => {
      const paths: {[key: string]: string} = {
        'ShoppingBag': '<path d="M16 10a4 4 0 0 1-8 0"/><path d="M3.103 6.034h17.794"/><path d="M3.4 5.467a2 2 0 0 0-.4 1.2V20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6.667a2 2 0 0 0-.4-1.2l-2-2.667A2 2 0 0 0 17 2H7a2 2 0 0 0-1.6.8z"/>',
        'Store': '<path d="M15 21v-5a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v5"/><path d="M17.774 10.31a1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.451 0 1.12 1.12 0 0 0-1.548 0 2.5 2.5 0 0 1-3.452 0 1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.77-3.248l2.889-4.184A2 2 0 0 1 7 2h10a2 2 0 0 1 1.653.873l2.895 4.192a2.5 2.5 0 0 1-3.774 3.244"/><path d="M4 10.95V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8.05"/>',
        'Package': '<path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><polyline points="3.29 7 12 12 20.71 7"/><path d="m7.5 4.27 9 5.15"/>',
        'Gift': '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/>',
        'Truck': '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
        'CreditCard': '<rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>',
        'Globe': '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
        'Link': '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
        'MapIcon': '<path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"/><path d="M15 5.764v15"/><path d="M9 3.236v15"/>',
        'Instagram': '<rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>',
        'Camera': '<path d="M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z"/><circle cx="12" cy="13" r="3"/>',
        'Link2': '<path d="M9 17H7A5 5 0 0 1 7 7h2"/><path d="M15 7h2a5 5 0 1 1 0 10h-2"/><line x1="8" x2="16" y1="12" y2="12"/>',
        'User': '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
        'MessageCircle': '<path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719"/>',
        'Whatsapp': '<path fill="currentColor" stroke="none" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>',
        'Phone': '<path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384"/>',
        'MessageSquare': '<path d="M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z"/>',
        'Search': '<path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/>',
        'Send': '<path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/>',
        'MapPin': '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>'
      };
      return paths[name] || paths['ShoppingBag'];
    };

    const getIconSvg = (name: string, url?: string, size = 18) => {
      if (url) {
        return `<img src="${url}" style="width: ${size}px; height: ${size}px; object-fit: contain; filter: drop-shadow(0 0 1px rgba(0,0,0,0.5));" />`;
      }
      return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><use xlink:href="#icon-${name}"></use></svg>`;
    };

    const cardsHtml = suppliersToExport.map(s => `
      <div class="card-wrapper" data-name="${s.name}" data-id="${s.numericId}">
        <div class="glow"></div>
        <div class="card">
          <div class="overlay"></div>
          
          <div class="logo-container">
            ${cardConfig.showLogoRings ? `<div class="logo-decorative-ring"></div>` : ''}
            <div class="logo-ring-wrapper">
              <div class="logo-inner">
                ${s.logoUrl ? `
                  <img src="${s.logoUrl}" style="width: 100%; height: 100%; object-fit: cover;" />
                ` : `
                  <span class="logo-text">${s.logo}</span>
                `}
              </div>
            </div>
          </div>
          <div class="info">
            <span class="handle">${s.handle}</span>
            <h3 class="name">${s.name}</h3>
            <div class="divider"></div>
            ${cardConfig.showIcons ? `
            <div class="social-icons">
              <a href="https://wa.me/${s.whatsapp}" target="_blank" class="icon-circle">
                ${getIconSvg(cardConfig.whatsappIcon, cardConfig.whatsappIconUrl, cardConfig.socialIconSize)}
              </a>
              <a href="https://instagram.com/${s.instagram}" target="_blank" class="icon-circle">
                ${getIconSvg(cardConfig.instagramIcon, cardConfig.instagramIconUrl, cardConfig.socialIconSize)}
              </a>
            </div>
            ` : ''}
            <div class="category-pill">${s.category}</div>
            <div class="address">
              ${getIconSvg('MapPin', undefined, 14)}
              <span>${s.address}</span>
            </div>
          </div>
          <div class="footer">
            <div class="divider-full"></div>
            <div style="display: flex; justify-content: center; align-items: center; gap: 12px; width: 100%; color: ${cardConfig.iconColor}66;">
              <span class="footer-id">${s.numericId}</span>
              <div style="width: 3px; height: 3px; border-radius: 50%; background: rgba(255, 255, 255, 0.1);"></div>
              ${getIconSvg(cardConfig.footerIcon, cardConfig.footerIconUrl, cardConfig.footerIconSize)}
            </div>
          </div>
        </div>
      </div>
    `).join('');

    const hexToRgbaCSS = (hex: string, opacity: number) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
    };

    const symbolsHtml = Array.from(new Set([
      cardConfig.whatsappIcon,
      cardConfig.instagramIcon,
      cardConfig.footerIcon,
      'MapPin',
      'Search'
    ])).map(name => `<symbol id="icon-${name}" viewBox="0 0 24 24">${getIconPaths(name)}</symbol>`).join('');

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Catálogo de Fornecedores - ${selectedCategory}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:wght@400;500&display=swap" rel="stylesheet">
  <style>
    html, body {
      margin: 0;
      padding: 0;
      background-color: ${cardConfig.pageBackgroundColor};
      min-height: 100vh;
    }
    body {
      color: #FFFFFF;
      font-family: ${fontStack};
      padding: 40px;
      display: flex;
      flex-direction: column;
      align-items: center;
      box-sizing: border-box;
    }
    .container {
      width: 100%;
      padding: 40px;
      box-sizing: border-box;
    }
    .search-section {
      width: 100%;
      margin-bottom: 64px;
    }
    .search-wrapper {
      position: relative;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      padding: 0 24px;
      display: flex;
      align-items: center;
      transition: all 0.3s ease;
    }
    .search-wrapper:focus-within {
      border-color: ${cardConfig.iconColor}80;
      background: rgba(255, 255, 255, 0.05);
      box-shadow: 0 0 30px ${cardConfig.iconColor}1a;
    }
    .search-input {
      width: 100%;
      height: 64px;
      background: transparent;
      border: none;
      outline: none;
      color: #fff;
      font-size: 16px;
      font-family: inherit;
    }
    .search-svg {
      color: ${cardConfig.iconColor}66;
      margin-right: 16px;
    }
    .search-clear {
      display: none;
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 8px;
      border-radius: 50%;
      color: rgba(255, 255, 255, 0.3);
      transition: background 0.2s ease, color 0.2s ease;
      margin-left: 8px;
    }
    .search-clear:hover {
      background: rgba(255, 255, 255, 0.05);
      color: rgba(255, 255, 255, 0.6);
    }
    .search-clear.visible { display: inline-flex; align-items: center; justify-content: center; }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 32px;
      width: 100%;
    }
    .card-wrapper {
      position: relative;
      height: 100%;
      transition: transform 0.4s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.3s ease;
    }
    .card-wrapper.hidden {
      display: none;
    }
    .card-wrapper:hover {
      transform: translateY(-5px);
    }
    .glow {
      position: absolute;
      top: -1px;
      left: -1px;
      right: -1px;
      bottom: -1px;
      filter: blur(2px);
      opacity: 0.2;
      pointer-events: none;
      z-index: 0;
      transition: opacity 0.5s ease;
      border-radius: ${cardConfig.borderRadius + 2}px;
      background: linear-gradient(to bottom, ${cardConfig.accentColor}66, ${cardConfig.accentColor}1a, ${cardConfig.accentColor}66);
    }
    .card-wrapper:hover .glow {
      opacity: 0.4;
    }
    .overlay {
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 0;
      background: radial-gradient(at 50% 0%, ${cardConfig.accentColor}0d, transparent);
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
      overflow: hidden;
      height: 100%;
      box-sizing: border-box;
      z-index: 1;
    }
    .footer-id {
      font-family: Arial, sans-serif;
      font-size: ${cardConfig.codeSize}px;
      font-weight: 700;
      color: rgba(255, 255, 255, 0.3);
    }
    .logo-container { width: 120px; height: 120px; margin-bottom: 32px; position: relative; }
    .logo-ring-wrapper {
      position: absolute; inset: 0; border-radius: 50%;
      border: ${cardConfig.logoBorderWidth}px solid ${cardConfig.logoBorderColor};
      display: flex; align-items: center; justify-content: center;
      padding: ${cardConfig.showLogoRings ? '10px' : '0'};
    }
    .logo-inner {
      width: 100%; height: 100%; border-radius: 50%;
      border: ${cardConfig.showLogoRings ? `1px solid ${cardConfig.iconColor}80` : 'none'};
      background: black; display: flex; align-items: center; justify-content: center;
      overflow: hidden;
    }
    .logo-text { color: ${cardConfig.iconColor}; font-size: 36px; font-weight: 300; }
    .info { flex-grow: 1; width: 100%; text-align: center; display: flex; flex-direction: column; align-items: center; }
    .handle { font-size: 10px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.3em; color: ${cardConfig.iconColor}80; margin-bottom: 8px; }
    .name { font-size: 24px; margin-bottom: 16px; color: #FFFFFF; }
    .divider { height: 1px; width: 96px; background: linear-gradient(to right, transparent, ${cardConfig.iconColor}66, transparent); margin-bottom: 24px; }
    .social-icons { display: flex; gap: 16px; margin-bottom: 24px; }
    .icon-circle {
      width: ${cardConfig.socialIconSize + 18}px; height: ${cardConfig.socialIconSize + 18}px; border-radius: 50%; border: 1px solid ${cardConfig.iconColor}4d;
      display: flex; align-items: center; justify-content: center; color: ${cardConfig.iconColor}b3;
      text-decoration: none; transition: all 0.3s ease;
    }
    .icon-circle:hover {
      background: ${cardConfig.iconColor}1a;
      color: ${cardConfig.iconColor};
      border-color: ${cardConfig.iconColor};
      transform: translateY(-2px);
    }
    .card-wrapper:hover .logo-ring-wrapper {
      border-color: ${cardConfig.iconColor};
    }
    .card-wrapper:hover .logo-inner {
      box-shadow: ${cardConfig.showLogoRings ? `0 0 30px ${cardConfig.iconColor}4d` : 'none'};
    }
    .category-pill { font-size: 10px; text-transform: uppercase; padding: 8px 24px; border-radius: 99px; border: 1px solid ${cardConfig.iconColor}33; background: ${cardConfig.iconColor}0d; color: ${cardConfig.iconColor}cc; margin-bottom: 24px; font-style: italic; transition: all 0.3s ease; }
    .category-pill:hover {
      background: ${cardConfig.iconColor}1a;
      border-color: ${cardConfig.iconColor}66;
      color: ${cardConfig.iconColor};
    }
    .address { font-size: 11px; color: rgba(255, 255, 255, 0.4); display: flex; gap: 8px; text-align: center; }
    .footer { width: 100%; padding-top: 16px; margin-top: 24px; }
    .divider-full { height: 1px; width: 100%; background: linear-gradient(to right, transparent, ${cardConfig.iconColor}33, transparent); margin-bottom: 16px; }
  </style>
</head>
<body>
  <svg style="display: none;">${symbolsHtml}</svg>
  <div class="container">
    <div class="search-section">
      <div class="search-wrapper">
        <svg class="search-svg" viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><use xlink:href="#icon-Search"></use></svg>
        <input type="text" id="searchInput" class="search-input" placeholder="Pesquisar por nome ou código ID...">
        <button type="button" id="searchClear" class="search-clear" aria-label="Limpar busca">
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>

    <div style="display: flex; align-items: center; gap: 24px; margin-bottom: 64px;">
      <h2 style="font-size: 10px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.4em; color: rgba(255, 255, 255, 0.3); white-space: nowrap;">Catálogo de Fornecedores${selectedCategory !== 'Todos' ? ` - ${selectedCategory}` : ''}</h2>
      <div style="height: 1px; width: 100%; background: linear-gradient(to right, ${cardConfig.iconColor}4d, transparent);"></div>
    </div>
    
    <div class="grid" id="cardGrid">
      ${cardsHtml}
    </div>

    <footer style="border-top: 1px solid rgba(255, 255, 255, 0.05); padding: 64px 0; margin-top: 80px; width: 100%;">
      <div style="display: flex; flex-direction: column; align-items: center; gap: 32px; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 16px;">
          ${cardConfig.footerLogoUrl ? 
            `<img src="${cardConfig.footerLogoUrl}" style="width: 40px; height: 40px; border-radius: 50%; border: 1px solid ${cardConfig.iconColor}4d; object-fit: cover;">` : 
            `<div style="width: 40px; height: 40px; border-radius: 50%; border: 1px solid ${cardConfig.iconColor}4d; display: flex; align-items: center; justify-content: center; color: ${cardConfig.iconColor}; font-weight: 700; font-size: 14px;">${cardConfig.footerBrandName ? cardConfig.footerBrandName.charAt(0) : 'L'}</div>`
          }
          <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3em;">${cardConfig.footerBrandName}</div>
        </div>
        
        <p style="color: rgba(255, 255, 255, 0.2); font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; margin: 0;">
          © 2026 ${cardConfig.footerBrandName}. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  </div>

  <script>
    const searchInput = document.getElementById('searchInput');
    const searchClear = document.getElementById('searchClear');
    const cards = document.getElementsByClassName('card-wrapper');

    function applyFilter(term) {
      Array.from(cards).forEach(card => {
        const name = card.getAttribute('data-name').toLowerCase();
        const id = card.getAttribute('data-id').toLowerCase();
        if (name.includes(term) || id.includes(term)) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    }

    searchInput.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase().trim();
      searchClear.classList.toggle('visible', term.length > 0);
      applyFilter(term);
    });

    searchClear.addEventListener('click', () => {
      searchInput.value = '';
      searchClear.classList.remove('visible');
      applyFilter('');
      searchInput.focus();
    });
  </script>
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const logoInitial = formData.handle.charAt(1).toUpperCase() || formData.name.charAt(0).toUpperCase() || 'S';

    // If user picked a local file (base64), upload to Storage first
    let finalLogoUrl = formData.logoUrl ?? '';
    if (finalLogoUrl.startsWith('data:')) {
      const path = `${editingId ?? ('new-' + Date.now())}.jpg`;
      finalLogoUrl = await dataUrlToStorageUrl(finalLogoUrl, path);
    }

    const dbPayload = {
      name: formData.name,
      handle: formData.handle,
      category: formData.category,
      address: formData.address,
      whatsapp: formData.whatsapp,
      instagram: formData.instagram,
      logo: logoInitial,
      logo_url: finalLogoUrl,
    };

    if (editingId) {
      const idToUpdate = editingId;
      // Optimistic — explicit camelCase fields (no snake_case bleed)
      setSuppliers(prev => prev.map(s => s.id === idToUpdate ? {
        ...s,
        name: dbPayload.name,
        handle: dbPayload.handle,
        category: dbPayload.category,
        address: dbPayload.address,
        whatsapp: dbPayload.whatsapp,
        instagram: dbPayload.instagram,
        logo: dbPayload.logo,
        logoUrl: finalLogoUrl || undefined,
      } : s));
      setEditingId(null);

      const { data, error } = await supabase
        .from('suppliers')
        .update(dbPayload)
        .eq('id', idToUpdate)
        .select()
        .single();
      if (error) console.error('[update supplier]', error);
      else if (data) {
        setSuppliers(prev => prev.map(s => s.id === idToUpdate ? dbToSupplier(data) : s));
      }
    } else {
      const tempId = 'temp-' + Date.now();
      setSuppliers(prev => [{ id: tempId, numericId: 0, ...dbPayload, logoUrl: finalLogoUrl || undefined }, ...prev]);
      const { data } = await supabase.from('suppliers').insert(dbPayload).select().single();
      if (data) {
        setSuppliers(prev => prev.map(s => s.id === tempId ? dbToSupplier(data) : s));
      }
    }

    setIsModalOpen(false);
    setFormData({
      name: '',
      handle: '',
      category: categories[0] || 'Moda Feminina',
      address: '',
      whatsapp: '',
      instagram: '',
      logoUrl: undefined,
    });
  };

  const handleDelete = useCallback(async (id: string) => {
    if (window.confirm('Deseja realmente excluir este fornecedor?')) {
      setSuppliers(prev => prev.filter(s => s.id !== id));
      await supabase.from('suppliers').delete().eq('id', id);
    }
  }, []);

  const handleEdit = useCallback((supplier: Supplier) => {
    setFormData({
      name: supplier.name,
      handle: supplier.handle,
      category: supplier.category,
      address: supplier.address,
      whatsapp: supplier.whatsapp,
      instagram: supplier.instagram,
      logoUrl: supplier.logoUrl,
    });
    setEditingId(supplier.id);
    setIsModalOpen(true);
  }, []);

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
        logoUrl: undefined,
      });
    } else {
      setIsModalOpen(true);
    }
  };

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => {
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch = !term || 
                           s.name.toLowerCase().includes(term) || 
                           s.numericId.toString().includes(term);
      const matchesCategory = selectedCategory === 'Todos' || s.category === selectedCategory;
      return matchesSearch && matchesCategory;
    }).sort((a, b) => b.numericId - a.numericId);
  }, [suppliers, searchTerm, selectedCategory]);

  const loadingScreen = (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#050505' }}>
      <motion.div
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
        className="text-[10px] uppercase tracking-[0.4em] text-gold/60 font-bold"
      >
        Carregando...
      </motion.div>
    </div>
  );

  if (authLoading) return loadingScreen;

  if (!session) return (
    <div className="min-h-screen flex items-center justify-center px-6 font-sans" style={{ backgroundColor: '#050505' }}>
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #C89A62 0%, transparent 70%)' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        className="relative w-full max-w-md"
      >
        {/* Logo / Brand */}
        <div className="text-center mb-12">
          <div className="inline-flex w-16 h-16 rounded-full items-center justify-center mb-6 border"
            style={{ borderColor: '#C89A6240', backgroundColor: '#C89A620d' }}>
            <ShoppingBag size={28} style={{ color: '#C89A62' }} />
          </div>
          <h1 className="text-2xl font-display text-white mb-2 tracking-tight">Acesso Restrito</h1>
          <p className="text-[11px] uppercase tracking-[0.3em] text-white/30">Diretório de Fornecedores</p>
        </div>

        {/* Card */}
        <div className="border border-white/5 rounded-[2rem] p-8 md:p-10" style={{ backgroundColor: '#121212' }}>
          {/* Top glow line */}
          <div className="absolute top-0 left-1/4 right-1/4 h-px rounded-full"
            style={{ background: 'linear-gradient(to right, transparent, #C89A6266, transparent)' }} />

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">E-mail</label>
              <input
                type="email"
                required
                autoFocus
                placeholder="seu@email.com"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 outline-none text-white placeholder:text-white/10 text-sm transition-colors"
                style={{ '--tw-ring-color': '#C89A62' } as any}
                onFocus={e => (e.target.style.borderColor = '#C89A6280')}
                onBlur={e => (e.target.style.borderColor = '')}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">Senha</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 pr-12 outline-none text-white placeholder:text-white/10 text-sm"
                  onFocus={e => (e.target.style.borderColor = '#C89A6280')}
                  onBlur={e => (e.target.style.borderColor = '')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
                >
                  {showPassword
                    ? <ExternalLink size={16} />
                    : <ExternalLink size={16} style={{ opacity: 0.4 }} />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {loginError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 text-red-400/80 text-xs px-1"
                >
                  <AlertTriangle size={14} />
                  {loginError}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-4 rounded-2xl text-black text-xs font-bold uppercase tracking-[0.2em] transition-all mt-2 disabled:opacity-50"
              style={{ backgroundColor: '#C89A62', boxShadow: '0 0 30px #C89A6240' }}
            >
              {loginLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );

  if (loading) return loadingScreen;

  return (
    <div className="min-h-screen font-sans selection:bg-gold/30 selection:text-white transition-colors duration-500" style={{ backgroundColor: cardConfig.pageBackgroundColor }}>
      {/* Main Content */}
      <main className="w-full max-w-[1800px] mx-auto px-6 py-8 md:py-12">
        
        {/* Navigation Tabs */}
        <nav className="flex justify-center gap-8 mb-16 border-b border-white/5 relative">
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
          <button
            onClick={() => setActiveTab('configuration')}
            className={`flex items-center gap-2 py-4 px-4 text-xs font-bold uppercase tracking-[0.2em] transition-all relative ${
              activeTab === 'configuration' ? 'text-gold' : 'text-white/20 hover:text-white/50'
            }`}
          >
            <Settings2 size={16} />
            Configuração
            {activeTab === 'configuration' && (
              <motion.div layoutId="nav-active" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold" />
            )}
          </button>

          <button
            onClick={handleLogout}
            title="Sair"
            className="absolute right-0 top-1/2 -translate-y-1/2 p-2 rounded-full text-white/20 hover:text-red-400/60 hover:bg-white/5 transition-all"
          >
            <ExternalLink size={15} />
          </button>
        </nav>

        {activeTab === 'directory' && (
          <>

        {/* Hidden file inputs (used by Configuration tab actions) */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImportExcel}
          accept=".xlsx, .xls"
          className="hidden"
        />
        <input
          type="file"
          ref={bulkImageInputRef}
          onChange={handleBulkImageUpload}
          accept="image/*"
          multiple
          className="hidden"
        />

        {/* Primary action */}
        <div className="flex justify-end mb-12">
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
                  <div className="md:col-span-2 flex flex-col items-center mb-6">
                    <div className="relative group cursor-pointer">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                      />
                      <div 
                        className="w-24 h-24 rounded-full border-2 border-dashed border-gold/30 flex items-center justify-center bg-white/5 transition-all group-hover:border-gold/60 overflow-hidden"
                      >
                        {formData.logoUrl ? (
                          <img src={formData.logoUrl} className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex flex-col items-center text-gold/40 group-hover:text-gold/60">
                            <Camera size={24} />
                            <span className="text-[8px] uppercase tracking-tighter mt-1">Upload</span>
                          </div>
                        )}
                      </div>
                      {formData.logoUrl && (
                        <button 
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setFormData({...formData, logoUrl: undefined}); }}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 z-30"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                    <p className="text-[9px] uppercase tracking-widest text-white/30 mt-3">Logo ou Foto da Empresa</p>
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/40 ml-4">URL da Imagem de Perfil (Opcional)</label>
                    <input 
                      type="text" 
                      placeholder="https://exemplo.com/imagem.jpg"
                      value={formData.logoUrl || ''}
                      onChange={e => setFormData({...formData, logoUrl: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-gold/50 text-white placeholder:text-white/10"
                    />
                  </div>

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
                      onChange={e => {
                        const v = e.target.value;
                        const clean = v.replace(/^@+/, '').toLowerCase().trim();
                        setFormData({...formData, handle: v, instagram: clean});
                      }}
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
                    <label className="text-[10px] uppercase tracking-widest text-white/40 ml-4">Instagram User (auto-preenchido)</label>
                    <input
                      required
                      type="text"
                      placeholder="lumiereboutique"
                      value={formData.instagram}
                      onChange={e => {
                        const clean = e.target.value.replace(/^@+/, '').toLowerCase().trim();
                        setFormData({...formData, instagram: clean, handle: clean ? `@${clean}` : ''});
                      }}
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
            Catálogo de Fornecedores {selectedCategory !== 'Todos' && ` - ${selectedCategory}`}
          </p>
          <div className="h-px grow mx-6 bg-gradient-to-r from-gold/20 to-transparent" />
        </div>

        {/* Search Bar + Category Filter */}
        <div className="mb-12 flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="relative group grow">
            <div className="absolute inset-0 bg-gold/5 blur-2xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity" />
            <div className="relative flex items-center bg-white/5 border border-white/10 rounded-2xl px-6 py-1 focus-within:border-gold/50 transition-all h-full">
              <Search className="text-white/20 group-focus-within:text-gold/50 transition-colors shrink-0" size={20} />
              <input
                type="text"
                placeholder="Pesquisar por nome ou código ID..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-transparent border-none outline-none py-5 px-4 text-white text-lg placeholder:text-white/10"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="p-2 hover:bg-white/5 rounded-full text-white/20 hover:text-white/40 transition-all shrink-0"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Category Dropdown (custom, styled) */}
          <div className="relative md:w-72 shrink-0" ref={categoryDropdownRef}>
            <button
              type="button"
              onClick={() => setIsCategoryDropdownOpen(v => !v)}
              className={`w-full bg-white/5 border rounded-2xl pl-14 py-5 text-white text-sm outline-none transition-all cursor-pointer uppercase tracking-widest h-full text-left ${
                selectedCategory !== 'Todos' ? 'pr-20' : 'pr-12'
              } ${isCategoryDropdownOpen ? 'border-gold/50' : 'border-white/10 hover:border-white/20'}`}
            >
              <Folder size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
              <span className="block truncate">{selectedCategory}</span>
              <ChevronRight
                size={16}
                className={`absolute right-5 top-1/2 -translate-y-1/2 text-white/30 transition-transform pointer-events-none ${
                  isCategoryDropdownOpen ? '-rotate-90' : 'rotate-90'
                }`}
              />
            </button>

            {selectedCategory !== 'Todos' && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedCategory('Todos');
                  setIsCategoryDropdownOpen(false);
                }}
                title="Limpar categoria"
                className="absolute right-12 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-white/30 hover:text-white hover:bg-white/10 transition-all z-10"
              >
                <X size={14} />
              </button>
            )}

            <AnimatePresence>
              {isCategoryDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
                  className="absolute top-full left-0 right-0 mt-2 z-50 bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden"
                >
                  <div className="max-h-80 overflow-y-auto py-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-track]:bg-transparent">
                    {allCategories.map((cat) => {
                      const isActive = cat === selectedCategory;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            setSelectedCategory(cat);
                            setIsCategoryDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between gap-3 px-5 py-3 text-left text-xs uppercase tracking-widest transition-colors ${
                            isActive
                              ? 'bg-gold/10 text-gold'
                              : 'text-white/60 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          <span className="truncate">{cat}</span>
                          {isActive && <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="sync">
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
    )}

    {activeTab === 'configuration' && (
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="flex items-center gap-2 mb-2">
          <Settings2 size={16} className="text-gold" />
          <h2 className="text-white text-xs font-bold uppercase tracking-widest">Ações & Dados</h2>
        </div>

        {/* Categorias */}
        <section>
          <h3 className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-4">Categorias</h3>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <AnimatePresence mode="wait">
              {!isAddingCategory ? (
                <motion.button
                  key="add-btn"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsAddingCategory(true)}
                  className="flex items-center gap-3 px-5 py-3 rounded-xl bg-gold/10 text-gold border border-gold/20 hover:bg-gold/20 transition-all text-xs font-bold uppercase tracking-widest"
                >
                  <FolderPlus size={18} />
                  Adicionar Nova Categoria
                </motion.button>
              ) : (
                <motion.form
                  key="add-form"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  onSubmit={handleAddCategory}
                  className="flex gap-3"
                >
                  <input
                    autoFocus
                    type="text"
                    placeholder="Nome da nova categoria..."
                    value={newCategoryName}
                    onChange={e => setNewCategoryName(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-gold/50 grow"
                  />
                  <button type="submit" className="px-6 py-3 bg-gold text-black rounded-xl text-xs font-bold uppercase tracking-widest">
                    Criar
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsAddingCategory(false); setNewCategoryName(''); }}
                    className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white/60 hover:text-white hover:bg-white/10 transition-all"
                  >
                    Cancelar
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Importar */}
        <section>
          <h3 className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-4">Importar</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="group flex items-center gap-4 p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-gold/30 hover:bg-white/[0.07] transition-all text-left"
            >
              <div className="p-3 rounded-xl bg-gold/10 text-gold group-hover:bg-gold/20 transition-colors">
                <Upload size={24} />
              </div>
              <div>
                <div className="text-white text-sm font-bold uppercase tracking-widest mb-1">Importar Excel</div>
                <div className="text-white/40 text-xs">Adicione fornecedores em massa de uma planilha</div>
              </div>
            </button>

            <button
              onClick={() => bulkImageInputRef.current?.click()}
              className="group flex items-center gap-4 p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-gold/30 hover:bg-white/[0.07] transition-all text-left"
            >
              <div className="p-3 rounded-xl bg-gold/10 text-gold group-hover:bg-gold/20 transition-colors">
                <ImageIcon size={24} />
              </div>
              <div>
                <div className="text-white text-sm font-bold uppercase tracking-widest mb-1">Fotos em Massa</div>
                <div className="text-white/40 text-xs">Atualize logos vinculando pelo código do card</div>
              </div>
            </button>
          </div>

          <button
            onClick={handleDownloadExample}
            className="mt-4 text-[10px] uppercase tracking-widest text-white/30 hover:text-gold transition-colors"
          >
            ↓ Baixar Exemplo de Planilha
          </button>
        </section>

        {/* Exportar */}
        <section>
          <h3 className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-4">Exportar</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={handleExcelExport}
              disabled={filteredSuppliers.length === 0}
              className="group flex items-center gap-4 p-6 rounded-2xl bg-white/5 border border-gold/30 hover:bg-gold/5 transition-all text-left disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <div className="p-3 rounded-xl bg-gold/10 text-gold group-hover:bg-gold/20 transition-colors">
                <Package size={24} />
              </div>
              <div>
                <div className="text-gold text-sm font-bold uppercase tracking-widest mb-1">Exportar Excel</div>
                <div className="text-white/40 text-xs">Baixe a lista filtrada em planilha .xlsx</div>
              </div>
            </button>

            <button
              onClick={handleExport}
              disabled={filteredSuppliers.length === 0}
              className="group flex items-center gap-4 p-6 rounded-2xl bg-white/5 border border-gold/30 hover:bg-gold/5 transition-all text-left disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <div className="p-3 rounded-xl bg-gold/10 text-gold group-hover:bg-gold/20 transition-colors">
                <Download size={24} />
              </div>
              <div>
                <div className="text-gold text-sm font-bold uppercase tracking-widest mb-1">Exportar HTML</div>
                <div className="text-white/40 text-xs">Gere o catálogo estilizado pronto pra publicar</div>
              </div>
            </button>
          </div>
          {filteredSuppliers.length === 0 && (
            <p className="mt-3 text-[10px] uppercase tracking-widest text-white/20">Adicione fornecedores para habilitar a exportação</p>
          )}
        </section>
      </div>
    )}

    {activeTab === 'customization' && (
      <div className="flex flex-col md:flex-row gap-12">
        {/* Customization Controls */}
        <div className="w-full md:w-80 shrink-0 space-y-10">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Settings2 size={16} className="text-gold" />
                <h2 className="text-white text-xs font-bold uppercase tracking-widest">Aparência</h2>
              </div>
              <button 
                onClick={() => setShowResetConfirm(true)}
                className="text-[10px] uppercase tracking-widest text-gold/60 hover:text-gold transition-colors font-bold border-b border-transparent hover:border-gold/30"
              >
                Resetar
              </button>
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
                  onChange={e => updateConfig({borderRadius: parseInt(e.target.value)})}
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
                  onChange={e => updateConfig({padding: parseInt(e.target.value)})}
                  className="w-full accent-gold bg-white/5 h-1 rounded-full appearance-none"
                />
              </div>

              {/* Background Opacity */}
              <div className="space-y-4">
                <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-white/40">
                  <label>Opacidade do Card</label>
                  <span>{cardConfig.backgroundOpacity}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" 
                  value={cardConfig.backgroundOpacity}
                  onChange={e => updateConfig({backgroundOpacity: parseInt(e.target.value)})}
                  className="w-full accent-gold bg-white/5 h-1 rounded-full appearance-none"
                />
              </div>

              {/* Colors */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/40">Fundo Card</label>
                  <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3">
                    <input 
                      type="color" 
                      value={cardConfig.backgroundColor}
                      onChange={e => updateConfig({backgroundColor: e.target.value})}
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
                      onChange={e => updateConfig({accentColor: e.target.value})}
                      className="w-6 h-6 bg-transparent border-none cursor-pointer"
                    />
                    <span className="text-[10px] text-white/60 font-mono">{cardConfig.accentColor}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/40">Icones</label>
                  <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3">
                    <input 
                      type="color" 
                      value={cardConfig.iconColor}
                      onChange={e => updateConfig({iconColor: e.target.value})}
                      className="w-6 h-6 bg-transparent border-none cursor-pointer"
                    />
                    <span className="text-[10px] text-white/60 font-mono">{cardConfig.iconColor}</span>
                  </div>
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/40">Fundo da Página</label>
                  <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3">
                    <input 
                      type="color" 
                      value={cardConfig.pageBackgroundColor}
                      onChange={e => updateConfig({pageBackgroundColor: e.target.value})}
                      className="w-6 h-6 bg-transparent border-none cursor-pointer"
                    />
                    <span className="text-[10px] text-white/60 font-mono">{cardConfig.pageBackgroundColor}</span>
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
                    onChange={e => updateConfig({logoBorderWidth: parseInt(e.target.value)})}
                    className="w-full accent-gold bg-white/5 h-1 rounded-full appearance-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/40">Cor da Borda</label>
                  <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3">
                    <input 
                      type="color" 
                      value={cardConfig.logoBorderColor}
                      onChange={e => updateConfig({logoBorderColor: e.target.value})}
                      className="w-6 h-6 bg-transparent border-none cursor-pointer"
                    />
                    <span className="text-[10px] text-white/60 font-mono">{cardConfig.logoBorderColor}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-[10px] uppercase tracking-widest text-white/40">Efeito de Anéis</label>
                  <button 
                    onClick={() => updateConfig({showLogoRings: !cardConfig.showLogoRings})}
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
                      onClick={() => updateConfig({fontFamily: font})}
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
              <div className="space-y-6 pt-4 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] uppercase tracking-widest text-white/40">Exibir Ícones</label>
                  <button 
                    onClick={() => updateConfig({showIcons: !cardConfig.showIcons})}
                    className={`w-10 h-5 rounded-full transition-all relative ${cardConfig.showIcons ? 'bg-gold' : 'bg-white/10'}`}
                  >
                    <motion.div 
                      animate={{ x: cardConfig.showIcons ? 22 : 4 }}
                      className="absolute top-1 w-3 h-3 rounded-full bg-white"
                    />
                  </button>
                </div>

                {cardConfig.showIcons && (
                  <>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-white/40">
                        <label>Tamanho dos Ícones Sociais</label>
                        <span>{cardConfig.socialIconSize}px</span>
                      </div>
                      <input
                        type="range" min="12" max="36"
                        value={cardConfig.socialIconSize}
                        onChange={e => updateConfig({socialIconSize: parseInt(e.target.value)})}
                        className="w-full accent-gold bg-white/5 h-1 rounded-full appearance-none"
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-white/40">
                        <label>Tamanho do Código (#)</label>
                        <span>{cardConfig.codeSize}px</span>
                      </div>
                      <input
                        type="range" min="8" max="24"
                        value={cardConfig.codeSize}
                        onChange={e => updateConfig({codeSize: parseInt(e.target.value)})}
                        className="w-full accent-gold bg-white/5 h-1 rounded-full appearance-none"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] uppercase tracking-widest text-white/40">Ícone WhatsApp</label>
                      <div className="flex flex-wrap gap-2">
                        {WHATSAPP_ICONS.map(iconName => {
                          const IconComp = (ICON_COMPONENTS as any)[iconName];
                          return (
                            <button
                              key={iconName}
                              onClick={() => updateConfig({whatsappIcon: iconName})}
                              className={`p-2 rounded-lg border transition-all ${
                                cardConfig.whatsappIcon === iconName 
                                  ? 'border-gold text-gold bg-gold/5' 
                                  : 'border-white/10 text-white/40 hover:border-white/30'
                              }`}
                            >
                              <IconComp size={18} />
                            </button>
                          );
                        })}
                        <div className="relative group p-2 rounded-lg border border-white/10 text-white/40 hover:border-white/30 cursor-pointer">
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={e => handleConfigImageUpload(e, 'whatsappIconUrl')}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                          {cardConfig.whatsappIconUrl ? (
                            <div className="relative">
                              <img src={cardConfig.whatsappIconUrl} className="w-[18px] h-[18px] object-contain" />
                              <button 
                                onClick={(e) => { e.stopPropagation(); updateConfig({whatsappIconUrl: undefined}); }}
                                className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-0.5"
                              >
                                <X size={8} />
                              </button>
                            </div>
                          ) : (
                            <Plus size={18} />
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] uppercase tracking-widest text-white/40">Ícone Instagram</label>
                      <div className="flex flex-wrap gap-2">
                        {INSTAGRAM_ICONS.map(iconName => {
                          const IconComp = (ICON_COMPONENTS as any)[iconName];
                          return (
                            <button
                              key={iconName}
                              onClick={() => updateConfig({instagramIcon: iconName})}
                              className={`p-2 rounded-lg border transition-all ${
                                cardConfig.instagramIcon === iconName 
                                  ? 'border-gold text-gold bg-gold/5' 
                                  : 'border-white/10 text-white/40 hover:border-white/30'
                              }`}
                            >
                              <IconComp size={18} />
                            </button>
                          );
                        })}
                        <div className="relative group p-2 rounded-lg border border-white/10 text-white/40 hover:border-white/30 cursor-pointer">
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={e => handleConfigImageUpload(e, 'instagramIconUrl')}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                          {cardConfig.instagramIconUrl ? (
                            <div className="relative">
                              <img src={cardConfig.instagramIconUrl} className="w-[18px] h-[18px] object-contain" />
                              <button 
                                onClick={(e) => { e.stopPropagation(); updateConfig({instagramIconUrl: undefined}); }}
                                className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-0.5"
                              >
                                <X size={8} />
                              </button>
                            </div>
                          ) : (
                            <Plus size={18} />
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div className="space-y-3 pt-4 border-t border-white/5">
                  <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-white/40">
                    <label>Tamanho do Ícone Rodapé</label>
                    <span>{cardConfig.footerIconSize}px</span>
                  </div>
                  <input 
                    type="range" min="10" max="32" 
                    value={cardConfig.footerIconSize}
                    onChange={e => updateConfig({footerIconSize: parseInt(e.target.value)})}
                    className="w-full accent-gold bg-white/5 h-1 rounded-full appearance-none"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-widest text-white/40">Ícone Rodapé</label>
                  <div className="flex flex-wrap gap-2">
                    {FOOTER_ICONS.map(iconName => {
                      const IconComp = (ICON_COMPONENTS as any)[iconName];
                      return (
                        <button
                          key={iconName}
                          onClick={() => updateConfig({footerIcon: iconName})}
                          className={`p-2 rounded-lg border transition-all ${
                            cardConfig.footerIcon === iconName 
                              ? 'border-gold text-gold bg-gold/5' 
                              : 'border-white/10 text-white/40 hover:border-white/30'
                          }`}
                        >
                          <IconComp size={18} />
                        </button>
                      );
                    })}
                    <div className="relative group p-2 rounded-lg border border-white/10 text-white/40 hover:border-white/30 cursor-pointer">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={e => handleConfigImageUpload(e, 'footerIconUrl')}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      {cardConfig.footerIconUrl ? (
                        <div className="relative">
                          <img src={cardConfig.footerIconUrl} className="w-[18px] h-[18px] object-contain" />
                          <button 
                            onClick={(e) => { e.stopPropagation(); updateConfig({footerIconUrl: undefined}); }}
                            className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-0.5"
                          >
                            <X size={8} />
                          </button>
                        </div>
                      ) : (
                        <Plus size={18} />
                      )}
                    </div>
                  </div>
                </div>
                <div className="space-y-4 pt-6 mt-6 border-t border-white/5">
                  <h3 className="text-[10px] uppercase tracking-[0.2em] text-gold font-bold">Rodapé da Página</h3>
                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-white/40">Nome da Marca</label>
                      <input 
                        type="text" 
                        value={cardConfig.footerBrandName}
                        onChange={e => updateConfig({footerBrandName: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-gold/50 transition-colors"
                        placeholder="Ex: Luxe Directory"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-white/40">Logo do Rodapé</label>
                      <label className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3 cursor-pointer hover:bg-white/10 transition-all group">
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                updateConfig({footerLogoUrl: reader.result as string});
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden"
                        />
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-gold/50 overflow-hidden">
                          {cardConfig.footerLogoUrl ? (
                            <img src={cardConfig.footerLogoUrl} className="w-full h-full object-cover" />
                          ) : (
                            <Upload size={14} className="text-white/40 group-hover:text-gold" />
                          )}
                        </div>
                        <span className="text-[10px] text-white/60">
                          {cardConfig.footerLogoUrl ? 'Alterar Logo' : 'Subir Logo Customizada'}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
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
        <div className="w-full max-w-[1800px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            {cardConfig.footerLogoUrl ? (
              <img 
                src={cardConfig.footerLogoUrl} 
                alt="Footer Logo" 
                className="w-10 h-10 rounded-full object-cover border border-gold/30"
              />
            ) : (
              <div 
                className="w-10 h-10 rounded-full border border-gold/30 flex items-center justify-center bg-gold/5"
                style={{ borderColor: `${cardConfig.iconColor}4d` }}
              >
                <span className="text-gold font-display font-bold" style={{ color: cardConfig.iconColor }}>
                  {cardConfig.footerBrandName ? cardConfig.footerBrandName.charAt(0) : 'L'}
                </span>
              </div>
            )}
            <span className="font-display text-white tracking-[0.2em] font-light uppercase">
              {cardConfig.footerBrandName}
            </span>
          </div>

          <p className="text-[10px] text-white/20 tracking-widest uppercase">
            © 2026 {cardConfig.footerBrandName}. Todos os direitos reservados.
          </p>
        </div>
      </footer>

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowResetConfirm(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-[#121212] border border-white/10 rounded-[40px] p-10 overflow-hidden shadow-2xl"
            >
              {/* Background Grain */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
              
              <div className="relative z-10 text-center">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6 text-red-500">
                  <Settings2 size={32} />
                </div>
                <h2 className="text-2xl font-display text-white mb-4">Resetar Aparência?</h2>
                <p className="text-white/40 text-sm leading-relaxed mb-10">
                  Isso voltará todas as configurações de cores, bordas e ícones para o padrão original. 
                  <span className="block mt-2 text-red-500/60 font-medium">Esta ação não pode ser desfeita.</span>
                </p>
                
                <div className="flex gap-4">
                  <button 
                    onClick={() => setShowResetConfirm(false)}
                    className="flex-1 py-4 px-6 rounded-2xl bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-all font-bold uppercase tracking-widest text-[10px]"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={() => {
                      setCardConfig(DEFAULT_CARD_CONFIG);
                      setShowResetConfirm(false);
                    }}
                    className="flex-1 py-4 px-6 rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all font-bold uppercase tracking-widest text-[10px]"
                  >
                    Confirmar Reset
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Duplicate Warning Modal */}
      <AnimatePresence>
        {duplicateWarning && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDuplicateWarning(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-[#0A0A0A] border border-white/10 rounded-[32px] p-8 overflow-hidden shadow-2xl"
            >
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
              
              <div className="relative z-10 text-center">
                <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <AlertTriangle className="text-amber-500" size={32} />
                </div>
                
                <h3 className="text-xl font-semibold text-white mb-2">
                  {duplicateWarning.type === 'import' ? 'Fornecedores Repetidos' : 'Erro na Exportação'}
                </h3>
                
                <p className="text-white/50 text-sm leading-relaxed mb-6">
                  {duplicateWarning.type === 'import' ? (
                    <>Identificamos <strong>{duplicateWarning.count}</strong> fornecedor(es) que já estão cadastrados. Eles foram ignorados.</>
                  ) : (
                    <>Existem <strong>{duplicateWarning.count}</strong> fornecedores duplicados na lista. Remova-os antes de exportar.</>
                  )}
                </p>

                <div className="bg-white/5 rounded-2xl p-4 mb-8 text-left">
                  <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2">Alguns exemplos:</p>
                  <ul className="space-y-1">
                    {duplicateWarning.names.map((name, i) => (
                      <li key={i} className="text-xs text-white/60 truncate">• {name}</li>
                    ))}
                    {duplicateWarning.count > 5 && <li className="text-[10px] text-white/20 italic mt-1">...e outros {duplicateWarning.count - 5}</li>}
                  </ul>
                </div>

                <button
                  onClick={() => setDuplicateWarning(null)}
                  className="w-full py-4 bg-white text-black text-xs font-bold uppercase tracking-widest rounded-2xl hover:bg-white/90 transition-all shadow-lg"
                >
                  Entendido
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Import Result Modal */}
      <AnimatePresence>
        {importResult && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setImportResult(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-[#0A0A0A] border border-white/10 rounded-[32px] p-8 overflow-hidden shadow-2xl"
            >
              <div className="relative z-10 text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto ${
                  importResult.failed > 0 ? 'bg-red-500/10 text-red-500'
                    : importResult.imported > 0 ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-amber-500/10 text-amber-500'
                }`}>
                  {importResult.failed > 0
                    ? <AlertTriangle size={32} />
                    : importResult.imported > 0 ? <Upload size={32} /> : <AlertTriangle size={32} />}
                </div>

                <h3 className="text-xl font-semibold text-white mb-2">
                  {importResult.failed > 0 ? 'Falha na Importação'
                    : importResult.imported > 0 ? 'Importação Concluída'
                    : 'Nada para Importar'}
                </h3>

                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-3">
                    <p className="text-2xl font-bold text-emerald-400">{importResult.imported}</p>
                    <p className="text-[9px] uppercase tracking-widest text-white/40 mt-1">Importados</p>
                  </div>
                  <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-3">
                    <p className="text-2xl font-bold text-amber-400">{importResult.duplicates}</p>
                    <p className="text-[9px] uppercase tracking-widest text-white/40 mt-1">Repetidos</p>
                  </div>
                  <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-3">
                    <p className="text-2xl font-bold text-red-400">{importResult.failed}</p>
                    <p className="text-[9px] uppercase tracking-widest text-white/40 mt-1">Falharam</p>
                  </div>
                </div>

                {importResult.failedRows.length > 0 && (
                  <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4 mb-6 text-left max-h-48 overflow-y-auto">
                    <p className="text-[10px] uppercase tracking-widest text-red-400/70 mb-2">Falhas:</p>
                    <ul className="space-y-2">
                      {importResult.failedRows.map((f, i) => (
                        <li key={i} className="text-xs">
                          <span className="text-white/80 font-medium">• {f.name}</span>
                          <span className="block text-white/40 text-[10px] ml-3 break-words">{f.reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {importResult.duplicateNames.length > 0 && (
                  <div className="bg-white/5 rounded-2xl p-4 mb-6 text-left">
                    <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2">Repetidos ignorados:</p>
                    <ul className="space-y-1">
                      {importResult.duplicateNames.map((name, i) => (
                        <li key={i} className="text-xs text-white/60 truncate">• {name}</li>
                      ))}
                      {importResult.duplicates > 5 && <li className="text-[10px] text-white/20 italic mt-1">...e outros {importResult.duplicates - 5}</li>}
                    </ul>
                  </div>
                )}

                <button
                  onClick={() => setImportResult(null)}
                  className="w-full py-4 bg-white text-black text-xs font-bold uppercase tracking-widest rounded-2xl hover:bg-white/90 transition-all shadow-lg"
                >
                  Entendido
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
