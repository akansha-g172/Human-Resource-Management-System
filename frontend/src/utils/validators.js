import { z } from 'zod';

// Validate password format: min 8 characters, uppercase, number, and special character
const passwordSchema = z.string()
  .min(8, { message: "Password must be at least 8 characters long" })
  .refine((val) => /[A-Z]/.test(val), { message: "Password must contain at least one uppercase letter" })
  .refine((val) => /\d/.test(val), { message: "Password must contain at least one number" })
  .refine((val) => /[#@%&*!]/.test(val), { message: "Password must contain at least one special character (#@%&*!)" });

// Sign Up Schema
export const signUpSchema = z.object({
  name: z.string().trim().min(1, { message: "Name is required" }),
  email: z.string().trim().email({ message: "Invalid email address" }),
  password: passwordSchema,
  confirmPassword: z.string(),
  role: z.enum(["admin", "employee"], { errorMap: () => ({ message: "Role must be admin or employee" }) }),
  startDate: z.string().refine((val) => {
    if (!val) return false;
    const date = new Date(val);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Allow today's date
    return date <= today;
  }, { message: "Start date cannot be in the future" })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

// Sign In Schema
export const signInSchema = z.object({
  identifier: z.string().trim().min(1, { message: "Email or Employee ID is required" }),
  password: z.string().min(1, { message: "Password is required" })
});

// Profile Update Schema (For Employees)
export const profileUpdateSchema = z.object({
  phone: z.string().trim().nullable().or(z.string().trim().min(0)),
  address: z.string().trim().nullable().or(z.string().trim().min(0)),
  photoUrl: z.string().trim().url({ message: "Must be a valid image URL" }).or(z.string().length(0)).nullable()
});

// Leave Application Schema
export const leaveApplySchema = z.object({
  leaveType: z.enum(["paid", "sick", "unpaid"], { errorMap: () => ({ message: "Select a leave type" }) }),
  startDate: z.string().min(1, { message: "Start date is required" }),
  endDate: z.string().min(1, { message: "End date is required" }),
  remarks: z.string().trim().max(300, { message: "Remarks cannot exceed 300 characters" }).min(1, { message: "Remarks are required" })
}).refine((data) => {
  if (!data.startDate || !data.endDate) return false;
  return new Date(data.endDate) >= new Date(data.startDate);
}, {
  message: "End date must be on or after start date",
  path: ["endDate"]
}).refine((data) => {
  if (!data.startDate || !data.endDate) return false;
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays > 0;
}, {
  message: "Leave duration cannot be 0 days",
  path: ["endDate"]
});

// Admin Employee Update Schema
export const adminEmployeeUpdateSchema = z.object({
  jobTitle: z.string().trim().min(1, { message: "Job title is required" }).nullable().or(z.string().trim().min(1)),
  department: z.string().trim().min(1, { message: "Department is required" }).nullable().or(z.string().trim().min(1)),
  phone: z.string().trim().nullable().or(z.string().trim().min(0)),
  address: z.string().trim().nullable().or(z.string().trim().min(0)),
  salary: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
    z.number({ invalid_type_error: "Salary must be a number" })
     .nonnegative({ message: "Salary must be a non-negative number" })
     .nullable()
  )
});
