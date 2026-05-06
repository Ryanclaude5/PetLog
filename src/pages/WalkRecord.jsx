import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Edit2, X, Check, MapPin, Clock, Route, Navigation } from 'lucide-react';
import { walkStorage } from '../utils/storage';

const defaultForm = {
  date: new Date().toISOString().split('T')[0],
  startTime: '',
  endTime: '',
  distance: '',
  duration: '',
  startLocation: '',
  endLocation: '',
  note: '',
  route: [],
};

function MapView({ route, onRouteChange, editable }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const polylineRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!mapRef.current) return;

    import('leaflet').then(L => {
      // Fix default icon
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      const center = route.length > 0 ? route[0] : [25.0478, 121.5318];
      const map = L.map(mapRef.current).setView(center, 15);
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
      }).addTo(map);

      function redraw(pts) {
        markersRef.current.forEach(m => map.removeLayer(m));
        markersRef.current = [];
        if (polylineRef.current) map.removeLayer(polylineRef.current);

        if (pts.length > 0) {
          polylineRef.current = L.polyline(pts, { color: '#007AFF', weight: 4, opacity: 0.8 }).addTo(map);
          pts.forEach((pt, i) => {
            const icon = L.divIcon({
              html: `<div style="
                background: ${i === 0 ? '#34C759' : i === pts.length - 1 ? '#FF3B30' : '#007AFF'};
                width: 12px; height: 12px; border-radius: 50%;
                border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              "></div>`,
              className: '',
              iconSize: [12, 12],
              iconAnchor: [6, 6],
            });
            const m = L.marker(pt, { icon }).addTo(map);
            markersRef.current.push(m);
          });
          map.fitBounds(polylineRef.current.getBounds(), { padding: [20, 20] });
        }
      }

      redraw(route);

      if (editable) {
        map.on('click', e => {
          const newRoute = [...route, [e.latlng.lat, e.latlng.lng]];
          redraw(newRoute);
          onRouteChange && onRouteChange(newRoute);
          route = newRoute;
        });
      }
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative">
      <div ref={mapRef} className="w-full h-56 rounded-2xl overflow-hidden border border-gray-200" />
      {editable && (
        <div className="absolute bottom-2 left-2 right-2 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 text-xs text-gray-500 text-center">
          點擊地圖加入路線點，
          <button
            onClick={() => onRouteChange && onRouteChange([])}
            className="text-red-500 font-medium ml-1"
          >
            清除路線
          </button>
        </div>
      )}
    </div>
  );
}

function FormModal({ record, onClose, onSave }) {
  const [form, setForm] = useState(record || defaultForm);
  const [showMap, setShowMap] = useState(false);

  function set(k, v) { setForm(p => ({ ...p, [k]: v })); }

  function handleSubmit(e) {
    e.preventDefault();
    onSave(form);
  }

  const calcDuration = () => {
    if (form.startTime && form.endTime) {
      const [sh, sm] = form.startTime.split(':').map(Number);
      const [eh, em] = form.endTime.split(':').map(Number);
      const mins = (eh * 60 + em) - (sh * 60 + sm);
      if (mins > 0) set('duration', String(mins));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white rounded-t-3xl">
          <h3 className="font-bold text-gray-800">{record ? '編輯散步紀錄' : '新增散步紀錄'}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">日期</label>
            <input type="date" value={form.date} onChange={e => set('date', e.target.value)} className="input-field" required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">出發時間</label>
              <input type="time" value={form.startTime} onChange={e => { set('startTime', e.target.value); }} onBlur={calcDuration} className="input-field" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">返回時間</label>
              <input type="time" value={form.endTime} onChange={e => { set('endTime', e.target.value); }} onBlur={calcDuration} className="input-field" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">距離 (km)</label>
              <input type="number" step="0.01" min="0" placeholder="例：1.5" value={form.distance} onChange={e => set('distance', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">時間 (分鐘)</label>
              <input type="number" min="0" placeholder="例：30" value={form.duration} onChange={e => set('duration', e.target.value)} className="input-field" />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">起點</label>
            <input type="text" placeholder="例：公園入口" value={form.startLocation} onChange={e => set('startLocation', e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">終點</label>
            <input type="text" placeholder="例：家門口" value={form.endLocation} onChange={e => set('endLocation', e.target.value)} className="input-field" />
          </div>

          {/* Map Route */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-gray-400">地圖路線（點擊地圖標記路線點）</label>
              <button type="button" onClick={() => setShowMap(p => !p)} className="text-xs text-blue-500 font-medium">
                {showMap ? '收起地圖' : '開啟地圖'}
              </button>
            </div>
            {showMap && (
              <MapView
                route={form.route}
                editable
                onRouteChange={r => set('route', r)}
              />
            )}
            {form.route.length > 0 && (
              <p className="text-xs text-gray-400 mt-1">已標記 {form.route.length} 個路線點</p>
            )}
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">備註</label>
            <textarea placeholder="天氣、心情、特殊狀況..." value={form.note} onChange={e => set('note', e.target.value)}
              className="input-field resize-none" rows={2} />
          </div>

          <div className="flex gap-2 pt-2">
            <button type="submit" className="btn-primary flex-1">
              <span className="flex items-center justify-center gap-2"><Check size={16} />{record ? '儲存變更' : '新增紀錄'}</span>
            </button>
            <button type="button" onClick={onClose} className="btn-secondary">取消</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function WalkRecord() {
  const [records, setRecords] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [viewMap, setViewMap] = useState(null);

  const load = () => setRecords(walkStorage.getAll());
  useEffect(() => { load(); }, []);

  function save(form) {
    if (editRecord) {
      walkStorage.update(editRecord.id, form);
    } else {
      walkStorage.add(form);
    }
    setShowForm(false);
    setEditRecord(null);
    load();
  }

  function del(id) {
    if (confirm('確定刪除此散步紀錄？')) {
      walkStorage.remove(id);
      load();
    }
  }

  const totalDist = records.reduce((s, r) => s + (parseFloat(r.distance) || 0), 0);
  const totalMin = records.reduce((s, r) => s + (parseInt(r.duration) || 0), 0);

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {records.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{records.length}</p>
            <p className="text-xs text-gray-400 mt-1">總次數</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{totalDist.toFixed(1)}</p>
            <p className="text-xs text-gray-400 mt-1">總距離 (km)</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">{totalMin}</p>
            <p className="text-xs text-gray-400 mt-1">總時間 (分)</p>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-50">
          <p className="font-semibold text-gray-800">散步紀錄</p>
          <button onClick={() => { setEditRecord(null); setShowForm(true); }}
            className="flex items-center gap-1.5 text-blue-500 font-medium text-sm hover:text-blue-600">
            <Plus size={16} /> 新增
          </button>
        </div>

        {records.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-4xl mb-3">🦮</p>
            <p className="text-gray-400 text-sm">尚無散步紀錄</p>
            <button onClick={() => setShowForm(true)} className="mt-4 btn-primary text-sm">新增第一筆紀錄</button>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {records.map(r => (
              <div key={r.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0 text-lg">
                    🦮
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-gray-800">{r.date}</span>
                      {r.startTime && <span className="text-xs text-gray-400">{r.startTime}{r.endTime ? ` – ${r.endTime}` : ''}</span>}
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      {r.distance && (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Route size={11} /> {r.distance} km
                        </span>
                      )}
                      {r.duration && (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock size={11} /> {r.duration} 分鐘
                        </span>
                      )}
                      {(r.startLocation || r.endLocation) && (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <MapPin size={11} /> {r.startLocation || ''}{r.startLocation && r.endLocation ? ' → ' : ''}{r.endLocation || ''}
                        </span>
                      )}
                    </div>
                    {r.note && <p className="text-xs text-gray-400 mt-1">{r.note}</p>}
                    {r.route && r.route.length > 0 && (
                      <button onClick={() => setViewMap(r)} className="mt-2 flex items-center gap-1 text-xs text-blue-500 font-medium hover:text-blue-600">
                        <Navigation size={11} /> 查看地圖路線 ({r.route.length} 個點)
                      </button>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditRecord(r); setShowForm(true); }}
                      className="w-8 h-8 rounded-lg bg-gray-100 text-gray-400 hover:bg-blue-50 hover:text-blue-500 flex items-center justify-center">
                      <Edit2 size={13} />
                    </button>
                    <button onClick={() => del(r.id)}
                      className="w-8 h-8 rounded-lg bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500 flex items-center justify-center">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* View Map Modal */}
      {viewMap && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-800">散步路線 – {viewMap.date}</h3>
              <button onClick={() => setViewMap(null)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <X size={16} />
              </button>
            </div>
            <div className="p-4">
              <MapView route={viewMap.route} editable={false} />
              <div className="flex gap-4 mt-3 text-xs text-gray-500">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500 inline-block" /> 起點</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> 終點</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block" /> 途經點</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {(showForm) && (
        <FormModal
          record={editRecord}
          onClose={() => { setShowForm(false); setEditRecord(null); }}
          onSave={save}
        />
      )}
    </div>
  );
}
