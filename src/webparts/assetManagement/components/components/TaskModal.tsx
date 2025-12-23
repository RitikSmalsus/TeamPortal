
import React, { useState, useEffect } from 'react';
import { X, Calendar, User as UserIcon, AlertCircle, CheckSquare } from 'lucide-react';
import { User, Request, Task, TaskPriority, TaskStatus } from '../types';

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    request: Request;
    adminUsers: User[];
    onCreateTask: (task: Task) => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, request, adminUsers, onCreateTask }) => {
    const [assignedToId, setAssignedToId] = useState<string>('');
    const [priority, setPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
    const [dueDate, setDueDate] = useState<string>('');
    const [description, setDescription] = useState<string>('');

    useEffect(() => {
        if (isOpen) {
            // Default due date to 3 days from now
            const d = new Date();
            d.setDate(d.getDate() + 3);
            setDueDate(d.toISOString().split('T')[0]);
            setDescription(`Fulfillment required for ${request.type}: ${request.item}.\nRequested by: ${request.requestedBy.fullName}`);

            // Default to first admin if available
            if (adminUsers.length > 0) {
                setAssignedToId(String(adminUsers[0].id));
            }
        }
    }, [isOpen, request, adminUsers]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const assignedUser = adminUsers.find(u => String(u.id) === assignedToId) || null;

        const newTask: Task = {
            id: `task-${Date.now()}`,
            requestId: request.id,
            title: `Fulfill: ${request.item}`,
            assignedTo: assignedUser,
            status: TaskStatus.TODO,
            priority: priority,
            dueDate: dueDate,
            description: description,
            createdDate: new Date().toISOString()
        };

        onCreateTask(newTask);
    };

    if (!isOpen) return null;

    return (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 1060 }} onClick={onClose}>
            <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit} className="modal-content border-0 shadow-lg">

                    <div className="modal-header border-bottom-0 bg-light p-4 rounded-top">
                        <div className="d-flex align-items-center gap-2">
                            <div className="bg-white p-2 rounded shadow-sm text-primary">
                                <CheckSquare size={20} />
                            </div>
                            <h5 className="modal-title fw-bold text-dark">Approve & Create Task</h5>
                        </div>
                        <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
                    </div>

                    <div className="modal-body p-4">
                        {/* Request Context Summary */}
                        <div className="alert alert-primary border-0 bg-primary-subtle shadow-sm mb-4">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                                <span className="fw-bold small text-primary text-uppercase" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>Request Context</span>
                                <span className="badge bg-primary text-white text-uppercase" style={{ fontSize: '9px' }}>{request.type}</span>
                            </div>
                            <p className="mb-1 fw-bold text-dark">{request.item}</p>
                            <p className="small text-primary mb-0 opacity-75">Requested by {request.requestedBy.fullName} on {request.requestDate}</p>
                        </div>

                        <div className="mb-3">
                            <label className="form-label small fw-bold text-secondary text-uppercase" style={{ fontSize: '11px' }}>Assign To (Admin)</label>
                            <div className="input-group input-group-sm">
                                <span className="input-group-text bg-light border-light-subtle text-secondary"><UserIcon size={16} /></span>
                                <select
                                    value={assignedToId}
                                    onChange={(e) => setAssignedToId(e.target.value)}
                                    className="form-select"
                                    required
                                >
                                    {adminUsers.map(u => (
                                        <option key={u.id} value={String(u.id)}>{u.fullName}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="row g-3 mb-3">
                            <div className="col-md-6">
                                <label className="form-label small fw-bold text-secondary text-uppercase" style={{ fontSize: '11px' }}>Priority</label>
                                <select
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                                    className="form-select form-select-sm"
                                >
                                    <option value={TaskPriority.HIGH}>High</option>
                                    <option value={TaskPriority.MEDIUM}>Medium</option>
                                    <option value={TaskPriority.LOW}>Low</option>
                                </select>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small fw-bold text-secondary text-uppercase" style={{ fontSize: '11px' }}>Due Date</label>
                                <div className="input-group input-group-sm">
                                    <input
                                        type="date"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        className="form-control"
                                        required
                                    />
                                    <span className="input-group-text bg-light border-light-subtle text-secondary"><Calendar size={16} /></span>
                                </div>
                            </div>
                        </div>

                        <div className="mb-0">
                            <label className="form-label small fw-bold text-secondary text-uppercase" style={{ fontSize: '11px' }}>Task Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={4}
                                className="form-control text-sm"
                                placeholder="E.g. Verify stock, order from vendor, configure device..."
                            />
                        </div>
                    </div>

                    <div className="modal-footer border-top-0 bg-light p-3 rounded-bottom">
                        <button type="button" onClick={onClose} className="btn btn-sm btn-link text-secondary text-decoration-none fw-bold">Cancel</button>
                        <button type="submit" className="btn btn-sm btn-primary fw-bold px-4 shadow-sm d-flex align-items-center gap-2">
                            <CheckSquare size={16} /> Confirm Approval
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TaskModal;
