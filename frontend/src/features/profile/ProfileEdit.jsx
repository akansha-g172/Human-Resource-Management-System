import React, { useState } from 'react';
import { profileUpdateSchema } from '../../utils/validators';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';

export default function ProfileEdit({ profile, onSave, onCancel, loading }) {
  const { showToast } = useToast();
  
  const [formData, setFormData] = useState({
    phone: profile.phone || '',
    address: profile.address || '',
    photoUrl: profile.photoUrl || '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});

    const validation = profileUpdateSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors = {};
      validation.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message;
      });
      setErrors(fieldErrors);
      showToast("Validation failed. Please check fields.", "error");
      return;
    }

    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Phone */}
      <Input
        id="phone"
        name="phone"
        label="Phone Number"
        type="tel"
        placeholder="+1 (555) 000-0000"
        value={formData.phone}
        onChange={handleChange}
        error={errors.phone}
      />

      {/* Address */}
      <Input
        id="address"
        name="address"
        label="Home Address"
        type="text"
        placeholder="123 Main St, City, Country"
        value={formData.address}
        onChange={handleChange}
        error={errors.address}
      />

      {/* Photo URL */}
      <Input
        id="photoUrl"
        name="photoUrl"
        label="Profile Image URL"
        type="url"
        placeholder="https://example.com/photo.jpg"
        value={formData.photoUrl}
        onChange={handleChange}
        error={errors.photoUrl}
      />

      <div className="flex items-center gap-3 pt-2">
        <Button
          type="submit"
          loading={loading}
          variant="primary"
          className="text-xs font-semibold py-2 px-4"
        >
          Save Changes
        </Button>
        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
          disabled={loading}
          className="text-xs font-semibold py-2 px-4"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
