export const dummyCompanies = [
  {
    id: "company_1",
    name: "Acme Corp",
    contact: "John Smith",
    email: "contact@acmecorp.com",
    phone: "+1 (555) 123-4567",
    plan: "Enterprise",
    tickets: 24,
    createdAt: "2023-01-10T00:00:00Z"
  },
  {
    id: "company_2",
    name: "Globex Inc",
    contact: "Emily Johnson",
    email: "info@globex.com",
    phone: "+1 (555) 987-6543",
    plan: "Professional",
    tickets: 18,
    createdAt: "2023-02-15T00:00:00Z"
  },
  {
    id: "company_3",
    name: "Initech",
    contact: "Michael Scott",
    email: "support@initech.com",
    phone: "+1 (555) 456-7890",
    plan: "Starter",
    tickets: 12,
    createdAt: "2023-03-22T00:00:00Z"
  },
  {
    id: "company_4",
    name: "Umbrella Corp",
    contact: "Alice Wesker",
    email: "admin@umbrella.com",
    phone: "+1 (555) 234-5678",
    plan: "Professional",
    tickets: 32,
    createdAt: "2023-04-05T00:00:00Z"
  }
];



export const dummyTickets = [
  {
    id: "ticket_1",
    title: "Login issue on mobile app",
    description: "I'm unable to login to the mobile application. It keeps showing invalid credentials error even though I'm sure my password is correct.",
    status: "open",
    priority: "high",
    category: "technical",
    company: "Acme Corp",
    user: "user_1",
    createdAt: "2023-06-01T09:15:00Z",
    attachments: []
  },
  {
    id: "ticket_2",
    title: "Invoice discrepancy",
    description: "My latest invoice shows incorrect charges for premium features I didn't subscribe to.",
    status: "pending",
    priority: "medium",
    category: "billing",
    company: "Acme Corp",
    user: "user_1",
    assignedTo: "user_3",
    createdAt: "2023-05-28T14:30:00Z",
    attachments: [
      { originalname: "invoice_june.pdf" }
    ]
  },
  {
    id: "ticket_3",
    title: "Feature request: Dark mode",
    description: "Please add a dark mode option to the dashboard interface. It would help reduce eye strain during night-time usage.",
    status: "open",
    priority: "low",
    category: "general",
    company: "Globex Inc",
    user: "user_4",
    createdAt: "2023-06-05T11:20:00Z",
    attachments: []
  },
  {
    id: "ticket_4",
    title: "API connection timeout",
    description: "Our integration is timing out when connecting to the API endpoint. This started happening after the recent update.",
    status: "resolved",
    priority: "high",
    category: "technical",
    company: "Globex Inc",
    user: "user_4",
    assignedTo: "user_5",
    createdAt: "2023-05-20T16:45:00Z",
    attachments: [
      { originalname: "error_logs.txt" },
      { originalname: "api_config.png" }
    ]
  },
  {
    id: "ticket_5",
    title: "Account upgrade request",
    description: "I'd like to upgrade my account to the enterprise plan. Please provide details on the process.",
    status: "pending",
    priority: "medium",
    category: "account",
    company: "Acme Corp",
    user: "user_1",
    assignedTo: "user_3",
    createdAt: "2023-06-03T10:05:00Z",
    attachments: []
  }
];


export const dummyUsers = [
  {
    id: "user_1",
    name: "John Client",
    email: "client@gmail.com",
    password: "1234",
    role: "client",
    company: "Acme Corp",
    createdAt: "2023-01-15T08:30:00Z"
  },
  {
    id: "user_2",
    name: "Sarah Admin",
    email: "admin@gmail.com",
    password: "1234",
    role: "admin",
    company: "SupportHub",
    createdAt: "2023-02-20T10:15:00Z"
  },
  {
    id: "user_3",
    name: "Mike Employee",
    email: "employee@gmail.com",
    password: "1234",
    role: "employee",
    company: "SupportHub",
    createdAt: "2023-03-05T14:20:00Z"
  },
  {
    id: "user_4",
    name: "Emily Client",
    email: "emily@example.com",
    password: "password123",
    role: "client",
    company: "Globex Inc",
    createdAt: "2023-04-12T09:45:00Z"
  },
  {
    id: "user_5",
    name: "David Employee",
    email: "david@example.com",
    password: "employee123",
    role: "employee",
    company: "SupportHub",
    createdAt: "2023-05-18T11:30:00Z"
  }
];