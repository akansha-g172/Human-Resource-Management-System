import React, { useState } from 'react';
import { z } from 'zod';
import { profileUpdateSchema } from '../../utils/validators';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';

// Combined schema for admin self-editing
const adminSelfEditSchema = z.object({
  phone: z.string().trim().nullable().or(z.string().trim().min(0)),
  address: z.string().trim().nullable().or(z.string().trim().min(0)),
  photoUrl: z.string().trim().url({ message: "Must be a valid image URL" }).or(z.string().length(0)).nullable(),
  jobTitle: z.string().trim().min(1, { message: "Job title is required" }),
  department: z.string().trim().min(1, { message: "Department is required" }),
  salary: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? null : Number(val)),
    z.number({ invalid_type_error: "Salary must be a number" })
     .nonnegative({ message: "Salary must be non-negative" })
     .nullable()
  )
});

export default function ProfileEdit({ profile, onSave, onCancel, loading, isAdmin }) {
  const { showToast } = useToast();
  
  const [formData, setFormData] = useState({
    phone: profile.phone || '',
    address: profile.address || '',
    photoUrl: profile.photoUrl || '',
    jobTitle: profile.jobTitle || '',
    department: profile.department || '',
    salary: profile.salary !== null && profile.salary !== undefined ? String(profile.salary) : '',
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

    const schema = isAdmin ? adminSelfEditSchema : profileUpdateSchema;
    const validation = schema.safeParse(formData);
    
    if (!validation.success) {
      const fieldErrors = {};
      validation.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message;
      });
      setErrors(fieldErrors);
      showToast("Validation failed. Please check fields.", "error");
      return;
    }

    onSave(validation.data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Admin specific fields */}
      {isAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="jobTitle"
            name="jobTitle"
            label="Job Title"
            type="text"
            placeholder="e.g. Lead HR Manager"
            value={formData.jobTitle}
            onChange={handleChange}
            error={errors.jobTitle}
            required
          />
          <Input
            id="department"
            name="department"
            label="Department"
            type="text"
            placeholder="e.g. Human Resources"
            value={formData.department}
            onChange={handleChange}
            error={errors.department}
            required
          />
        </div>
      )}

      {/* Salary for Admin */}
      {isAdmin && (
        <Input
          id="salary"
          name="salary"
          label="Salary Rate"
          type="number"
          step="0.01"
          placeholder="e.g. 120000"
          value={formData.salary}
          onChange={handleChange}
          error={errors.salary}
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
      </div>

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
