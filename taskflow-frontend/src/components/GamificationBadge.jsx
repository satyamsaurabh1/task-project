import { Award, Zap, Target, Flame, Star, Trophy } from 'lucide-react';

const BADGE_DEFS = [
    { id: 'first_project', icon: <Star size={18} />, label: 'First Project', desc: 'Created your first project', check: (s) => s.totalProjects >= 1 },
    { id: 'five_tasks', icon: <Target size={18} />, label: '5 Tasks Done', desc: 'Completed 5 tasks', check: (s) => s.completedTasks >= 5 },
    { id: 'ten_tasks', icon: <Zap size={18} />, label: '10 Tasks Done', desc: 'Completed 10 tasks', check: (s) => s.completedTasks >= 10 },
    { id: 'twenty_five', icon: <Flame size={18} />, label: '25 Tasks', desc: 'Completed 25 tasks', check: (s) => s.completedTasks >= 25 },
    { id: 'fifty_tasks', icon: <Trophy size={18} />, label: 'Half Century', desc: 'Completed 50 tasks', check: (s) => s.completedTasks >= 50 },
    { id: 'five_projects', icon: <Award size={18} />, label: 'Team Builder', desc: 'Created 5 projects', check: (s) => s.totalProjects >= 5 },
];

const GamificationBadge = ({ stats }) => {
    if (!stats) return null;

    const earned = BADGE_DEFS.filter(b => b.check(stats));
    const locked = BADGE_DEFS.filter(b => !b.check(stats));

    return (
        <div className="gamification-section" id="gamification-badges">
            <h3><Award size={18} /> Achievements</h3>
            <div className="badge-grid">
                {earned.map(b => (
                    <div key={b.id} className="achievement-badge achievement-badge--earned" title={b.desc}>
                        <div className="achievement-icon">{b.icon}</div>
                        <span>{b.label}</span>
                    </div>
                ))}
                {locked.map(b => (
                    <div key={b.id} className="achievement-badge achievement-badge--locked" title={b.desc}>
                        <div className="achievement-icon">{b.icon}</div>
                        <span>{b.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GamificationBadge;
