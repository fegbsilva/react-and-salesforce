import { useEffect, useState } from "react";

const KANBAN_STORAGE_KEY = "sf_demo_kanban_cards_v1";

const COLUMNS = [
  { id: "todo", title: "A Fazer" },
  { id: "doing", title: "Em Progresso" },
  { id: "done", title: "Concluído" },
];

const INITIAL_CARDS = [
  {
    id: "card-1",
    title: "Componentizar elementos do App.jsx",
    description: "Verificar se há elementos passíveis de componentização no App.jsx e realizar as devidas alterações",
    column: "todo",
    priority: "High",
    tag: "Order",
  },
  {
    id: "card-2",
    title: "Padronizar CSS global na aplicação",
    description: "Verificar se há css inline na aplicação e padronizá-los conforme as melhores práticas de desenvolvimento #00001201.",
    column: "todo",
    priority: "Medium",
    tag: "Case",
  },
  {
    id: "card-3",
    title: "Separar página do Kanban da página principal",
    description: "A página /kanban mostra o conteúdo da página principal + a página Kanban. O correto é mostrar o conteúdo da página principal no caminho '/' e o conteúdo da página Kanban no caminho '/kanban'.",
    column: "todo",
    priority: "Low",
    tag: "Suporte",
  },
];

export function KanbanBoard({ onLogAction }) {
  const [cards, setCards] = useState(() => {
    const saved = localStorage.getItem(KANBAN_STORAGE_KEY);
    if (!saved) {
      localStorage.setItem(KANBAN_STORAGE_KEY, JSON.stringify(INITIAL_CARDS));
      return INITIAL_CARDS;
    }
    return JSON.parse(saved);
  });

  // Estado do formulário de Create / Edit
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [column, setColumn] = useState("todo");
  const [priority, setPriority] = useState("Medium");
  const [tag, setTag] = useState("Operação");

  useEffect(() => {
    localStorage.setItem(KANBAN_STORAGE_KEY, JSON.stringify(cards));
  }, [cards]);

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setColumn("todo");
    setPriority("Medium");
    setTag("Operação");
  }

  function handleSaveCard(e) {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingId) {
      // UPDATE
      setCards((prev) =>
        prev.map((card) =>
          card.id === editingId
            ? { ...card, title, description, column, priority, tag }
            : card
        )
      );
      onLogAction?.(`KANBAN UPDATE -> Card "${title}" atualizado`);
      resetForm();
      return;
    }

    // CREATE
    const newCard = {
      id: `card-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      column,
      priority,
      tag: tag.trim() || "Geral",
    };

    setCards((prev) => [newCard, ...prev]);
    onLogAction?.(`KANBAN CREATE -> Novo card "${newCard.title}" em ${column}`);
    resetForm();
  }

  function handleStartEdit(card) {
    setEditingId(card.id);
    setTitle(card.title);
    setDescription(card.description);
    setColumn(card.column);
    setPriority(card.priority);
    setTag(card.tag);
  }

  function handleMoveCard(cardId, nextColumn) {
    setCards((prev) =>
      prev.map((card) =>
        card.id === cardId ? { ...card, column: nextColumn } : card
      )
    );
    onLogAction?.(`KANBAN MOVE -> Card ${cardId} movido para "${nextColumn}"`);
  }

  function handleDeleteCard(cardId) {
    setCards((prev) => prev.filter((card) => card.id !== cardId));
    if (editingId === cardId) resetForm();
    onLogAction?.(`KANBAN DELETE -> Card ${cardId} removido`);
  }

  return (
    <div className="kanban-page">
      {/* Formulário Create / Update */}
      <section className="card kanban-form-card">
        <h2>{editingId ? "Editar Card" : "Novo Card no Kanban"}</h2>
        <form onSubmit={handleSaveCard} className="kanban-form-grid">
          <label>
            Título
            <input
              type="text"
              placeholder="Ex.: Acompanhar entrega ou tratar pendência"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </label>

          <label>
            Coluna
            <select value={column} onChange={(e) => setColumn(e.target.value)}>
              {COLUMNS.map((col) => (
                <option key={col.id} value={col.id}>
                  {col.title}
                </option>
              ))}
            </select>
          </label>

          <label>
            Prioridade
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </label>

          <label>
            Tag / Contexto
            <input
              type="text"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="Ex.: Order, Case, SLA"
            />
          </label>

          <label className="kanban-full-col">
            Descrição
            <textarea
              rows="2"
              placeholder="Detalhes do card..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>

          <div className="kanban-form-actions kanban-full-col">
            <button type="submit" className="btn-primary">
              {editingId ? "Salvar Alterações" : "Adicionar Card"}
            </button>
            {editingId && (
              <button
                type="button"
                className="btn-secondary"
                onClick={resetForm}
              >
                Cancelar Edição
              </button>
            )}
          </div>
        </form>
      </section>

      {/* Colunas do Kanban */}
      <section className="kanban-columns">
        {COLUMNS.map((col) => {
          const colCards = cards.filter((c) => c.column === col.id);

          return (
            <div key={col.id} className="kanban-column">
              <div className="kanban-column-header">
                <h3>{col.title}</h3>
                <span className="kanban-count">{colCards.length}</span>
              </div>

              <div className="kanban-cards-list">
                {colCards.map((card) => (
                  <article key={card.id} className="kanban-card">
                    <div className="kanban-card-top">
                      <span className="kanban-tag">{card.tag}</span>
                      <span
                        className={`pill priority-${card.priority.toLowerCase()}`}
                      >
                        {card.priority}
                      </span>
                    </div>

                    <h4>{card.title}</h4>
                    {card.description && <p>{card.description}</p>}

                    <div className="kanban-card-controls">
                      <select
                        aria-label="Mover coluna"
                        value={card.column}
                        onChange={(e) =>
                          handleMoveCard(card.id, e.target.value)
                        }
                      >
                        {COLUMNS.map((targetCol) => (
                          <option key={targetCol.id} value={targetCol.id}>
                            Mover: {targetCol.title}
                          </option>
                        ))}
                      </select>

                      <div className="kanban-card-btns">
                        <button
                          type="button"
                          className="btn-ghost"
                          onClick={() => handleStartEdit(card)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="btn-danger-ghost"
                          onClick={() => handleDeleteCard(card.id)}
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  </article>
                ))}

                {colCards.length === 0 && (
                  <p className="kanban-empty">Nenhum card nesta coluna.</p>
                )}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}