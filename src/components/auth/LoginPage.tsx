import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useHostel } from '../../context/HostelContext';
import { UserRole } from '../../types';
import {
  Lock,
  Mail,
  User,
  Phone,
  Building,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, signup } = useAuth();
  const { allHostels, db, addToast } = useHostel();

  const isFirstRun = db.users.length === 0;
  const [activeMode, setActiveMode] = useState<'LOGIN' | 'SIGNUP'>(isFirstRun ? 'SIGNUP' : 'LOGIN');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Login form state (Empty by default)
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Signup form state (Empty by default)
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupRole, setSignupRole] = useState<UserRole>('HOSTEL_ADMIN');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [hostelName, setHostelName] = useState('');
  const [hostelAddress, setHostelAddress] = useState('');
  const [hostelCity, setHostelCity] = useState('');
  const [hostelCurrency, setHostelCurrency] = useState('৳');
  const [selectedHostelId, setSelectedHostelId] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!loginEmail.trim() || !loginPassword) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await login(loginEmail, loginPassword);
      if (!res.success) {
        setErrorMessage(res.message);
      } else {
        addToast({ type: 'success', title: 'Login Successful', message: 'Welcome to HostelSphere Pro' });
      }
    } catch (err: any) {
      setErrorMessage('An unexpected error occurred during login.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!signupName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!signupEmail.trim() || !signupEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (signupPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }
    if (signupPassword !== signupConfirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (signupRole === 'HOSTEL_ADMIN' && !hostelName.trim() && allHostels.length === 0) {
      setErrorMessage('Please provide a name for your hostel property.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await signup({
        name: signupName,
        email: signupEmail,
        passwordPlain: signupPassword,
        phone: signupPhone,
        role: signupRole,
        hostelName: hostelName.trim() || undefined,
        hostelAddress: hostelAddress.trim() || undefined,
        hostelCity: hostelCity.trim() || undefined,
        currency: hostelCurrency,
        existingHostelId: selectedHostelId || (allHostels[0]?.id || undefined)
      });

      if (!res.success) {
        setErrorMessage(res.message);
      } else {
        addToast({ type: 'success', title: 'Account Created', message: 'Your account is ready. Welcome!' });
      }
    } catch (err: any) {
      setErrorMessage('Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Left Visual Banner Column */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-900 text-white flex-col justify-between p-12">
        <div className="absolute inset-0 z-0">
          <img
            src="/src/assets/images/hostel_residence_building_1792048795073.jpg"
            alt="HostelSphere Living"
            className="w-full h-full object-cover opacity-35 brightness-75 scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
        </div>

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white text-slate-900 flex items-center justify-center font-bold text-base shadow-sm">
            HP
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-white block">Hostel Management</span>
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest">Enterprise Residence PMS</span>
          </div>
        </div>

        {/* Narrative */}
        <div className="relative z-10 space-y-4 max-w-lg">
          <h1 className="text-3xl font-bold tracking-tight text-white leading-tight">
            Centralized property intelligence for residential dormitories & hostels.
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Manage buildings, rooms, beds, resident scholars, rent invoices, mess dining, complaints, and security clearances from one unified interface.
          </p>

          <div className="pt-4 flex items-center gap-6 text-xs text-slate-400 font-mono">
            <div>
              <span className="text-white font-bold block text-base">Real-Life</span>
              <span>Hostel Operations</span>
            </div>
            <div className="h-6 w-px bg-slate-700" />
            <div>
              <span className="text-white font-bold block text-base">Secure</span>
              <span>Role-Based Access</span>
            </div>
            <div className="h-6 w-px bg-slate-700" />
            <div>
              <span className="text-white font-bold block text-base">Zero Slop</span>
              <span>Clean Architecture</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Column */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile Brand Mark */}
          <div className="flex items-center gap-2 lg:hidden mb-2">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center font-bold text-xs">
              HP
            </div>
            <span className="font-bold text-slate-900 dark:text-white">Hostel Management</span>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex p-1 bg-slate-200/80 dark:bg-slate-900 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setActiveMode('LOGIN');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 rounded-lg transition-all ${
                activeMode === 'LOGIN'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Sign In 
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveMode('SIGNUP');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 rounded-lg transition-all ${
                activeMode === 'SIGNUP'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Heading */}
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {activeMode === 'LOGIN' ? 'Sign in to your account' : 'Create a new account'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {activeMode === 'LOGIN'
                ? 'Enter your registered email and password to access your dashboard.'
                : 'Set up your administrator profile or student account to get started.'}
            </p>
          </div>

          {/* Clean Setup First-Run Notification */}
          {isFirstRun && (
            <div className="p-3.5 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900/60 rounded-xl text-xs text-sky-800 dark:text-sky-300 space-y-1">
              <div className="flex items-center gap-2 font-bold text-sky-900 dark:text-sky-200">
                <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0" />
                <span>Clean System</span>
              </div>
              {/* <p className="text-[11px] leading-relaxed">
                অ্যাপে কোনো ডামি ডাটা রাখা হয়নি। অনুগ্রহ করে নিচের ফর্ম পূরণ করে সাইন আপ (Create Account) করুন এবং আপনার হোস্টেল ও রিয়েল অ্যাকাউন্ট সেটআপ করুন।
              </p> */}
            </div>
          )}

          {/* Notice if attempting to login on empty db */}
          {activeMode === 'LOGIN' && isFirstRun && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-xl text-xs text-amber-800 dark:text-amber-300">
              <p className="font-semibold">There is no portal yet.</p>
              <p className="text-[11px] mt-0.5">
               Before logging in, please create an account by clicking the 'Create Account (Sign Up)' tab above.
              </p>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl flex items-center gap-2.5 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {activeMode === 'LOGIN' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@hostel.com"
                    className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-9 pr-10 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Remember active session</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 font-bold text-xs text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:opacity-90 transition-opacity shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? 'Signing In...' : 'Sign In to Portal'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="text-center pt-2">
                <p className="text-slate-500 text-xs">
                  Don't have an account yet?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveMode('SIGNUP');
                      setErrorMessage('');
                    }}
                    className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                  >
                    Create Account
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* SIGNUP FORM */}
          {activeMode === 'SIGNUP' && (
            <form onSubmit={handleSignupSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Full Legal Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="e.g. Meheraz Hosen"
                    className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="you@domain.com"
                      className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      value={signupPhone}
                      onChange={(e) => setSignupPhone(e.target.value)}
                      placeholder="+880 1..."
                      className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Select User Role *
                </label>
                <select
                  value={signupRole}
                  onChange={(e) => setSignupRole(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-hidden font-medium"
                >
                  <option value="HOSTEL_ADMIN">Hostel Administrator (Full property management)</option>
                  <option value="SUPER_ADMIN">Super Administrator</option>
                  <option value="MANAGER">Manager (Daily operations)</option>
                  <option value="WARDEN">Head Warden (Attendance & leaves)</option>
                  <option value="ACCOUNTANT">Accountant (Billing & expenses)</option>
                  <option value="STAFF">Maintenance Staff (Workorders)</option>
                  <option value="RESIDENT">Resident Student (Student portal access)</option>
                </select>
              </div>

              {/* If Hostel Admin or no hostel exists, allow naming their hostel */}
              {(signupRole === 'HOSTEL_ADMIN' || signupRole === 'SUPER_ADMIN' || allHostels.length === 0) && (
                <div className="p-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block">
                    Hostel Property Registration
                  </span>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                      Hostel / Residence Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Green Valley Residence"
                      value={hostelName}
                      onChange={(e) => setHostelName(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                        Campus Address
                      </label>
                      <input
                        type="text"
                        placeholder="Road / Area"
                        value={hostelAddress}
                        onChange={(e) => setHostelAddress(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        placeholder="City"
                        value={hostelCity}
                        onChange={(e) => setHostelCity(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                      Billing Currency (মুদ্রা)
                    </label>
                    <select
                      value={hostelCurrency}
                      onChange={(e) => setHostelCurrency(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden font-medium"
                    >
                      <option value="৳">৳ BDT (Taka)</option>
                      <option value="$">$ USD (US Dollar)</option>
                      <option value="€">€ EUR (Euro)</option>
                      <option value="£">£ GBP (British Pound)</option>
                      <option value="₹">₹ INR (Indian Rupee)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* If existing hostels exist and role is student/staff, pick hostel */}
              {allHostels.length > 0 && signupRole !== 'HOSTEL_ADMIN' && signupRole !== 'SUPER_ADMIN' && (
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Select Assigned Hostel
                  </label>
                  <select
                    value={selectedHostelId}
                    onChange={(e) => setSelectedHostelId(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
                  >
                    {allHostels.map(h => (
                      <option key={h.id} value={h.id}>
                        {h.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Password (min 6 chars) *
                  </label>
                  <input
                    type="password"
                    required
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 font-bold text-xs text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:opacity-90 transition-opacity shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? 'Creating Account...' : 'Complete Sign Up & Enter'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="text-center pt-2">
                <p className="text-slate-500 text-xs">
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveMode('LOGIN');
                      setErrorMessage('');
                    }}
                    className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                  >
                    Sign In instead
                  </button>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
