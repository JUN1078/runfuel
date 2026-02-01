import { useEffect, useState } from 'react';
import { Plus, Sparkles, Calendar, MapPin, Mountain, Flag, CheckCircle2, Circle } from 'lucide-react';
import { trainingApi } from '../../api/training';
import type { TrainingPlan, Race, TrainingSession } from '../../types/training';

const sessionTypeLabels: Record<string, { label: string; color: string; emoji: string }> = {
  easy_run: { label: 'Easy Run', color: '#22c55e', emoji: '🏃' },
  tempo: { label: 'Tempo', color: '#f59e0b', emoji: '⚡' },
  interval: { label: 'Interval', color: '#ef4444', emoji: '🔥' },
  long_run: { label: 'Long Run', color: '#3b82f6', emoji: '🛤️' },
  recovery: { label: 'Recovery', color: '#a855f7', emoji: '🧘' },
  rest: { label: 'Rest', color: '#64748b', emoji: '😴' },
  strength: { label: 'Strength', color: '#f97316', emoji: '💪' },
  cross_training: { label: 'Cross Train', color: '#06b6d4', emoji: '🚴' },
  race: { label: 'Race', color: '#fbbf24', emoji: '🏆' },
  trail: { label: 'Trail', color: '#16a34a', emoji: '⛰️' },
};

export function TrainingPage() {
  const [tab, setTab] = useState<'plan' | 'races'>('plan');
  const [plans, setPlans] = useState<TrainingPlan[]>([]);
  const [races, setRaces] = useState<Race[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewRace, setShowNewRace] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [raceForm, setRaceForm] = useState({ name: '', race_date: '', category: '', distance_km: '', location: '', target_time: '', elevation_gain_m: '' });
  const [genForm, setGenForm] = useState({ weeks: '12', race_name: '', race_distance_km: '', current_weekly_km: '' });
  const [showGenerate, setShowGenerate] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [p, r] = await Promise.allSettled([trainingApi.getPlans(), trainingApi.getRaces()]);
        if (p.status === 'fulfilled') setPlans(p.value.data);
        if (r.status === 'fulfilled') setRaces(r.value.data);
      } finally { setLoading(false); }
    };
    fetch();
  }, []);

  const handleAddRace = async () => {
    try {
      await trainingApi.createRace({
        name: raceForm.name,
        race_date: raceForm.race_date,
        category: raceForm.category as any || undefined,
        distance_km: raceForm.distance_km ? Number(raceForm.distance_km) : undefined,
        location: raceForm.location || undefined,
        target_time: raceForm.target_time || undefined,
        elevation_gain_m: raceForm.elevation_gain_m ? Number(raceForm.elevation_gain_m) : undefined,
      } as any);
      const { data } = await trainingApi.getRaces();
      setRaces(data);
      setShowNewRace(false);
      setRaceForm({ name: '', race_date: '', category: '', distance_km: '', location: '', target_time: '', elevation_gain_m: '' });
    } catch {}
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await trainingApi.generatePlan({
        weeks: Number(genForm.weeks) || 12,
        race_name: genForm.race_name || undefined,
        race_distance_km: genForm.race_distance_km ? Number(genForm.race_distance_km) : undefined,
        current_weekly_km: genForm.current_weekly_km ? Number(genForm.current_weekly_km) : undefined,
      });
      const { data } = await trainingApi.getPlans();
      setPlans(data);
      setShowGenerate(false);
    } finally { setGenerating(false); }
  };

  const handleToggleSession = async (session: TrainingSession) => {
    try {
      await trainingApi.updateSession(session.id, { completed: !session.completed });
      const { data } = await trainingApi.getPlans();
      setPlans(data);
    } catch {}
  };

  if (loading) return (
    <div className="space-y-4">
      <div className="skeleton h-8 w-40" />
      <div className="skeleton h-32" />
      <div className="skeleton h-32" />
    </div>
  );

  const activePlan = plans.find(p => p.is_active);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold tracking-tight">Training</h1>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-[var(--color-surface)] p-1">
        {(['plan', 'races'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 rounded-lg py-2 text-xs font-semibold capitalize transition-all ${
              tab === t ? 'bg-[var(--color-primary)] text-white' : 'text-[var(--color-text-muted)]'
            }`}
          >{t === 'plan' ? 'Training Plan' : 'Races'}</button>
        ))}
      </div>

      {/* PLAN TAB */}
      {tab === 'plan' && (
        <div className="space-y-4">
          {/* Generate button */}
          <button onClick={() => setShowGenerate(true)} className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-sm">
            <Sparkles size={16} /> AI Generate Training Plan
          </button>

          {/* Generate form */}
          {showGenerate && (
            <div className="glass-card p-4 space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Sparkles size={14} className="text-purple-400" /> Generate AI Plan
              </h3>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Race Name</label>
                <input placeholder="e.g. Boston Marathon (optional)" value={genForm.race_name} onChange={e => setGenForm({...genForm, race_name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Distance (km)</label>
                  <input type="number" placeholder="42.2" value={genForm.race_distance_km} onChange={e => setGenForm({...genForm, race_distance_km: e.target.value})} />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Weeks</label>
                  <input type="number" placeholder="12" value={genForm.weeks} onChange={e => setGenForm({...genForm, weeks: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Current Weekly KM</label>
                <input type="number" placeholder="e.g. 30" value={genForm.current_weekly_km} onChange={e => setGenForm({...genForm, current_weekly_km: e.target.value})} />
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={() => setShowGenerate(false)} className="btn-secondary flex-1 py-2.5 text-sm">Cancel</button>
                <button onClick={handleGenerate} disabled={generating} className="btn-primary flex-1 py-2.5 text-sm disabled:opacity-50">
                  {generating ? 'Generating...' : 'Generate'}
                </button>
              </div>
            </div>
          )}

          {/* Active plan */}
          {activePlan ? (
            <div className="space-y-3">
              <div className="glass-card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{activePlan.name}</h3>
                    <div className="text-xs text-[var(--color-text-muted)]">
                      {activePlan.start_date} — {activePlan.end_date} · {activePlan.weeks} weeks
                    </div>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    activePlan.source === 'ai_generated' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'
                  }`}>
                    {activePlan.source === 'ai_generated' ? 'AI' : 'Manual'}
                  </span>
                </div>
                {/* Progress */}
                {(() => {
                  const done = activePlan.sessions.filter(s => s.completed).length;
                  const total = activePlan.sessions.filter(s => s.session_type !== 'rest').length;
                  const pct = total > 0 ? (done / total) * 100 : 0;
                  return (
                    <div className="mt-3">
                      <div className="flex justify-between text-[10px] text-[var(--color-text-muted)] mb-1">
                        <span>{done}/{total} sessions</span>
                        <span>{Math.round(pct)}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[var(--color-surface-light)] overflow-hidden">
                        <div className="progress-bar h-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Sessions by week */}
              {Array.from(new Set(activePlan.sessions.map(s => s.week_number))).sort((a,b) => a-b).map(week => {
                const weekSessions = activePlan.sessions.filter(s => s.week_number === week);
                return (
                  <div key={week}>
                    <h4 className="text-xs font-semibold text-[var(--color-text-muted)] mb-2 uppercase tracking-wider">Week {week}</h4>
                    <div className="space-y-1.5">
                      {weekSessions.map(session => {
                        const info = sessionTypeLabels[session.session_type] || { label: session.session_type, color: '#64748b', emoji: '🏃' };
                        return (
                          <div key={session.id} className="glass-card p-3 flex items-center gap-3">
                            <button onClick={() => handleToggleSession(session)} className="shrink-0">
                              {session.completed
                                ? <CheckCircle2 size={20} className="text-[var(--color-primary)]" />
                                : <Circle size={20} className="text-[var(--color-text-muted)]" />
                              }
                            </button>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span>{info.emoji}</span>
                                <span className={`text-sm font-medium ${session.completed ? 'line-through opacity-50' : ''}`}>
                                  {info.label}
                                </span>
                              </div>
                              {session.description && (
                                <p className="text-[11px] text-[var(--color-text-muted)] truncate">{session.description}</p>
                              )}
                            </div>
                            <div className="text-right shrink-0">
                              {session.target_distance_km && (
                                <div className="text-xs font-medium">{session.target_distance_km}km</div>
                              )}
                              <div className="text-[10px] text-[var(--color-text-muted)] capitalize">{session.day_of_week.slice(0,3)}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="glass-card p-8 text-center">
              <Calendar size={32} className="mx-auto mb-3 text-[var(--color-text-muted)]" />
              <p className="font-medium">No active training plan</p>
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">Generate one with AI or create manually</p>
            </div>
          )}
        </div>
      )}

      {/* RACES TAB */}
      {tab === 'races' && (
        <div className="space-y-4">
          <button onClick={() => setShowNewRace(true)} className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-sm">
            <Plus size={16} /> Add Race
          </button>

          {showNewRace && (
            <div className="glass-card p-4 space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Flag size={14} className="text-[var(--color-primary)]" /> New Race
              </h3>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Race Name *</label>
                <input placeholder="e.g. Berlin Marathon" value={raceForm.name} onChange={e => setRaceForm({...raceForm, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Date *</label>
                  <input type="date" value={raceForm.race_date} onChange={e => setRaceForm({...raceForm, race_date: e.target.value})} />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Category</label>
                  <select value={raceForm.category} onChange={e => setRaceForm({...raceForm, category: e.target.value})}>
                    <option value="">Select...</option>
                    <option value="5k">5K</option>
                    <option value="10k">10K</option>
                    <option value="half_marathon">Half Marathon</option>
                    <option value="marathon">Marathon</option>
                    <option value="ultra_50k">Ultra 50K</option>
                    <option value="ultra_100k">Ultra 100K</option>
                    <option value="trail">Trail</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Distance (km)</label>
                  <input type="number" placeholder="42.2" value={raceForm.distance_km} onChange={e => setRaceForm({...raceForm, distance_km: e.target.value})} />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Elevation (m)</label>
                  <input type="number" placeholder="500" value={raceForm.elevation_gain_m} onChange={e => setRaceForm({...raceForm, elevation_gain_m: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Target Time</label>
                  <input placeholder="e.g. 3:30:00" value={raceForm.target_time} onChange={e => setRaceForm({...raceForm, target_time: e.target.value})} />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Location</label>
                  <input placeholder="e.g. Berlin, DE" value={raceForm.location} onChange={e => setRaceForm({...raceForm, location: e.target.value})} />
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={() => setShowNewRace(false)} className="btn-secondary flex-1 py-2.5 text-sm">Cancel</button>
                <button onClick={handleAddRace} disabled={!raceForm.name || !raceForm.race_date} className="btn-primary flex-1 py-2.5 text-sm disabled:opacity-50">Save</button>
              </div>
            </div>
          )}

          {/* Race list */}
          {races.length > 0 ? (
            <div className="space-y-2">
              {races.map(race => {
                const isUpcoming = race.status === 'upcoming';
                const daysUntil = isUpcoming ? Math.ceil((new Date(race.race_date).getTime() - Date.now()) / 86400000) : null;
                return (
                  <div key={race.id} className="glass-card p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Flag size={14} className={isUpcoming ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'} />
                          <span className="font-semibold">{race.name}</span>
                        </div>
                        <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-[var(--color-text-muted)]">
                          <span className="flex items-center gap-1"><Calendar size={10} /> {race.race_date}</span>
                          {race.distance_km && <span className="flex items-center gap-1"><MapPin size={10} /> {race.distance_km}km</span>}
                          {race.elevation_gain_m && <span className="flex items-center gap-1"><Mountain size={10} /> {race.elevation_gain_m}m</span>}
                          {race.location && <span>{race.location}</span>}
                        </div>
                        {race.target_time && <div className="mt-1 text-xs text-[var(--color-text-muted)]">Target: {race.target_time}</div>}
                      </div>
                      <div className="text-right">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          isUpcoming ? 'bg-green-500/10 text-green-400' : race.status === 'completed' ? 'bg-blue-500/10 text-blue-400' : 'bg-red-500/10 text-red-400'
                        }`}>{race.status}</span>
                        {daysUntil != null && daysUntil > 0 && (
                          <div className="mt-1 text-xs font-medium text-[var(--color-primary)]">{daysUntil}d</div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="glass-card p-8 text-center">
              <Flag size={32} className="mx-auto mb-3 text-[var(--color-text-muted)]" />
              <p className="font-medium">No races yet</p>
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">Add upcoming races to plan your training</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
