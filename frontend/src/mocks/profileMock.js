export const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export let mockProfiles = [
  {
    id: "99999999-9999-9999-9999-999999999999",
    employeeId: "ODAD200101001",
    name: "Jane Admin",
    email: "admin@demo.com",
    role: "admin",
    photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150",
    jobTitle: "HR Director",
    department: "Human Resources",
    phone: "+1-555-0101",
    address: "123 Admin Way, Metro City",
    salary: 120000.00,
    dateJoined: "2020-01-01"
  },
  {
    id: "11111111-1111-1111-1111-111111111111",
    employeeId: "ODJD260704007",
    name: "John Doe",
    email: "john.doe@demo.com",
    role: "employee",
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
    jobTitle: "Software Engineer",
    department: "Engineering",
    phone: "+1-555-0102",
    address: "456 Elm St, Suburbia",
    salary: 85000.00,
    dateJoined: "2026-07-04"
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    employeeId: "ODAS260515001",
    name: "Alice Smith",
    email: "alice.smith@demo.com",
    role: "employee",
    photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    jobTitle: "Product Designer",
    department: "Design",
    phone: "+1-555-0103",
    address: "789 Pine Rd, Creative Town",
    salary: 80000.00,
    dateJoined: "2026-05-15"
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    employeeId: "ODBJ260210002",
    name: "Bob Johnson",
    email: "bob.johnson@demo.com",
    role: "employee",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    jobTitle: "QA Engineer",
    department: "Quality Assurance",
    phone: "+1-555-0104",
    address: "321 Oak Ln, Bug City",
    salary: 70000.00,
    dateJoined: "2026-02-10"
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    employeeId: "ODCB251120005",
    name: "Charlie Brown",
    email: "charlie.brown@demo.com",
    role: "employee",
    photoUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150",
    jobTitle: "Marketing Analyst",
    department: "Marketing",
    phone: "+1-555-0105",
    address: "555 Maple Dr, Salesville",
    salary: 72000.00,
    dateJoined: "2025-11-20"
  },
  {
    id: "55555555-5555-5555-5555-555555555555",
    employeeId: "ODDP240618012",
    name: "Diana Prince",
    email: "diana.prince@demo.com",
    role: "employee",
    photoUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150",
    jobTitle: "HR Specialist",
    department: "Human Resources",
    phone: "+1-555-0106",
    address: "888 Plaza St, Themyscira",
    salary: 75000.00,
    dateJoined: "2024-06-18"
  }
];

export async function mockGetProfileMe(userId) {
  await delay();
  const profile = mockProfiles.find(p => p.id === userId);
  if (!profile) throw { response: { status: 404, data: { error: "Profile not found" } } };
  return { ...profile };
}

export async function mockUpdateProfileMe(userId, data) {
  await delay();
  const index = mockProfiles.findIndex(p => p.id === userId);
  if (index === -1) throw { response: { status: 404, data: { error: "Profile not found" } } };
  
  // Can only edit address, phone, photoUrl
  const allowed = {
    address: data.address !== undefined ? data.address : mockProfiles[index].address,
    phone: data.phone !== undefined ? data.phone : mockProfiles[index].phone,
    photoUrl: data.photoUrl !== undefined ? data.photoUrl : mockProfiles[index].photoUrl,
  };
  
  mockProfiles[index] = {
    ...mockProfiles[index],
    ...allowed
  };
  
  return { ...mockProfiles[index] };
}

export async function mockGetEmployees() {
  await delay();
  return mockProfiles.map(p => ({ ...p }));
}

export async function mockUpdateEmployeeProfile(userId, data) {
  await delay();
  const index = mockProfiles.findIndex(p => p.id === userId);
  if (index === -1) throw { response: { status: 404, data: { error: "Profile not found" } } };
  
  // Admin can edit any of: jobTitle, department, phone, address, salary
  const allowed = {};
  if (data.jobTitle !== undefined) allowed.jobTitle = data.jobTitle;
  if (data.department !== undefined) allowed.department = data.department;
  if (data.phone !== undefined) allowed.phone = data.phone;
  if (data.address !== undefined) allowed.address = data.address;
  if (data.salary !== undefined) allowed.salary = data.salary;
  if (data.photoUrl !== undefined) allowed.photoUrl = data.photoUrl;
  if (data.name !== undefined) allowed.name = data.name; // In case admin wants to change name
  
  mockProfiles[index] = {
    ...mockProfiles[index],
    ...allowed
  };
  
  return { ...mockProfiles[index] };
}
