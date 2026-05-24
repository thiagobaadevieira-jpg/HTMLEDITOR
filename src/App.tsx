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
  Image as ImageIcon,
  Copy,
  Check,
  Heart,
  Lock,
  LockKeyhole,
  KeyRound,
  EyeOff,
  Shield,
  ShieldOff
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
  Instagram, Camera, Link2, User,
  Lock, LockKeyhole, KeyRound, EyeOff, Shield, ShieldOff
};

const FOOTER_ICONS = ['ShoppingBag', 'Store', 'Package', 'Gift', 'Truck', 'CreditCard', 'Globe', 'Link', 'MapIcon'];
const WHATSAPP_ICONS = ['MessageCircle', 'Phone', 'MessageSquare', 'Send', 'Whatsapp'];
const INSTAGRAM_ICONS = ['Instagram', 'Camera', 'Link2', 'User'];
const LOCK_ICONS = ['Lock', 'LockKeyhole', 'KeyRound', 'EyeOff', 'Shield', 'ShieldOff'];

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
  privacyBlur: 0,
  lockEnabled: false,
  lockSize: 36,
  lockColor: '#C89A62',
  lockIcon: 'Lock',
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
  privacyBlur: number;
  lockEnabled: boolean;
  lockSize: number;
  lockColor: string;
  lockIcon: string;
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
  isFavorite: boolean;
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
  onToggleFavorite,
  config
}: {
  supplier: Supplier;
  onDelete: (id: string) => void;
  onEdit: (supplier: Supplier) => void;
  onToggleFavorite?: (id: string) => void;
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
        {/* Favorite toggle — top-left, always visible */}
        {onToggleFavorite && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(supplier.id); }}
            title={supplier.isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            className="absolute top-6 left-6 z-20 p-2 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 hover:scale-110 transition-all"
            style={{ color: supplier.isFavorite ? config.iconColor : 'rgba(255,255,255,0.3)' }}
          >
            <Heart size={14} fill={supplier.isFavorite ? 'currentColor' : 'none'} />
          </button>
        )}

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
        
        {/* Logo Section (outer wrapper — no blur, holds lock overlay) */}
        <div className="relative z-10 w-[120px] h-[120px] mb-8">
          {/* Inner — receives the blur (clipped to circle to avoid square halo) */}
          <div className="absolute inset-0 rounded-full overflow-hidden transition-[filter] duration-200" style={{ filter: config.privacyBlur ? `blur(${config.privacyBlur * 0.12}px)` : undefined }}>
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

          {/* Lock overlay (NOT blurred, on top) */}
          {config.lockEnabled && (() => {
            const LockIco = (ICON_COMPONENTS as any)[config.lockIcon] || Lock;
            return (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <LockIco
                  size={config.lockSize}
                  style={{ color: config.lockColor, filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.6))' }}
                />
              </div>
            );
          })()}
        </div>

        {/* Info */}
        <div className="text-center z-10 w-full mb-6 flex flex-col items-center">
          <span
            className="text-[10px] uppercase font-bold tracking-[0.3em] mb-2 block transition-[filter] duration-200"
            style={{ color: `${config.iconColor}80`, filter: config.privacyBlur ? `blur(${config.privacyBlur * 0.12}px)` : undefined }}
          >
            {supplier.handle}
          </span>
          <h3 className="text-2xl font-display font-normal text-white mb-4 tracking-tight leading-tight text-center transition-[filter] duration-200" style={{ filter: config.privacyBlur ? `blur(${config.privacyBlur * 0.12}px)` : undefined }}>
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
          <div className="flex items-start justify-center gap-2 px-2 w-full transition-[filter] duration-200" style={{ filter: config.privacyBlur ? `blur(${config.privacyBlur * 0.12}px)` : undefined }}>
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
    isFavorite: row.is_favorite ?? false,
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
    privacyBlur: row.privacy_blur ?? 0,
    lockEnabled: row.lock_enabled ?? false,
    lockSize: row.lock_size ?? 36,
    lockColor: row.lock_color ?? '#C89A62',
    lockIcon: row.lock_icon ?? 'Lock',
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
    privacy_blur: config.privacyBlur,
    lock_enabled: config.lockEnabled,
    lock_size: config.lockSize,
    lock_color: config.lockColor,
    lock_icon: config.lockIcon,
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
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [categoryDeleteAction, setCategoryDeleteAction] = useState<'move' | 'orphan'>('move');
  const [categoryDeleteTarget, setCategoryDeleteTarget] = useState<string>('');
  const [deletingCategory, setDeletingCategory] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<string | null>(null);
  const [categoryEditName, setCategoryEditName] = useState('');
  const [savingCategoryEdit, setSavingCategoryEdit] = useState(false);
  const [categoryEditError, setCategoryEditError] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<{ count: number, names: string[], type: 'import' | 'export' } | null>(null);
  const [copiedHtml, setCopiedHtml] = useState(false);
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

  // Normaliza nome de categoria — remove acentos, espaços extras, lowercase
  // (usado só para comparar; o nome salvo mantém o texto original do usuário)
  const normalizeCategory = (s: string): string =>
    (s ?? '').toString().normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim().replace(/\s+/g, ' ');

  // Procura categoria existente (ignorando acento/case) e retorna o nome canônico se houver
  const findExistingCategory = (name: string, list: string[] = categories): string | null => {
    const norm = normalizeCategory(name);
    if (!norm) return null;
    return list.find(c => normalizeCategory(c) === norm) ?? null;
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;

    const existing = findExistingCategory(trimmed);
    if (existing) {
      // Já existe variante — não cria duplicata, fecha o form e seleciona a existente
      setSelectedCategory(existing);
      setNewCategoryName('');
      setIsAddingCategory(false);
      return;
    }

    setCategories(prev => [...prev, trimmed]);
    setNewCategoryName('');
    setIsAddingCategory(false);
    await supabase.from('categories').insert({ name: trimmed });
  };

  const openDeleteCategory = (cat: string) => {
    setCategoryToDelete(cat);
    setCategoryDeleteAction('move');
    // Default destination = first available category that isn't the one being deleted
    const firstOther = categories.find(c => c !== cat) ?? '';
    setCategoryDeleteTarget(firstOther);
  };

  const handleConfirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    setDeletingCategory(true);
    const oldCat = categoryToDelete;
    const count = suppliers.filter(s => s.category === oldCat).length;

    try {
      // Se há fornecedores e usuário escolheu mover → atualiza category dos suppliers
      if (count > 0 && categoryDeleteAction === 'move' && categoryDeleteTarget) {
        setSuppliers(prev => prev.map(s => s.category === oldCat ? { ...s, category: categoryDeleteTarget } : s));
        const { error } = await supabase.from('suppliers').update({ category: categoryDeleteTarget }).eq('category', oldCat);
        if (error) { console.error('[move suppliers]', error); throw error; }
      }

      // Remove categoria
      setCategories(prev => prev.filter(c => c !== oldCat));
      if (selectedCategory === oldCat) setSelectedCategory('Todos');
      const { error: delErr } = await supabase.from('categories').delete().eq('name', oldCat);
      if (delErr) { console.error('[delete category]', delErr); throw delErr; }
    } catch (e) {
      console.error('[handleConfirmDeleteCategory]', e);
    } finally {
      setDeletingCategory(false);
      setCategoryToDelete(null);
      setCategoryDeleteTarget('');
      setCategoryDeleteAction('move');
    }
  };

  const openEditCategory = (cat: string) => {
    setCategoryToEdit(cat);
    setCategoryEditName(cat);
    setCategoryEditError('');
  };

  const handleSaveEditCategory = async () => {
    if (!categoryToEdit) return;
    const trimmed = categoryEditName.trim();
    if (!trimmed) { setCategoryEditError('Nome não pode estar vazio.'); return; }
    if (trimmed === categoryToEdit) { setCategoryToEdit(null); return; }

    // Verifica se já existe outra categoria com nome equivalente (case/acento)
    const conflict = categories.find(c => c !== categoryToEdit && normalizeCategory(c) === normalizeCategory(trimmed));
    if (conflict) {
      setCategoryEditError(`Já existe a categoria "${conflict}". Use a função de excluir/mesclar.`);
      return;
    }

    setSavingCategoryEdit(true);
    const oldCat = categoryToEdit;
    try {
      // 1. Atualiza suppliers que usam a categoria antiga
      setSuppliers(prev => prev.map(s => s.category === oldCat ? { ...s, category: trimmed } : s));
      const { error: supErr } = await supabase.from('suppliers').update({ category: trimmed }).eq('category', oldCat);
      if (supErr) throw supErr;

      // 2. Insere nova + apaga antiga (renomear == insert+delete porque nome é UNIQUE)
      setCategories(prev => prev.map(c => c === oldCat ? trimmed : c));
      if (selectedCategory === oldCat) setSelectedCategory(trimmed);
      await supabase.from('categories').upsert({ name: trimmed }, { onConflict: 'name' });
      await supabase.from('categories').delete().eq('name', oldCat);

      setCategoryToEdit(null);
      setCategoryEditName('');
      setCategoryEditError('');
    } catch (e: any) {
      console.error('[edit category]', e);
      setCategoryEditError(e?.message || 'Erro ao salvar.');
    } finally {
      setSavingCategoryEdit(false);
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

        // Trackeia categorias canônicas (incluindo as criadas durante este import)
        const knownCategories: string[] = [...categories];

        data.forEach((row: any) => {
          const name = (row['Nome da Loja'] || row['Nome'] || '').toString().trim();
          const instagram = normalizeInstagram(row['Instagram']);
          const whatsapp = (row['WhatsApp'] || row['Whats'] || row['whats'] || '').toString().replace(/\D/g, '');
          const address = (row['Endereço'] || row['Endereco'] || '').toString();
          const rawCategory = (row['Categoria'] || 'Importado').toString().trim();
          // Se já existe variante (com/sem acento, com/sem maiúscula), usa a canônica
          const matched = findExistingCategory(rawCategory, knownCategories);
          const category = matched ?? rawCategory;
          if (!matched) knownCategories.push(rawCategory);
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

  const handleExport = async (mode: 'download' | 'copy' = 'download') => {
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
        'MapPin': '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
        'Lock': '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
        'LockKeyhole': '<circle cx="12" cy="16" r="1"/><rect x="3" y="10" width="18" height="12" rx="2"/><path d="M7 10V7a5 5 0 0 1 10 0v3"/>',
        'KeyRound': '<path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"/><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/>',
        'EyeOff': '<path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/>',
        'Shield': '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
        'ShieldOff': '<path d="M19.69 14a6.9 6.9 0 0 0 .31-2V5l-8-3-3.16 1.18"/><path d="M4.73 4.73 4 5v7c0 6 8 10 8 10a20.29 20.29 0 0 0 5.62-4.38"/><path d="m2 2 20 20"/>'
      };
      return paths[name] || paths['ShoppingBag'];
    };

    const getIconSvg = (name: string, url?: string, size = 18) => {
      if (url) {
        return `<img src="${url}" style="width: ${size}px; height: ${size}px; object-fit: contain; filter: drop-shadow(0 0 1px rgba(0,0,0,0.5));" />`;
      }
      return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><use xlink:href="#icon-${name}"></use></svg>`;
    };

    const cardsHtml = suppliersToExport.map((s, i) => `
      <div class="card-wrapper${i >= 5 ? ' lazy-hidden' : ''}" data-name="${s.name}" data-id="${s.numericId}">
        <div class="glow"></div>
        <div class="card">
          <div class="overlay"></div>
          
          <div class="logo-container">
            <div class="logo-blur-wrapper">
              ${cardConfig.showLogoRings ? `<div class="logo-decorative-ring"></div>` : ''}
              <div class="logo-ring-wrapper">
                <div class="logo-inner">
                  ${s.logoUrl ? `
                    <img src="${s.logoUrl}" loading="${i === 0 ? 'eager' : 'lazy'}" decoding="async" ${i === 0 ? 'fetchpriority="high"' : ''} style="width: 100%; height: 100%; object-fit: cover;" />
                  ` : `
                    <span class="logo-text">${s.logo}</span>
                  `}
                </div>
              </div>
            </div>
            ${cardConfig.lockEnabled ? `
              <div class="lock-overlay">
                <svg viewBox="0 0 24 24" width="${cardConfig.lockSize}" height="${cardConfig.lockSize}" stroke="${cardConfig.lockColor}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 2px 8px rgba(0,0,0,0.6));">
                  <use xlink:href="#icon-${cardConfig.lockIcon}"></use>
                </svg>
              </div>
            ` : ''}
          </div>
          <div class="info">
            <span class="handle">${s.handle}</span>
            <h3 class="name">${s.name}</h3>
            <div class="divider"></div>
            ${cardConfig.showIcons ? `
            <div class="social-icons">
              <a href="whatsapp://send?phone=${s.whatsapp}" class="icon-circle">
                ${getIconSvg(cardConfig.whatsappIcon, cardConfig.whatsappIconUrl, cardConfig.socialIconSize)}
              </a>
              <a href="instagram://user?username=${s.instagram}" class="icon-circle">
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
      cardConfig.lockIcon,
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
      overflow-x: hidden;
      max-width: 100%;
    }
    *, *::before, *::after { box-sizing: border-box; }
    body {
      color: #FFFFFF;
      font-family: ${fontStack};
      padding: 40px;
      display: flex;
      flex-direction: column;
      align-items: center;
      max-width: 100%;
    }
    .container {
      width: 100%;
      max-width: 100%;
      padding: 40px;
    }
    @media (max-width: 640px) {
      body { padding: 16px; }
      .container { padding: 16px; }
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
    .card-wrapper.hidden,
    .card-wrapper.lazy-hidden {
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
    .logo-blur-wrapper { position: absolute; inset: 0; filter: blur(${(cardConfig.privacyBlur || 0) * 0.12}px); border-radius: 50%; overflow: hidden; }
    .lock-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
      z-index: 10;
    }
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
    .handle { font-size: 10px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.3em; color: ${cardConfig.iconColor}80; margin-bottom: 8px; filter: blur(${(cardConfig.privacyBlur || 0) * 0.12}px); }
    .name { font-size: 24px; margin-bottom: 16px; color: #FFFFFF; filter: blur(${(cardConfig.privacyBlur || 0) * 0.12}px); }
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
    .address { font-size: 11px; color: rgba(255, 255, 255, 0.4); display: flex; gap: 8px; text-align: center; filter: blur(${(cardConfig.privacyBlur || 0) * 0.12}px); }
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
        <input type="text" id="searchInput" class="search-input" placeholder="Pesquisar por nome ou código ID..." autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">
        <button type="button" id="searchClear" class="search-clear" aria-label="Limpar busca">
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>

    <div style="margin-bottom: 48px;">
      <div style="display: flex; align-items: center; gap: 16px;">
        <h2 style="font-size: 10px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.4em; color: rgba(255, 255, 255, 0.3); margin: 0; white-space: nowrap;">Catálogo de Fornecedores</h2>
        <div style="height: 1px; flex: 1; background: linear-gradient(to right, ${cardConfig.iconColor}4d, transparent);"></div>
      </div>
      ${selectedCategory !== 'Todos' ? `
      <div style="font-size: 14px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.25em; color: ${cardConfig.iconColor}; margin-top: 12px; word-break: break-word;">${selectedCategory}</div>
      ` : ''}
    </div>
    
    <div class="grid" id="cardGrid">
      ${cardsHtml}
    </div>
    <div id="lazy-sentinel" style="height: 1px; width: 100%;"></div>

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
    const cards = Array.from(document.getElementsByClassName('card-wrapper'));
    const sentinel = document.getElementById('lazy-sentinel');

    const BATCH = 5;
    let visibleCount = Math.min(BATCH, cards.length);
    let isSearching = false;

    function revealMore() {
      if (isSearching || visibleCount >= cards.length) return;
      const newCount = Math.min(visibleCount + BATCH, cards.length);
      for (let i = visibleCount; i < newCount; i++) {
        cards[i].classList.remove('lazy-hidden');
      }
      visibleCount = newCount;
    }

    // Auto-load more cards when sentinel scrolls into view
    if (sentinel && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => { if (entry.isIntersecting) revealMore(); });
      }, { rootMargin: '300px' });
      observer.observe(sentinel);
    } else {
      // Fallback: reveal all if IntersectionObserver not supported
      cards.forEach(c => c.classList.remove('lazy-hidden'));
      visibleCount = cards.length;
    }

    function applyFilter(term) {
      isSearching = term.length > 0;
      cards.forEach((card, i) => {
        const name = card.getAttribute('data-name').toLowerCase();
        const id = card.getAttribute('data-id').toLowerCase();
        const matches = !term || name.includes(term) || id.includes(term);

        if (isSearching) {
          // Show ALL matches (override lazy state)
          card.classList.remove('lazy-hidden');
          card.classList.toggle('hidden', !matches);
        } else {
          // Restore lazy behavior
          card.classList.remove('hidden');
          card.classList.toggle('lazy-hidden', i >= visibleCount);
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

    // Sempre começar com campo vazio — limpa imediatamente e também quando a página
    // é restaurada do bfcache (iOS/Android, ao voltar pra tela)
    function resetSearch() {
      searchInput.value = '';
      searchClear.classList.remove('visible');
      applyFilter('');
    }
    resetSearch();
    window.addEventListener('pageshow', resetSearch);
  </script>
</body>
</html>
    `
      // Minify: remove leading/trailing whitespace per line + collapse multiple spaces
      // (safe enough — doesn't touch content of strings or attributes)
      .replace(/\n\s+/g, '\n')          // tira indentação
      .replace(/\n{2,}/g, '\n')          // tira linhas vazias duplas
      .replace(/>\s+</g, '><')           // remove espaços entre tags
      .replace(/ {2,}/g, ' ');           // colapsa múltiplos espaços em um

    if (mode === 'copy') {
      try {
        await navigator.clipboard.writeText(htmlContent);
        setCopiedHtml(true);
        setTimeout(() => setCopiedHtml(false), 2200);
      } catch (err) {
        console.error('[copy html]', err);
        // Fallback: usar textarea + execCommand
        const ta = document.createElement('textarea');
        ta.value = htmlContent;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); setCopiedHtml(true); setTimeout(() => setCopiedHtml(false), 2200); } catch {}
        document.body.removeChild(ta);
      }
      return;
    }

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
      setSuppliers(prev => [{ id: tempId, numericId: 0, ...dbPayload, logoUrl: finalLogoUrl || undefined, isFavorite: false }, ...prev]);
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

  const handleToggleFavorite = useCallback(async (id: string) => {
    let newValue = false;
    setSuppliers(prev => prev.map(s => {
      if (s.id !== id) return s;
      newValue = !s.isFavorite;
      return { ...s, isFavorite: newValue };
    }));
    const { error } = await supabase.from('suppliers').update({ is_favorite: newValue }).eq('id', id);
    if (error) console.error('[toggle favorite]', error);
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

  const favoriteCount = useMemo(() => suppliers.filter(s => s.isFavorite).length, [suppliers]);

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => {
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch = !term ||
                           s.name.toLowerCase().includes(term) ||
                           s.numericId.toString().includes(term);
      const matchesCategory = selectedCategory === 'Todos' || s.category === selectedCategory;
      const matchesFavorite = !showOnlyFavorites || s.isFavorite;
      return matchesSearch && matchesCategory && matchesFavorite;
    }).sort((a, b) => b.numericId - a.numericId);
  }, [suppliers, searchTerm, selectedCategory, showOnlyFavorites]);

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
      {/* Hidden file inputs — always mounted so buttons in any tab can trigger them */}
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

        {/* Primary action */}
        <div className="flex justify-end items-center gap-3 mb-12 flex-wrap">
          <div className="flex items-center gap-2 px-5 py-3 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs font-semibold tracking-widest uppercase">
            <Store size={14} className="text-gold" />
            <span className="text-white"><span className="text-gold font-bold">{suppliers.length}</span> {suppliers.length === 1 ? 'Fornecedor' : 'Fornecedores'}</span>
            {selectedCategory !== 'Todos' && filteredSuppliers.length !== suppliers.length && !showOnlyFavorites && (
              <span className="text-white/40 normal-case">· {filteredSuppliers.length} na categoria</span>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowOnlyFavorites(v => !v)}
            title={showOnlyFavorites ? 'Mostrar todos' : 'Mostrar só favoritos'}
            className={`flex items-center gap-2 px-5 py-3 rounded-full border transition-all text-xs font-semibold tracking-widest uppercase ${
              showOnlyFavorites
                ? 'bg-gold/15 border-gold/50 text-gold'
                : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'
            }`}
          >
            <Heart size={14} fill={showOnlyFavorites ? 'currentColor' : 'none'} className={showOnlyFavorites ? 'text-gold' : 'text-gold/70'} />
            <span><span className="font-bold">{favoriteCount}</span> {favoriteCount === 1 ? 'Favorito' : 'Favoritos'}</span>
          </button>

          <button
            onClick={() => handleExport('copy')}
            disabled={filteredSuppliers.length === 0}
            className="flex items-center gap-2 px-6 py-3 rounded-full border border-gold/40 text-gold text-xs font-semibold tracking-widest uppercase hover:bg-gold/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {copiedHtml ? <><Check size={16} /> Copiado!</> : <><Copy size={16} /> Copiar HTML</>}
          </button>
          <button
            onClick={() => handleExport('download')}
            disabled={filteredSuppliers.length === 0}
            className="flex items-center gap-2 px-6 py-3 rounded-full border border-gold/40 text-gold text-xs font-semibold tracking-widest uppercase hover:bg-gold/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download size={16} />
            Exportar HTML
          </button>
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
                      const isTodos = cat === 'Todos';
                      return (
                        <div
                          key={cat}
                          className={`group/cat flex items-center transition-colors ${
                            isActive ? 'bg-gold/10 text-gold' : 'text-white/60 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCategory(cat);
                              setIsCategoryDropdownOpen(false);
                            }}
                            className="flex-1 flex items-center justify-between gap-3 px-5 py-3 text-left text-xs uppercase tracking-widest min-w-0"
                          >
                            <span className="truncate">{cat}</span>
                            {isActive && <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />}
                          </button>
                          {!isTodos && (
                            <>
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); openEditCategory(cat); setIsCategoryDropdownOpen(false); }}
                                className="opacity-0 group-hover/cat:opacity-100 p-3 text-white/30 hover:text-gold transition-all"
                                title={`Editar categoria "${cat}"`}
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); openDeleteCategory(cat); setIsCategoryDropdownOpen(false); }}
                                className="opacity-0 group-hover/cat:opacity-100 p-3 text-white/30 hover:text-red-400 transition-all"
                                title={`Excluir categoria "${cat}"`}
                              >
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                        </div>
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
          {filteredSuppliers.map((supplier) => (
            <SupplierCard
              key={supplier.id}
              supplier={supplier}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onToggleFavorite={handleToggleFavorite}
              config={cardConfig}
            />
          ))}
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
              onClick={() => handleExport('download')}
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

            <button
              onClick={() => handleExport('copy')}
              disabled={filteredSuppliers.length === 0}
              className="group flex items-center gap-4 p-6 rounded-2xl bg-white/5 border border-gold/30 hover:bg-gold/5 transition-all text-left disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <div className="p-3 rounded-xl bg-gold/10 text-gold group-hover:bg-gold/20 transition-colors">
                {copiedHtml ? <Check size={24} /> : <Copy size={24} />}
              </div>
              <div>
                <div className="text-gold text-sm font-bold uppercase tracking-widest mb-1">{copiedHtml ? 'Copiado!' : 'Copiar HTML'}</div>
                <div className="text-white/40 text-xs">Cola direto onde quiser, sem baixar arquivo</div>
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

                    {/* Privacy Blur — para gravar vídeo demonstrativo sem expor contatos */}
                    <div className="space-y-3 pt-4 border-t border-white/5">
                      <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-white/40">
                        <label>Borrão de Privacidade</label>
                        <span className={cardConfig.privacyBlur > 0 ? 'text-gold' : ''}>{cardConfig.privacyBlur}%</span>
                      </div>
                      <input
                        type="range" min="0" max="100"
                        value={cardConfig.privacyBlur}
                        onChange={e => updateConfig({privacyBlur: parseInt(e.target.value)})}
                        className="w-full accent-gold bg-white/5 h-1 rounded-full appearance-none"
                      />
                      <p className="text-[9px] text-white/30 leading-relaxed">Borra foto, nome, @ e endereço dos cards. Útil para gravar vídeo sem expor contatos. Volte a 0% depois.</p>
                    </div>

                    {/* Cadeado de Privacidade */}
                    <div className="space-y-3 pt-4 border-t border-white/5">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] uppercase tracking-widest text-white/40">Cadeado de Privacidade</label>
                        <button
                          type="button"
                          onClick={() => updateConfig({lockEnabled: !cardConfig.lockEnabled})}
                          className={`relative w-10 h-5 rounded-full transition-colors ${cardConfig.lockEnabled ? 'bg-gold' : 'bg-white/10'}`}
                        >
                          <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${cardConfig.lockEnabled ? 'left-[22px]' : 'left-0.5'}`} />
                        </button>
                      </div>

                      <AnimatePresence>
                        {cardConfig.lockEnabled && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4 overflow-hidden"
                          >
                            {/* Tamanho */}
                            <div className="space-y-2 pt-2">
                              <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-white/40">
                                <label>Tamanho</label>
                                <span>{cardConfig.lockSize}px</span>
                              </div>
                              <input
                                type="range" min="16" max="72"
                                value={cardConfig.lockSize}
                                onChange={e => updateConfig({lockSize: parseInt(e.target.value)})}
                                className="w-full accent-gold bg-white/5 h-1 rounded-full appearance-none"
                              />
                            </div>

                            {/* Cor */}
                            <div className="space-y-2">
                              <label className="text-[10px] uppercase tracking-widest text-white/40">Cor</label>
                              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3">
                                <input
                                  type="color"
                                  value={cardConfig.lockColor}
                                  onChange={e => updateConfig({lockColor: e.target.value})}
                                  className="w-6 h-6 bg-transparent border-none cursor-pointer"
                                />
                                <span className="text-[10px] text-white/60 font-mono">{cardConfig.lockColor}</span>
                              </div>
                            </div>

                            {/* Ícone */}
                            <div className="space-y-2">
                              <label className="text-[10px] uppercase tracking-widest text-white/40">Ícone</label>
                              <div className="flex flex-wrap gap-2">
                                {LOCK_ICONS.map(iconName => {
                                  const IconComp = (ICON_COMPONENTS as any)[iconName];
                                  return (
                                    <button
                                      key={iconName}
                                      type="button"
                                      onClick={() => updateConfig({lockIcon: iconName})}
                                      className={`p-2 rounded-lg border transition-all ${
                                        cardConfig.lockIcon === iconName
                                          ? 'bg-gold/10 border-gold/50 text-gold'
                                          : 'bg-white/5 border-white/10 text-white/40 hover:text-white/70'
                                      }`}
                                      title={iconName}
                                    >
                                      <IconComp size={18} />
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
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

      {/* Edit Category Modal */}
      <AnimatePresence>
        {categoryToEdit && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !savingCategoryEdit && setCategoryToEdit(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-[#0A0A0A] border border-white/10 rounded-[32px] p-8 shadow-2xl"
            >
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4 text-gold">
                  <Edit2 size={24} />
                </div>
                <h3 className="text-xl font-display text-white mb-1">Editar Categoria</h3>
                <p className="text-[10px] uppercase tracking-widest text-white/40">
                  Renomeando "{categoryToEdit}"
                </p>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleSaveEditCategory(); }} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">Novo nome</label>
                  <input
                    autoFocus
                    type="text"
                    value={categoryEditName}
                    onChange={e => { setCategoryEditName(e.target.value); setCategoryEditError(''); }}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 outline-none text-white text-sm focus:border-gold/50 transition-colors"
                  />
                </div>

                <AnimatePresence>
                  {categoryEditError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-start gap-2 text-amber-400/90 text-xs px-1"
                    >
                      <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                      <span>{categoryEditError}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <p className="text-[10px] text-white/30 leading-relaxed px-1">
                  Todos os fornecedores que estão nessa categoria serão atualizados automaticamente.
                </p>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setCategoryToEdit(null)}
                    disabled={savingCategoryEdit}
                    className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all text-xs font-bold uppercase tracking-widest disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={savingCategoryEdit || !categoryEditName.trim() || categoryEditName.trim() === categoryToEdit}
                    className="flex-1 py-4 rounded-2xl bg-gold text-black hover:brightness-110 transition-all text-xs font-bold uppercase tracking-widest disabled:opacity-50"
                  >
                    {savingCategoryEdit ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Category Confirmation Modal */}
      <AnimatePresence>
        {categoryToDelete && (() => {
          const count = suppliers.filter(s => s.category === categoryToDelete).length;
          const targets = categories.filter(c => c !== categoryToDelete);
          return (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => !deletingCategory && setCategoryToDelete(null)}
                className="absolute inset-0 bg-black/90 backdrop-blur-md"
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-md bg-[#0A0A0A] border border-white/10 rounded-[32px] p-8 shadow-2xl"
              >
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6 text-red-400">
                    <Trash2 size={28} />
                  </div>
                  <h3 className="text-xl font-display text-white mb-2">Excluir categoria?</h3>
                  <p className="text-white/40 text-sm mb-6">
                    <span className="text-gold font-bold">"{categoryToDelete}"</span>
                  </p>

                  {count === 0 ? (
                    <p className="text-white/50 text-xs leading-relaxed mb-8">
                      Nenhum fornecedor usa essa categoria. Pode excluir tranquilo.
                    </p>
                  ) : (
                    <div className="text-left">
                      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 mb-5">
                        <div className="flex items-start gap-3">
                          <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
                          <p className="text-amber-300/90 text-xs leading-relaxed">
                            <strong>{count} fornecedor(es)</strong> estão nessa categoria. Escolha o que fazer:
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 mb-6">
                        <button
                          type="button"
                          onClick={() => setCategoryDeleteAction('move')}
                          className={`w-full text-left p-4 rounded-2xl border transition-all ${
                            categoryDeleteAction === 'move'
                              ? 'bg-gold/10 border-gold/40'
                              : 'bg-white/5 border-white/10 hover:border-white/20'
                          }`}
                        >
                          <div className={`text-[10px] uppercase tracking-widest font-bold mb-2 ${categoryDeleteAction === 'move' ? 'text-gold' : 'text-white/60'}`}>
                            🔄 Mover para outra categoria
                          </div>
                          {categoryDeleteAction === 'move' && (
                            <select
                              value={categoryDeleteTarget}
                              onChange={e => setCategoryDeleteTarget(e.target.value)}
                              onClick={e => e.stopPropagation()}
                              className="w-full mt-2 bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-white text-xs outline-none focus:border-gold/50 appearance-none cursor-pointer"
                            >
                              {targets.length === 0 && <option value="">Sem outra categoria — escolha "órfão"</option>}
                              {targets.map(c => <option key={c} value={c} className="bg-[#121212]">{c}</option>)}
                            </select>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => setCategoryDeleteAction('orphan')}
                          className={`w-full text-left p-4 rounded-2xl border transition-all ${
                            categoryDeleteAction === 'orphan'
                              ? 'bg-red-500/10 border-red-500/40'
                              : 'bg-white/5 border-white/10 hover:border-white/20'
                          }`}
                        >
                          <div className={`text-[10px] uppercase tracking-widest font-bold mb-1 ${categoryDeleteAction === 'orphan' ? 'text-red-400' : 'text-white/60'}`}>
                            🗑️ Apagar a categoria mesmo assim
                          </div>
                          <div className="text-[10px] text-white/40 leading-relaxed">
                            Fornecedores ficam órfãos (mantém o texto, mas a categoria some do filtro)
                          </div>
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => setCategoryToDelete(null)}
                      disabled={deletingCategory}
                      className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all text-xs font-bold uppercase tracking-widest disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleConfirmDeleteCategory}
                      disabled={deletingCategory || (count > 0 && categoryDeleteAction === 'move' && !categoryDeleteTarget)}
                      className="flex-1 py-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white transition-all text-xs font-bold uppercase tracking-widest disabled:opacity-50"
                    >
                      {deletingCategory ? 'Excluindo...' : 'Confirmar Exclusão'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })()}
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
