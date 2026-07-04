import React, { useEffect, useState } from 'react';
import useAuth from '../../hooks/useAuth';
import * as profileService from './profileService';
import * as adminService from '../admin/adminService';
import ProfileEdit from './ProfileEdit';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Building2, 
  DollarSign, 
  CalendarDays, 
  Edit2, 
  Lock,
  Camera
} from 'lucide-react';
import { formatToHumanDate } from '../../utils/dateHelpers';

export default function ProfileView() {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await profileService.getProfileMe(user.userId);
        setProfile(data);
      } catch (err) {
        showToast(err.response?.data?.error || "Failed to load profile.", "error");
      } finally {
        setLoading(false);
      }
    }
    if (user) {
      loadProfile();
    }
  }, [user, showToast]);

  const handleSaveProfile = async (formData) => {
    setSaveLoading(true);
    try {
      let updated;
      if (user.role === 'admin') {
        updated = await adminService.updateEmployee(user.userId, formData);
      } else {
        updated = await profileService.updateProfileMe(formData, user.userId);
      }
      setProfile(updated);
      setEditMode(false);
      showToast("Profile updated successfully!", "success");
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to save profile changes.", "error");
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Summary */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-sm">
        {/* Avatar/Photo */}
        <div className="relative group shrink-0">
          <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-2 border-primary-500 shadow-md bg-neutral-100 flex items-center justify-center">
            {profile.photoUrl ? (
              <img 
                src={profile.photoUrl} 
                alt={profile.name} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150";
                }}
              />
            ) : (
              <User className="w-12 h-12 text-neutral-400" />
            )}
          </div>
          <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs cursor-pointer transition-opacity duration-200 pointer-events-none">
            <Camera className="w-4 h-4 mr-1" />
            Update
          </div>
        </div>

        {/* User Brief */}
        <div className="text-center md:text-left flex-1 space-y-2">
          <div>
            <h1 className="text-lg md:text-xl font-black text-neutral-800">{profile.name}</h1>
            <p className="text-xs text-neutral-500 font-semibold">{profile.jobTitle || 'Employee'} • {profile.department || 'Staff'}</p>
          </div>
          
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider text-primary-700 bg-primary-50 border border-primary-100 uppercase">
            ID: {user.employeeId}
          </div>

          <p className="text-xs text-neutral-400">
            Joined on {formatToHumanDate(profile.dateJoined)}
          </p>
        </div>

        {/* Toggle Edit Button */}
        {!editMode && (
          <Button
            onClick={() => setEditMode(true)}
            variant="outline"
            className="text-xs font-bold py-1.5 px-3 self-center md:self-start shrink-0"
            icon={Edit2}
          >
            Edit Profile
          </Button>
        )}
      </div>

      {/* Grid: Details form / View panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Personal Details (Editable / Form) */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-neutral-800">
              {editMode ? 'Edit Personal Information' : 'Personal Information'}
            </CardTitle>
            <CardDescription>
              {editMode ? 'Update your reachable contacts' : 'General communication contacts'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {editMode ? (
              <ProfileEdit 
                profile={profile} 
                onSave={handleSaveProfile} 
                onCancel={() => setEditMode(false)}
                loading={saveLoading}
                isAdmin={user.role === 'admin'}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Phone view */}
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-neutral-50 text-neutral-500 border border-neutral-100">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Phone</span>
                    <span className="text-xs font-semibold text-neutral-700 mt-1 block">
                      {profile.phone || 'No phone added'}
                    </span>
                  </div>
                </div>

                {/* Address view */}
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-neutral-50 text-neutral-500 border border-neutral-100">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Address</span>
                    <span className="text-xs font-semibold text-neutral-700 mt-1 block leading-relaxed">
                      {profile.address || 'No address added'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Read-Only Employment Details */}
        <Card className="lg:col-span-1 border-neutral-200/80">
          <CardHeader className="bg-neutral-50/50">
            <CardTitle className="text-sm font-bold text-neutral-800 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-neutral-400" />
              Employment Details
            </CardTitle>
            <CardDescription>Locked administrative parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 pt-5">
            {/* Email */}
            <div className="flex items-center gap-3">
              <Mail className="w-4.5 h-4.5 text-neutral-400 shrink-0" />
              <div className="min-w-0">
                <span className="block text-[9px] font-bold text-neutral-400 uppercase">Email Address</span>
                <span className="text-xs font-semibold text-neutral-700 truncate block mt-0.5">{profile.email}</span>
              </div>
            </div>

            {/* Job Title */}
            <div className="flex items-center gap-3">
              <Briefcase className="w-4.5 h-4.5 text-neutral-400 shrink-0" />
              <div>
                <span className="block text-[9px] font-bold text-neutral-400 uppercase">Job Title</span>
                <span className="text-xs font-semibold text-neutral-700 block mt-0.5">{profile.jobTitle || '--'}</span>
              </div>
            </div>

            {/* Department */}
            <div className="flex items-center gap-3">
              <Building2 className="w-4.5 h-4.5 text-neutral-400 shrink-0" />
              <div>
                <span className="block text-[9px] font-bold text-neutral-400 uppercase">Department</span>
                <span className="text-xs font-semibold text-neutral-700 block mt-0.5">{profile.department || '--'}</span>
              </div>
            </div>

            {/* Salary */}
            <div className="flex items-center gap-3">
              <DollarSign className="w-4.5 h-4.5 text-neutral-400 shrink-0" />
              <div>
                <span className="block text-[9px] font-bold text-neutral-400 uppercase">Salary Rate (Annual)</span>
                <span className="text-xs font-semibold text-neutral-700 block mt-0.5">
                  {profile.salary ? `$${profile.salary.toLocaleString()}` : 'Negotiating'}
                </span>
              </div>
            </div>
          </CardContent>
          <div className="px-6 py-4 bg-amber-50/50 border-t border-neutral-100 text-center">
            <span className="text-[10px] text-amber-700 font-semibold leading-normal">
              🔒 Contact your HR Administrator to update employment fields.
            </span>
          </div>
        </Card>

      </div>
    </div>
  );
}
