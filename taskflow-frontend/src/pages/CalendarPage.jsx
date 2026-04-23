import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import AppShell from '../components/AppShell';
import Loader from '../components/Loader';
import DeadlineCountdown from '../components/DeadlineCountdown';
import * as projectService from '../services/projectService';
import * as taskService from '../services/taskService';

const CalendarPage = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                const projects = await projectService.getProjects();
                const allTasks = [];
                for (const p of projects) {
                    const ts = await taskService.getTasksByProject(p._id);
                    ts.forEach(t => allTasks.push({ ...t, projectTitle: p.title, projectId: p._id }));
                }
                setTasks(allTasks.filter(t => t.deadline));
            } catch { /* silent */ }
            finally { setLoading(false); }
        };
        load();
    }, []);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    const prev = () => setCurrentDate(new Date(year, month - 1, 1));
    const next = () => setCurrentDate(new Date(year, month + 1, 1));
    const today = () => setCurrentDate(new Date());

    const getTasksForDay = (day) => {
        return tasks.filter(t => {
            const d = new Date(t.deadline);
            return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
        });
    };

    const isToday = (day) => {
        const now = new Date();
        return now.getFullYear() === year && now.getMonth() === month && now.getDate() === day;
    };

    const selectedTasks = selectedDay ? getTasksForDay(selectedDay) : [];

    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(<div key={`empty-${i}`} className="cal-cell cal-cell--empty" />);
    for (let d = 1; d <= daysInMonth; d++) {
        const dayTasks = getTasksForDay(d);
        const hasOverdue = dayTasks.some(t => new Date(t.deadline) < new Date() && t.status !== 'completed');
        cells.push(
            <div
                key={d}
                className={`cal-cell ${isToday(d) ? 'cal-cell--today' : ''} ${selectedDay === d ? 'cal-cell--selected' : ''} ${hasOverdue ? 'cal-cell--overdue' : ''}`}
                onClick={() => setSelectedDay(d)}
            >
                <span className="cal-day-num">{d}</span>
                {dayTasks.length > 0 && (
                    <div className="cal-dots">
                        {dayTasks.slice(0, 3).map((t, i) => (
                            <span
                                key={i}
                                className={`cal-dot cal-dot--${t.priority}`}
                                title={t.title}
                            />
                        ))}
                        {dayTasks.length > 3 && <span className="cal-dot-more">+{dayTasks.length - 3}</span>}
                    </div>
                )}
            </div>
        );
    }

    return (
        <AppShell title="Calendar" subtitle="View tasks by deadline across all projects.">
            {loading ? <Loader label="Loading calendar" /> : (
                <div className="calendar-container">
                    <div className="cal-header">
                        <button className="icon-button" onClick={prev}><ChevronLeft size={18} /></button>
                        <h2>{monthName}</h2>
                        <button className="ghost-button" onClick={today} style={{ padding: '8px 14px', fontSize: '0.85rem' }}>Today</button>
                        <button className="icon-button" onClick={next}><ChevronRight size={18} /></button>
                    </div>

                    <div className="cal-weekdays">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                            <div key={d} className="cal-weekday">{d}</div>
                        ))}
                    </div>

                    <div className="cal-grid">{cells}</div>

                    {selectedDay && (
                        <div className="cal-detail-panel fade-in">
                            <h3>Tasks on {monthName.split(' ')[0]} {selectedDay}</h3>
                            {selectedTasks.length === 0 ? (
                                <p style={{ color: 'var(--muted)' }}>No tasks due on this day.</p>
                            ) : (
                                <div className="cal-task-list">
                                    {selectedTasks.map(t => (
                                        <div key={t._id} className={`cal-task-item cal-task-item--${t.priority}`}>
                                            <div>
                                                <strong>{t.title}</strong>
                                                <span className="cal-task-project">{t.projectTitle}</span>
                                            </div>
                                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                                <span className={`badge badge-${t.priority}`}>{t.priority}</span>
                                                <span className={`badge badge-${t.status === 'completed' ? 'low' : t.status === 'in-progress' ? 'medium' : 'high'}`}>
                                                    {t.status}
                                                </span>
                                                <DeadlineCountdown deadline={t.deadline} compact />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </AppShell>
    );
};

export default CalendarPage;
