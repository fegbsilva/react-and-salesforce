// src/services/salesforceMockService.js

const STORAGE_KEY = "sf_portal_mock_cases_v1";

// Simula o registro Account do cliente autenticado
const MOCK_ACCOUNT = {
  Id: "001Dn000008xYzQIAU",
  Name: "Indústrias Horizonte Ltda",
  AccountNumber: "CLI-2026-089",
  Industry: "Manufatura",
  BillingCity: "Londrina",
  BillingState: "PR",
  SLA__c: "Gold (Resposta em até 4h)",
};

// Simula registros do objeto Order vinculados à Account
const MOCK_ORDERS = [
  {
    Id: "801Dn000002aBcDEAU",
    OrderNumber: "00001042",
    EffectiveDate: "2026-11-10",
    Status: "Entregue",
    TotalAmount: 14850.0,
    Description: "Lote 12x Sensores Industriais IoT + Gateway",
  },
  {
    Id: "801Dn000002aBcEEAU",
    OrderNumber: "00001089",
    EffectiveDate: "2026-11-18",
    Status: "Em Transporte",
    TotalAmount: 6320.5,
    Description: "Módulos de Expansão de Telemetria (4 un.)",
  },
  {
    Id: "801Dn000002aBcFEAU",
    OrderNumber: "00001104",
    EffectiveDate: "2026-11-20",
    Status: "Em Processamento",
    TotalAmount: 3190.0,
    Description: "Renovação Anual de Licenças Cloud",
  },
];

// Simula registros iniciais do objeto Case
const INITIAL_CASES = [
  {
    Id: "500Dn000004kLmNIAU",
    CaseNumber: "00001201",
    Subject: "Divergência na nota fiscal do pedido #00001042",
    Description: "O valor do frete destacado na NF veio diferente da proposta comercial.",
    Status: "Em Análise",
    Priority: "High",
    Origin: "Web Portal",
    CreatedDate: "2026-11-15T14:20:00Z",
  },
  {
    Id: "500Dn000004kLmOIAU",
    CaseNumber: "00001188",
    Subject: "Solicitação de manual técnico de instalação",
    Description: "Precisamos do esquema elétrico atualizado da linha v3.",
    Status: "Closed",
    Priority: "Low",
    Origin: "Web Portal",
    CreatedDate: "2026-11-04T09:10:00Z",
  },
];

const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

function loadCases() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CASES));
    return INITIAL_CASES;
  }
  return JSON.parse(saved);
}

// Equivalente a: GET /services/data/v60.0/sobjects/Account/{id}
export async function getAccountInfo() {
  await delay(250);
  return MOCK_ACCOUNT;
}

// Equivalente a: GET /services/data/v60.0/query/?q=SELECT+...+FROM+Order
export async function getOrders() {
  await delay(350);
  return MOCK_ORDERS;
}

// Equivalente a: GET /services/data/v60.0/query/?q=SELECT+...+FROM+Case
export async function getCases() {
  await delay(350);
  return loadCases();
}

// Equivalente a: POST /services/data/v60.0/sobjects/Case
export async function createCase({ subject, description, priority }) {
  await delay(500);
  const currentCases = loadCases();

  const nextNumber = String(1202 + currentCases.length).padStart(8, "0");
  const newCase = {
    Id: `500Dn00000${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
    CaseNumber: nextNumber,
    Subject: subject,
    Description: description,
    Status: "New",
    Priority: priority,
    Origin: "Web Portal",
    CreatedDate: new Date().toISOString(),
  };

  const updated = [newCase, ...currentCases];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return newCase;
}