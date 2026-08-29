import protobuf from 'protobufjs';

export const STM_CONFIG = {
  API_KEY: 'l78d7ad1bead4945ecb074eb411b099dfb',
  CLIENT_SECRET: 'd42c0b7f7c82484a9587fe44cbc144f4',
  BASE_URL: 'https://api.stm.info/pub/od/gtfs-rt/ic/v2'
};

const PROTO_DEFINITION = `
syntax = "proto2";
package transit_realtime;

message FeedMessage {
  required FeedHeader header = 1;
  repeated FeedEntity entity = 2;
}
message FeedHeader {
  required string gtfs_realtime_version = 1;
  optional uint64 timestamp = 3;
}
message FeedEntity {
  required string id = 1;
  optional VehiclePosition vehicle = 4;
  optional TripUpdate trip_update = 3;
}
message VehiclePosition {
  optional TripDescriptor trip = 1;
  optional VehicleDescriptor vehicle = 8;
  optional Position position = 2;
  optional uint32 current_stop_sequence = 3;
  optional uint64 timestamp = 5;
}
message TripDescriptor {
  optional string trip_id = 1;
  optional string route_id = 5;
}
message VehicleDescriptor {
  optional string id = 1;
  optional string label = 2;
}
message Position {
  required float latitude = 1;
  required float longitude = 2;
  optional float bearing = 3;
  optional double odometer = 4;
  optional float speed = 5;
}
message TripUpdate {
  optional TripDescriptor trip = 1;
  repeated StopTimeUpdate stop_time_update = 2;
  optional int32 delay = 3;
}
message StopTimeUpdate {
  optional uint32 stop_sequence = 1;
  optional string stop_id = 4;
  optional StopTimeEvent arrival = 2;
  optional StopTimeEvent departure = 3;
}
message StopTimeEvent {
  optional int32 delay = 1;
  optional int64 time = 2;
}
`;

let feedMessageType: protobuf.Type | null = null;

function getFeedMessageType(): protobuf.Type {
  if (!feedMessageType) {
    const root = protobuf.parse(PROTO_DEFINITION).root;
    feedMessageType = root.lookupType('transit_realtime.FeedMessage');
  }
  return feedMessageType;
}

export interface STMBusVehicle {
  id: string;
  routeId: string;
  tripId: string;
  latitude: number;
  longitude: number;
  speedKmH: number;
  stopSequence: number;
  timestamp: number;
}

export interface STMBusStatusReport {
  routeId: string;
  activeCount: number;
  vehicles: STMBusVehicle[];
  avgDelaySec: number;
  maxDelaySec: number;
  statusText: string;
  summary: string;
}

// Fetch and decode live vehicle positions from Cloud Backend first (CORS safe), then direct fallback
export async function fetchSTMVehicles(routeId?: string): Promise<STMBusVehicle[]> {
  try {
    const cloudUrl = routeId ? `/api/stm/vehicles?routeId=${encodeURIComponent(routeId)}` : `/api/stm/vehicles`;
    const cloudRes = await fetch(cloudUrl);
    if (cloudRes.ok) {
      const data = await cloudRes.json();
      if (data && Array.isArray(data.vehicles)) {
        return data.vehicles;
      }
    }
  } catch (err) {
    console.warn('[STM] Cloud API fallback to direct fetch:', err);
  }

  try {
    const res = await fetch(`${STM_CONFIG.BASE_URL}/vehiclePositions`, {
      method: 'GET',
      headers: {
        'apikey': STM_CONFIG.API_KEY,
        'User-Agent': 'DeusExSophia-STM-Realtime/1.0'
      }
    });

    if (!res.ok) return [];

    const buffer = await res.arrayBuffer();
    const uint8 = new Uint8Array(buffer);
    const Type = getFeedMessageType();
    const message = Type.decode(uint8);
    const obj: any = Type.toObject(message);

    const vehicles: STMBusVehicle[] = [];
    if (obj && obj.entity && Array.isArray(obj.entity)) {
      for (const ent of obj.entity) {
        if (ent.vehicle && ent.vehicle.position) {
          const vRoute = ent.vehicle.trip?.routeId || '';
          if (routeId && String(vRoute) !== String(routeId)) {
            continue;
          }

          vehicles.push({
            id: ent.vehicle.vehicle?.id || ent.id,
            routeId: vRoute,
            tripId: ent.vehicle.trip?.tripId || '',
            latitude: Number(ent.vehicle.position.latitude?.toFixed(6) || 0),
            longitude: Number(ent.vehicle.position.longitude?.toFixed(6) || 0),
            speedKmH: Number(((ent.vehicle.position.speed || 0) * 3.6).toFixed(1)),
            stopSequence: ent.vehicle.currentStopSequence || 0,
            timestamp: Number(ent.vehicle.timestamp || Date.now())
          });
        }
      }
    }

    return vehicles;
  } catch (err) {
    console.warn('[STM] Error fetching vehicle positions:', err);
    return [];
  }
}

// Fetch and decode live trip updates & delays from STM API
export async function fetchSTMTripDelays(routeId?: string): Promise<{ avgDelaySec: number; maxDelaySec: number }> {
  try {
    const res = await fetch(`${STM_CONFIG.BASE_URL}/tripUpdates`, {
      method: 'GET',
      headers: {
        'apikey': STM_CONFIG.API_KEY,
        'User-Agent': 'DeusExSophia-STM-Realtime/1.0'
      }
    });

    if (!res.ok) return { avgDelaySec: 0, maxDelaySec: 0 };

    const buffer = await res.arrayBuffer();
    const uint8 = new Uint8Array(buffer);
    const Type = getFeedMessageType();
    const message = Type.decode(uint8);
    const obj: any = Type.toObject(message);

    const delays: number[] = [];
    if (obj && obj.entity && Array.isArray(obj.entity)) {
      for (const ent of obj.entity) {
        if (ent.tripUpdate) {
          const vRoute = ent.tripUpdate.trip?.routeId || '';
          if (routeId && String(vRoute) !== String(routeId)) {
            continue;
          }

          if (typeof ent.tripUpdate.delay === 'number') {
            delays.push(ent.tripUpdate.delay);
          } else if (Array.isArray(ent.tripUpdate.stopTimeUpdate)) {
            for (const stu of ent.tripUpdate.stopTimeUpdate) {
              if (stu.arrival && typeof stu.arrival.delay === 'number') {
                delays.push(stu.arrival.delay);
              }
            }
          }
        }
      }
    }

    if (delays.length === 0) return { avgDelaySec: 0, maxDelaySec: 0 };

    const sum = delays.reduce((a, b) => a + b, 0);
    const avg = Math.round(sum / delays.length);
    const max = Math.max(...delays);

    return { avgDelaySec: avg, maxDelaySec: max };
  } catch (err) {
    console.warn('[STM] Error fetching trip updates:', err);
    return { avgDelaySec: 0, maxDelaySec: 0 };
  }
}

// Complete Live STM Status Query for any bus number (e.g. "136", "24", "106")
export async function getSTMBusLiveReport(busNumber: string): Promise<STMBusStatusReport> {
  const cleanRoute = busNumber.replace(/\D/g, '');
  const [vehicles, delays] = await Promise.all([
    fetchSTMVehicles(cleanRoute),
    fetchSTMTripDelays(cleanRoute)
  ]);

  let statusText = "À l'heure (0s de retard)";
  if (delays.maxDelaySec > 180) {
    const mins = Math.round(delays.maxDelaySec / 60);
    statusText = `En retard de ${mins} min (${delays.maxDelaySec}s)`;
  } else if (delays.maxDelaySec < -60) {
    const mins = Math.round(Math.abs(delays.maxDelaySec) / 60);
    statusText = `En avance de ${mins} min`;
  }

  let summary = '';
  if (vehicles.length > 0) {
    summary = `Ligne ${cleanRoute} : ${vehicles.length} bus actifs en direct sur le réseau STM. Statut : ${statusText}.`;
  } else {
    summary = `Ligne ${cleanRoute} : Aucun bus détecté en circulation actuellement sur l'API STM.`;
  }

  return {
    routeId: cleanRoute,
    activeCount: vehicles.length,
    vehicles,
    avgDelaySec: delays.avgDelaySec,
    maxDelaySec: delays.maxDelaySec,
    statusText,
    summary
  };
}
