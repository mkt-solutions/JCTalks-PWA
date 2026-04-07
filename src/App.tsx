/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageCircle, 
  User, 
  CreditCard, 
  LogOut, 
  Menu, 
  X, 
  Send, 
  Heart,
  Calendar,
  Globe,
  ChevronRight,
  Sparkles,
  Home,
  Mail,
  Share2
} from 'lucide-react';
import { 
  UserProfile, 
  Message, 
  STORAGE_KEYS, 
  calculateAge, 
  getTrialDaysRemaining,
  formatDate
} from './lib/types';
import { getJesusResponse } from './services/gemini';
import { BIBLE_VERSES, shareMessage } from './lib/constants';

export default function App() {
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [view, setView] = useState<'home' | 'chat' | 'profile' | 'upgrade'>('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [inputText, setInputText] = useState('');
  const [dailyVerse, setDailyVerse] = useState(BIBLE_VERSES[0]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const randomVerse = BIBLE_VERSES[Math.floor(Math.random() * BIBLE_VERSES.length)];
    setDailyVerse(randomVerse);
  }, [view]);

  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
    const savedChat = localStorage.getItem(STORAGE_KEYS.CHAT);
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      i18n.changeLanguage(parsedUser.language);
    }
    if (savedChat) setMessages(JSON.parse(savedChat));
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEYS.CHAT, JSON.stringify(messages));
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newUser: UserProfile = {
      name: formData.get('name') as string,
      birthdate: formData.get('birthdate') as string,
      gender: formData.get('gender') as string,
      language: formData.get('language') as string,
      createdAt: new Date().toISOString(),
      isPremium: false,
    };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
    setUser(newUser);
    i18n.changeLanguage(newUser.language);
  };

  const handleUpdateProfile = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    const formData = new FormData(e.currentTarget);
    const updatedUser: UserProfile = {
      ...user,
      name: formData.get('name') as string,
      birthdate: formData.get('birthdate') as string,
      gender: formData.get('gender') as string,
      language: formData.get('language') as string,
    };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
    setUser(updatedUser);
    i18n.changeLanguage(updatedUser.language);
    setIsEditingProfile(false);
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.CHAT);
    setUser(null);
    setMessages([]);
    setIsMenuOpen(false);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading || !user) return;

    // Check trial/premium
    const trialDays = getTrialDaysRemaining(user.createdAt);
    if (trialDays <= 0 && !user.isPremium) {
      setView('upgrade');
      return;
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const history = messages.concat(userMsg).map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      
      const responseText = await getJesusResponse(history, user.language);
      
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText || '...',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f5f2ed] flex items-center justify-center p-4 font-sans">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-12 rounded-[48px] shadow-xl max-w-md w-full border border-[#e5e1d8]"
        >
          <div className="flex flex-col items-center mb-10">
            <div className="w-20 h-20 bg-[#f5f2ed] rounded-full flex items-center justify-center mb-6">
              <Sparkles className="text-[#5A5A40] w-10 h-10" />
            </div>
            <h1 className="text-4xl font-serif font-bold text-[#1a1a1a]">JC Talks</h1>
            <p className="text-stone-400 text-center mt-3 font-serif italic text-lg">{t('login_title')}</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] mb-2 px-1">{t('name_label')}</label>
              <input 
                required 
                name="name"
                className="w-full px-6 py-4 rounded-2xl bg-[#f5f2ed] border border-[#e5e1d8] focus:ring-2 focus:ring-[#5A5A40] focus:border-transparent outline-none transition-all font-serif text-lg"
                placeholder="Ex: João"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] mb-2 px-1">{t('birthdate_label')}</label>
                <input 
                  required 
                  type="date" 
                  name="birthdate"
                  className="w-full px-6 py-4 rounded-2xl bg-[#f5f2ed] border border-[#e5e1d8] focus:ring-2 focus:ring-[#5A5A40] outline-none font-serif"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] mb-2 px-1">{t('gender_label')}</label>
                <select 
                  name="gender"
                  className="w-full px-6 py-4 rounded-2xl bg-[#f5f2ed] border border-[#e5e1d8] focus:ring-2 focus:ring-[#5A5A40] outline-none font-serif"
                >
                  <option value="male">{t('gender_male')}</option>
                  <option value="female">{t('gender_female')}</option>
                  <option value="other">{t('gender_other')}</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] mb-2 px-1">{t('language_label')}</label>
              <select 
                name="language"
                className="w-full px-6 py-4 rounded-2xl bg-[#f5f2ed] border border-[#e5e1d8] focus:ring-2 focus:ring-[#5A5A40] outline-none font-serif"
              >
                <option value="en">{t('lang_en')}</option>
                <option value="pt">{t('lang_pt')}</option>
                <option value="pt-BR">{t('lang_pt_br')}</option>
                <option value="es">{t('lang_es')}</option>
                <option value="it">{t('lang_it')}</option>
                <option value="fr">{t('lang_fr')}</option>
                <option value="de">{t('lang_de')}</option>
              </select>
            </div>
            <button 
              type="submit"
              className="w-full bg-[#5A5A40] text-white py-5 rounded-full font-bold text-lg hover:bg-[#4a4a35] transition-all shadow-lg shadow-[#5A5A40]/20 flex items-center justify-center gap-2"
            >
              {t('start_button')}
              <ChevronRight className="w-5 h-5" />
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  const trialDays = getTrialDaysRemaining(user.createdAt);

  return (
    <div className="min-h-screen bg-[#f5f2ed] flex flex-col font-sans text-[#1a1a1a]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-[#e5e1d8] px-6 py-4 flex items-center justify-between shadow-sm">
        <button 
          onClick={() => setIsMenuOpen(true)}
          className="p-2 hover:bg-[#f5f2ed] rounded-full transition-colors"
        >
          <Menu className="w-6 h-6 text-[#5A5A40]" />
        </button>
        <div className="flex items-center gap-2">
          <Sparkles className="text-[#5A5A40] w-5 h-5" />
          <span className="font-serif font-bold text-2xl tracking-tight">JC Talks</span>
        </div>
        <div className="w-10 h-10 bg-[#f5f2ed] rounded-full flex items-center justify-center text-[#5A5A40] font-serif font-bold">
          {user.name[0].toUpperCase()}
        </div>
      </header>

      {/* Sidebar Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-stone-900/20 backdrop-blur-sm z-50"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-white z-50 shadow-2xl flex flex-col border-r border-[#e5e1d8]"
            >
              <div className="p-8 flex items-center justify-between border-b border-[#e5e1d8]">
                <div className="flex items-center gap-2">
                  <Sparkles className="text-[#5A5A40] w-6 h-6" />
                  <span className="font-serif font-bold text-2xl">JC Talks</span>
                </div>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-[#f5f2ed] rounded-full">
                  <X className="w-6 h-6 text-stone-400" />
                </button>
              </div>

              <nav className="flex-1 p-4 space-y-2">
                <button 
                  onClick={() => { setView('home'); setIsMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all ${view === 'home' ? 'bg-[#f5f2ed] text-[#5A5A40] font-semibold' : 'hover:bg-stone-50 text-stone-600'}`}
                >
                  <Home className="w-5 h-5" />
                  {t('menu_home')}
                </button>
                <button 
                  onClick={() => { setView('chat'); setIsMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all ${view === 'chat' ? 'bg-[#f5f2ed] text-[#5A5A40] font-semibold' : 'hover:bg-stone-50 text-stone-600'}`}
                >
                  <MessageCircle className="w-5 h-5" />
                  {t('menu_chat')}
                </button>
                <button 
                  onClick={() => { setView('profile'); setIsMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all ${view === 'profile' ? 'bg-[#f5f2ed] text-[#5A5A40] font-semibold' : 'hover:bg-stone-50 text-stone-600'}`}
                >
                  <User className="w-5 h-5" />
                  {t('menu_profile')}
                </button>
                <button 
                  onClick={() => { setView('upgrade'); setIsMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all ${view === 'upgrade' ? 'bg-[#f5f2ed] text-[#5A5A40] font-semibold' : 'hover:bg-stone-50 text-stone-600'}`}
                >
                  <CreditCard className="w-5 h-5" />
                  {t('menu_upgrade')}
                </button>
              </nav>

              <div className="p-4 border-t border-[#e5e1d8]">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 p-4 rounded-2xl text-red-500 hover:bg-red-50 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  {t('menu_logout')}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {view === 'home' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center text-center space-y-12"
          >
            <div className="space-y-4">
              <h2 className="text-4xl font-serif text-[#1a1a1a]">{t('welcome')}, {user.name}</h2>
              <p className="text-stone-500 font-serif italic text-lg">
                "A paz esteja convosco"
              </p>
            </div>

            {/* Daily Message Box - Matching Image Exactly */}
            <div className="w-full max-w-3xl bg-white p-12 rounded-[48px] shadow-sm space-y-8 relative">
              <h3 className="text-xs font-bold text-[#b5b0a3] uppercase tracking-[0.2em]">{t('daily_message_title')}</h3>
              <div className="space-y-6">
                <p className="text-3xl font-serif italic text-[#1a1a1a] leading-relaxed px-4">
                  "{dailyVerse.text}"
                </p>
                <p className="text-sm font-bold text-[#b5b0a3] uppercase tracking-widest">— {dailyVerse.ref}</p>
              </div>
              
              <div className="flex flex-col items-center gap-6">
                <div className="w-14 h-14 bg-[#f5f2ed] rounded-full flex items-center justify-center text-[#1a1a1a] hover:scale-110 transition-transform cursor-pointer">
                  <Heart className="w-6 h-6" />
                </div>
                
                <div className="flex items-center justify-center gap-3">
                  <button 
                    onClick={() => shareMessage(`"${dailyVerse.text}" - ${dailyVerse.ref}`, 'whatsapp')}
                    className="flex items-center gap-2 px-6 py-3 bg-[#e8fbf2] text-[#25d366] rounded-full font-medium text-sm hover:opacity-80 transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </button>
                  <button 
                    onClick={() => shareMessage(`"${dailyVerse.text}" - ${dailyVerse.ref}`, 'telegram')}
                    className="flex items-center gap-2 px-6 py-3 bg-[#e8f4fb] text-[#0088cc] rounded-full font-medium text-sm hover:opacity-80 transition-all"
                  >
                    <Send className="w-4 h-4" />
                    Telegram
                  </button>
                </div>
              </div>
            </div>

            {/* Large Chat Button - Matching Image Exactly */}
            <button 
              onClick={() => setView('chat')}
              className="w-full max-w-3xl bg-[#5A5A40] p-8 rounded-[48px] flex items-center justify-between group hover:bg-[#4a4a35] transition-all shadow-xl shadow-[#5A5A40]/10"
            >
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center text-white">
                  <MessageCircle className="w-8 h-8" />
                </div>
                <div className="text-left">
                  <h3 className="text-2xl font-serif text-white">{t('menu_chat')}</h3>
                  <p className="text-white/60 text-sm italic">Abra seu coração para Jesus</p>
                </div>
              </div>
              <ChevronRight className="text-white/40 w-8 h-8 group-hover:translate-x-2 transition-transform" />
            </button>

            {trialDays > 0 && !user.isPremium && (
              <div className="w-full max-w-3xl p-8 bg-[#b5b0a3]/10 rounded-[48px] text-[#5A5A40] flex items-center justify-between">
                <div className="flex items-center gap-4 font-serif italic text-lg">
                  <Sparkles className="w-6 h-6" />
                  {t('trial_remaining', { days: trialDays })}
                </div>
                <button 
                  onClick={() => setView('upgrade')}
                  className="bg-[#5A5A40] text-white px-8 py-3 rounded-full font-bold hover:bg-[#4a4a35] transition-colors"
                >
                  {t('upgrade_now')}
                </button>
              </div>
            )}
          </motion.div>
        )}

        {view === 'chat' && (
          <>
            {/* Trial Banner */}
            {trialDays > 0 && !user.isPremium && (
              <div className="bg-[#5A5A40] text-white px-4 py-2 text-center text-sm font-medium flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" />
                {t('trial_remaining', { days: trialDays })}
                <button onClick={() => setView('upgrade')} className="underline ml-2 font-bold">
                  {t('upgrade_now')}
                </button>
              </div>
            )}

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-[#f5f2ed]/30 scroll-smooth">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-6">
                  <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center">
                    <Heart className="text-[#5A5A40] w-10 h-10" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-3xl font-serif font-bold text-[#1a1a1a]">Olá, {user.name}</h2>
                    <p className="text-stone-400 font-serif italic text-lg max-w-xs">
                      Estou aqui para conversar, ouvir e caminhar ao seu lado. O que está em seu coração hoje?
                    </p>
                  </div>
                </div>
              )}
              {messages.map((msg) => (
                <motion.div 
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-6 rounded-[32px] shadow-sm relative group ${
                    msg.role === 'user' 
                      ? 'bg-[#5A5A40] text-white rounded-tr-none' 
                      : 'bg-white text-[#1a1a1a] rounded-tl-none border border-[#e5e1d8]'
                  }`}>
                    <p className={`leading-relaxed whitespace-pre-wrap ${msg.role === 'model' ? 'font-serif italic text-xl' : 'text-lg'}`}>{msg.text}</p>
                    
                    {msg.role === 'model' && (
                      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-stone-50 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => shareMessage(msg.text, 'whatsapp')}
                          className="flex items-center gap-2 px-4 py-2 bg-[#e8fbf2] text-[#25d366] rounded-full text-xs font-bold hover:opacity-80 transition-all"
                        >
                          <MessageCircle className="w-4 h-4" />
                          WhatsApp
                        </button>
                        <button 
                          onClick={() => shareMessage(msg.text, 'telegram')}
                          className="flex items-center gap-2 px-4 py-2 bg-[#e8f4fb] text-[#0088cc] rounded-full text-xs font-bold hover:opacity-80 transition-all"
                        >
                          <Send className="w-4 h-4" />
                          Telegram
                        </button>
                      </div>
                    )}

                    <span className={`text-[10px] mt-3 block opacity-30 uppercase tracking-[0.2em] font-bold ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white p-6 rounded-[32px] rounded-tl-none border border-[#e5e1d8] flex gap-2">
                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2.5 h-2.5 bg-[#5A5A40]/20 rounded-full" />
                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2.5 h-2.5 bg-[#5A5A40]/40 rounded-full" />
                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2.5 h-2.5 bg-[#5A5A40]/60 rounded-full" />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white border-t border-[#e5e1d8]">
              <form onSubmit={sendMessage} className="flex gap-3 max-w-4xl mx-auto">
                <input 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={t('chat_placeholder')}
                  className="flex-1 px-8 py-5 rounded-full bg-[#f5f2ed] border border-[#e5e1d8] focus:ring-2 focus:ring-[#5A5A40] outline-none transition-all font-serif italic text-lg"
                />
                <button 
                  disabled={isLoading || !inputText.trim()}
                  className="bg-[#5A5A40] text-white p-5 rounded-full hover:bg-[#4a4a35] disabled:opacity-50 transition-all shadow-xl shadow-[#5A5A40]/20"
                >
                  <Send className="w-6 h-6" />
                </button>
              </form>
            </div>
          </>
        )}

        {view === 'profile' && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-6 max-w-2xl mx-auto w-full space-y-8"
          >
            {!isEditingProfile ? (
              <>
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 bg-[#f5f2ed] rounded-full flex items-center justify-center text-[#5A5A40] text-3xl font-serif font-bold mb-4">
                    {user.name[0].toUpperCase()}
                  </div>
                  <h2 className="text-3xl font-serif font-bold">{user.name}</h2>
                  <p className="text-stone-400 font-serif italic">{calculateAge(user.birthdate)} {t('age_suffix')}</p>
                </div>

                <div className="grid gap-4">
                  <div className="bg-white p-6 rounded-[32px] border border-[#e5e1d8] flex items-center gap-4">
                    <div className="p-3 bg-[#f5f2ed] rounded-2xl">
                      <Calendar className="text-[#5A5A40] w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-stone-400 uppercase font-bold tracking-[0.2em]">{t('birthdate_label')}</p>
                      <p className="font-serif text-lg">{formatDate(user.birthdate)}</p>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-[32px] border border-[#e5e1d8] flex items-center gap-4">
                    <div className="p-3 bg-[#f5f2ed] rounded-2xl">
                      <Globe className="text-[#5A5A40] w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-stone-400 uppercase font-bold tracking-[0.2em]">{t('language_label')}</p>
                      <p className="font-serif text-lg">{t(`lang_${user.language.replace('-', '_').toLowerCase()}`)}</p>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-[32px] border border-[#e5e1d8] flex items-center gap-4">
                    <div className="p-3 bg-[#f5f2ed] rounded-2xl">
                      <Heart className="text-[#5A5A40] w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-stone-400 uppercase font-bold tracking-[0.2em]">{t('gender_label')}</p>
                      <p className="font-serif text-lg">{t(`gender_${user.gender}`)}</p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setIsEditingProfile(true)}
                  className="w-full bg-[#5A5A40] text-white py-5 rounded-full font-bold hover:bg-[#4a4a35] transition-all shadow-lg shadow-[#5A5A40]/10"
                >
                  {t('edit_profile')}
                </button>
              </>
            ) : (
              <form onSubmit={handleUpdateProfile} className="space-y-6 bg-white p-10 rounded-[48px] border border-[#e5e1d8] shadow-sm">
                <h2 className="text-3xl font-serif font-bold text-center mb-8">{t('edit_profile')}</h2>
                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2 px-1">{t('name_label')}</label>
                  <input 
                    required 
                    name="name"
                    defaultValue={user.name}
                    className="w-full px-6 py-4 rounded-2xl bg-[#f5f2ed] border border-[#e5e1d8] focus:ring-2 focus:ring-[#5A5A40] outline-none font-serif text-lg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2 px-1">{t('birthdate_label')}</label>
                    <input 
                      required 
                      type="date" 
                      name="birthdate"
                      defaultValue={user.birthdate}
                      className="w-full px-6 py-4 rounded-2xl bg-[#f5f2ed] border border-[#e5e1d8] focus:ring-2 focus:ring-[#5A5A40] outline-none font-serif"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2 px-1">{t('gender_label')}</label>
                    <select 
                      name="gender"
                      defaultValue={user.gender}
                      className="w-full px-6 py-4 rounded-2xl bg-[#f5f2ed] border border-[#e5e1d8] focus:ring-2 focus:ring-[#5A5A40] outline-none font-serif"
                    >
                      <option value="male">{t('gender_male')}</option>
                      <option value="female">{t('gender_female')}</option>
                      <option value="other">{t('gender_other')}</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2 px-1">{t('language_label')}</label>
                  <select 
                    name="language"
                    defaultValue={user.language}
                    className="w-full px-6 py-4 rounded-2xl bg-[#f5f2ed] border border-[#e5e1d8] focus:ring-2 focus:ring-[#5A5A40] outline-none font-serif"
                  >
                    <option value="en">{t('lang_en')}</option>
                    <option value="pt">{t('lang_pt')}</option>
                    <option value="pt-BR">{t('lang_pt_br')}</option>
                    <option value="es">{t('lang_es')}</option>
                    <option value="it">{t('lang_it')}</option>
                    <option value="fr">{t('lang_fr')}</option>
                    <option value="de">{t('lang_de')}</option>
                  </select>
                </div>
                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="flex-1 bg-stone-100 text-stone-600 py-5 rounded-full font-bold hover:bg-stone-200 transition-all"
                  >
                    {t('cancel')}
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-[#5A5A40] text-white py-5 rounded-full font-bold hover:bg-[#4a4a35] transition-all shadow-lg shadow-[#5A5A40]/20"
                  >
                    {t('save_changes')}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        )}

        {view === 'upgrade' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 max-w-4xl mx-auto w-full flex flex-col items-center justify-center h-full text-center space-y-12"
          >
            <div className="space-y-4">
              <div className="w-24 h-24 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto">
                <Sparkles className="text-[#5A5A40] w-12 h-12" />
              </div>
              <h2 className="text-4xl font-serif font-bold text-[#1a1a1a]">{t('subscription_title')}</h2>
              <p className="text-stone-400 font-serif italic text-lg">{t('subscription_desc')}</p>
            </div>
            
            <div className="bg-white p-12 rounded-[48px] border border-[#e5e1d8] w-full max-w-xl shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#5A5A40] text-white px-6 py-2 rounded-bl-3xl text-xs font-bold uppercase tracking-widest">
                Best Value
              </div>
              <p className="text-stone-400 text-xs font-bold uppercase tracking-[0.2em] mb-4">Annual Plan</p>
              <p className="text-5xl font-serif font-bold text-[#1a1a1a] mb-8">{t('subscription_price')}</p>
              
              <ul className="text-left space-y-6 mb-12">
                {[
                  "Unlimited Daily Wisdom",
                  "Priority Response Time",
                  "Spiritual Journey Tracking"
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-4 text-stone-600">
                    <div className="w-6 h-6 bg-[#f5f2ed] rounded-full flex items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5 text-[#5A5A40]" />
                    </div>
                    <span className="font-medium">{feature}</span>
                  </li>
                ))}
              </ul>

              <button 
                onClick={() => {
                  const updatedUser = { ...user, isPremium: true };
                  setUser(updatedUser);
                  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
                  setView('chat');
                }}
                className="w-full bg-[#5A5A40] text-white py-6 rounded-full font-bold text-xl hover:bg-[#4a4a35] transition-all shadow-xl shadow-[#5A5A40]/20"
              >
                {t('subscribe_button')}
              </button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
