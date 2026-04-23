/**
 * Heuristic-based AI task suggestions.
 * No API key needed — analyzes task patterns locally.
 */

export const generateSuggestions = (tasks = [], stats = {}) => {
    const suggestions = [];
    const now = new Date();
    const safeStats = stats || {};

    // Overdue high-priority tasks
    const overdueHigh = tasks.filter(t =>
        t.deadline && new Date(t.deadline) < now && t.status !== 'completed' && t.priority === 'high'
    );
    if (overdueHigh.length > 0) {
        suggestions.push({
            type: 'critical',
            icon: '🔴',
            title: `${overdueHigh.length} overdue high-priority task${overdueHigh.length > 1 ? 's' : ''}`,
            message: `Tackle ${overdueHigh.map(t => `"${t.title}"`).slice(0, 3).join(', ')} immediately.`,
            priority: 100
        });
    }

    // Tasks due today
    const dueToday = tasks.filter(t => {
        if (!t.deadline || t.status === 'completed') return false;
        const dl = new Date(t.deadline);
        return dl.toDateString() === now.toDateString();
    });
    if (dueToday.length > 0) {
        suggestions.push({
            type: 'warning',
            icon: '⏰',
            title: `${dueToday.length} task${dueToday.length > 1 ? 's' : ''} due today`,
            message: `Focus on ${dueToday.map(t => `"${t.title}"`).slice(0, 3).join(', ')} to stay on track.`,
            priority: 80
        });
    }

    // Unassigned tasks
    const unassigned = tasks.filter(t => !t.assignedTo && t.status !== 'completed');
    if (unassigned.length > 0) {
        suggestions.push({
            type: 'info',
            icon: '👤',
            title: `${unassigned.length} unassigned task${unassigned.length > 1 ? 's' : ''}`,
            message: 'Assign team members to improve accountability.',
            priority: 40
        });
    }

    // Lots of pending tasks
    const pending = tasks.filter(t => t.status === 'pending');
    if (pending.length > 5) {
        suggestions.push({
            type: 'info',
            icon: '📋',
            title: 'Task backlog growing',
            message: `${pending.length} tasks are still pending. Consider prioritizing or breaking them down.`,
            priority: 30
        });
    }

    // Completion rate insight
    if ((safeStats.totalTasks || 0) > 0) {
        const rate = Math.round(((safeStats.completedTasks || 0) / safeStats.totalTasks) * 100);
        if (rate >= 75) {
            suggestions.push({
                type: 'success',
                icon: '🎉',
                title: `${rate}% completion rate — great work!`,
                message: 'Your team is making excellent progress.',
                priority: 10
            });
        } else if (rate < 30 && safeStats.totalTasks >= 5) {
            suggestions.push({
                type: 'warning',
                icon: '📊',
                title: `Only ${rate}% tasks completed`,
                message: 'Consider reviewing priorities and blockers with your team.',
                priority: 60
            });
        }
    }

    // No deadline set
    const noDeadline = tasks.filter(t => !t.deadline && t.status !== 'completed');
    if (noDeadline.length >= 3) {
        suggestions.push({
            type: 'info',
            icon: '📅',
            title: `${noDeadline.length} tasks without deadlines`,
            message: 'Setting deadlines improves accountability and planning.',
            priority: 20
        });
    }

    return suggestions.sort((a, b) => b.priority - a.priority);
};
