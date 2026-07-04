import { mockProfiles, delay } from './profileMock';

// Generate employeeId: OD + Initials + StartDate (YYMMDD) + 3-digit serial
function generateEmployeeId(name, startDate) {
  const parts = name.trim().split(/\s+/);
  let initials = 'XX';
  if (parts.length >= 2) {
    initials = parts[0][0] + parts[parts.length - 1][0];
  } else if (parts.length === 1 && parts[0].length >= 2) {
    initials = parts[0].substring(0, 2);
  } else if (parts.length === 1 && parts[0].length === 1) {
    initials = parts[0][0] + 'X';
  }
  
  const cleanInitials = initials.toUpperCase();
  
  // Format startDate: YYYY-MM-DD -> YYMMDD
  const dateObj = new Date(startDate);
  const yy = String(dateObj.getFullYear()).substring(2, 4);
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const dd = String(dateObj.getDate()).padStart(2, '0');
  const dateStr = `${yy}${mm}${dd}`;
  
  // Get daily serial counter
  const matchCount = mockProfiles.filter(p => p.dateJoined === startDate).length;
  const serial = String(matchCount + 1).padStart(3, '0');
  
  return `OD${cleanInitials}${dateStr}${serial}`;
}

export async function mockLogin(identifier, password) {
  await delay();
  
  // Check if identifier matches email or employeeId
  const profile = mockProfiles.find(
    p => p.email.toLowerCase() === identifier.toLowerCase() || 
         p.employeeId.toUpperCase() === identifier.toUpperCase()
  );
  
  if (!profile || password !== 'password123!') {
    throw { response: { status: 401, data: { error: "Invalid credentials" } } };
  }
  
  return {
    accessToken: `mock-jwt-token-for-${profile.id}`,
    userId: profile.id,
    employeeId: profile.employeeId,
    name: profile.name,
    role: profile.role,
    photoUrl: profile.photoUrl
  };
}

export async function mockSignUp(data) {
  await delay();
  
  const { name, email, password, role, startDate } = data;
  
  // Check if email already registered
  const exists = mockProfiles.find(p => p.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    throw { response: { status: 400, data: { error: "Email already registered" } } };
  }
  
  const newId = crypto.randomUUID ? crypto.randomUUID() : `mock-uuid-${Date.now()}`;
  const empId = generateEmployeeId(name, startDate);
  
  const newProfile = {
    id: newId,
    employeeId: empId,
    name,
    email,
    role,
    photoUrl: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 900000)}?w=150`,
    jobTitle: role === 'admin' ? 'HR Manager' : 'Associate',
    department: role === 'admin' ? 'Human Resources' : 'General',
    phone: null,
    address: null,
    salary: role === 'admin' ? 90000.00 : 50000.00,
    dateJoined: startDate
  };
  
  mockProfiles.push(newProfile);
  
  return {
    id: newProfile.id,
    employeeId: newProfile.employeeId,
    name: newProfile.name,
    email: newProfile.email,
    role: newProfile.role
  };
}
