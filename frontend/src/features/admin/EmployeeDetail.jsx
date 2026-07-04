import React, { useState, useEffect } from 'react';
import { adminEmployeeUpdateSchema } from '../../utils/validators';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';

export default function EmployeeDetail({ employee, onSave, onCancel, loading }) {
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    jobTitle: employee.jobTitle || '',
    department: employee.department || '',
    phone: employee.phone || '',
    address: employee.address || '',
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

    const validation = adminEmployeeUpdateSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors = {};
      validation.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message;
      });
      setErrors(fieldErrors);
      showToast("Validation failed. Please correct form fields.", "error");
      return;
    }

    // Call save handler
    onSave(validation.data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-xs text-neutral-400 bg-neutral-50 p-3 rounded-lg border border-neutral-100 mb-2">
        <p className="font-semibold text-neutral-600">Editing Employee Profile:</p>
        <p className="mt-0.5 font-bold text-neutral-800">{employee.name} ({employee.employeeId})</p>
        <p className="text-[10px]">{employee.email}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Job Title */}
        <Input
          id="jobTitle"
          name="jobTitle"
          label="Job Title"
          type="text"
          placeholder="e.g. Lead Developer"
          value={formData.jobTitle}
          onChange={handleChange}
          error={errors.jobTitle}
          required
        />

        {/* Department */}
        <Input
          id="department"
          name="department"
          label="Department"
          type="text"
          placeholder="e.g. Engineering"
          value={formData.department}
          onChange={handleChange}
          error={errors.department}
          required
        />
      </div>

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
      </div>

      {/* Address */}
      <Input
        id="address"
        name="address"
        label="Home Address"
        type="text"
        placeholder="e.g. 123 Main St, City"
        value={formData.address}
        onChange={handleChange}
        error={errors.address}
      />

      <div className="flex items-center gap-3 pt-4 border-t border-neutral-100">
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
