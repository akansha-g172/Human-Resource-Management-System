import { delay, mockProfiles } from './profileMock';

// In-memory leave database
export let mockLeaveRequests = [
  {
    id: "leave-jd-1",
    userId: "11111111-1111-1111-1111-111111111111",
    leaveType: "sick",
    startDate: "2026-06-15",
    endDate: "2026-06-16",
    remarks: "Dental checkup and recovery.",
    status: "approved",
    reviewerComment: "Approved, hope you feel better.",
    createdAt: "2026-06-14T10:00:00.000Z"
  },
  {
    id: "leave-jd-2",
    userId: "11111111-1111-1111-1111-111111111111",
    leaveType: "paid",
    startDate: "2026-07-10",
    endDate: "2026-07-14",
    remarks: "Family vacation.",
    status: "pending",
    reviewerComment: null,
    createdAt: "2026-07-02T14:32:00.000Z"
  },
  {
    id: "leave-as-1",
    userId: "22222222-2222-2222-2222-222222222222",
    leaveType: "unpaid",
    startDate: "2026-07-05",
    endDate: "2026-07-06",
    remarks: "Personal work.",
    status: "pending",
    reviewerComment: null,
    createdAt: "2026-07-03T09:15:00.000Z"
  },
  {
    id: "leave-bj-1",
    userId: "33333333-3333-3333-3333-333333333333",
    leaveType: "paid",
    startDate: "2026-06-20",
    endDate: "2026-06-22",
    remarks: "Attending friend's wedding.",
    status: "rejected",
    reviewerComment: "Sorry, we have a major release delivery scheduled on those dates.",
    createdAt: "2026-06-10T11:00:00.000Z"
  }
];

export async function mockApplyLeave(userId, data) {
  await delay();
  const { leaveType, startDate, endDate, remarks } = data;
  
  if (endDate < startDate) {
    throw { response: { status: 400, data: { error: "endDate must be on or after startDate" } } };
  }
  
  const newLeave = {
    id: crypto.randomUUID ? crypto.randomUUID() : `mock-leave-${Date.now()}`,
    userId: userId,
    leaveType,
    startDate,
    endDate,
    remarks,
    status: "pending",
    reviewerComment: null,
    createdAt: new Date().toISOString()
  };
  
  mockLeaveRequests.unshift(newLeave); // newest first
  
  return {
    id: newLeave.id,
    leaveType: newLeave.leaveType,
    startDate: newLeave.startDate,
    endDate: newLeave.endDate,
    remarks: newLeave.remarks,
    status: newLeave.status,
    createdAt: newLeave.createdAt
  };
}

export async function mockGetLeaveMe(userId) {
  await delay();
  const userLeaves = mockLeaveRequests.filter(l => l.userId === userId);
  
  // Sort newest first
  return [...userLeaves].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function mockGetLeaveAdmin(status) {
  await delay();
  let leaves = [...mockLeaveRequests];
  
  if (status) {
    leaves = leaves.filter(l => l.status === status);
  }
  
  // Map to include userName
  const mapped = leaves.map(l => {
    const profile = mockProfiles.find(p => p.id === l.userId);
    return {
      id: l.id,
      userId: l.userId,
      userName: profile ? profile.name : "Unknown Employee",
      leaveType: l.leaveType,
      startDate: l.startDate,
      endDate: l.endDate,
      remarks: l.remarks,
      status: l.status,
      reviewerComment: l.reviewerComment,
      createdAt: l.createdAt
    };
  });
  
  // Sort newest first
  return mapped.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function mockUpdateLeaveStatus(id, status, reviewerComment) {
  await delay();
  const index = mockLeaveRequests.findIndex(l => l.id === id);
  
  if (index === -1) {
    throw { response: { status: 404, data: { error: "Leave request not found" } } };
  }
  
  mockLeaveRequests[index] = {
    ...mockLeaveRequests[index],
    status,
    reviewerComment,
    updatedAt: new Date().toISOString()
  };
  
  const updated = mockLeaveRequests[index];
  const profile = mockProfiles.find(p => p.id === updated.userId);
  
  return {
    id: updated.id,
    userId: updated.userId,
    userName: profile ? profile.name : "Unknown Employee",
    leaveType: updated.leaveType,
    startDate: updated.startDate,
    endDate: updated.endDate,
    remarks: updated.remarks,
    status: updated.status,
    reviewerComment: updated.reviewerComment,
    createdAt: updated.createdAt
  };
}
