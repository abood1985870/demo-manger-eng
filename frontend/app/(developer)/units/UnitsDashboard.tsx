'use client';

import { useState } from 'react';
import { Building2, Search, Plus, MapPin, Maximize, CircleDollarSign, TrendingUp, CheckCircle2, PackageSearch, LayoutGrid, LayoutList, X } from 'lucide-react';

const imageMap: Record<string, string> = {
  'BUILDING': '/images/tower_project.png',
  'COMPOUND': '/images/villa_project.png',
  'MASTER_PLAN': '/images/masterplan_project.png',
};

const statusColors: Record<string, string> = {
  'AVAILABLE': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'RESERVED': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'SOLD': 'bg-rose-500/20 text-rose-400 border-rose-500/30',
};

const bgColors: Record<string, string> = {
  'AVAILABLE': 'bg-emerald-500',
  'RESERVED': 'bg-amber-500',
  'SOLD': 'bg-rose-500',
};

const statusNames: Record<string, string> = {
  'AVAILABLE': 'متاحة',
  'RESERVED': 'محجوزة',
  'SOLD': 'مباعة',
};

const typeNames: Record<string, string> = {
  'APARTMENT': 'شقة فاخرة',
  'VILLA': 'فيلا سكنية',
  'OFFICE': 'مكتب',
  'RETAIL': 'معرض',
  'LAND': 'قطعة أرض',
};

export default function UnitsDashboard({ properties }: { properties: any[] }) {
  const [viewMode, setViewMode] = useState<'cards' | 'grid'>('cards');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selectedUnit, setSelectedUnit] = useState<any | null>(null);

  const totalProperties = properties.length;
  let totalUnits = 0;
  let availableUnits = 0;
  let totalInventoryValue = 0;
  let totalSoldValue = 0;

  properties.forEach(p => {
    totalUnits += p.units.length;
    p.units.forEach((u: any) => {
      if (u.status === 'AVAILABLE') availableUnits++;
      if (u.status === 'SOLD') totalSoldValue += (u.price || 0);
      totalInventoryValue += (u.price || 0);
    });
  });

  return (
    <>
      <header className="rusukh-page-header border-b border-slate-800 pb-8 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-10 px-8 pt-8">
        <div>
          <h1 className="text-3xl font-black bg-gradient-to-l from-amber-200 to-amber-500 bg-clip-text text-transparent mb-2">إدارة المخزون العقاري</h1>
          <p className="text-slate-400 text-sm">تتبع الوحدات المتاحة والمباعة وإدارة المخططات والأبراج بشكل تفاعلي</p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl transition-all font-medium text-sm border border-slate-700">
            <Search className="w-4 h-4" /> بحث متقدم
          </button>
          <button className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white px-4 py-2 rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] font-medium text-sm">
            <Plus className="w-4 h-4" /> إضافة مشروع
          </button>
        </div>
      </header>

      <section className="p-8">
        {/* KPI Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="glass-card p-6 rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-900/50 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-slate-400 font-medium">إجمالي المشاريع</h3>
              <div className="p-2 bg-slate-800 rounded-lg text-blue-400"><Building2 className="w-5 h-5" /></div>
            </div>
            <p className="text-3xl font-black text-white">{totalProperties}</p>
          </div>
          <div className="glass-card p-6 rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-900/50 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all"></div>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-slate-400 font-medium">قيمة المخزون الكلية</h3>
              <div className="p-2 bg-slate-800 rounded-lg text-amber-400"><CircleDollarSign className="w-5 h-5" /></div>
            </div>
            <p className="text-3xl font-black text-white flex items-baseline gap-1">
              {(totalInventoryValue / 1000000).toFixed(1)} <span className="text-sm text-slate-500 font-normal">مليون ر.س</span>
            </p>
          </div>
          <div className="glass-card p-6 rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-900/50 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-slate-400 font-medium">المبيعات المحققة</h3>
              <div className="p-2 bg-slate-800 rounded-lg text-emerald-400"><TrendingUp className="w-5 h-5" /></div>
            </div>
            <p className="text-3xl font-black text-white flex items-baseline gap-1">
              {(totalSoldValue / 1000000).toFixed(1)} <span className="text-sm text-slate-500 font-normal">مليون ر.س</span>
            </p>
          </div>
          <div className="glass-card p-6 rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-900/50 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all"></div>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-slate-400 font-medium">الوحدات المتاحة</h3>
              <div className="p-2 bg-slate-800 rounded-lg text-indigo-400"><PackageSearch className="w-5 h-5" /></div>
            </div>
            <p className="text-3xl font-black text-white flex items-baseline gap-2">
              {availableUnits} <span className="text-sm text-slate-500 font-normal">من أصل {totalUnits}</span>
            </p>
          </div>
        </div>

        {/* Filters and View Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 w-full md:w-auto">
            {['ALL', 'AVAILABLE', 'RESERVED', 'SOLD'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all ${filterStatus === status ? 'bg-slate-800 text-amber-400 shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
              >
                {status === 'ALL' ? 'الكل' : statusNames[status]}
              </button>
            ))}
          </div>

          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'cards' ? 'bg-slate-800 text-amber-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
              title="عرض البطاقات"
            >
              <LayoutList className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-slate-800 text-amber-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
              title="عرض المخطط الشبكي"
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="space-y-12">
          {properties.map((property) => {
            const allUnitsCount = property.Unit.length;
            const availableCount = property.Unit.filter((u: any) => u.status === 'AVAILABLE').length;
            const soldCount = property.Unit.filter((u: any) => u.status === 'SOLD').length;
            const reservedCount = property.Unit.filter((u: any) => u.status === 'RESERVED').length;
            
            const soldPercentage = allUnitsCount > 0 ? Math.round((soldCount / allUnitsCount) * 100) : 0;
            const imgPath = imageMap[property.type] || '/images/masterplan_project.png';
            
            const filteredUnits = property.Unit.filter((u: any) => filterStatus === 'ALL' || u.status === filterStatus);
            
            if (filteredUnits.length === 0 && filterStatus !== 'ALL') return null;

            return (
              <div key={property.id} className="glass-card rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950/50 group/project">
                {/* Project Header */}
                <div className="relative h-64 md:h-80 w-full overflow-hidden">
                  <div className="absolute inset-0 bg-slate-900">
                    <img src={imgPath} alt={property.name} className="w-full h-full object-cover opacity-60 group-hover/project:scale-105 transition-all duration-1000" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent"></div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-col md:flex-row justify-between items-end gap-6">
                    <div>
                      <span className="inline-block px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold rounded-full mb-3 backdrop-blur-md">
                        {property.status === 'PLANNING' ? 'تحت التخطيط' : property.status === 'UNDER_CONSTRUCTION' ? 'تحت الإنشاء' : 'مكتمل'}
                      </span>
                      <h2 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">{property.name}</h2>
                      <div className="flex items-center gap-6 text-sm text-slate-300 font-medium">
                        <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-amber-500" /> {property.location}</span>
                        <span className="flex items-center gap-1.5"><Maximize className="w-4 h-4 text-amber-500" /> المساحة: {property.totalArea?.toLocaleString()} م²</span>
                        <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-amber-500" /> رخصة وافي: {property.wafiLicenseNumber}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 bg-slate-900/80 p-4 rounded-2xl backdrop-blur-xl border border-slate-700 shadow-xl">
                      {/* CSS Pie Chart for Sales Progress */}
                      <div className="relative w-16 h-16 rounded-full flex items-center justify-center bg-slate-800"
                           style={{ background: `conic-gradient(#f43f5e ${soldPercentage}%, #1e293b ${soldPercentage}%)` }}>
                        <div className="absolute w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-white">{soldPercentage}%</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-4 border-r border-slate-700 pr-4">
                        <div className="text-center">
                          <span className="block text-xl font-black text-emerald-400">{availableCount}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">متاحة</span>
                        </div>
                        <div className="text-center">
                          <span className="block text-xl font-black text-rose-400">{soldCount}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">مباعة</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Units Content */}
                <div className="p-8 bg-slate-950">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-200">
                      الوحدات المعروضة ({filteredUnits.length})
                    </h3>
                  </div>
                  
                  {viewMode === 'cards' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                      {filteredUnits.map((unit: any) => (
                        <div key={unit.id} 
                             onClick={() => setSelectedUnit({ ...unit, propertyName: property.name })}
                             className="group relative p-5 rounded-2xl border border-slate-800 bg-slate-900/50 hover:bg-slate-800 hover:border-slate-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 cursor-pointer">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <span className="text-xs font-bold text-slate-500 block mb-1">{typeNames[unit.type] || 'وحدة'}</span>
                              <h3 className="font-black text-xl text-slate-100 group-hover:text-amber-400 transition-colors">#{unit.unitNumber}</h3>
                            </div>
                            <span className={`px-2.5 py-1 text-[10px] font-black rounded-md border ${statusColors[unit.status]}`}>
                              {statusNames[unit.status]}
                            </span>
                          </div>
                          
                          <div className="space-y-3 mb-5">
                            <div className="flex justify-between items-center text-sm font-medium">
                              <span className="text-slate-400 flex items-center gap-1.5"><Maximize className="w-3.5 h-3.5" /> المساحة</span>
                              <span className="text-slate-200">{unit.area} م²</span>
                            </div>
                            <div className="flex justify-between items-center text-sm font-medium">
                              <span className="text-slate-400 flex items-center gap-1.5"><CircleDollarSign className="w-3.5 h-3.5" /> السعر</span>
                              <span className="text-white font-bold">{unit.price?.toLocaleString()} ر.س</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    // Grid / Masterplan View
                    <div className="p-8 bg-slate-900/40 border border-slate-800 rounded-2xl border-dashed">
                      <p className="text-center text-slate-400 mb-6 text-sm">عرض المخطط المبسط (Floorplan / Map Grid)</p>
                      <div className="flex flex-wrap gap-3 justify-center">
                        {filteredUnits.map((unit: any) => (
                          <button 
                            key={unit.id}
                            onClick={() => setSelectedUnit({ ...unit, propertyName: property.name })}
                            className={`relative w-16 h-16 rounded-xl flex items-center justify-center font-bold text-white shadow-lg transition-transform hover:scale-110 ${bgColors[unit.status]}`}
                            title={`وحدة ${unit.unitNumber} - ${statusNames[unit.status]}`}
                          >
                            <span className="drop-shadow-md">{unit.unitNumber}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Slide-over Modal for Unit Details */}
      {selectedUnit && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" onClick={() => setSelectedUnit(null)}></div>
          
          <div className="relative w-full max-w-md bg-slate-900 h-full border-r border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950">
              <h2 className="text-xl font-bold text-white">تفاصيل الوحدة العقارية</h2>
              <button onClick={() => setSelectedUnit(null)} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-300 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              <div className="text-center pb-8 border-b border-slate-800">
                <span className={`inline-block px-4 py-1 text-xs font-black rounded-full border mb-4 ${statusColors[selectedUnit.status]}`}>
                  الحالة: {statusNames[selectedUnit.status]}
                </span>
                <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-amber-200 to-amber-600 mb-2">
                  #{selectedUnit.unitNumber}
                </h1>
                <p className="text-slate-400 font-medium">{selectedUnit.propertyName} — {typeNames[selectedUnit.type]}</p>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">المواصفات المالية والهندسية</h3>
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 flex items-center gap-2"><Maximize className="w-4 h-4 text-amber-500" /> المساحة الكلية</span>
                    <span className="text-white font-bold">{selectedUnit.area} م²</span>
                  </div>
                  <div className="h-px bg-slate-800"></div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 flex items-center gap-2"><CircleDollarSign className="w-4 h-4 text-emerald-500" /> السعر المطلوب</span>
                    <span className="text-2xl font-black text-emerald-400">{selectedUnit.price?.toLocaleString()} <span className="text-sm font-normal text-slate-500">ر.س</span></span>
                  </div>
                </div>
              </div>

              {selectedUnit.status === 'SOLD' && (
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-5 text-center">
                  <h3 className="text-rose-400 font-bold mb-2">تم بيع الوحدة</h3>
                  <p className="text-sm text-slate-400">مرتبطة بعقد مبايعة ومحولة لحساب الضمان.</p>
                </div>
              )}

            </div>
            
            <div className="p-6 border-t border-slate-800 bg-slate-950 flex gap-4">
              <button className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold py-3 rounded-xl transition-colors shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                {selectedUnit.status === 'AVAILABLE' ? 'حجز الوحدة' : 'عرض العقد'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
