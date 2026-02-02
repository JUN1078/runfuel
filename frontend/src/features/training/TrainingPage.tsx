import { useEffect, useState } from 'react';
import { Plus, Sparkles, Calendar, MapPin, Mountain, Flag, CheckCircle2, Circle, Edit3, Trash2 } from 'lucide-react';
import { trainingApi } from '../../api/training';
import type { TrainingPlan, Race, TrainingSession, DayOfWeek, SessionType } from '../../types/training';

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

const days: DayOfWeek[] = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
const sessionTypes: SessionType[] = ['easy_run','tempo','interval','long_run','recovery','rest','strength','cross_training','trail'];

export function TrainingPage() {
  const [tab, setTab] = useState<'plan' | 'races'>('plan');
  const [plans, setPlans] = useState<TrainingPlan[]>([]);
  const [races, setRaces] = useState<Race[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewRace, setShowNewRace] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [raceForm, setRaceForm] = useState({ name: '', race_date: '', category: '', distance_km: '', location: '', target_time: '', elevation_gain_m: '' });
  const [genForm, setGenForm] = useState({
    weeks: '12', race_name: '', race_distance_km: '', current_weekly_km: '',
    target_time: '', elevation_gain: '', best_5k: '', best_10k: '', best_half: '', best_marathon: '',
    avg_long_run: '',
  });
  const [showGenerate, setShowGenerate] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [createMode, setCreateMode] = useState<'ai' | 'manual' | null>(null);

  // Manual plan state
  const [manualForm, setManualForm] = useState({ name: '', weeks: '4', start_date: '' });
  const [manualSessions, setManualSessions] = useState<
    { day: DayOfWeek; type: SessionType; distance_km: string; description: string }[]
  >([{ day: 'monday', type: 'easy_run', distance_km: '', description: '' }]);

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
        name: raceForm.name, race_date: raceForm.race_date,
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
        target_time: genForm.target_time || undefined,
        current_weekly_km: genForm.current_weekly_km ? Number(genForm.current_weekly_km) : undefined,
        elevation_gain: genForm.elevation_gain ? Number(genForm.elevation_gain) : undefined,
        best_5k: genForm.best_5k || undefined,
        best_10k: genForm.best_10k || undefined,
        best_half: genForm.best_half || undefined,
        best_marathon: genForm.best_marathon || undefined,
        avg_long_run: genForm.avg_long_run ? Number(genForm.avg_long_run) : undefined,
      });
      const { data } = await trainingApi.getPlans();
      setPlans(data);
      setShowGenerate(false);
      setCreateMode(null);
    } finally { setGenerating(false); }
  };

  const handleCreateManual = async () => {
    setGenerating(true);
    try {
      await trainingApi.createPlan({
        name: manualForm.name || 'Custom Plan',
        weeks: Number(manualForm.weeks) || 4,
        start_date: manualForm.start_date || new Date().toISOString().split('T')[0],
        sessions_template: manualSessions.map(s => ({
          day_of_week: s.day, session_type: s.type,
          target_distance_km: s.distance_km ? Number(s.distance_km) : null,
          description: s.description || null,
        })),
      });
      const { data } = await trainingApi.getPlans();
      setPlans(data);
      setShowManual(false);
      setCreateMode(null);
    } catch {} finally { setGenerating(false); }
  };

  const handleToggleSession = async (session: TrainingSession) => {
    try {
      await trainingApi.updateSession(session.id, { completed: !session.completed });
      const { data } = await trainingApi.getPlans();
      setPlans(data);
    } catch {}
  };

  const addManualSession = () => {
    setManualSessions([...manualSessions, { day: 'monday', type: 'easy_run', distance_km: '', description: '' }]);
  };
  const removeManualSession = (i: number) => setManualSessions(manualSessions.filter((_, idx) => idx !== i));
  const updateManualSession = (i: number, field: string, value: string) => {
    const updated = [...manualSessions];
    (updated[i] as any)[field] = value;
    setManualSessions(updated);
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
    <div className="space-y-7">
      <h1 className="text-2xl font-light tracking-tight">Training</h1>

      <div className="tab-group">
        {(['plan', 'races'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={tab === t ? 'tab-item-active' : 'tab-item'}
          >{t === 'plan' ? 'Training Plan' : 'Races'}</button>
        ))}
      </div>

      {/* PLAN TAB */}
      {tab === 'plan' && (
        <div className="space-y-5">
          {!createMode && !showGenerate && !showManual && (
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => { setCreateMode('ai'); setShowGenerate(true); }}
                className="btn-primary flex items-center justify-center gap-2 py-3 text-sm">
                <Sparkles size={16} /> AI Generate
              </button>
              <button onClick={() => { setCreateMode('manual'); setShowManual(true); }}
                className="btn-secondary flex items-center justify-center gap-2 py-3 text-sm">
                <Edit3 size={16} /> Manual Plan
              </button>
            </div>
          )}

          {/* AI Generate form */}
          {showGenerate && (
            <div className="glass-card p-4 space-y-4">
              <h3 className="text-sm font-normal flex items-center gap-2">
                <Sparkles size={14} className="text-purple-400" /> AI Training Plan
              </h3>
              <div className="space-y-3">
                <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">Race Target</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-[11px] text-[var(--color-text-muted)]">Race Name</label>
                    <input placeholder="e.g. UTMB, Boston Marathon" value={genForm.race_name} onChange={e => setGenForm({...genForm, race_name: e.target.value})} />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] text-[var(--color-text-muted)]">Target Time</label>
                    <input placeholder="e.g. 3:30:00" value={genForm.target_time} onChange={e => setGenForm({...genForm, target_time: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="mb-1 block text-[11px] text-[var(--color-text-muted)]">Distance (km)</label>
                    <input type="number" placeholder="42.2" value={genForm.race_distance_km} onChange={e => setGenForm({...genForm, race_distance_km: e.target.value})} />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] text-[var(--color-text-muted)]">Elevation (m)</label>
                    <input type="number" placeholder="2500" value={genForm.elevation_gain} onChange={e => setGenForm({...genForm, elevation_gain: e.target.value})} />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] text-[var(--color-text-muted)]">Weeks</label>
                    <input type="number" placeholder="12" value={genForm.weeks} onChange={e => setGenForm({...genForm, weeks: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">Your Performance / Strava Stats</p>
                <p className="text-[11px] text-[var(--color-text-muted)]">Enter stats from Strava or your running log for a personalized plan</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-[11px] text-[var(--color-text-muted)]">Weekly KM</label>
                    <input type="number" placeholder="e.g. 62" value={genForm.current_weekly_km} onChange={e => setGenForm({...genForm, current_weekly_km: e.target.value})} />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] text-[var(--color-text-muted)]">Avg Long Run (km)</label>
                    <input type="number" placeholder="e.g. 25" value={genForm.avg_long_run} onChange={e => setGenForm({...genForm, avg_long_run: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="mb-1 block text-[11px] text-[var(--color-text-muted)]">Best 5K</label>
                    <input placeholder="25:49" value={genForm.best_5k} onChange={e => setGenForm({...genForm, best_5k: e.target.value})} />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] text-[var(--color-text-muted)]">Best 10K</label>
                    <input placeholder="55:44" value={genForm.best_10k} onChange={e => setGenForm({...genForm, best_10k: e.target.value})} />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] text-[var(--color-text-muted)]">Best Half</label>
                    <input placeholder="2:02:37" value={genForm.best_half} onChange={e => setGenForm({...genForm, best_half: e.target.value})} />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] text-[var(--color-text-muted)]">Best Marathon</label>
                    <input placeholder="8:15:08" value={genForm.best_marathon} onChange={e => setGenForm({...genForm, best_marathon: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button onClick={() => { setShowGenerate(false); setCreateMode(null); }} className="btn-secondary flex-1 py-2.5 text-sm">Cancel</button>
                <button onClick={handleGenerate} disabled={generating} className="btn-primary flex-1 flex items-center justify-center gap-2 py-2.5 text-sm disabled:opacity-50">
                  <Sparkles size={14} /> {generating ? 'Generating...' : 'Generate Plan'}
                </button>
              </div>
            </div>
          )}

          {/* Manual Plan form */}
          {showManual && (
            <div className="glass-card p-4 space-y-4">
              <h3 className="text-sm font-normal flex items-center gap-2">
                <Edit3 size={14} className="text-blue-400" /> Create Manual Plan
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block text-[11px] text-[var(--color-text-muted)]">Plan Name</label>
                  <input placeholder="e.g. Marathon Build" value={manualForm.name} onChange={e => setManualForm({...manualForm, name: e.target.value})} />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] text-[var(--color-text-muted)]">Start Date</label>
                  <input type="date" value={manualForm.start_date} onChange={e => setManualForm({...manualForm, start_date: e.target.value})} />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] text-[var(--color-text-muted)]">Weeks</label>
                  <input type="number" placeholder="4" value={manualForm.weeks} onChange={e => setManualForm({...manualForm, weeks: e.target.value})} />
                </div>
              </div>

              <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">Weekly Sessions</p>
              <div className="space-y-2">
                {manualSessions.map((s, i) => (
                  <div key={i} className="flex flex-wrap gap-2 items-end">
                    <div className="w-20">
                      <label className="mb-1 block text-[10px] text-[var(--color-text-muted)]">Day</label>
                      <select value={s.day} onChange={e => updateManualSession(i, 'day', e.target.value)}>
                        {days.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1,3)}</option>)}
                      </select>
                    </div>
                    <div className="flex-1 min-w-[120px]">
                      <label className="mb-1 block text-[10px] text-[var(--color-text-muted)]">Type</label>
                      <select value={s.type} onChange={e => updateManualSession(i, 'type', e.target.value)}>
                        {sessionTypes.map(t => {
                          const info = sessionTypeLabels[t];
                          return <option key={t} value={t}>{info?.emoji} {info?.label}</option>;
                        })}
                      </select>
                    </div>
                    <div className="w-16">
                      <label className="mb-1 block text-[10px] text-[var(--color-text-muted)]">KM</label>
                      <input type="number" placeholder="10" value={s.distance_km} onChange={e => updateManualSession(i, 'distance_km', e.target.value)} />
                    </div>
                    <div className="flex-1 min-w-[100px] hidden sm:block">
                      <label className="mb-1 block text-[10px] text-[var(--color-text-muted)]">Notes</label>
                      <input placeholder="Optional" value={s.description} onChange={e => updateManualSession(i, 'description', e.target.value)} />
                    </div>
                    <button onClick={() => removeManualSession(i)} className="rounded-lg p-2 hover:bg-white/5 mb-0.5">
                      <Trash2 size={14} className="text-[var(--color-text-muted)]" />
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={addManualSession} className="text-xs text-[var(--color-primary)] font-medium flex items-center gap-1">
                <Plus size={14} /> Add session
              </button>

              <div className="flex gap-2 pt-1">
                <button onClick={() => { setShowManual(false); setCreateMode(null); }} className="btn-secondary flex-1 py-2.5 text-sm">Cancel</button>
                <button onClick={handleCreateManual} disabled={generating || !manualForm.name}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 py-2.5 text-sm disabled:opacity-50">
                  {generating ? 'Creating...' : 'Create Plan'}
                </button>
              </div>
            </div>
          )}

          {/* Active plan */}
          {activePlan ? (
            <div className="space-y-4">
              <div className="glass-card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-normal">{activePlan.name}</h3>
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

              {Array.from(new Set(activePlan.sessions.map(s => s.week_number))).sort((a,b) => a-b).map(week => {
                const weekSessions = activePlan.sessions.filter(s => s.week_number === week);
                return (
                  <div key={week}>
                    <h4 className="text-xs font-medium text-[var(--color-text-muted)] mb-2 uppercase tracking-wider">Week {week}</h4>
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
                                <span className={`text-sm font-normal ${session.completed ? 'line-through opacity-50' : ''}`}>
                                  {info.label}
                                </span>
                              </div>
                              {session.description && (
                                <p className="text-[11px] text-[var(--color-text-muted)] truncate">{session.description}</p>
                              )}
                            </div>
                            <div className="text-right shrink-0">
                              {session.target_distance_km && (
                                <div className="text-xs font-normal">{session.target_distance_km}km</div>
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
          ) : !showGenerate && !showManual && (
            <div className="glass-card p-8 text-center">
              <Calendar size={32} className="mx-auto mb-3 text-[var(--color-text-muted)]" />
              <p className="font-normal">No active training plan</p>
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">Generate one with AI or create manually</p>
            </div>
          )}
        </div>
      )}

      {/* RACES TAB */}
      {tab === 'races' && (
        <div className="space-y-5">
          <button onClick={() => setShowNewRace(true)} className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-sm">
            <Plus size={16} /> Add Race
          </button>

          {showNewRace && (
            <div className="glass-card p-4 space-y-4">
              <h3 className="text-sm font-normal flex items-center gap-2">
                <Flag size={14} className="text-[var(--color-primary)]" /> New Race
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[11px] text-[var(--color-text-muted)]">Race Name *</label>
                  <input placeholder="e.g. Berlin Marathon" value={raceForm.name} onChange={e => setRaceForm({...raceForm, name: e.target.value})} />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] text-[var(--color-text-muted)]">Date *</label>
                  <input type="date" value={raceForm.race_date} onChange={e => setRaceForm({...raceForm, race_date: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block text-[11px] text-[var(--color-text-muted)]">Category</label>
                  <select value={raceForm.category} onChange={e => setRaceForm({...raceForm, category: e.target.value})}>
                    <option value="">Select...</option>
                    <option value="5k">5K</option><option value="10k">10K</option>
                    <option value="half_marathon">Half Marathon</option><option value="marathon">Marathon</option>
                    <option value="ultra_50k">Ultra 50K</option><option value="ultra_100k">Ultra 100K</option>
                    <option value="trail">Trail</option><option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[11px] text-[var(--color-text-muted)]">Distance (km)</label>
                  <input type="number" placeholder="42.2" value={raceForm.distance_km} onChange={e => setRaceForm({...raceForm, distance_km: e.target.value})} />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] text-[var(--color-text-muted)]">Elevation (m)</label>
                  <input type="number" placeholder="500" value={raceForm.elevation_gain_m} onChange={e => setRaceForm({...raceForm, elevation_gain_m: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[11px] text-[var(--color-text-muted)]">Target Time</label>
                  <input placeholder="e.g. 3:30:00" value={raceForm.target_time} onChange={e => setRaceForm({...raceForm, target_time: e.target.value})} />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] text-[var(--color-text-muted)]">Location</label>
                  <input placeholder="e.g. Berlin, DE" value={raceForm.location} onChange={e => setRaceForm({...raceForm, location: e.target.value})} />
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={() => setShowNewRace(false)} className="btn-secondary flex-1 py-2.5 text-sm">Cancel</button>
                <button onClick={handleAddRace} disabled={!raceForm.name || !raceForm.race_date} className="btn-primary flex-1 py-2.5 text-sm disabled:opacity-50">Save</button>
              </div>
            </div>
          )}

          {races.length > 0 ? (
            <div className="space-y-2.5">
              {races.map(race => {
                const isUpcoming = race.status === 'upcoming';
                const daysUntil = isUpcoming ? Math.ceil((new Date(race.race_date).getTime() - Date.now()) / 86400000) : null;
                return (
                  <div key={race.id} className="glass-card p-4">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Flag size={14} className={isUpcoming ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'} />
                          <span className="font-normal truncate">{race.name}</span>
                        </div>
                        <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-[var(--color-text-muted)]">
                          <span className="flex items-center gap-1"><Calendar size={10} /> {race.race_date}</span>
                          {race.distance_km && <span className="flex items-center gap-1"><MapPin size={10} /> {race.distance_km}km</span>}
                          {race.elevation_gain_m && <span className="flex items-center gap-1"><Mountain size={10} /> {race.elevation_gain_m}m</span>}
                          {race.location && <span>{race.location}</span>}
                        </div>
                        {race.target_time && <div className="mt-1 text-xs text-[var(--color-text-muted)]">Target: {race.target_time}</div>}
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          isUpcoming ? 'bg-green-500/10 text-green-400' : race.status === 'completed' ? 'bg-blue-500/10 text-blue-400' : 'bg-red-500/10 text-red-400'
                        }`}>{race.status}</span>
                        {daysUntil != null && daysUntil > 0 && (
                          <div className="mt-1 text-xs font-normal text-[var(--color-primary)]">{daysUntil}d</div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : !showNewRace && (
            <div className="glass-card p-8 text-center">
              <Flag size={32} className="mx-auto mb-3 text-[var(--color-text-muted)]" />
              <p className="font-normal">No races yet</p>
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">Add upcoming races to plan your training</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
