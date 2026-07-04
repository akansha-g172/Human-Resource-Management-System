import { delay, mockProfiles } from './profileMock';

// Stateful mock payroll database
export let mockPayroll = [
  {
    userId: "99999999-9999-9999-9999-999999999999",
    basicPay: 10000.00,
    allowances: 2000.00,
    deductions: 800.00
  },
  {
    userId: "11111111-1111-1111-1111-111111111111",
    basicPay: 6000.00,
    allowances: 1500.00,
    deductions: 500.00
  },
  {
    userId: "22222222-2222-2222-2222-222222222222",
    basicPay: 5500.00,
    allowances: 1200.00,
    deductions: 400.00
  },
  {
    userId: "33333333-3333-3333-3333-333333333333",
    basicPay: 5000.00,
    allowances: 1000.00,
    deductions: 350.00
  },
  {
    userId: "44444444-4444-4444-4444-444444444444",
    basicPay: 5200.00,
    allowances: 1100.00,
    deductions: 380.00
  },
  {
    userId: "55555555-5555-5555-5555-555555555555",
    basicPay: 5300.00,
    allowances: 1150.00,
    deductions: 390.00
  }
];

export async function mockGetMyPayroll(userId) {
  await delay();
  
  const record = mockPayroll.find(p => p.userId === userId);
  if (!record) {
    // If not seeded, return zero default record
    return {
      basicPay: 0,
      allowances: 0,
      deductions: 0,
      netPay: 0
    };
  }

  return {
    basicPay: record.basicPay,
    allowances: record.allowances,
    deductions: record.deductions,
    netPay: record.basicPay + record.allowances - record.deductions
  };
}

export async function mockGetAllPayroll() {
  await delay();
  
  return mockPayroll.map(record => {
    const profile = mockProfiles.find(p => p.id === record.userId);
    return {
      userId: record.userId,
      userName: profile ? profile.name : "Unknown Employee",
      employeeId: profile ? profile.employeeId : "N/A",
      basicPay: record.basicPay,
      allowances: record.allowances,
      deductions: record.deductions,
      netPay: record.basicPay + record.allowances - record.deductions
    };
  });
}

export async function mockUpdatePayroll(userId, data) {
  await delay();
  
  const { basicPay, allowances, deductions } = data;
  
  if (basicPay < 0 || allowances < 0 || deductions < 0) {
    throw { response: { status: 400, data: { error: "Values must be non-negative" } } };
  }

  let recordIndex = mockPayroll.findIndex(p => p.userId === userId);
  
  if (recordIndex === -1) {
    // Create new record if it doesn't exist
    const newRecord = {
      userId,
      basicPay,
      allowances,
      deductions
    };
    mockPayroll.push(newRecord);
    recordIndex = mockPayroll.length - 1;
  } else {
    // Update existing
    mockPayroll[recordIndex] = {
      ...mockPayroll[recordIndex],
      basicPay,
      allowances,
      deductions
    };
  }

  const record = mockPayroll[recordIndex];
  return {
    userId: record.userId,
    basicPay: record.basicPay,
    allowances: record.allowances,
    deductions: record.deductions,
    netPay: record.basicPay + record.allowances - record.deductions
  };
}
