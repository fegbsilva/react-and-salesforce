// src/App.jsx
import { useEffect, useState } from "react";
import {
  getAccountInfo,
  getOrders,
  getCases,
  createCase,
} from "./services/salesforceMockService";
import "./App.css";

export default function App() {
  const [account, setAccount] = useState(null);
  const [orders, setOrders] = useState([]);
  const [cases, setCases] = useState([]);
  const [activeTab, setActiveTab] = useState("orders");
  const [loading, setLoading] = useState(true);

  // Estado do formulário de novo Case
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [submitting, setSubmitting] = useState(false);
  const [lastApiLog, setLastApiLog] = useState(
    "GET /services/data/v60.0/query/?q=SELECT+Id,OrderNumber,Status+FROM+Order"
  );

  useEffect(() => {
    async function loadPortalData() {
      setLoading(true);
      const [accData, ordersData, casesData] = await Promise.all([
        getAccountInfo(),
        getOrders(),
        getCases(),
      ]);
      setAccount(accData);
      setOrders(ordersData);
      setCases(casesData);
      setLoading(false);
    }
    loadPortalData();
  }, []);

  async function handleCreateCase(e) {
    e.preventDefault();
    if (!subject.trim()) return;

    setSubmitting(true);
    const created = await createCase({ subject, description, priority });
    setCases((prev) => [created, ...prev]);
    setLastApiLog(
      `POST /services/data/v60.0/sobjects/Case -> 201 Created (Id: ${created.Id})`
    );
    setSubject("");
    setDescription("");
    setPriority("Medium");
    setSubmitting(false);
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Sincronizando dados com Salesforce CRM...</p>
      </div>
    );
  }

  return (
    <div className="portal-container">
      {/* Cabeçalho com dados do objeto Account */}
      <header className="portal-header">
        <div>
          <span className="badge-sf">Salesforce Customer Portal • Demo</span>
          <h1>{account.Name}</h1>
          <p className="subtitle">
            Código: <strong>{account.AccountNumber}</strong> •{" "}
            {account.BillingCity}/{account.BillingState} • Plano:{" "}
            <strong>{account.SLA__c}</strong>
          </p>
        </div>
        <div className="account-id-box">
          <span>Account ID (CRM)</span>
          <code>{account.Id}</code>
        </div>
      </header>

      {/* Cards de resumo */}
      <section className="kpi-grid">
        <div className="kpi-card">
          <span>Pedidos Totais (Order)</span>
          <strong>{orders.length}</strong>
        </div>
        <div className="kpi-card">
          <span>Chamados Abertos (Case)</span>
          <strong>{cases.filter((c) => c.Status !== "Closed").length}</strong>
        </div>
        <div className="kpi-card">
          <span>Status da Integração</span>
          <strong className="status-online">● Conectado (Mock API)</strong>
        </div>
      </section>

      {/* Navegação por abas */}
      <nav className="tabs">
        <button
          className={activeTab === "orders" ? "tab active" : "tab"}
          onClick={() => {
            setActiveTab("orders");
            setLastApiLog(
              "GET /services/data/v60.0/query/?q=SELECT+Id,OrderNumber,Status,TotalAmount+FROM+Order"
            );
          }}
        >
          Meus Pedidos ({orders.length})
        </button>
        <button
          className={activeTab === "cases" ? "tab active" : "tab"}
          onClick={() => {
            setActiveTab("cases");
            setLastApiLog(
              "GET /services/data/v60.0/query/?q=SELECT+Id,CaseNumber,Subject,Status,Priority+FROM+Case"
            );
          }}
        >
          Chamados de Suporte ({cases.length})
        </button>
      </nav>

      {/* Conteúdo da Aba: Pedidos */}
      {activeTab === "orders" && (
        <section className="card">
          <h2>Pedidos Vinculados à Conta</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Nº Pedido</th>
                <th>Data</th>
                <th>Descrição</th>
                <th>Valor Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.Id}>
                  <td>
                    <code>#{order.OrderNumber}</code>
                  </td>
                  <td>{new Date(order.EffectiveDate).toLocaleDateString("pt-BR")}</td>
                  <td>{order.Description}</td>
                  <td>
                    {order.TotalAmount.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </td>
                  <td>
                    <span className={`pill pill-${order.Status.toLowerCase().replace(/\s+/g, "-")}`}>
                      {order.Status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* Conteúdo da Aba: Chamados */}
      {activeTab === "cases" && (
        <div className="cases-layout">
          <section className="card">
            <h2>Abrir Novo Chamado (Objeto Case)</h2>
            <form onSubmit={handleCreateCase} className="case-form">
              <label>
                Assunto (Subject)
                <input
                  type="text"
                  placeholder="Ex.: Dúvida sobre faturamento ou suporte técnico"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </label>

              <label>
                Prioridade (Priority)
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="Low">Baixa (Low)</option>
                  <option value="Medium">Média (Medium)</option>
                  <option value="High">Alta (High)</option>
                </select>
              </label>

              <label>
                Descrição Detalhada (Description)
                <textarea
                  rows="3"
                  placeholder="Descreva sua solicitação..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </label>

              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? "Enviando ao Salesforce..." : "Registrar Chamado"}
              </button>
            </form>
          </section>

          <section className="card">
            <h2>Histórico de Chamados</h2>
            <div className="case-list">
              {cases.map((item) => (
                <article key={item.Id} className="case-item">
                  <div className="case-item-header">
                    <code>Case #{item.CaseNumber}</code>
                    <span className={`pill priority-${item.Priority.toLowerCase()}`}>
                      {item.Priority}
                    </span>
                    <span className="case-status">{item.Status}</span>
                  </div>
                  <h3>{item.Subject}</h3>
                  {item.Description && <p>{item.Description}</p>}
                  <small>
                    Aberto em {new Date(item.CreatedDate).toLocaleString("pt-BR")} • Origem: {item.Origin}
                  </small>
                </article>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Barra inferior didática mostrando a chamada REST equivalente */}
      <footer className="api-inspector">
        <span>Última operação Salesforce REST API simulada:</span>
        <code>{lastApiLog}</code>
      </footer>
    </div>
  );
}