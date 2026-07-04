import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { signUpSchema } from '../../utils/validators';
import useAuth from '../../hooks/useAuth';
import Input from '../../components/ui/Input';
import EmailInput from '../../components/ui/EmailInput';
import PasswordInput from '../../components/ui/PasswordInput';
import Button from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { useToast } from '../../components/ui/Toast';
import { Copy, Check, Sparkles, KeyRound } from 'lucide-react';

export default function SignUp() {
  const { signUp } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'employee',
    startDate: new Date().toISOString().substring(0, 10),
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [createdUser, setCreatedUser] = useState(null); // stores { id, employeeId, name, email }
  const [copied, setCopied] = useState(false);

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

    const validation = signUpSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors = {};
      validation.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message;
      });
      setErrors(fieldErrors);
      setLoading(false);
      showToast("Please correct the validation errors in the form.", "error");
      return;
    }

    const response = await signUp(formData);
    setLoading(false);

    if (response.success) {
      setCreatedUser(response.data);
      showToast("Registration successful! Save your Employee ID.", "success");
    } else {
      showToast(response.error, "error");
    }
  };

  const handleCopyId = () => {
    if (!createdUser) return;
    navigator.clipboard.writeText(createdUser.employeeId);
    setCopied(true);
    showToast("Employee ID copied to clipboard!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  if (createdUser) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-neutral-900">
        <Card className="w-full max-w-md animate-fade-in glass-dark-card border-none text-white shadow-2xl">
          <CardHeader className="text-center border-b border-white/5 pb-6">
            <div className="w-12 h-12 bg-primary-600/20 border border-primary-500/30 text-primary-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <CardTitle className="text-xl font-extrabold text-white">Registration Complete!</CardTitle>
            <CardDescription className="text-neutral-400 mt-2">
              Your account has been created successfully.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6 pt-6">
            <div className="bg-neutral-950/60 border border-white/10 rounded-xl p-5 text-center">
              <span className="text-xs text-neutral-400 font-semibold tracking-wider uppercase block">
                Your Employee Login ID
              </span>
              <div className="flex items-center justify-center gap-3 mt-3">
                <span className="text-2xl font-black text-glow tracking-widest text-primary-400 select-all">
                  {createdUser.employeeId}
                </span>
                <button
                  onClick={handleCopyId}
                  className="p-2 rounded-lg bg-neutral-900 border border-white/10 hover:bg-neutral-800 hover:text-primary-400 transition-all active:scale-95"
                  title="Copy Employee ID"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <div className="text-xs text-neutral-400 leading-relaxed space-y-2 bg-neutral-950/20 p-4 border border-white/5 rounded-lg">
              <p className="font-semibold text-neutral-300">🔑 Log In Notes:</p>
              <p>1. Copy the Employee ID above.</p>
              <p>2. Go to the Sign In page and enter this ID or your registered email as the identifier.</p>
              <p>3. Enter the password you just registered.</p>
            </div>
            
            <Link to="/signin" className="block">
              <Button className="w-full font-bold py-2.5" size="lg">
                Proceed to Sign In
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

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
          <CardTitle className="text-lg font-bold text-white">Create your account</CardTitle>
          <CardDescription className="text-neutral-400">
            Sign up to join your organization's portal
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <Input
              id="name"
              name="name"
              label="Full Name"
              type="text"
              placeholder="e.g. John Doe"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              required
              className="text-white placeholder-neutral-500 [&>input]:bg-neutral-950/60 [&>input]:border-white/10 [&>input]:text-white [&>input]:placeholder-neutral-500 [&>label]:text-neutral-300 [&>input]:focus:border-primary-500 [&>input]:focus:ring-primary-500"
            />

            {/* Email Address */}
            <EmailInput
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              required
              className="text-white placeholder-neutral-500 [&>input]:bg-neutral-950/60 [&>input]:border-white/10 [&>input]:text-white [&>input]:placeholder-neutral-500 [&>label]:text-neutral-300 [&>input]:focus:border-primary-500 [&>input]:focus:ring-primary-500"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input type="hidden" name="role" value="employee" />

              {/* Start Date */}
              <Input
                id="startDate"
                name="startDate"
                label="Start Date"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                error={errors.startDate}
                required
                className="text-white [&>input]:bg-neutral-950/60 [&>input]:border-white/10 [&>input]:text-white [&>label]:text-neutral-300 [&>input]:focus:border-primary-500 [&>input]:focus:ring-primary-500"
              />
            </div>

            {/* Password */}
            <PasswordInput
              id="password"
              name="password"
              label="Password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              required
              className="text-white placeholder-neutral-500 [&>input]:bg-neutral-950/60 [&>input]:border-white/10 [&>input]:text-white [&>input]:placeholder-neutral-500 [&>label]:text-neutral-300 [&>input]:focus:border-primary-500 [&>input]:focus:ring-primary-500"
            />

            {/* Confirm Password */}
            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              label="Confirm Password"
              placeholder="Repeat your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              required
              showCriteria={false}
              className="text-white placeholder-neutral-500 [&>input]:bg-neutral-950/60 [&>input]:border-white/10 [&>input]:text-white [&>input]:placeholder-neutral-500 [&>label]:text-neutral-300 [&>input]:focus:border-primary-500 [&>input]:focus:ring-primary-500"
            />

            <Button
              type="submit"
              loading={loading}
              className="w-full font-bold py-2.5 mt-2"
              size="lg"
            >
              Register Account
            </Button>
          </form>

          <div className="mt-5 text-center text-xs text-neutral-400">
            Already have an account?{' '}
            <Link to="/signin" className="font-bold text-primary-400 hover:text-primary-300 transition-colors">
              Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
