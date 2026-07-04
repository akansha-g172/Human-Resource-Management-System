import { delay, mockProfiles } from './profileMock';

// In-memory attendance database
export let mockAttendance = [
  // Seed attendance for John Doe (11111111-1111-1111-1111-111111111111)
  {
    id: "att-jd-1",
    userId: "11111111-1111-1111-1111-111111111111",
    date: "2026-06-30",
    status: "present",
    checkIn: "2026-06-30T09:05:12.000Z",
    checkOut: "2026-06-30T18:02:45.000Z"
  },
  {
    id: "att-jd-2",
    userId: "11111111-1111-1111-1111-111111111111",
    date: "2026-07-01",
    status: "present",
    checkIn: "2026-07-01T08:58:33.000Z",
    checkOut: "2026-07-01T17:59:10.000Z"
  },
  {
    id: "att-jd-3",
    userId: "11111111-1111-1111-1111-111111111111",
    date: "2026-07-02",
    status: "half-day",
    checkIn: "2026-07-02T09:12:00.000Z",
    checkOut: "2026-07-02T13:15:00.000Z"
  },
  {
    id: "att-jd-4",
    userId: "11111111-1111-1111-1111-111111111111",
    date: "2026-07-03",
    status: "present",
    checkIn: "2026-07-03T09:01:20.000Z",
    checkOut: null // Did not check out yet or forgot
  },
  // Seed attendance for Alice Smith (22222222-2222-2222-2222-222222222222)
  {
    id: "att-as-1",
    userId: "22222222-2222-2222-2222-222222222222",
    date: "2026-07-01",
    status: "present",
    checkIn: "2026-07-01T09:00:00.000Z",
    checkOut: "2026-07-01T18:00:00.000Z"
  },
  {
    id: "att-as-2",
    userId: "22222222-2222-2222-2222-222222222222",
    date: "2026-07-02",
    status: "leave",
    checkIn: null,
    checkOut: null
  },
  {
    id: "att-as-3",
    userId: "22222222-2222-2222-2222-222222222222",
    date: "2026-07-03",
    status: "absent",
    checkIn: null,
    checkOut: null
  },
  // Seed attendance for Bob Johnson (33333333-3333-3333-3333-333333333333)
  {
    id: "att-bj-1",
    userId: "33333333-3333-3333-3333-333333333333",
    date: "2026-07-02",
    status: "present",
    checkIn: "2026-07-02T09:05:00.000Z",
    checkOut: "2026-07-02T18:05:00.000Z"
  },
  {
    id: "att-bj-2",
    userId: "33333333-3333-3333-3333-333333333333",
    date: "2026-07-03",
    status: "present",
    checkIn: "2026-07-03T08:45:00.000Z",
    checkOut: "2026-07-03T17:45:00.000Z"
  }
];

// Helper to get formatted today date (local YYYY-MM-DD)
function getTodayString() {
  const d = new Date();
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

export async function mockCheckIn(userId) {
  await delay();
  const today = getTodayString();
  
  // Check if check-in already exists
  const existing = mockAttendance.find(a => a.userId === userId && a.date === today);
  if (existing) {
    throw { response: { status: 400, data: { error: "Already checked in today" } } };
  }
  
  const newRecord = {
    id: crypto.randomUUID ? crypto.randomUUID() : `mock-att-${Date.now()}`,
    userId: userId,
    date: today,
    status: "present",
    checkIn: new Date().toISOString(),
    checkOut: null
  };
  
  mockAttendance.push(newRecord);
  
  return {
    id: newRecord.id,
    date: newRecord.date,
    checkIn: newRecord.checkIn,
    status: newRecord.status
  };
}

export async function mockCheckOut(userId) {
  await delay();
  const today = getTodayString();
  
  // Find check-in record for today
  const existing = mockAttendance.find(a => a.userId === userId && a.date === today);
  if (!existing || !existing.checkIn) {
    throw { response: { status: 400, data: { error: "No active check-in found" } } };
  }
  
  existing.checkOut = new Date().toISOString();
  
  return {
    id: existing.id,
    date: existing.date,
    checkOut: existing.checkOut
  };
}

export async function mockGetAttendanceMe(userId, fromDate, toDate) {
  await delay();
  
  let records = mockAttendance.filter(a => a.userId === userId);
  
  if (fromDate) {
    records = records.filter(a => a.date >= fromDate);
  }
  if (toDate) {
    records = records.filter(a => a.date <= toDate);
  }
  
  // Return shape: { id, date, status, checkIn, checkOut }
  return records.map(a => ({
    id: a.id,
    date: a.date,
    status: a.status,
    checkIn: a.checkIn,
    checkOut: a.checkOut
  }));
}

export async function mockGetAttendanceAdmin(userId, fromDate, toDate) {
  await delay();
  
  let records = [...mockAttendance];
  
  if (userId) {
    records = records.filter(a => a.userId === userId);
  }
  if (fromDate) {
    records = records.filter(a => a.date >= fromDate);
  }
  if (toDate) {
    records = records.filter(a => a.date <= toDate);
  }
  
  // Return shape: { userId, userName, date, status, checkIn, checkOut }
  return records.map(a => {
    const profile = mockProfiles.find(p => p.id === a.userId);
    return {
      userId: a.userId,
      userName: profile ? profile.name : "Unknown Employee",
      date: a.date,
      status: a.status,
      checkIn: a.checkIn,
      checkOut: a.checkOut
    };
  });
}
