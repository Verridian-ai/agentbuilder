import { useState } from 'react';
import { NavBar, BottomSheet } from '../components/MobileNavigation';
import { Network, Server, Router, Shield, Plus, ChevronRight, X, Check, Trash2 } from 'lucide-react';
import { useStore } from '../store';

export default function NetworkPage() {
  const { networkDevices, addNetworkDevice, removeNetworkDevice } = useStore();
  const [activeCategory, setActiveCategory] = useState('all');
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [showDeviceSheet, setShowDeviceSheet] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<typeof networkDevices[0] | null>(null);
  
  // New device form
  const [newDevice, setNewDevice] = useState({
    name: '',
    vendor: 'cisco',
    ip: '',
    status: 'offline'
  });

  const categories = [
    { id: 'all', label: 'All', count: networkDevices.length },
    { id: 'cisco', label: 'Cisco', count: networkDevices.filter(t => t.vendor === 'cisco').length },
    { id: 'juniper', label: 'Juniper', count: networkDevices.filter(t => t.vendor === 'juniper').length },
  ];

  const filteredDevices = activeCategory === 'all' 
    ? networkDevices 
    : networkDevices.filter(t => t.vendor === activeCategory);

  const handleAddDevice = () => {
    if (!newDevice.name || !newDevice.ip) return;
    
    addNetworkDevice({
      id: crypto.randomUUID(),
      name: newDevice.name,
      vendor: newDevice.vendor,
      ip: newDevice.ip,
      status: newDevice.status,
    });
    
    setNewDevice({ name: '', vendor: 'cisco', ip: '', status: 'offline' });
    setShowAddSheet(false);
  };

  const handleDeleteDevice = (id: string) => {
    removeNetworkDevice(id);
    setShowDeviceSheet(false);
    setSelectedDevice(null);
  };

  const viewDevice = (device: typeof networkDevices[0]) => {
    setSelectedDevice(device);
    setShowDeviceSheet(true);
  };

  const generateConfig = (device: typeof networkDevices[0]) => {
    if (device.vendor === 'cisco') {
      return `! Cisco IOS Configuration
! Device: ${device.name}
! IP: ${device.ip}

hostname ${device.name.replace(/\s+/g, '-')}
!
interface GigabitEthernet0/0
 ip address ${device.ip} 255.255.255.0
 no shutdown
!
enable secret YOUR_PASSWORD
!
line vty 0 4
 login local
 transport input ssh
!
end`;
    } else {
      return `# Juniper JunOS Configuration
# Device: ${device.name}
# IP: ${device.ip}

set system host-name ${device.name.replace(/\s+/g, '-')}
set interfaces ge-0/0/0 unit 0 family inet address ${device.ip}/24
set system services ssh
set system login user admin class super-user
`;
    }
  };

  return (
    <div className="min-h-screen bg-canvas pb-24">
      <NavBar title="Network" large />
      
      <div className="px-4 space-y-6">
        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto py-2 -mx-4 px-4 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-ios-subhead whitespace-nowrap transition-all
                ${activeCategory === cat.id 
                  ? 'bg-ios-blue text-white' 
                  : 'bg-surface-secondary text-text-secondary'}`}
            >
              {cat.label} ({cat.count})
            </button>
          ))}
        </div>

        {/* Quick Actions */}
        <section className="ios-card">
          <h2 className="text-ios-headline font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => setShowAddSheet(true)}
              className="flex flex-col items-center p-4 bg-surface-secondary rounded-ios-lg active:bg-surface-active"
            >
              <Server className="w-8 h-8 text-ios-blue mb-2" />
              <span className="text-ios-caption1 text-text-secondary">New Device</span>
            </button>
            <button className="flex flex-col items-center p-4 bg-surface-secondary rounded-ios-lg active:bg-surface-active">
              <Router className="w-8 h-8 text-ios-green mb-2" />
              <span className="text-ios-caption1 text-text-secondary">Import</span>
            </button>
            <button className="flex flex-col items-center p-4 bg-surface-secondary rounded-ios-lg active:bg-surface-active">
              <Shield className="w-8 h-8 text-ios-orange mb-2" />
              <span className="text-ios-caption1 text-text-secondary">Validate</span>
            </button>
            <button className="flex flex-col items-center p-4 bg-surface-secondary rounded-ios-lg active:bg-surface-active">
              <Network className="w-8 h-8 text-ios-purple mb-2" />
              <span className="text-ios-caption1 text-text-secondary">Deploy</span>
            </button>
          </div>
        </section>

        {/* Devices List */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-ios-headline font-semibold">Devices</h2>
            <button 
              onClick={() => setShowAddSheet(true)}
              className="text-ios-blue text-ios-subhead flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
          
          {filteredDevices.length === 0 ? (
            <div className="ios-card text-center py-8">
              <Network className="w-12 h-12 text-text-tertiary mx-auto mb-3" />
              <p className="text-text-secondary text-ios-body">No devices yet</p>
              <p className="text-text-tertiary text-ios-caption1 mt-1">Add your first network device</p>
              <button 
                onClick={() => setShowAddSheet(true)}
                className="mt-4 ios-button-primary text-ios-subhead"
              >
                Add Device
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredDevices.map(device => (
                <button 
                  key={device.id}
                  onClick={() => viewDevice(device)}
                  className="ios-card w-full flex items-center gap-4 active:bg-surface-active"
                >
                  <div className={`w-10 h-10 rounded-ios flex items-center justify-center
                    ${device.vendor === 'cisco' ? 'bg-ios-blue/10 text-ios-blue' : 'bg-ios-green/10 text-ios-green'}`}>
                    <Server className="w-5 h-5" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-ios-body font-medium text-text-primary">{device.name}</p>
                    <p className="text-ios-caption1 text-text-tertiary">{device.vendor} - {device.ip}</p>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${device.status === 'online' ? 'bg-ios-green' : 'bg-ios-gray-3'}`} />
                  <ChevronRight className="w-5 h-5 text-text-tertiary" />
                </button>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Add Device Sheet */}
      <BottomSheet isOpen={showAddSheet} onClose={() => setShowAddSheet(false)} title="Add Network Device">
        <div className="p-4 space-y-4">
          <div>
            <label className="text-ios-footnote font-medium text-text-secondary block mb-2">Device Name</label>
            <input
              type="text"
              value={newDevice.name}
              onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
              placeholder="e.g., Core Router 1"
              className="ios-input"
            />
          </div>

          <div>
            <label className="text-ios-footnote font-medium text-text-secondary block mb-2">Vendor</label>
            <div className="flex gap-2">
              <button
                onClick={() => setNewDevice({ ...newDevice, vendor: 'cisco' })}
                className={`flex-1 py-3 rounded-ios-lg text-ios-body font-medium transition-all
                  ${newDevice.vendor === 'cisco' ? 'bg-ios-blue text-white' : 'bg-surface-secondary text-text-primary'}`}
              >
                Cisco
              </button>
              <button
                onClick={() => setNewDevice({ ...newDevice, vendor: 'juniper' })}
                className={`flex-1 py-3 rounded-ios-lg text-ios-body font-medium transition-all
                  ${newDevice.vendor === 'juniper' ? 'bg-ios-green text-white' : 'bg-surface-secondary text-text-primary'}`}
              >
                Juniper
              </button>
            </div>
          </div>

          <div>
            <label className="text-ios-footnote font-medium text-text-secondary block mb-2">IP Address</label>
            <input
              type="text"
              value={newDevice.ip}
              onChange={(e) => setNewDevice({ ...newDevice, ip: e.target.value })}
              placeholder="e.g., 192.168.1.1"
              className="ios-input"
            />
          </div>

          <div>
            <label className="text-ios-footnote font-medium text-text-secondary block mb-2">Status</label>
            <div className="flex gap-2">
              <button
                onClick={() => setNewDevice({ ...newDevice, status: 'online' })}
                className={`flex-1 py-3 rounded-ios-lg text-ios-body font-medium transition-all
                  ${newDevice.status === 'online' ? 'bg-ios-green text-white' : 'bg-surface-secondary text-text-primary'}`}
              >
                Online
              </button>
              <button
                onClick={() => setNewDevice({ ...newDevice, status: 'offline' })}
                className={`flex-1 py-3 rounded-ios-lg text-ios-body font-medium transition-all
                  ${newDevice.status === 'offline' ? 'bg-ios-gray-3 text-white' : 'bg-surface-secondary text-text-primary'}`}
              >
                Offline
              </button>
            </div>
          </div>

          <button
            onClick={handleAddDevice}
            disabled={!newDevice.name || !newDevice.ip}
            className="w-full ios-button-primary flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Check className="w-5 h-5" />
            Add Device
          </button>
        </div>
      </BottomSheet>

      {/* Device Detail Sheet */}
      <BottomSheet isOpen={showDeviceSheet} onClose={() => setShowDeviceSheet(false)} title={selectedDevice?.name || 'Device'}>
        {selectedDevice && (
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface-secondary rounded-ios-lg p-3">
                <p className="text-ios-caption1 text-text-tertiary">Vendor</p>
                <p className="text-ios-body font-medium text-text-primary capitalize">{selectedDevice.vendor}</p>
              </div>
              <div className="bg-surface-secondary rounded-ios-lg p-3">
                <p className="text-ios-caption1 text-text-tertiary">IP Address</p>
                <p className="text-ios-body font-medium text-text-primary">{selectedDevice.ip}</p>
              </div>
              <div className="bg-surface-secondary rounded-ios-lg p-3">
                <p className="text-ios-caption1 text-text-tertiary">Status</p>
                <p className={`text-ios-body font-medium ${selectedDevice.status === 'online' ? 'text-ios-green' : 'text-text-tertiary'}`}>
                  {selectedDevice.status}
                </p>
              </div>
            </div>

            <div>
              <p className="text-ios-footnote font-medium text-text-secondary mb-2">Generated Configuration</p>
              <pre className="bg-surface-secondary rounded-ios-lg p-3 text-xs text-text-primary overflow-x-auto font-mono">
                {generateConfig(selectedDevice)}
              </pre>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generateConfig(selectedDevice));
                }}
                className="flex-1 ios-button-primary"
              >
                Copy Config
              </button>
              <button
                onClick={() => handleDeleteDevice(selectedDevice.id)}
                className="w-12 h-12 rounded-ios-lg bg-ios-red/10 flex items-center justify-center text-ios-red"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
