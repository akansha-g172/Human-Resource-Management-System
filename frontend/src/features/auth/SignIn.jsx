import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { signInSchema } from '../../utils/validators';
import useAuth from '../../hooks/useAuth';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { useToast } from '../../components/ui/Toast';
import { KeyRound, Sparkles, UserCheck } from 'lucide-react';

export default function SignIn() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const validation = signInSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors = {};
      validation.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message;
      });
      setErrors(fieldErrors);
      setLoading(false);
      showToast("Please enter both identifier and password.", "error");
      return;
    }

    const result = await login(formData.identifier, formData.password);
    setLoading(false);

    if (result.success) {
      showToast(`Welcome back, ${formData.identifier}!`, "success");
      if (result.role === 'admin') {
        navigate('/admin/employees', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } else {
      showToast(result.error, "error");
    }
  };

  // Helper function to fill demo credentials
  const fillCredentials = (role) => {
    if (role === 'admin') {
      setFormData({
        identifier: 'admin@demo.com',
        password: 'password123!',
      });
    } else {
      setFormData({
        identifier: 'ODJD260704007',
        password: 'password123!',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-neutral-900">
      <Card className="w-full max-w-md animate-fade-in glass-dark-card border-none text-white shadow-2xl">
        <CardHeader className="text-center border-b border-white/5 pb-5">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="bg-primary-600 p-1 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-lg tracking-wider text-white">
              HR<span className="text-primary-400">Flow</span>
            </span>
          </div>
          <CardTitle className="text-lg font-bold text-white">Sign in to your portal</CardTitle>
          <CardDescription className="text-neutral-400">
            Enter your credentials or use the demo presets below
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Employee ID or Email */}
            <Input
              id="identifier"
              name="identifier"
              label="Employee ID or Email"
              type="text"
              placeholder="e.g. ODJD260704007 or name@demo.com"
              value={formData.identifier}
              onChange={handleChange}
              error={errors.identifier}
              required
              className="text-white placeholder-neutral-500 [&>input]:bg-neutral-950/60 [&>input]:border-white/10 [&>input]:text-white [&>input]:placeholder-neutral-500 [&>label]:text-neutral-300 [&>input]:focus:border-primary-500 [&>input]:focus:ring-primary-500"
            />

            {/* Password */}
            <Input
              id="password"
              name="password"
              label="Password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              required
              className="text-white placeholder-neutral-500 [&>input]:bg-neutral-950/60 [&>input]:border-white/10 [&>input]:text-white [&>input]:placeholder-neutral-500 [&>label]:text-neutral-300 [&>input]:focus:border-primary-500 [&>input]:focus:ring-primary-500"
            />

            <Button
              type="submit"
              loading={loading}
              className="w-full font-bold py-2.5 mt-2"
              size="lg"
            >
              Sign In
            </Button>
          </form>

          {/* Demo Presets Helper */}
          <div className="border-t border-white/5 pt-4">
            <span className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase block text-center mb-2">
              Demo Credentials (Click to Autofill)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillCredentials('employee')}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold text-neutral-200 transition-all hover:border-primary-500/50"
              >
                <UserCheck className="w-3.5 h-3.5 text-primary-400" />
                Employee Demo
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('admin')}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold text-neutral-200 transition-all hover:border-primary-500/50"
              >
                <KeyRound className="w-3.5 h-3.5 text-primary-400" />
                Admin Demo
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-neutral-400">
            Don't have an account?{' '}
            <Link to="/signup" className="font-bold text-primary-400 hover:text-primary-300 transition-colors">
              Sign Up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
