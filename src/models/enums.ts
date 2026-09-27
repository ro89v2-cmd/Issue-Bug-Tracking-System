// ===== Enums =====
// ใช้ enum เพื่อกำหนดค่าคงที่สำหรับ Priority และ Status

export enum Priority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical',
}

export enum Status {
  OPEN = 'Open',
  IN_PROGRESS = 'In Progress',
  RESOLVED = 'Resolved',
  CLOSED = 'Closed',
}

export enum IssueType {
  BUG = 'Bug',
  FEATURE = 'Feature',
  TASK = 'Task',
  THREAT = 'Threat',
}
