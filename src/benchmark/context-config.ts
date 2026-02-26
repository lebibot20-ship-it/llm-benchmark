import type { ChatCompletionTool } from "openai/resources/chat/completions";
import { QualityScores } from "./config";

// ============ WORKSPACE DATA TYPES ============

export interface WorkingArea {
  id: string;
  name: string;
}

export interface Branch {
  id: string;
  name: string;
  workingAreas: WorkingArea[];
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  branchId: string;
  workingAreaId: string;
  role: "employee" | "manager";
  status: "active" | "inactive";
  employmentType: "vollzeit" | "teilzeit" | "minijob";
}

export interface Shift {
  id: string;
  branchId: string;
  workingAreaId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  assignedEmployees: string[]; // employee IDs
  openSlots: number;
  tags: string[]; // tag IDs
}

export interface Tag {
  id: string;
  name: string;
}

export interface WorkspaceContext {
  company: { name: string; id: string };
  branches: Branch[];
  employees: Employee[];
  shifts: Shift[];
  tags: Tag[];
}

// ============ MOCK WORKSPACE: "Muster GmbH" ============

export const MOCK_WORKSPACE: WorkspaceContext = {
  company: { name: "Muster GmbH", id: "7532" },
  branches: [
    {
      id: "101",
      name: "Berlin",
      workingAreas: [
        { id: "201", name: "Küche" },
        { id: "202", name: "Service" },
      ],
    },
    {
      id: "102",
      name: "München",
      workingAreas: [
        { id: "203", name: "Bar" },
        { id: "204", name: "Küche" },
      ],
    },
  ],
  employees: [
    // Berlin — Küche (4)
    { id: "emp-001", firstName: "Max", lastName: "Müller", branchId: "101", workingAreaId: "201", role: "employee", status: "active", employmentType: "vollzeit" },
    { id: "emp-003", firstName: "Lukas", lastName: "Weber", branchId: "101", workingAreaId: "201", role: "employee", status: "active", employmentType: "vollzeit" },
    { id: "emp-005", firstName: "Jonas", lastName: "Meyer", branchId: "101", workingAreaId: "201", role: "employee", status: "active", employmentType: "teilzeit" },
    { id: "emp-007", firstName: "Tim", lastName: "Hoffmann", branchId: "101", workingAreaId: "201", role: "employee", status: "active", employmentType: "minijob" },
    // Berlin — Service (3)
    { id: "emp-002", firstName: "Anna", lastName: "Schmidt", branchId: "101", workingAreaId: "202", role: "manager", status: "active", employmentType: "vollzeit" },
    { id: "emp-004", firstName: "Sophie", lastName: "Fischer", branchId: "101", workingAreaId: "202", role: "employee", status: "active", employmentType: "vollzeit" },
    { id: "emp-006", firstName: "Laura", lastName: "Braun", branchId: "101", workingAreaId: "202", role: "employee", status: "active", employmentType: "teilzeit" },
    // München — Bar (3)
    { id: "emp-008", firstName: "Maria", lastName: "Wagner", branchId: "102", workingAreaId: "203", role: "manager", status: "active", employmentType: "vollzeit" },
    { id: "emp-010", firstName: "Lisa", lastName: "Schulz", branchId: "102", workingAreaId: "203", role: "employee", status: "active", employmentType: "vollzeit" },
    { id: "emp-012", firstName: "Emma", lastName: "Richter", branchId: "102", workingAreaId: "203", role: "employee", status: "active", employmentType: "minijob" },
    // München — Küche (2)
    { id: "emp-009", firstName: "Paul", lastName: "Becker", branchId: "102", workingAreaId: "204", role: "employee", status: "active", employmentType: "vollzeit" },
    { id: "emp-011", firstName: "Felix", lastName: "Koch", branchId: "102", workingAreaId: "204", role: "employee", status: "active", employmentType: "teilzeit" },
  ],
  shifts: [
    // Berlin Küche
    { id: "shift-001", branchId: "101", workingAreaId: "201", date: "2026-02-26", startTime: "06:00", endTime: "14:00", assignedEmployees: ["emp-001", "emp-003"], openSlots: 0, tags: ["tag-1"] },
    { id: "shift-002", branchId: "101", workingAreaId: "201", date: "2026-02-26", startTime: "14:00", endTime: "22:00", assignedEmployees: ["emp-005", "emp-007"], openSlots: 0, tags: ["tag-2"] },
    { id: "shift-003", branchId: "101", workingAreaId: "201", date: "2026-02-27", startTime: "06:00", endTime: "14:00", assignedEmployees: ["emp-001"], openSlots: 1, tags: ["tag-1"] },
    { id: "shift-004", branchId: "101", workingAreaId: "201", date: "2026-02-27", startTime: "14:00", endTime: "22:00", assignedEmployees: ["emp-003", "emp-005"], openSlots: 0, tags: ["tag-2"] },
    { id: "shift-005", branchId: "101", workingAreaId: "201", date: "2026-02-28", startTime: "06:00", endTime: "14:00", assignedEmployees: ["emp-007"], openSlots: 1, tags: ["tag-1", "tag-3"] },
    { id: "shift-006", branchId: "101", workingAreaId: "201", date: "2026-03-02", startTime: "06:00", endTime: "14:00", assignedEmployees: ["emp-001", "emp-003", "emp-005", "emp-007"], openSlots: 0, tags: ["tag-1"] },
    { id: "shift-007", branchId: "101", workingAreaId: "201", date: "2026-03-03", startTime: "06:00", endTime: "14:00", assignedEmployees: ["emp-001", "emp-003"], openSlots: 0, tags: ["tag-1"] },
    // Berlin Service
    { id: "shift-008", branchId: "101", workingAreaId: "202", date: "2026-02-26", startTime: "10:00", endTime: "18:00", assignedEmployees: ["emp-002", "emp-004"], openSlots: 0, tags: [] },
    { id: "shift-009", branchId: "101", workingAreaId: "202", date: "2026-02-27", startTime: "10:00", endTime: "18:00", assignedEmployees: ["emp-006"], openSlots: 1, tags: [] },
    { id: "shift-010", branchId: "101", workingAreaId: "202", date: "2026-02-28", startTime: "10:00", endTime: "18:00", assignedEmployees: ["emp-002", "emp-004"], openSlots: 0, tags: ["tag-3"] },
    { id: "shift-011", branchId: "101", workingAreaId: "202", date: "2026-03-02", startTime: "10:00", endTime: "18:00", assignedEmployees: ["emp-002", "emp-004", "emp-006"], openSlots: 0, tags: [] },
    { id: "shift-012", branchId: "101", workingAreaId: "202", date: "2026-03-03", startTime: "10:00", endTime: "18:00", assignedEmployees: ["emp-004", "emp-006"], openSlots: 0, tags: [] },
    // München Bar
    { id: "shift-013", branchId: "102", workingAreaId: "203", date: "2026-02-26", startTime: "16:00", endTime: "00:00", assignedEmployees: ["emp-008", "emp-010"], openSlots: 0, tags: ["tag-2"] },
    { id: "shift-014", branchId: "102", workingAreaId: "203", date: "2026-02-27", startTime: "16:00", endTime: "00:00", assignedEmployees: ["emp-008", "emp-012"], openSlots: 0, tags: ["tag-2"] },
    { id: "shift-015", branchId: "102", workingAreaId: "203", date: "2026-02-28", startTime: "16:00", endTime: "00:00", assignedEmployees: ["emp-010", "emp-012"], openSlots: 0, tags: ["tag-2", "tag-3"] },
    { id: "shift-016", branchId: "102", workingAreaId: "203", date: "2026-03-02", startTime: "16:00", endTime: "00:00", assignedEmployees: ["emp-008", "emp-010"], openSlots: 0, tags: ["tag-2"] },
    // München Küche
    { id: "shift-017", branchId: "102", workingAreaId: "204", date: "2026-02-26", startTime: "06:00", endTime: "14:00", assignedEmployees: ["emp-009"], openSlots: 0, tags: ["tag-1"] },
    { id: "shift-018", branchId: "102", workingAreaId: "204", date: "2026-02-27", startTime: "06:00", endTime: "14:00", assignedEmployees: ["emp-011"], openSlots: 0, tags: ["tag-1"] },
    { id: "shift-019", branchId: "102", workingAreaId: "204", date: "2026-02-28", startTime: "06:00", endTime: "14:00", assignedEmployees: ["emp-009"], openSlots: 1, tags: ["tag-1", "tag-3"] },
    { id: "shift-020", branchId: "102", workingAreaId: "204", date: "2026-03-02", startTime: "06:00", endTime: "14:00", assignedEmployees: ["emp-009", "emp-011"], openSlots: 0, tags: ["tag-1"] },
  ],
  tags: [
    { id: "tag-1", name: "Frühschicht" },
    { id: "tag-2", name: "Spätschicht" },
    { id: "tag-3", name: "Wochenende" },
  ],
};

// ============ TOOL DEFINITIONS ============

export const MOCK_TOOLS: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "get_branch_working_areas",
      description: "Get all branches and their working areas for the current workspace.",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_employees",
      description: "List employees in the workspace. Optionally filter by branch ID.",
      parameters: {
        type: "object",
        properties: {
          branch_id: {
            type: "string",
            description: "Filter employees by branch ID. If omitted, returns all employees.",
          },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_shifts_for_range",
      description: "Get shifts for a date range. Returns all shifts between start_date and end_date.",
      parameters: {
        type: "object",
        properties: {
          start_date: {
            type: "string",
            description: "Start date in YYYY-MM-DD format.",
          },
          end_date: {
            type: "string",
            description: "End date in YYYY-MM-DD format.",
          },
          branch_id: {
            type: "string",
            description: "Optional branch ID to filter shifts.",
          },
        },
        required: ["start_date", "end_date"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_company_tags",
      description: "Get all tags defined in the workspace.",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "calculate_datetimes",
      description: "Calculate dates relative to today. Returns the computed date.",
      parameters: {
        type: "object",
        properties: {
          operation: {
            type: "string",
            enum: ["today", "tomorrow", "yesterday", "add_days", "subtract_days", "start_of_week", "end_of_week"],
            description: "The date calculation to perform.",
          },
          days: {
            type: "number",
            description: "Number of days for add_days/subtract_days operations.",
          },
        },
        required: ["operation"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "calculate_weekdays",
      description: "Calculate the date of a specific weekday relative to today.",
      parameters: {
        type: "object",
        properties: {
          weekday: {
            type: "string",
            enum: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
            description: "The target weekday.",
          },
          which: {
            type: "string",
            enum: ["this", "next", "last"],
            description: "Which occurrence: this week, next week, or last week.",
          },
        },
        required: ["weekday"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_shifts",
      description: "Create one or more shifts. Returns confirmation with created shift IDs.",
      parameters: {
        type: "object",
        properties: {
          shifts: {
            type: "array",
            items: {
              type: "object",
              properties: {
                branch_id: { type: "string" },
                working_area_id: { type: "string" },
                date: { type: "string", description: "YYYY-MM-DD" },
                start_time: { type: "string", description: "HH:mm" },
                end_time: { type: "string", description: "HH:mm" },
                employee_ids: { type: "array", items: { type: "string" } },
              },
              required: ["branch_id", "working_area_id", "date", "start_time", "end_time"],
            },
            description: "Array of shifts to create.",
          },
        },
        required: ["shifts"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "send_broadcast",
      description: "Send a broadcast message to a list of employees.",
      parameters: {
        type: "object",
        properties: {
          employee_ids: {
            type: "array",
            items: { type: "string" },
            description: "List of employee IDs to send the message to.",
          },
          message: {
            type: "string",
            description: "The message content to send.",
          },
        },
        required: ["employee_ids", "message"],
      },
    },
  },
];

// ============ MOCK TOOL RESPONSES ============

// Reference date: 2026-02-25 (Wednesday)
const TODAY = new Date("2026-02-25T12:00:00+01:00");

function formatDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

function addDays(d: Date, n: number): Date {
  const result = new Date(d);
  result.setDate(result.getDate() + n);
  return result;
}

export const MOCK_TOOL_RESPONSES: Record<string, (args: Record<string, unknown>) => string> = {
  get_branch_working_areas: () => {
    return JSON.stringify(MOCK_WORKSPACE.branches.map(b => ({
      id: b.id,
      name: b.name,
      working_areas: b.workingAreas.map(wa => ({ id: wa.id, name: wa.name })),
    })));
  },

  list_employees: (args) => {
    let employees = MOCK_WORKSPACE.employees;
    if (args.branch_id) {
      employees = employees.filter(e => e.branchId === args.branch_id);
    }
    return JSON.stringify(employees.map(e => ({
      id: e.id,
      first_name: e.firstName,
      last_name: e.lastName,
      branch_id: e.branchId,
      working_area_id: e.workingAreaId,
      role: e.role,
      status: e.status,
      employment_type: e.employmentType,
    })));
  },

  get_shifts_for_range: (args) => {
    let shifts = MOCK_WORKSPACE.shifts.filter(s => {
      return s.date >= (args.start_date as string) && s.date <= (args.end_date as string);
    });
    if (args.branch_id) {
      shifts = shifts.filter(s => s.branchId === args.branch_id);
    }
    // Enrich with employee names
    return JSON.stringify(shifts.map(s => {
      const branch = MOCK_WORKSPACE.branches.find(b => b.id === s.branchId);
      const wa = branch?.workingAreas.find(w => w.id === s.workingAreaId);
      const assigned = s.assignedEmployees.map(eid => {
        const emp = MOCK_WORKSPACE.employees.find(e => e.id === eid);
        return emp ? { id: emp.id, name: `${emp.firstName} ${emp.lastName}` } : { id: eid, name: "Unknown" };
      });
      return {
        id: s.id,
        branch: branch?.name ?? s.branchId,
        working_area: wa?.name ?? s.workingAreaId,
        date: s.date,
        start_time: s.startTime,
        end_time: s.endTime,
        assigned_employees: assigned,
        open_slots: s.openSlots,
        tags: s.tags.map(tid => {
          const tag = MOCK_WORKSPACE.tags.find(t => t.id === tid);
          return tag?.name ?? tid;
        }),
      };
    }));
  },

  get_company_tags: () => {
    return JSON.stringify(MOCK_WORKSPACE.tags.map(t => ({ id: t.id, name: t.name })));
  },

  calculate_datetimes: (args) => {
    const op = args.operation as string;
    let result: Date;
    switch (op) {
      case "today":
        result = TODAY;
        break;
      case "tomorrow":
        result = addDays(TODAY, 1);
        break;
      case "yesterday":
        result = addDays(TODAY, -1);
        break;
      case "add_days":
        result = addDays(TODAY, (args.days as number) || 0);
        break;
      case "subtract_days":
        result = addDays(TODAY, -((args.days as number) || 0));
        break;
      case "start_of_week": {
        const d = new Date(TODAY);
        const day = d.getDay();
        const diff = day === 0 ? -6 : 1 - day; // Monday
        result = addDays(d, diff);
        break;
      }
      case "end_of_week": {
        const d = new Date(TODAY);
        const day = d.getDay();
        const diff = day === 0 ? 0 : 7 - day; // Sunday
        result = addDays(d, diff);
        break;
      }
      default:
        result = TODAY;
    }
    const weekdays = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
    return JSON.stringify({
      date: formatDate(result),
      weekday: weekdays[result.getDay()],
      iso: result.toISOString(),
    });
  },

  calculate_weekdays: (args) => {
    const weekday = args.weekday as string;
    const which = (args.which as string) || "this";
    const dayMap: Record<string, number> = {
      monday: 1, tuesday: 2, wednesday: 3, thursday: 4,
      friday: 5, saturday: 6, sunday: 0,
    };
    const targetDay = dayMap[weekday] ?? 1;
    const currentDay = TODAY.getDay();
    let diff = targetDay - currentDay;
    if (which === "next") {
      if (diff <= 0) diff += 7;
    } else if (which === "last") {
      if (diff >= 0) diff -= 7;
    } else {
      // "this" — find the occurrence in the current week (Mon-Sun)
      const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
      const monday = addDays(TODAY, mondayOffset);
      const targetDate = addDays(monday, targetDay === 0 ? 6 : targetDay - 1);
      const weekdays = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
      return JSON.stringify({
        date: formatDate(targetDate),
        weekday: weekdays[targetDate.getDay()],
        iso: targetDate.toISOString(),
      });
    }
    const result = addDays(TODAY, diff);
    const weekdays = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
    return JSON.stringify({
      date: formatDate(result),
      weekday: weekdays[result.getDay()],
      iso: result.toISOString(),
    });
  },

  create_shifts: (args) => {
    const shifts = args.shifts as Array<Record<string, unknown>>;
    const created = shifts.map((s, i) => ({
      id: `shift-new-${i + 1}`,
      ...s,
      status: "created",
    }));
    return JSON.stringify({
      success: true,
      message: `${created.length} Schicht(en) erfolgreich erstellt.`,
      created_shifts: created,
    });
  },

  send_broadcast: (args) => {
    const employeeIds = args.employee_ids as string[];
    return JSON.stringify({
      success: true,
      message: `Nachricht erfolgreich an ${employeeIds.length} Mitarbeiter gesendet.`,
      recipients: employeeIds,
    });
  },
};

// ============ SYSTEM PROMPTS ============

const BASE_SYSTEM_PROMPT = `You are the AI assistant for Ordio, a cloud-based workforce and shift management platform.

Your primary role is to help managers with shift planning, employee management, and workforce operations.

## Execution Strategy
1. Analyze the user's request to understand what information is needed
2. Use available tools to gather data
3. Process the data and provide a clear, helpful response in German

## Communication Style
- Always respond in German (the user's language)
- Be concise and actionable
- Format data clearly using lists or tables when appropriate
- Confirm actions before executing them (e.g., creating shifts, sending messages)

## Tool Usage
- Use tools to fetch real-time data rather than guessing
- Combine multiple tool calls when needed to fulfill a request
- When creating shifts or sending messages, confirm with the user first unless they explicitly asked to execute

Today: 2026-02-25
Day: Mittwoch
Timezone: Europe/Berlin
Available Tools: get_branch_working_areas, list_employees, get_shifts_for_range, get_company_tags, calculate_datetimes, calculate_weekdays, create_shifts, send_broadcast`;

const LIGHT_CONTEXT = `

## Workspace Context
Company: Muster GmbH
Branches: Berlin (Küche, Service), München (Bar, Küche)
Employees: 12 total (Berlin: 7, München: 5)
Tags: Frühschicht, Spätschicht, Wochenende`;

const FULL_CONTEXT = `

## Workspace Context
### Company
Muster GmbH (ID: 7532)

### Branches & Working Areas
- Berlin (ID: 101)
  - Küche (ID: 201)
  - Service (ID: 202)
- München (ID: 102)
  - Bar (ID: 203)
  - Küche (ID: 204)

### Employees (12 total)
Berlin / Küche:
1. Max Müller (ID: emp-001, Vollzeit, Employee)
2. Lukas Weber (ID: emp-003, Vollzeit, Employee)
3. Jonas Meyer (ID: emp-005, Teilzeit, Employee)
4. Tim Hoffmann (ID: emp-007, Minijob, Employee)

Berlin / Service:
5. Anna Schmidt (ID: emp-002, Vollzeit, Manager)
6. Sophie Fischer (ID: emp-004, Vollzeit, Employee)
7. Laura Braun (ID: emp-006, Teilzeit, Employee)

München / Bar:
8. Maria Wagner (ID: emp-008, Vollzeit, Manager)
9. Lisa Schulz (ID: emp-010, Vollzeit, Employee)
10. Emma Richter (ID: emp-012, Minijob, Employee)

München / Küche:
11. Paul Becker (ID: emp-009, Vollzeit, Employee)
12. Felix Koch (ID: emp-011, Teilzeit, Employee)

### Shifts (next 7 days)
Do 26.02:
- Berlin/Küche 06:00-14:00 [Max Müller, Lukas Weber] (Frühschicht)
- Berlin/Küche 14:00-22:00 [Jonas Meyer, Tim Hoffmann] (Spätschicht)
- Berlin/Service 10:00-18:00 [Anna Schmidt, Sophie Fischer]
- München/Bar 16:00-00:00 [Maria Wagner, Lisa Schulz] (Spätschicht)
- München/Küche 06:00-14:00 [Paul Becker] (Frühschicht)

Fr 27.02:
- Berlin/Küche 06:00-14:00 [Max Müller, 1 offen] (Frühschicht)
- Berlin/Küche 14:00-22:00 [Lukas Weber, Jonas Meyer] (Spätschicht)
- Berlin/Service 10:00-18:00 [Laura Braun, 1 offen]
- München/Bar 16:00-00:00 [Maria Wagner, Emma Richter] (Spätschicht)
- München/Küche 06:00-14:00 [Felix Koch] (Frühschicht)

Sa 28.02:
- Berlin/Küche 06:00-14:00 [Tim Hoffmann, 1 offen] (Frühschicht, Wochenende)
- Berlin/Service 10:00-18:00 [Anna Schmidt, Sophie Fischer] (Wochenende)
- München/Bar 16:00-00:00 [Lisa Schulz, Emma Richter] (Spätschicht, Wochenende)
- München/Küche 06:00-14:00 [Paul Becker, 1 offen] (Frühschicht, Wochenende)

Mo 02.03:
- Berlin/Küche 06:00-14:00 [Max Müller, Lukas Weber, Jonas Meyer, Tim Hoffmann] (Frühschicht)
- Berlin/Service 10:00-18:00 [Anna Schmidt, Sophie Fischer, Laura Braun]
- München/Bar 16:00-00:00 [Maria Wagner, Lisa Schulz] (Spätschicht)
- München/Küche 06:00-14:00 [Paul Becker, Felix Koch] (Frühschicht)

Di 03.03:
- Berlin/Küche 06:00-14:00 [Max Müller, Lukas Weber] (Frühschicht)
- Berlin/Service 10:00-18:00 [Sophie Fischer, Laura Braun]

### Tags
- Frühschicht (ID: tag-1)
- Spätschicht (ID: tag-2)
- Wochenende (ID: tag-3)`;

const SUMMARY_CONTEXT = `

## Workspace Summary
Muster GmbH operates 2 branches with 12 employees.

Berlin (7 employees): Küche (4), Service (3) — 12 shifts this week, 3 open slots
München (5 employees): Bar (2 + 1 Manager), Küche (2) — 8 shifts this week, 1 open slot

This week: 20 total shifts, 4 open slots needing coverage. Peak days: Monday (full staffing) and Thursday (5 shifts).
Employment mix: 6 Vollzeit, 3 Teilzeit, 3 Minijob.
Tags in use: Frühschicht (morning), Spätschicht (evening), Wochenende (weekend).`;

export type ContextStrategy = "baseline" | "light" | "full" | "summary";

export const CONTEXT_STRATEGIES: Record<ContextStrategy, string> = {
  baseline: BASE_SYSTEM_PROMPT,
  light: BASE_SYSTEM_PROMPT + LIGHT_CONTEXT,
  full: BASE_SYSTEM_PROMPT + FULL_CONTEXT,
  summary: BASE_SYSTEM_PROMPT + SUMMARY_CONTEXT,
};

export const ALL_STRATEGIES: ContextStrategy[] = ["baseline", "light", "full", "summary"];

// ============ TEST QUERIES ============

export interface ContextQuery {
  id: string;
  category: string;
  query: string;
  expectedTools: string[];
  description: string;
}

export const CONTEXT_QUERIES: ContextQuery[] = [
  {
    id: "q1-who-works-tomorrow",
    category: "info-retrieval",
    query: "Wer arbeitet morgen?",
    expectedTools: ["calculate_datetimes", "get_shifts_for_range"],
    description: "List employees working tomorrow — requires date calculation + shift lookup",
  },
  {
    id: "q2-employees-berlin",
    category: "info-retrieval",
    query: "Zeige mir alle Mitarbeiter in der Filiale Berlin",
    expectedTools: ["get_branch_working_areas", "list_employees"],
    description: "List all Berlin employees — requires branch lookup + employee filtering",
  },
  {
    id: "q3-open-shifts-week",
    category: "info-retrieval",
    query: "Wie viele offene Schichten haben wir diese Woche?",
    expectedTools: ["calculate_weekdays", "get_shifts_for_range"],
    description: "Count open shifts this week — requires week calculation + shift filtering",
  },
  {
    id: "q4-create-shifts-monday",
    category: "action",
    query: "Erstelle Schichten für alle Mitarbeiter nächsten Montag 9-17 Uhr",
    expectedTools: ["calculate_weekdays", "list_employees", "get_branch_working_areas", "create_shifts"],
    description: "Create shifts for all employees next Monday — requires multiple lookups + action",
  },
  {
    id: "q5-broadcast-service",
    category: "action",
    query: "Schicke eine Nachricht an alle im Service: Morgen bitte 15 Minuten früher kommen",
    expectedTools: ["get_branch_working_areas", "list_employees", "send_broadcast"],
    description: "Send broadcast to Service working area — requires WA lookup + employee filtering + send",
  },
  {
    id: "q6-general-knowledge",
    category: "general",
    query: "Was ist der Unterschied zwischen Minijob und Vollzeit bei den Arbeitszeiten?",
    expectedTools: [],
    description: "General knowledge question — should need zero tools",
  },
];
