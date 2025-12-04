
import { User, Personnel, AuditLog, Rank, Role } from '../types';
import { INITIAL_SUPER_ADMIN, INITIAL_ADMIN, INITIAL_PERSONNEL } from '../constants';

const KEYS = {
  USERS: 'bjmp_users',
  PERSONNEL: 'bjmp_personnel',
  LOGS: 'bjmp_logs',
  SESSION: 'bjmp_session',
};

// --- Helpers ---
const getStorage = <T>(key: string, defaultVal: T): T => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultVal;
};

const setStorage = <T>(key: string, value: T) => {
  localStorage.setItem(key, JSON.stringify(value));
};

// --- Initialization ---
export const initStorage = () => {
  const users = getStorage<any[]>(KEYS.USERS, []);
  let hasChanges = false;

  // Check/Add Super Admin if missing
  if (!users.some(u => u.email === INITIAL_SUPER_ADMIN.email)) {
    users.push({
      ...INITIAL_SUPER_ADMIN,
      password: 'Admin@123',
    });
    hasChanges = true;
  }

  // Check/Add Default Admin if missing
  if (!users.some(u => u.email === INITIAL_ADMIN.email)) {
    users.push({
      ...INITIAL_ADMIN,
      password: 'Admin@123',
    });
    hasChanges = true;
  }

  if (hasChanges) {
    setStorage(KEYS.USERS, users);
  }

  // Check/Add Initial Personnel if empty
  const personnel = getStorage<Personnel[]>(KEYS.PERSONNEL, []);
  if (personnel.length === 0) {
    setStorage(KEYS.PERSONNEL, INITIAL_PERSONNEL);
  }
};

// --- User Operations ---
export const getUsers = (): User[] => {
  // Return users without passwords for safety in UI
  const users = getStorage<any[]>(KEYS.USERS, []);
  return users.map(({ password, ...user }) => user);
};

export const getUserWithAuth = (email: string) => {
  const users = getStorage<any[]>(KEYS.USERS, []);
  return users.find(u => u.email === email);
};

export const saveUser = (user: any) => {
  const users = getStorage<any[]>(KEYS.USERS, []);
  const index = users.findIndex(u => u.id === user.id);
  if (index >= 0) {
    users[index] = { ...users[index], ...user };
  } else {
    users.push(user);
  }
  setStorage(KEYS.USERS, users);
};

export const deleteUser = (id: string) => {
  const users = getStorage<any[]>(KEYS.USERS, []);
  const filtered = users.filter(u => u.id !== id);
  setStorage(KEYS.USERS, filtered);
};

// --- Personnel Operations ---
export const getPersonnel = (): Personnel[] => getStorage<Personnel[]>(KEYS.PERSONNEL, []);

export const savePersonnel = (person: Personnel) => {
  const list = getPersonnel();
  const index = list.findIndex(p => p.id === person.id);
  if (index >= 0) {
    list[index] = person;
  } else {
    list.push(person);
  }
  setStorage(KEYS.PERSONNEL, list);
};

export const deletePersonnel = (id: string) => {
  const list = getPersonnel();
  const filtered = list.filter(p => p.id !== id);
  setStorage(KEYS.PERSONNEL, filtered);
};

// --- Logs ---
export const getLogs = (): AuditLog[] => getStorage<AuditLog[]>(KEYS.LOGS, []);

export const addLog = (action: string, details: string, performedBy: string) => {
  const logs = getLogs();
  const newLog: AuditLog = {
    id: Date.now().toString(),
    action,
    details,
    performedBy,
    timestamp: new Date().toISOString(),
  };
  setStorage(KEYS.LOGS, [newLog, ...logs].slice(0, 1000)); // Keep last 1000
};

export const clearLogs = () => {
    setStorage(KEYS.LOGS, []);
};
