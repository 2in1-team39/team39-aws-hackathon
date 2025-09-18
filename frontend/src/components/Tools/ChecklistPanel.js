import React, { useState } from 'react';
import './ChecklistPanel.css';

const ChecklistPanel = () => {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');

  const addItem = () => {
    if (newItem.trim()) {
      const item = {
        id: Date.now(),
        text: newItem.trim(),
        completed: false
      };
      setItems([...items, item]);
      setNewItem('');
    }
  };

  const toggleItem = (id) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const deleteItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const startEdit = (id, text) => {
    setEditingId(id);
    setEditingText(text);
  };

  const saveEdit = () => {
    if (editingText.trim()) {
      setItems(items.map(item =>
        item.id === editingId ? { ...item, text: editingText.trim() } : item
      ));
    }
    setEditingId(null);
    setEditingText('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingText('');
  };

  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter') {
      action();
    }
  };

  return (
    <div className="checklist-panel">
      <h4>체크리스트</h4>

      {/* 새 항목 추가 */}
      <div className="add-item-section">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyPress={(e) => handleKeyPress(e, addItem)}
          placeholder="새 할 일을 입력하세요..."
          className="add-input"
        />
        <button onClick={addItem} className="add-btn">
          추가
        </button>
      </div>

      {/* 체크리스트 항목들 */}
      <div className="checklist-items">
        {items.length === 0 ? (
          <div className="empty-state">
            할 일을 추가해보세요!
          </div>
        ) : (
          items.map(item => (
            <div key={item.id} className={`checklist-item ${item.completed ? 'completed' : ''}`}>
              <div className="item-content">
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => toggleItem(item.id)}
                  className="item-checkbox"
                />

                {editingId === item.id ? (
                  <input
                    type="text"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, saveEdit)}
                    onBlur={saveEdit}
                    className="edit-input"
                    autoFocus
                  />
                ) : (
                  <span
                    className="item-text"
                    onDoubleClick={() => startEdit(item.id, item.text)}
                  >
                    {item.text}
                  </span>
                )}
              </div>

              <div className="item-actions">
                {editingId === item.id ? (
                  <>
                    <button onClick={saveEdit} className="save-btn">
                      ✓
                    </button>
                    <button onClick={cancelEdit} className="cancel-btn">
                      ✕
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startEdit(item.id, item.text)}
                      className="edit-btn"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="delete-btn"
                    >
                      🗑️
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 진행률 표시 */}
      {items.length > 0 && (
        <div className="progress-section">
          <div className="progress-text">
            완료: {items.filter(item => item.completed).length} / {items.length}
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${(items.filter(item => item.completed).length / items.length) * 100}%`
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChecklistPanel;