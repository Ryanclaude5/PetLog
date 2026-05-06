import React, { useState } from 'react';
import { loginWithGoogle, loginWithEmail, registerWithEmail } from '../context/AuthContext';

export default function Login() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const errMsg = (e) => {
    const map = {
      'auth/user-not-found': '找不到此帳號',
      'auth/wrong-password': '密碼錯誤',
      'auth/email-already-in-use': '此電郵已被使用',
      'auth/weak-password': '密碼最少 6 個字元',
      'auth/invalid-email': '電郵格式不正確',
      'auth/popup-closed-by-user': '登入視窗已關閉，請重試',
    };
    return map[e.code] || e.message;
  };

  async function handleGoogle() {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (e) {
      setError(errMsg(e));
    }
    setLoading(false);
  }

  async function handleEmail(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await loginWithEmail(email, password);
      } else {
        await registerWithEmail(email, password);
      }
    } catch (e) {
      setError(errMsg(e));
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-24 -translate-y-24" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/10 rounded-full translate-x-24 translate-y-24" />

      <div className="relative bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-4 shadow-sm">
            🐾
          </div>
          <h1 className="text-2xl font-bold text-gray-900">PetLog</h1>
          <p className="text-sm text-gray-400 mt-1">寵物健康日誌</p>
        </div>

        {/* Google Login */}
        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 border-2 border-gray-100 rounded-2xl py-3 px-4 hover:bg-gray-50 hover:border-gray-200 transition-colors font-medium text-gray-700 text-sm mb-4"
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 2.9l6-6C34.5 6.5 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.4-7.7 19.4-20 0-1.3-.2-2.7-.4-4z"/>
            <path fill="#FF3D00" d="M6.3 14.7l7 5.1C15 16.1 19.2 13 24 13c3 0 5.8 1.1 7.9 2.9l6-6C34.5 6.5 29.5 4 24 4c-7.6 0-14.2 4.4-17.7 10.7z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 10-1.8 13.7-4.8l-6.3-5.2C29.5 35.6 26.9 36 24 36c-5.2 0-9.6-3-11.3-7.3l-6.9 5.3C9.6 39.5 16.4 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.9 2.5-2.6 4.6-4.9 6l6.3 5.2C40.9 35.6 44 30.3 44 24c0-1.3-.2-2.7-.4-4z"/>
          </svg>
          使用 Google 登入
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-xs text-gray-400">或用電郵</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        {/* Email/Password */}
        <form onSubmit={handleEmail} className="space-y-3">
          <input
            type="email" placeholder="電郵地址" value={email}
            onChange={e => setEmail(e.target.value)}
            className="input-field" required
          />
          <input
            type="password" placeholder="密碼（最少 6 位）" value={password}
            onChange={e => setPassword(e.target.value)}
            className="input-field" required minLength={6}
          />
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}
          <button
            type="submit" disabled={loading}
            className="btn-primary w-full py-3 disabled:opacity-50"
          >
            {loading ? '處理中...' : mode === 'login' ? '登入' : '建立帳號'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-5">
          {mode === 'login' ? '還沒有帳號？' : '已有帳號？'}
          <button
            onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setError(''); }}
            className="text-blue-500 font-semibold ml-1"
          >
            {mode === 'login' ? '立即註冊' : '返回登入'}
          </button>
        </p>
      </div>
    </div>
  );
}
